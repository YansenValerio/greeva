<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Tipe potongan voucher.
 *
 * percent : value = persen (1–100); potongan = subtotal × value%, opsional dibatasi max_discount
 * fixed   : value = nominal dalam sen; potongan = value (di-cap ≤ subtotal)
 */
enum VoucherType: string
{
    case Percent = 'percent';
    case Fixed   = 'fixed';

    public function label(): string
    {
        return match ($this) {
            VoucherType::Percent => 'Persentase',
            VoucherType::Fixed   => 'Nominal Tetap',
        };
    }
}
