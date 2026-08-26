<?php
/**
 * GAMES.RO ads — ads.php · serverul central de reclame first-party
 * GET  ?zone=home-cabinet[&site=games.ro]  → JSON cu creativa de servit
 * POST {"e":"imp"|"click","zone":...,"cid":...}  → beacon (204)
 * GET  ?stats=1&key=ADS_KEY               → sumar zilnic (doar cu cheie)
 * Cookieless. Prioritate: campanii direct-sold din campaigns.json → produs
 * contextual din products-cache.json → house-ad fallback.
 */

declare(strict_types=1);
if (!function_exists('str_contains')) {
    function str_contains(string $h, string $n): bool { return $n === '' || strpos($h, $n) !== false; }
}
require __DIR__ . '/config.php';

$ORIGINS = ['https://games.ro', 'https://www.games.ro', 'https://buhnici.ro', 'https://www.buhnici.ro', 'https://gb.ro'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $ORIGINS, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Cache-Control: no-store');

/* ---- beacon ---- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input', false, null, 0, 512);
    $d = json_decode($raw ?: '', true);
    $e = $d['e'] ?? ''; $zone = $d['zone'] ?? ''; $cid = $d['cid'] ?? '';
    if (in_array($e, ['imp', 'click'], true) && preg_match('/^[a-z0-9-]{1,40}$/', $zone) && preg_match('/^[a-zA-Z0-9_-]{0,80}$/', $cid)) {
        $f = __DIR__ . '/stats-' . date('Ym') . '.jsonl';
        if (!file_exists($f) || filesize($f) < 20000000) {   // plafon 20MB/lună
            file_put_contents($f, json_encode(['t' => time(), 'e' => $e, 'z' => $zone, 'c' => $cid]) . "\n", FILE_APPEND | LOCK_EX);
        }
    }
    http_response_code(204);
    exit;
}

/* ---- sumar statistici (protejat) ---- */
if (isset($_GET['stats'])) {
    if (!hash_equals(ADS_KEY, (string)($_GET['key'] ?? ''))) { http_response_code(403); exit; }
    header('Content-Type: application/json');
    $sum = [];
    foreach (glob(__DIR__ . '/stats-*.jsonl') ?: [] as $f) {
        foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $r = json_decode($line, true);
            if (!$r) continue;
            $k = $r['z'] . '|' . $r['e'];
            $sum[$k] = ($sum[$k] ?? 0) + 1;
        }
    }
    echo json_encode($sum, JSON_PRETTY_PRINT);
    exit;
}

/* ---- servirea unei zone ---- */
header('Content-Type: application/json; charset=utf-8');
$zone = (string)($_GET['zone'] ?? '');
$site = preg_replace('/[^a-z0-9.-]/', '', (string)($_GET['site'] ?? 'games.ro'));
if (!preg_match('/^[a-z0-9-]{1,40}$/', $zone)) { http_response_code(400); echo '{"error":"zone"}'; exit; }

function utm(string $url, string $site, string $zone): string {
    $sep = str_contains($url, '?') ? '&' : '?';
    return $url . $sep . http_build_query(['utm_source' => $site, 'utm_medium' => 'gro-ads', 'utm_campaign' => $zone]);
}

/* 1) campanii direct-sold / house cu flight activ */
$camps = json_decode(@file_get_contents(__DIR__ . '/campaigns.json') ?: '{}', true)['campaigns'] ?? [];
$now = date('Y-m-d');
$eligible = array_values(array_filter($camps, function ($c) use ($zone, $now) {
    return in_array($zone, isset($c['zones']) ? $c['zones'] : [], true)
        && (isset($c['start']) ? $c['start'] : '0000') <= $now
        && $now <= (isset($c['end']) ? $c['end'] : '9999')
        && (isset($c['weight']) ? $c['weight'] : 0) > 0;
}));
/* campaniile plătite au prioritate absolută față de house */
$paid = array_values(array_filter($eligible, function ($c) { return (isset($c['type']) ? $c['type'] : '') === 'paid'; }));
$pool = $paid ?: $eligible;
if ($pool) {
    $totw = array_sum(array_column($pool, 'weight'));
    $r = random_int(1, max(1, $totw));
    foreach ($pool as $c) {
        $r -= $c['weight'];
        if ($r <= 0) {
            $cr = $c['creative'];
            $cr['url'] = utm($cr['url'], $site, $zone);
            /* house-ads cedează 50% din afișări produselor, ca să nu ne autopromovăm în buclă */
            if (($c['type'] ?? '') === 'paid' || random_int(0, 1) === 0) {
                echo json_encode(['cid' => $c['id'], 'kind' => $c['type'] ?? 'house', 'creative' => $cr], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                exit;
            }
            break;
        }
    }
}

/* 2) produs contextual din cache */
$ZONE_BUCKETS = [
    'home-cabinet' => ['casti', 'incarcatoare', 'crypto', 'gadget', 'esim'],
    'end-geo-ro'   => ['esim'],
    'end-arcade'   => ['casti', 'incarcatoare'],
    'end-quiz'     => ['crypto', 'gadget'],
    'ticker'       => ['casti', 'esim', 'incarcatoare', 'crypto', 'gadget'],
];
$cache = json_decode(@file_get_contents(__DIR__ . '/products-cache.json') ?: '{}', true);
$buckets = $cache['buckets'] ?? [];
$cands = [];
foreach ($ZONE_BUCKETS[$zone] ?? ['gadget'] as $b) {
    foreach ($buckets[$b] ?? [] as $p) $cands[] = $p;
}
if ($cands) {
    $p = $cands[random_int(0, count($cands) - 1)];
    echo json_encode([
        'cid' => 'gb-' . $p['handle'],
        'kind' => 'product',
        'creative' => [
            'title' => $p['title'],
            'desc'  => null,
            'price' => $p['price'] . ' lei',
            'img'   => $p['img'],
            'cta'   => 'Vezi pe GB.ro',
            'url'   => utm('https://gb.ro/products/' . $p['handle'], $site, $zone),
            'label' => 'RECLAMĂ · GB.RO',
        ],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/* 3) fallback house */
echo json_encode([
    'cid' => 'house-prosumatorul',
    'kind' => 'house',
    'creative' => [
        'title' => 'PROSUMATORUL',
        'desc'  => 'Simulatorul casei tale energetice — în pregătire pe GAMES.ro.',
        'price' => null, 'img' => null,
        'cta'   => 'Despre proiect', 'url' => utm('https://games.ro/', $site, $zone),
        'label' => 'CURÂND',
    ],
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
