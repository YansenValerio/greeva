<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\VoucherType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Voucher extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'description',
        'type',
        'value',
        'max_discount',
        'min_purchase',
        'valid_from',
        'valid_until',
        'usage_limit',
        'per_user_limit',
        'first_order_only',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type'             => VoucherType::class,
            'value'            => 'integer',
            'max_discount'     => 'integer',
            'min_purchase'     => 'integer',
            'valid_from'       => 'datetime',
            'valid_until'      => 'datetime',
            'usage_limit'      => 'integer',
            'per_user_limit'   => 'integer',
            'first_order_only' => 'boolean',
            'is_active'        => 'boolean',
        ];
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    // ── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    public function isWithinValidPeriod(): bool
    {
        $now = now();

        if ($this->valid_from !== null && $now->lt($this->valid_from)) {
            return false;
        }

        if ($this->valid_until !== null && $now->gt($this->valid_until)) {
            return false;
        }

        return true;
    }
}
