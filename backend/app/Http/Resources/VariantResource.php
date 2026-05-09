<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'sku'        => $this->sku,
            'name'       => $this->name,
            'price'      => $this->price,       // sen; null = pakai product.price
            'stock'      => $this->stock,
            'images'     => $this->images ?? [],
            'sort_order' => $this->sort_order,
            'is_active'  => $this->is_active,
        ];
    }
}
