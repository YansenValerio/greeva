<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isPrivileged = $user && ($user->isAdmin() || $user->isPartner());

        return [
            'id'                   => $this->id,
            'name'                 => $this->name,
            'slug'                 => $this->slug,
            'description'          => $this->description,
            'short_description'    => $this->short_description,
            'status'               => $this->status->value,
            'status_label'         => $this->status->label(),
            'price'                => $this->price,
            'compare_price'        => $this->compare_price,
            'price_formatted'      => Money::format($this->price),
            'images'               => $this->images ?? [],
            'weight'               => $this->weight,
            'material'             => $this->material,
            'sustainability_notes' => $this->sustainability_notes,
            'meta_title'           => $this->meta_title,
            'meta_description'     => $this->meta_description,
            'total_stock'          => $this->totalStock(),
            'created_at'           => $this->created_at?->toDateTimeString(),
            'updated_at'           => $this->updated_at?->toDateTimeString(),

            'partner'   => PartnerResource::make($this->whenLoaded('partner')),
            'category'  => CategoryResource::make($this->whenLoaded('category')),
            'variants'  => VariantResource::collection($this->whenLoaded('variants')),

            // Admin / Partner only
            'partner_id'             => $this->when($isPrivileged, $this->partner_id),
            'category_id'            => $this->when($isPrivileged, $this->category_id),
            'revenue_share_percent'  => $this->when($isPrivileged, $this->revenue_share_percent),
            'published_at'           => $this->when($isPrivileged, $this->published_at?->toDateTimeString()),
        ];
    }
}
