<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PayoutStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class PayoutBatch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'payout_number',
        'partner_id',
        'processed_by',
        'status',
        'total_amount',
        'item_count',
        'period_start',
        'period_end',
        'payment_proof',
        'paid_at',
        'cancelled_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'status'       => PayoutStatus::class,
            'total_amount' => 'integer', // sen
            'item_count'   => 'integer',
            'period_start' => 'date',
            'period_end'   => 'date',
            'paid_at'      => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PayoutItem::class);
    }

    public function earnings(): HasManyThrough
    {
        return $this->hasManyThrough(
            PartnerEarning::class,
            PayoutItem::class,
            'payout_batch_id',
            'id',
            'id',
            'partner_earning_id'
        );
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public function canBeCancelled(): bool
    {
        return in_array($this->status, [
            PayoutStatus::Pending,
            PayoutStatus::Processing,
        ], strict: true);
    }
}
