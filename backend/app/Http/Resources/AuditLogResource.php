<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    private const LABELS = [
        'Order'          => 'Pesanan',
        'OrderItem'      => 'Item Pesanan',
        'Product'        => 'Produk',
        'ProductVariant' => 'Varian',
        'Partner'        => 'Mitra',
        'Category'       => 'Kategori',
        'PayoutBatch'    => 'Payout',
        'PartnerEarning' => 'Earning',
        'ProductReview'  => 'Ulasan',
        'User'           => 'User',
    ];

    public function toArray(Request $request): array
    {
        $basename = class_basename($this->auditable_type);

        return [
            'id'              => $this->id,
            'event'           => $this->event,
            'auditable_type'  => $basename,
            'auditable_label' => self::LABELS[$basename] ?? $basename,
            'auditable_id'    => $this->auditable_id,
            'actor'           => $this->user
                ? ['id' => $this->user->id, 'name' => $this->user->name, 'email' => $this->user->email]
                : null,
            'old_values'      => $this->old_values,
            'new_values'      => $this->new_values,
            'ip_address'      => $this->ip_address,
            'created_at'      => $this->created_at?->toISOString(),
        ];
    }
}
