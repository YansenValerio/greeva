<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Status pengajuan retur.
 *
 * Alur:
 *   pending → approved  (admin setuju, order direfund, earning di-reverse)
 *           ↘ rejected  (admin tolak, order tetap completed)
 */
enum ReturnRequestStatus: string
{
    case Pending  = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            ReturnRequestStatus::Pending  => 'Menunggu Tinjauan',
            ReturnRequestStatus::Approved => 'Disetujui',
            ReturnRequestStatus::Rejected => 'Ditolak',
        };
    }
}
