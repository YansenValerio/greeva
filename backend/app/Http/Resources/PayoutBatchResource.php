<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayoutBatchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'payout_number'  => $this->payout_number,
            'partner_id'     => $this->partner_id,
            'status'         => $this->status->value,
            'status_label'   => $this->status->label(),
            'total_amount'   => $this->total_amount, // sen
            'item_count'     => $this->item_count,
            'period_start'   => $this->period_start->toDateString(),
            'period_end'     => $this->period_end->toDateString(),
            'payment_proof'  => $this->payment_proof,
            'paid_at'        => $this->paid_at?->toISOString(),
            'cancelled_at'   => $this->cancelled_at?->toISOString(),
            'notes'          => $this->notes,
            'created_at'     => $this->created_at->toISOString(),

            'partner' => $this->when(
                $this->relationLoaded('partner'),
                fn () => [
                    'id'   => $this->partner->id,
                    'name' => $this->partner->name,
                    'slug' => $this->partner->slug,
                ]
            ),

            'items' => PartnerEarningResource::collection(
                $this->whenLoaded('earnings', fn () => $this->earnings->loadMissing('orderItem'))
            ),
        ];
    }
}
