<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Status earning mitra.
 *
 * Alur:
 *   pending → available → paid
 *           ↘ reversed  (refund/dispute)
 *
 * pending   : order completed, dalam cooling period (7 hari)
 * available : cooling selesai, siap masuk batch payout
 * paid      : sudah masuk batch payout & ditransfer
 * reversed  : dibatalkan karena refund atau dispute
 */
enum EarningStatus: string
{
    case Pending   = 'pending';
    case Available = 'available';
    case Paid      = 'paid';
    case Reversed  = 'reversed';

    public function label(): string
    {
        return match ($this) {
            EarningStatus::Pending   => 'Dalam Proses',
            EarningStatus::Available => 'Siap Dicairkan',
            EarningStatus::Paid      => 'Sudah Dibayar',
            EarningStatus::Reversed  => 'Dibatalkan',
        };
    }
}
