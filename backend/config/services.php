<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third-Party Service Configuration
    |--------------------------------------------------------------------------
    */

    'midtrans' => [
        'server_key'    => env('MIDTRANS_SERVER_KEY'),
        'client_key'    => env('MIDTRANS_CLIENT_KEY'),
        'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    ],

    'cloudinary' => [
        'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
        'api_key'    => env('CLOUDINARY_API_KEY'),
        'api_secret' => env('CLOUDINARY_API_SECRET'),
    ],

    'meilisearch' => [
        'host' => env('MEILISEARCH_HOST', 'http://meilisearch:7700'),
        'key'  => env('MEILISEARCH_KEY'),
    ],

    'google_ai' => [
        'api_key' => env('GOOGLE_AI_API_KEY'),
        'model'   => env('GOOGLE_AI_MODEL', 'gemini-pro'),
    ],

    'whatsapp' => [
        'provider' => env('WHATSAPP_PROVIDER', 'fonnte'),
        'api_key'  => env('WHATSAPP_API_KEY'),
    ],

];
