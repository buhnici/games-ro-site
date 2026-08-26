<?php
// Sondă temporară de diagnostic (protejată cu cheie; se șterge după).
error_reporting(E_ALL); ini_set('display_errors', '1');
if (!isset($_GET['key']) || $_GET['key'] !== '621389732234d9dca4301b9c0ad5dcca06ba66c07fc2bf79') { http_response_code(403); exit('forbidden'); }
echo 'PHP=' . PHP_VERSION . "\n";
echo 'sapi=' . PHP_SAPI . "\n";
echo 'curl=' . (function_exists('curl_init') ? 'da' : 'NU') . "\n";
echo 'scriabil=' . (is_writable(__DIR__) ? 'da' : 'NU') . "\n";
$t = @include __DIR__ . '/config.php';
echo 'config=' . (defined('ADS_KEY') ? 'OK' : 'EȘEC') . "\n";
