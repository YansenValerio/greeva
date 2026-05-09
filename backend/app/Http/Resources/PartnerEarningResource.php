<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerEarningResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'partner_id'         => $this->partner_id,
            'order_id'           => $this->order_id,
            'order_item_id'      => $this->order_item_id,
            'payout_batch_id'    => $this->payout_batch_id,
            'amount'             => $this->amount, // sen
            'status'             => $this->status->value,
            'status_label'       => $this->status->label(),
            'order_completed_at' => $this->order_completed_at?->toISOString(),
            'available_at'       => $this->available_at?->toISOString(),
            'paid_at'            => $this->paid_at?->toISOString(),
            'reversed_at'        => $this->reversed_at?->toISOString(),
            'reversal_reason'    => $this->reversal_reason,

            'order_item' => $this->when(
                $this->relationLoaded('orderItem'),
                fn () => [
                    'product_name' => $this->orderItem->product_name,
                    'variant_name' => $this->orderItem->variant_name,
                    'sku'          => $this->orderItem->sku,
                    'quantity'     => $this->orderItem->quantity,
                    'unit_price'   => $this->orderItem->unit_price,
                ]
            ),
        ];
    }
}
