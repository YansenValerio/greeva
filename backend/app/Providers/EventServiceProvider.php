<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        // Listeners are auto-discovered from app/Listeners/ by the framework.
        // Add entries here only for conditional or dynamic registration.
    ];
}
