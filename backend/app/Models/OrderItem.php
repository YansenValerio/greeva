<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OrderItem extends Model
{
    use HasFactory;
    protected $fillable = [
        'order_id',
        'product_id',
        'product_variant_id',
        'partner_id',
        'product_name',
        'variant_name',
        'sku',
        'product_image',
        'unit_price',
        'quantity',
        'subtotal',
        'revenue_share_percent',
        'partner_earning_amount',
    ];

    protected function casts(): array
    {
        return [
            'unit_price'             => 'integer', // sen
            'subtotal'               => 'integer', // sen
            'partner_earning_amount' => 'integer', // sen
            'quantity'               => 'integer',
            'revenue_share_percent'  => 'integer',
        ];
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** withTrashed agar data order tetap lengkap meski produk dihapus */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id')->withTrashed();
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function earning(): HasOne
    {
        return $this->hasOne(PartnerEarning::class);
    }
}
