<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isOwner = $user && $user->id === $this->user_id;
        $isAdmin = $user && $user->isAdmin();

        return [
            'id'           => $this->id,
            'rating'       => $this->rating,
            'body'         => $this->body,
            'created_at'   => $this->created_at?->toISOString(),
            'is_approved'  => $this->when($isOwner || $isAdmin, $this->is_approved),

            'reviewer' => [
                'name'    => $this->whenLoaded('user', fn () => $this->maskName($this->user->name)),
                'is_self' => $isOwner,
            ],

            'product' => $this->whenLoaded('product', fn () => [
                'id'   => $this->product->id,
                'name' => $this->product->name,
                'slug' => $this->product->slug,
            ]),

            'order_item' => $this->whenLoaded('orderItem', fn () => [
                'id'           => $this->orderItem->id,
                'variant_name' => $this->orderItem->variant_name,
            ]),
        ];
    }

    /** Privacy: tampilkan nama depan + inisial terakhir, mis. "Yansen V." */
    private function maskName(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name)) ?: [$name];
        if (count($parts) === 1) {
            return $parts[0];
        }
        $first = array_shift($parts);
        $last  = end($parts);

        return $first . ' ' . mb_substr($last, 0, 1) . '.';
    }
}
