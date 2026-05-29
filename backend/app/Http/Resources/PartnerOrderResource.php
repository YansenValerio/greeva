<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Representasi order untuk partner — tanpa data PII buyer.
 */
class PartnerOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'order_number' => $this->order_number,
            'status'       => $this->status->value,
            'status_label' => $this->status->label(),

            'grand_total'           => $this->grand_total,
            'grand_total_formatted' => Money::format($this->grand_total),

            'paid_at'       => $this->paid_at?->toDateTimeString(),
            'created_at'    => $this->created_at?->toDateTimeString(),

            // Hanya item milik mitra ini (sudah di-filter di controller)
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
