<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ProductStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'partner_id',
        'category_id',
        'name',
        'slug',
        'description',
        'short_description',
        'status',
        'price',
        'compare_price',
        'images',
        'weight',
        'material',
        'sustainability_notes',
        'meta_title',
        'meta_description',
        'revenue_share_percent',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'status'                 => ProductStatus::class,
            'price'                  => 'integer', // sen
            'compare_price'          => 'integer', // sen
            'images'                 => 'array',
            'weight'                 => 'integer',
            'revenue_share_percent'  => 'integer',
            'published_at'           => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('sort_order');
    }

    public function activeVariants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)
            ->where('is_active', true)
            ->orderBy('sort_order');
    }

    // ── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', ProductStatus::Active);
    }

    public function scopeForPartner($query, int $partnerId)
    {
        return $query->where('partner_id', $partnerId);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public function isActive(): bool
    {
        return $this->status === ProductStatus::Active;
    }

    public function totalStock(): int
    {
        return $this->variants()->sum('stock');
    }
}
