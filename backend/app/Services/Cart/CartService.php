<?php

declare(strict_types=1);

namespace App\Services\Cart;

use App\Models\ProductVariant;
use Illuminate\Support\Facades\Redis;

class CartService
{
    public function getAuthKey(int $userId): string
    {
        return "cart:{$userId}";
    }

    public function getGuestKey(string $token): string
    {
        return "cart:guest:{$token}";
    }

    /** Ambil semua item dari keranjang */
    public function get(string $key): array
    {
        $raw = Redis::hgetall($key);
        if (empty($raw)) {
            return [];
        }

        return array_values(array_map(
            fn (string $json) => json_decode($json, true),
            $raw,
        ));
    }

    /** Tambah item. Jika variant sudah ada, tambah qty. */
    public function addItem(string $key, int $variantId, int $qty): array
    {
        $variant = ProductVariant::with('product')->findOrFail($variantId);

        if (! $variant->is_active || ! $variant->product->isActive()) {
            abort(422, 'Produk tidak tersedia.');
        }

        $existing = Redis::hget($key, (string) $variantId);
        $current  = $existing ? json_decode($existing, true) : null;
        $newQty   = ($current['quantity'] ?? 0) + $qty;

        if ($newQty > $variant->stock) {
            abort(422, "Stok tidak mencukupi. Tersedia: {$variant->stock}.");
        }

        $item = [
            'variant_id'    => $variantId,
            'product_id'    => $variant->product_id,
            'partner_id'    => $variant->product->partner_id,
            'product_name'  => $variant->product->name,
            'variant_name'  => $variant->name,
            'sku'           => $variant->sku,
            'product_image' => $variant->product->images[0] ?? null,
            'price'         => $variant->effectivePrice(), // sen
            'quantity'      => $newQty,
        ];

        Redis::hset($key, (string) $variantId, json_encode($item));

        return $item;
    }

    /** Update qty item tertentu. qty=0 akan hapus item. */
    public function updateItem(string $key, int $variantId, int $qty): ?array
    {
        if ($qty === 0) {
            $this->removeItem($key, $variantId);
            return null;
        }

        $existing = Redis::hget($key, (string) $variantId);
        if (! $existing) {
            abort(404, 'Item tidak ditemukan di keranjang.');
        }

        $variant = ProductVariant::findOrFail($variantId);

        if ($qty > $variant->stock) {
            abort(422, "Stok tidak mencukupi. Tersedia: {$variant->stock}.");
        }

        $item             = json_decode($existing, true);
        $item['quantity'] = $qty;
        $item['price']    = $variant->effectivePrice(); // refresh harga

        Redis::hset($key, (string) $variantId, json_encode($item));

        return $item;
    }

    public function removeItem(string $key, int $variantId): void
    {
        Redis::hdel($key, (string) $variantId);
    }

    public function clear(string $key): void
    {
        Redis::del($key);
    }

    public function count(string $key): int
    {
        return (int) Redis::hlen($key);
    }

    /** Total harga semua item dalam sen */
    public function subtotal(string $key): int
    {
        return array_sum(
            array_map(
                fn (array $i) => $i['price'] * $i['quantity'],
                $this->get($key),
            )
        );
    }

    /**
     * Merge guest cart ke auth cart saat user login.
     * Qty dijumlah jika variant sudah ada di auth cart.
     */
    public function mergeGuestToAuth(string $guestKey, string $authKey): void
    {
        $guestItems = Redis::hgetall($guestKey);

        foreach ($guestItems as $variantId => $json) {
            $guestItem = json_decode($json, true);
            $existing  = Redis::hget($authKey, $variantId);

            if ($existing) {
                $authItem             = json_decode($existing, true);
                $authItem['quantity'] += $guestItem['quantity'];
                Redis::hset($authKey, $variantId, json_encode($authItem));
            } else {
                Redis::hset($authKey, $variantId, $json);
            }
        }

        Redis::del($guestKey);
    }
}
