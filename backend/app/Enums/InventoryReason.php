<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Alasan perubahan stok varian produk.
 *
 * sale       : stok dipotong karena order (checkout)
 * release    : stok dikembalikan karena order dibatalkan / pembayaran gagal
 * adjustment : perubahan manual oleh mitra/admin (restock atau koreksi)
 * initial    : stok awal saat varian dibuat
 */
enum InventoryReason: string
{
    case Sale       = 'sale';
    case Release    = 'release';
    case Adjustment = 'adjustment';
    case Initial    = 'initial';

    public function label(): string
    {
        return match ($this) {
            InventoryReason::Sale       => 'Terjual',
            InventoryReason::Release    => 'Stok Dikembalikan',
            InventoryReason::Adjustment => 'Penyesuaian Manual',
            InventoryReason::Initial    => 'Stok Awal',
        };
    }
}
