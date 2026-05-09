<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'sku',
        'name',
        'price',
        'stock',
        'images',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price'      => 'integer', // sen; null = gunakan product.price
            'stock'      => 'integer',
            'images'     => 'array',
            'sort_order' => 'integer',
            'is_active'  => 'boolean',
        ];
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /** Harga efektif: gunakan harga variant jika ada, fallback ke harga produk */
    public function effectivePrice(): int
    {
        return $this->price ?? $this->product->price;
    }

    public function isInStock(): bool
    {
        return $this->stock > 0;
    }

    // ── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock', '>', 0);
    }
}
