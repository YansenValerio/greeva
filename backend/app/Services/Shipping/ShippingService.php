<?php

declare(strict_types=1);

namespace App\Services\Shipping;

use App\Models\Product;
use App\Services\Shipping\Providers\BiteshipShippingProvider;
use App\Services\Shipping\Providers\MockShippingProvider;
use App\Services\Shipping\Providers\ShippingProvider;

class ShippingService
{
    /**
     * Pilih provider aktif. Fallback ke mock bila Biteship dipilih
     * tapi API key belum diisi.
     */
    public function provider(): ShippingProvider
    {
        $mode = config('shipping.provider', 'mock');

        if ($mode === 'biteship' && ! empty(config('shipping.biteship.api_key'))) {
            return new BiteshipShippingProvider();
        }

        return new MockShippingProvider();
    }

    /**
     * Daftar tarif untuk isi cart menuju kode pos tujuan.
     *
     * @param  array<int, array<string, mixed>>  $cartItems
     * @return ShippingRate[]
     */
    public function ratesForCart(array $cartItems, string $destinationPostalCode): array
    {
        return $this->provider()->rates($destinationPostalCode, $this->totalWeight($cartItems));
    }

    /**
     * Cari tarif spesifik berdasarkan kurir + layanan yang dipilih buyer.
     * Dipakai saat checkout untuk menghitung ulang ongkir secara otoritatif
     * (harga tidak pernah dipercaya dari client).
     *
     * @param  array<int, array<string, mixed>>  $cartItems
     */
    public function resolveRate(
        array $cartItems,
        string $destinationPostalCode,
        string $courierCode,
        string $serviceCode,
    ): ?ShippingRate {
        $key = "{$courierCode}:{$serviceCode}";

        foreach ($this->ratesForCart($cartItems, $destinationPostalCode) as $rate) {
            if ($rate->key() === $key) {
                return $rate;
            }
        }

        return null;
    }

    /**
     * Total berat (gram) dari isi cart. Produk tanpa berat memakai default,
     * dan total minimal mengikuti config (mis. 1 kg).
     *
     * @param  array<int, array<string, mixed>>  $cartItems
     */
    public function totalWeight(array $cartItems): int
    {
        $defaultPerItem = (int) config('shipping.weight.default_per_item', 250);
        $minimum        = (int) config('shipping.weight.minimum', 1000);

        $productIds = array_values(array_unique(array_column($cartItems, 'product_id')));
        $weights    = Product::whereIn('id', $productIds)->pluck('weight', 'id');

        $total = 0;
        foreach ($cartItems as $item) {
            $weight = (int) ($weights[$item['product_id']] ?? 0);
            if ($weight <= 0) {
                $weight = $defaultPerItem;
            }
            $total += $weight * (int) $item['quantity'];
        }

        return max($total, $minimum);
    }
}
