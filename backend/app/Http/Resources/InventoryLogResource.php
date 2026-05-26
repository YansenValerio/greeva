<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'product_variant_id' => $this->product_variant_id,
            'product_id'         => $this->product_id,
            'order_id'           => $this->order_id,
            'change'             => $this->change,
            'stock_before'       => $this->stock_before,
            'stock_after'        => $this->stock_after,
            'reason'             => $this->reason->value,
            'reason_label'       => $this->reason->label(),
            'note'               => $this->note,
            'created_at'         => $this->created_at?->toISOString(),

            'product_name' => $this->whenLoaded('product', fn () => $this->product?->name),
            'variant_name' => $this->whenLoaded('variant', fn () => $this->variant?->name),
            'sku'          => $this->whenLoaded('variant', fn () => $this->variant?->sku),
            'order_number' => $this->whenLoaded('order', fn () => $this->order?->order_number),
        ];
    }
}
