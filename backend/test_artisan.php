<?php
use Symfony\Component\Console\Input\ArgvInput;

define('LARAVEL_START', microtime(true));

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
echo "App class: " . get_class($app) . PHP_EOL;
echo "Has handleCommand: " . (method_exists($app, 'handleCommand') ? 'yes' : 'no') . PHP_EOL;

try {
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    echo "Kernel class: " . get_class($kernel) . PHP_EOL;
} catch (\Throwable $e) {
    echo "Kernel error: " . $e->getMessage() . PHP_EOL;
    echo "In: " . $e->getFile() . ':' . $e->getLine() . PHP_EOL;
}
