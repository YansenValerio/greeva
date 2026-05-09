<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /** Admin lihat semua; buyer lihat milik sendiri; partner dicek di service layer */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Order $order): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isBuyer()) {
            return $order->user_id === $user->id;
        }

        // Partner: cek apakah ada item milik mitra ini di order
        if ($user->isPartner() && $user->partner) {
            return $order->items()->where('partner_id', $user->partner->id)->exists();
        }

        return false;
    }

    /** Semua authenticated user bisa buat order */
    public function create(User $user): bool
    {
        return true;
    }

    /** Update status order: admin only */
    public function update(User $user, Order $order): bool
    {
        return $user->isAdmin();
    }

    /** Batalkan order: buyer (milik sendiri, sebelum shipped) atau admin */
    public function cancel(User $user, Order $order): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isBuyer()
            && $order->user_id === $user->id
            && $order->canBeCancelled();
    }
}
