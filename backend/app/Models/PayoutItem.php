<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayoutItem extends Model
{
    protected $fillable = [
        'payout_batch_id',
        'partner_earning_id',
        'amount',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer', // sen
        ];
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function batch(): BelongsTo
    {
        return $this->belongsTo(PayoutBatch::class, 'payout_batch_id');
    }

    public function earning(): BelongsTo
    {
        return $this->belongsTo(PartnerEarning::class, 'partner_earning_id');
    }
}
