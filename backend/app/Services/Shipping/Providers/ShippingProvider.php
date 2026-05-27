<?php

declare(strict_types=1);

namespace App\Services\Shipping\Providers;

use App\Services\Shipping\ShippingRate;

interface ShippingProvider
{
    /**
     * Ambil daftar tarif menuju kode pos tujuan untuk berat tertentu (gram).
     *
     * @return ShippingRate[]
     */
    public function rates(string $destinationPostalCode, int $weightGrams): array;
}
