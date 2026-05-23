<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'label'          => $this->label,
            'recipient_name' => $this->recipient_name,
            'phone'          => $this->phone,
            'address'        => $this->address,
            'province'       => $this->province,
            'city'           => $this->city,
            'district'       => $this->district,
            'postal_code'    => $this->postal_code,
            'is_default'     => $this->is_default,
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }
}
