<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\InventoryReason;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'product_variant_id',
        'product_id',
        'partner_id',
        'order_id',
        'user_id',
        'change',
        'stock_before',
        'stock_after',
        'reason',
        'note',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'reason'       => InventoryReason::class,
            'change'       => 'integer',
            'stock_before' => 'integer',
            'stock_after'  => 'integer',
            'created_at'   => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id')->withTrashed();
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    // ── Scopes ───────────────────────────────────────────────────────────────

    public function scopeForPartner($query, int $partnerId)
    {
        return $query->where('partner_id', $partnerId);
    }
}
