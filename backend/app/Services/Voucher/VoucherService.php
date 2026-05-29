<?php

declare(strict_types=1);

namespace App\Services\Voucher;

use App\Enums\OrderStatus;
use App\Enums\VoucherType;
use App\Models\Order;
use App\Models\User;
use App\Models\Voucher;
use App\Support\Money;

class VoucherService
{
    /**
     * Status order yang dianggap "memakai" kuota voucher.
     * Order cancelled/payment_failed otomatis melepas kuota.
     */
    private const COUNTED_STATUSES = [
        OrderStatus::PendingPayment,
        OrderStatus::Paid,
        OrderStatus::Packing,
        OrderStatus::Shipped,
        OrderStatus::Delivered,
        OrderStatus::Completed,
        OrderStatus::Refunded,
    ];

    /**
     * Status order yang dianggap "belanja sukses" (untuk cek pelanggan baru).
     */
    private const SUCCESS_STATUSES = [
        OrderStatus::Paid,
        OrderStatus::Packing,
        OrderStatus::Shipped,
        OrderStatus::Delivered,
        OrderStatus::Completed,
    ];

    /**
     * Validasi voucher untuk user & subtotal tertentu. Abort 422 (Bahasa Indonesia)
     * jika tidak memenuhi syarat. Kembalikan Voucher jika valid.
     *
     * @param  bool  $lock  true saat dipanggil di dalam transaksi checkout (kunci baris)
     */
    public function validate(string $code, int $subtotal, User $user, bool $lock = false): Voucher
    {
        $normalized = strtoupper(trim($code));

        $query = Voucher::query()->where('code', $normalized);
        if ($lock) {
            $query->lockForUpdate();
        }
        $voucher = $query->first();

        if (! $voucher || ! $voucher->is_active) {
            abort(422, 'Kode voucher tidak valid.');
        }

        $now = now();
        if ($voucher->valid_from !== null && $now->lt($voucher->valid_from)) {
            abort(422, 'Voucher belum berlaku.');
        }
        if ($voucher->valid_until !== null && $now->gt($voucher->valid_until)) {
            abort(422, 'Voucher sudah kedaluwarsa.');
        }

        if ($subtotal < $voucher->min_purchase) {
            abort(422, 'Minimal belanja ' . Money::format($voucher->min_purchase) . ' untuk memakai voucher ini.');
        }

        if ($voucher->first_order_only && $this->hasSuccessfulOrder($user)) {
            abort(422, 'Voucher ini hanya berlaku untuk pelanggan baru.');
        }

        if ($voucher->usage_limit !== null && $this->totalUsage($voucher) >= $voucher->usage_limit) {
            abort(422, 'Kuota voucher sudah habis.');
        }

        if ($voucher->per_user_limit !== null && $this->userUsage($voucher, $user) >= $voucher->per_user_limit) {
            abort(422, 'Kamu sudah pernah memakai voucher ini.');
        }

        return $voucher;
    }

    /**
     * Hitung nominal potongan (sen) dari voucher untuk subtotal tertentu.
     * Selalu di-cap agar tidak melebihi subtotal.
     */
    public function computeDiscount(Voucher $voucher, int $subtotal): int
    {
        $discount = match ($voucher->type) {
            VoucherType::Percent => Money::percentage($subtotal, $voucher->value),
            VoucherType::Fixed   => $voucher->value,
        };

        if ($voucher->type === VoucherType::Percent
            && $voucher->max_discount !== null
            && $discount > $voucher->max_discount
        ) {
            $discount = $voucher->max_discount;
        }

        return (int) min($discount, $subtotal);
    }

    private function totalUsage(Voucher $voucher): int
    {
        return Order::where('voucher_id', $voucher->id)
            ->whereIn('status', self::COUNTED_STATUSES)
            ->count();
    }

    private function userUsage(Voucher $voucher, User $user): int
    {
        return Order::where('voucher_id', $voucher->id)
            ->where('user_id', $user->id)
            ->whereIn('status', self::COUNTED_STATUSES)
            ->count();
    }

    private function hasSuccessfulOrder(User $user): bool
    {
        return Order::where('user_id', $user->id)
            ->whereIn('status', self::SUCCESS_STATUSES)
            ->exists();
    }
}
