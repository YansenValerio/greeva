<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /** Produk aktif bisa dilihat siapa saja (termasuk guest) */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Product $product): bool
    {
        // Produk aktif bisa dilihat publik
        if ($product->isActive()) {
            return true;
        }

        if (! $user) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        // Mitra hanya lihat produk miliknya
        return $user->isPartner() && $product->partner_id === $user->partner?->id;
    }

    /** Mitra atau admin bisa tambah produk */
    public function create(User $user): bool
    {
        return $user->isPartner() || $user->isAdmin();
    }

    /** Mitra edit produk milik sendiri; admin edit semua */
    public function update(User $user, Product $product): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isPartner() && $product->partner_id === $user->partner?->id;
    }

    /** Mitra hapus produk draft/inactive milik sendiri; admin hapus semua */
    public function delete(User $user, Product $product): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isPartner()
            && $product->partner_id === $user->partner?->id
            && in_array($product->status, [ProductStatus::Draft, ProductStatus::Inactive], strict: true);
    }
}
