<?php

declare(strict_types=1);

/**
 * Konfigurasi bisnis Greeva.
 *
 * Semua nilai bisnis yang bersifat configurable dikumpulkan di sini
 * agar mudah di-override via environment variable tanpa menyentuh kode.
 *
 * CATATAN: Nilai bagi hasil (revenue_share) bersifat snapshot saat order dibuat.
 * Perubahan config ini tidak retroaktif terhadap order yang sudah ada.
 */
return [

    /*
    |--------------------------------------------------------------------------
    | Bagi Hasil (Revenue Share)
    |--------------------------------------------------------------------------
    |
    | Persentase bagi hasil untuk mitra brand.
    | Berlaku sebagai default; setiap mitra bisa punya % tersendiri
    | selama masih dalam rentang min–max.
    |
    */
    'revenue_share' => [
        /** Persentase default bagi hasil mitra (80%) */
        'default_percent' => (int) env('GREEVA_DEFAULT_REVENUE_SHARE', 80),

        /** Persentase minimum yang diizinkan per kontrak mitra */
        'min_percent' => 80,

        /** Persentase maksimum yang diizinkan per kontrak mitra */
        'max_percent' => 85,
    ],

    /*
    |--------------------------------------------------------------------------
    | Earning & Cooling Period
    |--------------------------------------------------------------------------
    |
    | Setelah order berstatus `completed`, earning mitra memasuki cooling period
    | sebelum bisa dicairkan. Ini memberikan waktu untuk dispute/refund.
    |
    */
    'earnings' => [
        /** Jumlah hari cooling sebelum earning berstatus `available` */
        'cooling_period_days' => (int) env('GREEVA_COOLING_PERIOD_DAYS', 7),
    ],

    /*
    |--------------------------------------------------------------------------
    | Payout
    |--------------------------------------------------------------------------
    |
    | Cycle payout dua mingguan pada tanggal 1 dan 16.
    | Pencairan selalu manual oleh admin Greeva (tidak otomatis).
    |
    */
    'payout' => [
        /** Jumlah hari default periode payout */
        'period_days' => (int) env('GREEVA_DEFAULT_PAYOUT_PERIOD_DAYS', 14),

        /** Tanggal dalam sebulan untuk generate batch payout */
        'cycle_dates' => [1, 16],
    ],

    /*
    |--------------------------------------------------------------------------
    | Cart
    |--------------------------------------------------------------------------
    |
    | Konfigurasi keranjang belanja, termasuk TTL untuk guest cart
    | yang disimpan di Redis.
    |
    */
    'cart' => [
        /** Masa berlaku guest cart dalam hari (disimpan di Redis) */
        'guest_ttl_days' => (int) env('GREEVA_GUEST_CART_TTL_DAYS', 30),
    ],

    /*
    |--------------------------------------------------------------------------
    | Order
    |--------------------------------------------------------------------------
    |
    | Konfigurasi terkait siklus hidup order, termasuk expiry pembayaran
    | dan waktu auto-complete setelah delivered.
    |
    */
    'order' => [
        /** Waktu kadaluarsa pembayaran dalam jam sejak order dibuat */
        'payment_expiry_hours' => (int) env('GREEVA_ORDER_PAYMENT_EXPIRY_HOURS', 24),

        /** Hari setelah `delivered` hingga order otomatis `completed` */
        'auto_complete_days_after_delivery' => 7,
    ],

    /*
    |--------------------------------------------------------------------------
    | Prefix Nomor Dokumen
    |--------------------------------------------------------------------------
    |
    | Prefix untuk generate nomor order dan payout yang human-readable.
    | Contoh: GRV-20260501-0001, PYT-20260501-001
    |
    */
    'order_number_prefix' => 'GRV',
    'payout_number_prefix' => 'PYT',

];
