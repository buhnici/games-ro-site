<?php
// Diagnostic temporar (protejat). Se șterge după utilizare.
if (!isset($_GET['key']) || $_GET['key'] !== '621389732234d9dca4301b9c0ad5dcca06ba66c07fc2bf79') { http_response_code(403); exit('forbidden'); }
error_reporting(E_ALL); ini_set('display_errors', '1');
echo 'PHP=' . PHP_VERSION . "\n";
echo 'open_basedir=' . var_export(ini_get('open_basedir'), true) . "\n";
echo 'dir=' . __DIR__ . "\n";
$r = @file_get_contents(__DIR__ . '/campaigns.json');
echo 'citire_fisier=' . ($r === false ? 'EȘEC' : 'OK(' . strlen($r) . 'b)') . "\n";
echo 'include_config=';
$ok = @include __DIR__ . '/config.php';
echo (defined('ADS_KEY') ? 'OK' : 'EȘEC') . "\n";
error_clear_last();
