<?php
/**
 * GAMES.RO ads — cron.php
 * Trage feed-ul public Shopify de pe gb.ro, îl normalizează în bucket-uri
 * contextuale și scrie products-cache.json. Rulat zilnic din cPanel Cron:
 *   php /home/gamesro/public_html/ads/cron.php
 * sau manual: https://games.ro/ads/cron.php?key=<ADS_KEY din config.php>
 */

declare(strict_types=1);
if (!function_exists('str_contains')) {
    function str_contains(string $h, string $n): bool { return $n === '' || strpos($h, $n) !== false; }
}
require __DIR__ . '/config.php'; // definește ADS_KEY

if (PHP_SAPI !== 'cli') {
    if (!isset($_GET['key']) || !hash_equals(ADS_KEY, (string)$_GET['key'])) {
        http_response_code(403);
        exit('forbidden');
    }
}

function fetch_json(string $url): ?array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERAGENT => 'games.ro-ads/1.0 (+https://games.ro)',
        CURLOPT_FOLLOWLOCATION => true,
    ]);
    $body = curl_exec($ch);
    if (!is_string($body)) return null;
    $d = json_decode($body, true);
    return is_array($d) ? $d : null;
}

/** bucket-ul contextual al unui produs, din product_type + titlu */
function bucket(string $type, string $title): string {
    $t = mb_strtolower($type . ' ' . $title);
    if (str_contains($t, 'esim')) return 'esim';
    if (str_contains($t, 'căști') || str_contains($t, 'casti') || str_contains($t, 'headphone')) return 'casti';
    if (str_contains($t, 'încărcător') || str_contains($t, 'incarcator') || str_contains($t, 'charger') || str_contains($t, 'cablu')) return 'incarcatoare';
    if (str_contains($t, 'crypto') || str_contains($t, 'portofel') || str_contains($t, 'card')) return 'crypto';
    return 'gadget';
}

$all = [];
for ($page = 1; $page <= 6; $page++) {
    $d = fetch_json("https://gb.ro/products.json?limit=250&page={$page}");
    if (!$d || empty($d['products'])) break;
    foreach ($d['products'] as $p) {
        $v = $p['variants'][0] ?? null;
        if (!$v || empty($v['available'])) continue;           // doar produse în stoc
        $img = $p['images'][0]['src'] ?? null;
        if (!$img) continue;                                    // fără imagine nu servim
        $all[] = [
            'title'  => (string)$p['title'],
            'price'  => (string)$v['price'],
            'img'    => (string)$img,
            'handle' => (string)$p['handle'],
            'bucket' => bucket((string)($p['product_type'] ?? ''), (string)$p['title']),
        ];
    }
}

if (count($all) < 10) {                                         // feed suspect → nu stricăm cache-ul bun
    fwrite(STDERR, "feed prea mic (" . count($all) . "), cache păstrat\n");
    exit(1);
}

$out = [
    'generated' => date('c'),
    'count'     => count($all),
    'buckets'   => [],
];
foreach ($all as $p) $out['buckets'][$p['bucket']][] = $p;

file_put_contents(__DIR__ . '/products-cache.json', json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
echo 'ok: ' . count($all) . " produse, bucket-uri: " . implode(',', array_keys($out['buckets'])) . "\n";
