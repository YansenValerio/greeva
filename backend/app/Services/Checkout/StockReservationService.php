<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Models\ProductVariant;

/**
 * Mengelola penambahan/pengurangan stok untuk siklus checkout.
 *
 * Alur:
 *  1. reserve()  — potong stok saat order dibuat (dalam DB transaction)
 *  2. release()  — kembalikan stok jika pembayaran gagal/expired
 *
 * Hard deduction terjadi di reserve(). Stok tidak dipotong dua kali —
 * payment success hanya mengubah status order, bukan stok.
 */
class StockReservationService
{
    /**
     * Potong stok secara permanen (provisional: akan dikembalikan jika gagal).
     *
     * @param  array<int, array{variant_id: int, quantity: int}>  $items
     */
    public function reserve(array $items): void
    {
        foreach ($items as $item) {
            ProductVariant::where('id', $item['variant_id'])
                ->decrement('stock', $item['quantity']);
        }
    }

    /**
     * Kembalikan stok (saat payment_failed atau cancelled).
     *
     * @param  array<int, array{variant_id: int, quantity: int}>  $items
     */
    public function release(array $items): void
    {
        foreach ($items as $item) {
            ProductVariant::where('id', $item['variant_id'])
                ->increment('stock', $item['quantity']);
        }
    }
}
