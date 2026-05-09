<?php
use Symfony\Component\Console\Input\ArgvInput;

define('LARAVEL_START', microtime(true));
$_SERVER['argv'] = ['artisan', '--version'];
$_SERVER['argc'] = 2;

require __DIR__.'/vendor/autoload.php';

try {
    $status = (require_once __DIR__.'/bootstrap/app.php')
        ->handleCommand(new ArgvInput);
    exit($status);
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
    echo "In: " . $e->getFile() . ':' . $e->getLine() . PHP_EOL;
    echo "Trace:" . PHP_EOL;
    echo $e->getTraceAsString() . PHP_EOL;
}
