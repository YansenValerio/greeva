<?php

declare(strict_types=1);

namespace App\Services\StockAlert;

use App\Models\ProductVariant;
use App\Models\StockAlert;
use App\Models\User;

class StockAlertService
{
    /**
     * Daftarkan permintaan notifikasi stok untuk varian yang sedang habis.
     * Idempotent: satu langganan aktif per (varian, nomor telepon).
     *
     * @param  array{product_variant_id:int, phone:string, email?:string|null}  $data
     */
    public function subscribe(array $data, ?User $user = null): StockAlert
    {
        $variant = ProductVariant::findOrFail($data['product_variant_id']);

        if ($variant->stock > 0) {
            abort(422, 'Produk sedang tersedia. Tidak perlu notifikasi stok.');
        }

        return StockAlert::firstOrCreate(
            [
                'product_variant_id' => $variant->id,
                'phone'              => $data['phone'],
                'notified_at'        => null,
            ],
            [
                'user_id' => $user?->id,
                'email'   => $data['email'] ?? $user?->email,
            ],
        );
    }
}
