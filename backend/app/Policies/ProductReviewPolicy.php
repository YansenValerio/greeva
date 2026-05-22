<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\OrderStatus;
use App\Models\OrderItem;
use App\Models\ProductReview;
use App\Models\User;

class ProductReviewPolicy
{
    /** Daftar review publik */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, ProductReview $review): bool
    {
        return $review->is_approved
            || ($user && ($user->isAdmin() || $user->id === $review->user_id));
    }

    /**
     * Buat review: buyer pemilik order, order completed,
     * dan belum pernah me-review item ini.
     */
    public function createForItem(User $user, OrderItem $item): bool
    {
        $order = $item->order;

        if (! $order || $order->user_id !== $user->id) {
            return false;
        }

        if ($order->status !== OrderStatus::Completed) {
            return false;
        }

        // Unique constraint juga di DB; check di sini agar UX-nya bagus
        return ! ProductReview::where('order_item_id', $item->id)->exists();
    }

    /** Edit/hapus: hanya pemilik review (atau admin untuk hapus) */
    public function update(User $user, ProductReview $review): bool
    {
        return $user->id === $review->user_id;
    }

    public function delete(User $user, ProductReview $review): bool
    {
        return $user->isAdmin() || $user->id === $review->user_id;
    }
}
