<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\PayoutBatch;
use App\Models\User;

class PayoutBatchPolicy
{
    /** Admin lihat semua; mitra lihat milik sendiri */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isPartner();
    }

    public function view(User $user, PayoutBatch $batch): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isPartner() && $batch->partner_id === $user->partner?->id;
    }

    /** Buat batch payout: admin only */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /** Update status payout (processing → paid): admin only */
    public function update(User $user, PayoutBatch $batch): bool
    {
        return $user->isAdmin();
    }

    /** Batalkan batch: admin only, dan hanya jika statusnya memungkinkan */
    public function cancel(User $user, PayoutBatch $batch): bool
    {
        return $user->isAdmin() && $batch->canBeCancelled();
    }
}
