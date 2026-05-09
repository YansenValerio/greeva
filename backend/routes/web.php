<?php

use Illuminate\Support\Facades\Route;

// Greeva adalah API-only backend.
// Web routes hanya digunakan untuk health check dan fallback.

Route::get('/', fn() => response()->json([
    'app'     => 'Greeva API',
    'version' => 'v1',
    'docs'    => '/api/v1',
]));
