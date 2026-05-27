<?php

declare(strict_types=1);

namespace App\Services\Shipping\Providers;

use App\Services\Shipping\ShippingRate;
use App\Support\Money;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Adapter Biteship (https://biteship.com). Memakai kode pos asal & tujuan.
 * Endpoint: POST /v1/rates/couriers.
 */
class BiteshipShippingProvider implements ShippingProvider
{
    public function rates(string $destinationPostalCode, int $weightGrams): array
    {
        $config = config('shipping.biteship');

        $response = Http::withHeaders([
            'Authorization' => $config['api_key'],
        ])
            ->timeout($config['timeout'] ?? 10)
            ->post(rtrim($config['base_url'], '/') . '/v1/rates/couriers', [
                'origin_postal_code'      => (int) config('shipping.origin.postal_code'),
                'destination_postal_code' => (int) $destinationPostalCode,
                'couriers'                => $config['couriers'],
                'items'                   => [[
                    'name'     => 'Pesanan Greeva',
                    'quantity' => 1,
                    'weight'   => $weightGrams,
                    'value'    => 0,
                ]],
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Gagal mengambil tarif dari Biteship.');
        }

        $pricing = $response->json('pricing', []);

        return array_map(
            fn (array $p) => new ShippingRate(
                courierCode: (string) ($p['courier_code'] ?? ''),
                courierName: (string) ($p['courier_name'] ?? ''),
                serviceCode: (string) ($p['courier_service_code'] ?? ''),
                serviceName: (string) ($p['courier_service_name'] ?? ''),
                etd: (string) ($p['duration'] ?? $p['shipment_duration_range'] ?? '-'),
                // Biteship mengembalikan harga dalam rupiah → konversi ke sen
                cost: Money::toCents((int) ($p['price'] ?? 0)),
            ),
            $pricing,
        );
    }
}
