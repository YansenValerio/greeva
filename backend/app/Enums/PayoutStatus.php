<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Status batch payout mitra.
 *
 * Alur:
 *   pending → processing → paid
 *           ↘ cancelled  (earnings dikembalikan ke available)
 *           ↘ failed
 *
 * CATATAN: payout TIDAK pernah otomatis — selalu manual oleh admin.
 */
enum PayoutStatus: string
{
    case Pending    = 'pending';
    case Processing = 'processing';
    case Paid       = 'paid';
    case Cancelled  = 'cancelled';
    case Failed     = 'failed';

    public function label(): string
    {
        return match ($this) {
            PayoutStatus::Pending    => 'Menunggu Proses',
            PayoutStatus::Processing => 'Sedang Diproses',
            PayoutStatus::Paid       => 'Sudah Dibayar',
            PayoutStatus::Cancelled  => 'Dibatalkan',
            PayoutStatus::Failed     => 'Gagal',
        };
    }
}
