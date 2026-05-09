<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Tampilkan quote inspiratif');

// ── Scheduled Jobs ──────────────────────────────────────────────────────────
// Jalankan: php artisan schedule:work (development)
//           Cron: * * * * * php artisan schedule:run (production)

Schedule::command('sanctum:prune-expired --hours=24')->daily();

// Step 5: payment expiry checker
Schedule::command('greeva:expire-payments')->everyFiveMinutes();

// Step 6: earnings lifecycle
Schedule::command('greeva:mature-earnings')->hourly();
Schedule::command('greeva:auto-complete-orders')->daily();
