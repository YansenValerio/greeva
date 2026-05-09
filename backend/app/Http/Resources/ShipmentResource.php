<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShipmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'partner_id'      => $this->partner_id,
            'tracking_number' => $this->tracking_number,
            'courier'         => $this->courier,
            'courier_service' => $this->courier_service,
            'status'          => $this->status,
            'packed_at'       => $this->packed_at?->toDateTimeString(),
            'shipped_at'      => $this->shipped_at?->toDateTimeString(),
            'delivered_at'    => $this->delivered_at?->toDateTimeString(),
        ];
    }
}
