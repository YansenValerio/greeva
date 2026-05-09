<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number',
        'user_id',
        'guest_email',
        'guest_name',
        'guest_phone',
        'status',
        'subtotal',
        'shipping_total',
        'discount_total',
        'grand_total',
        'shipping_name',
        'shipping_phone',
        'shipping_address',
        'shipping_province',
        'shipping_city',
        'shipping_district',
        'shipping_postal_code',
        'payment_method',
        'payment_token',
        'payment_url',
        'paid_at',
        'payment_expired_at',
        'delivered_at',
        'completed_at',
        'cancelled_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'status'              => OrderStatus::class,
            'subtotal'            => 'integer', // sen
            'shipping_total'      => 'integer', // sen
            'discount_total'      => 'integer', // sen
            'grand_total'         => 'integer', // sen
            'paid_at'             => 'datetime',
            'payment_expired_at'  => 'datetime',
            'delivered_at'        => 'datetime',
            'completed_at'        => 'datetime',
            'cancelled_at'        => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class);
    }

    public function earnings(): HasMany
    {
        return $this->hasMany(PartnerEarning::class);
    }

    // ── Scopes ───────────────────────────────────────────────────────────────

    public function scopeByStatus($query, OrderStatus $status)
    {
        return $query->where('status', $status);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /** Order yang payment-nya sudah expired tapi belum ditandai gagal */
    public function scopeExpiredPayment($query)
    {
        return $query
            ->where('status', OrderStatus::PendingPayment)
            ->where('payment_expired_at', '<', now());
    }

    // ── State helpers ────────────────────────────────────────────────────────

    public function isPaid(): bool
    {
        return in_array($this->status, [
            OrderStatus::Paid,
            OrderStatus::Packing,
            OrderStatus::Shipped,
            OrderStatus::Delivered,
            OrderStatus::Completed,
        ], strict: true);
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, [
            OrderStatus::PendingPayment,
            OrderStatus::Paid,
            OrderStatus::Packing,
        ], strict: true);
    }

    public function isCompleted(): bool
    {
        return $this->status === OrderStatus::Completed;
    }

    public function isGuest(): bool
    {
        return $this->user_id === null;
    }
}
