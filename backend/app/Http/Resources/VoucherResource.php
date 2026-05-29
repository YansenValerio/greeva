<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\VoucherType;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoucherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'code'             => $this->code,
            'description'      => $this->description,
            'type'             => $this->type->value,
            'type_label'       => $this->type->label(),
            'value'            => $this->value,
            'discount_label'   => $this->discountLabel(),
            'max_discount'     => $this->max_discount,
            'max_discount_formatted' => $this->max_discount !== null ? Money::format($this->max_discount) : null,
            'min_purchase'     => $this->min_purchase,
            'min_purchase_formatted' => Money::format($this->min_purchase),
            'valid_from'       => $this->valid_from?->toDateTimeString(),
            'valid_until'      => $this->valid_until?->toDateTimeString(),
            'usage_limit'      => $this->usage_limit,
            'per_user_limit'   => $this->per_user_limit,
            'first_order_only' => $this->first_order_only,
            'is_active'        => $this->is_active,
            'created_at'       => $this->created_at?->toDateTimeString(),
        ];
    }

    private function discountLabel(): string
    {
        return $this->type === VoucherType::Percent
            ? "{$this->value}%"
            : Money::format($this->value);
    }
}
