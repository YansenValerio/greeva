<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user         = $request->user();
        $isPrivileged = $user && ($user->isAdmin() || $user->isPartner());

        return [
            'id'              => $this->id,
            'order_number'    => $this->order_number,
            'status'          => $this->status->value,
            'status_label'    => $this->status->label(),

            'subtotal'                => $this->subtotal,
            'subtotal_formatted'      => Money::format($this->subtotal),
            'shipping_total'          => $this->shipping_total,
            'shipping_total_formatted' => Money::format($this->shipping_total),
            'discount_total'          => $this->discount_total,
            'grand_total'             => $this->grand_total,
            'grand_total_formatted'   => Money::format($this->grand_total),

            'shipping_name'        => $this->shipping_name,
            'shipping_phone'       => $this->shipping_phone,
            'shipping_address'     => $this->shipping_address,
            'shipping_province'    => $this->shipping_province,
            'shipping_city'        => $this->shipping_city,
            'shipping_district'    => $this->shipping_district,
            'shipping_postal_code' => $this->shipping_postal_code,
            'notes'                => $this->notes,

            'payment_token'      => $this->payment_token,
            'payment_url'        => $this->payment_url,
            'payment_method'     => $this->payment_method,
            'payment_expired_at' => $this->payment_expired_at?->toDateTimeString(),
            'paid_at'            => $this->paid_at?->toDateTimeString(),
            'delivered_at'       => $this->delivered_at?->toDateTimeString(),
            'completed_at'       => $this->completed_at?->toDateTimeString(),

            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),

            'items'     => OrderItemResource::collection($this->whenLoaded('items')),
            'shipments' => ShipmentResource::collection($this->whenLoaded('shipments')),

            // Admin / partner only
            'user_id' => $this->when($isPrivileged, $this->user_id),
        ];
    }
}
