<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'parent_id'   => $this->parent_id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'description' => $this->description,
            'image'       => $this->image,
            'sort_order'  => $this->sort_order,
            'is_active'   => $this->is_active,
            'products_count' => $this->when(isset($this->products_count), $this->products_count),
            'parent'      => $this->whenLoaded('parent', fn () => $this->parent ? [
                'id'   => $this->parent->id,
                'name' => $this->parent->name,
                'slug' => $this->parent->slug,
            ] : null),
            'children'    => CategoryResource::collection($this->whenLoaded('children')),
        ];
    }
}
