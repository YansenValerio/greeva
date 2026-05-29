<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReturnRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'return_number' => $this->return_number,
            'order_id'      => $this->order_id,
            'order_number'  => $this->whenLoaded('order', fn () => $this->order?->order_number),
            'reason'        => $this->reason,
            'description'   => $this->description,
            'photos'        => $this->photos ?? [],
            'status'        => $this->status->value,
            'status_label'  => $this->status->label(),
            'admin_note'    => $this->admin_note,
            'resolved_at'   => $this->resolved_at?->toDateTimeString(),
            'resolved_by'   => $this->whenLoaded('resolvedBy', fn () => $this->resolvedBy?->name),
            'created_at'    => $this->created_at?->toDateTimeString(),

            // Hanya admin yang melihat data buyer
            'buyer' => $this->when(
                $request->user()?->isAdmin() && $this->relationLoaded('user'),
                fn () => $this->user ? [
                    'id'    => $this->user->id,
                    'name'  => $this->user->name,
                    'email' => $this->user->email,
                ] : null,
            ),
        ];
    }
}
