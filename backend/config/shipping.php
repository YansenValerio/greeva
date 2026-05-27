<?php

declare(strict_types=1);

/**
 * Konfigurasi pengiriman / ongkir Greeva.
 *
 * Mode "mock" menghitung ongkir secara lokal berbasis berat (tanpa API eksternal),
 * cocok untuk development. Mode "biteship" memanggil API Biteship; jika API key
 * kosong, ShippingService otomatis fallback ke "mock".
 *
 * CATATAN: ongkir bersifat snapshot saat order dibuat (disimpan di kolom
 * shipping_total order). Perubahan tarif tidak retroaktif terhadap order lama.
 */
return [

    /** Provider aktif: "mock" | "biteship" */
    'provider' => env('SHIPPING_PROVIDER', 'mock'),

    /** Titik asal pengiriman (gudang Greeva) */
    'origin' => [
        'city'        => env('SHIPPING_ORIGIN_CITY', 'Bandung'),
        'postal_code' => env('SHIPPING_ORIGIN_POSTAL_CODE', '40111'),
    ],

    /**
     * Berat default per item (gram) bila produk tidak punya berat.
     * Berat minimum yang ditagih per pengiriman juga diatur di sini.
     */
    'weight' => [
        'default_per_item' => 250,
        'minimum'          => 1000,
    ],

    'biteship' => [
        'api_key'  => env('BITESHIP_API_KEY'),
        'base_url' => env('BITESHIP_BASE_URL', 'https://api.biteship.com'),
        'couriers' => env('BITESHIP_COURIERS', 'jne,jnt,sicepat,anteraja'),
        'timeout'  => 10,
    ],

    /**
     * Tarif mock — dipakai saat provider "mock" (atau fallback).
     * Harga dalam SEN. Tarif final = base + (kg - 1) * per_extra_kg,
     * dibulatkan ke atas per kilogram.
     */
    'mock' => [
        'services' => [
            [
                'courier_code'  => 'jne',
                'courier_name'  => 'JNE',
                'service_code'  => 'REG',
                'service_name'  => 'Reguler',
                'etd'           => '2-3 hari',
                'base'          => 1000000,  // Rp 10.000
                'per_extra_kg'  => 500000,   // Rp 5.000 / kg tambahan
            ],
            [
                'courier_code'  => 'jnt',
                'courier_name'  => 'J&T Express',
                'service_code'  => 'EZ',
                'service_name'  => 'Reguler',
                'etd'           => '2-4 hari',
                'base'          => 900000,   // Rp 9.000
                'per_extra_kg'  => 600000,
            ],
            [
                'courier_code'  => 'sicepat',
                'courier_name'  => 'SiCepat',
                'service_code'  => 'BEST',
                'service_name'  => 'Express Besok Sampai',
                'etd'           => '1-2 hari',
                'base'          => 1600000,  // Rp 16.000
                'per_extra_kg'  => 800000,
            ],
        ],
    ],

];
