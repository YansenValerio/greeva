<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Partner;
use App\Models\User;

class PartnerPolicy
{
    /** Daftar semua mitra: admin only */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /** Buat mitra baru: admin only */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /** Detail mitra: admin atau mitra sendiri */
    public function view(User $user, Partner $partner): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isPartner() && $partner->user_id === $user->id;
    }

    /** Update profil mitra: admin atau mitra sendiri */
    public function update(User $user, Partner $partner): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isPartner() && $partner->user_id === $user->id;
    }

    /** Aktifkan/nonaktifkan mitra: admin only */
    public function toggleActive(User $user): bool
    {
        return $user->isAdmin();
    }

    /** Atur % bagi hasil mitra: admin only */
    public function updateRevenueShare(User $user): bool
    {
        return $user->isAdmin();
    }
}
