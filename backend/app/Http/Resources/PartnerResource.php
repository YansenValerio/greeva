<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isSelfOrAdmin = $user && ($user->isAdmin() || $user->partner?->id === $this->id);

        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'description' => $this->description,
            'logo'        => $this->logo,
            'is_active'   => $this->is_active,
            'joined_at'   => $this->joined_at?->toDateString(),

            // Hanya admin atau mitra sendiri
            'revenue_share_percent'  => $this->when($isSelfOrAdmin, $this->revenue_share_percent),
            'bank_name'              => $this->when($isSelfOrAdmin, $this->bank_name),
            'bank_account_number'    => $this->when($isSelfOrAdmin, $this->bank_account_number),
            'bank_account_name'      => $this->when($isSelfOrAdmin, $this->bank_account_name),
        ];
    }
}
