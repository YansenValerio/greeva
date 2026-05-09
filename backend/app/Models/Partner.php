<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Partner extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'logo',
        'revenue_share_percent',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'is_active',
        'joined_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active'              => 'boolean',
            'revenue_share_percent'  => 'integer',
            'joined_at'              => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function earnings(): HasMany
    {
        return $this->hasMany(PartnerEarning::class);
    }

    public function payoutBatches(): HasMany
    {
        return $this->hasMany(PayoutBatch::class);
    }

    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class);
    }

    // ── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
