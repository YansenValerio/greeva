<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\EarningStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartnerEarning extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'partner_id',
        'order_id',
        'order_item_id',
        'payout_batch_id',
        'amount',
        'status',
        'order_completed_at',
        'available_at',
        'paid_at',
        'reversed_at',
        'reversal_reason',
    ];

    protected function casts(): array
    {
        return [
            'status'              => EarningStatus::class,
            'amount'              => 'integer', // sen
            'order_completed_at'  => 'datetime',
            'available_at'        => 'datetime',
            'paid_at'             => 'datetime',
            'reversed_at'         => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function payoutBatch(): BelongsTo
    {
        return $this->belongsTo(PayoutBatch::class);
    }

    // ── Scopes ───────────────────────────────────────────────────────────────

    public function scopeAvailable($query)
    {
        return $query->where('status', EarningStatus::Available);
    }

    public function scopePending($query)
    {
        return $query->where('status', EarningStatus::Pending);
    }

    public function scopeForPartner($query, int $partnerId)
    {
        return $query->where('partner_id', $partnerId);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public function isAvailable(): bool
    {
        return $this->status === EarningStatus::Available;
    }
}
