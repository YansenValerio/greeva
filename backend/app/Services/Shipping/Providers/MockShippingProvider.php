<?php

declare(strict_types=1);

namespace App\Services\Shipping\Providers;

use App\Services\Shipping\ShippingRate;

/**
 * Kalkulasi ongkir lokal berbasis berat — tanpa API eksternal.
 * Dipakai di development atau sebagai fallback saat Biteship belum dikonfigurasi.
 */
class MockShippingProvider implements ShippingProvider
{
    public function rates(string $destinationPostalCode, int $weightGrams): array
    {
        $kg = max(1, (int) ceil($weightGrams / 1000));

        return array_map(function (array $svc) use ($kg) {
            $cost = $svc['base'] + ($kg - 1) * $svc['per_extra_kg'];

            return new ShippingRate(
                courierCode: $svc['courier_code'],
                courierName: $svc['courier_name'],
                serviceCode: $svc['service_code'],
                serviceName: $svc['service_name'],
                etd: $svc['etd'],
                cost: $cost,
            );
        }, config('shipping.mock.services', []));
    }
}
