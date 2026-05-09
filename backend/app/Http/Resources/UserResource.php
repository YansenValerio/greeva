<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'role'       => $this->role->value,
            'role_label' => $this->role->label(),
            'phone'      => $this->phone,
            'avatar'     => $this->avatar,
            'created_at' => $this->created_at->toISOString(),

            // Hanya disertakan jika relasi dimuat (via ->load('partner'))
            'partner' => $this->when(
                $this->relationLoaded('partner') && $this->partner !== null,
                fn () => [
                    'id'   => $this->partner->id,
                    'name' => $this->partner->name,
                    'slug' => $this->partner->slug,
                ]
            ),
        ];
    }
}
