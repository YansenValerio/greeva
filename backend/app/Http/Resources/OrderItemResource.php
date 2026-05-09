<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user         = $request->user();
        $isPrivileged = $user && ($user->isAdmin() || $user->isPartner());

        return [
            'id'             => $this->id,
            'product_name'   => $this->product_name,
            'variant_name'   => $this->variant_name,
            'sku'            => $this->sku,
            'product_image'  => $this->product_image,
            'unit_price'     => $this->unit_price,
            'price_formatted' => Money::format($this->unit_price),
            'quantity'       => $this->quantity,
            'subtotal'       => $this->subtotal,
            'subtotal_formatted' => Money::format($this->subtotal),

            // Hanya admin / partner yang boleh lihat data bagi hasil
            'revenue_share_percent'  => $this->when($isPrivileged, $this->revenue_share_percent),
            'partner_earning_amount' => $this->when($isPrivileged, $this->partner_earning_amount),
            'partner_id'             => $this->when($isPrivileged, $this->partner_id),
        ];
    }
}
