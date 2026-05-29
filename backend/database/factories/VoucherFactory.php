<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\VoucherType;
use App\Models\Voucher;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class VoucherFactory extends Factory
{
    protected $model = Voucher::class;

    public function definition(): array
    {
        return [
            'code'             => strtoupper(Str::random(8)),
            'description'      => 'Voucher uji',
            'type'             => VoucherType::Percent,
            'value'            => 10,            // 10%
            'max_discount'     => null,
            'min_purchase'     => 0,
            'valid_from'       => null,
            'valid_until'      => null,
            'usage_limit'      => null,
            'per_user_limit'   => null,
            'first_order_only' => false,
            'is_active'        => true,
        ];
    }

    public function percent(int $value = 10, ?int $maxDiscount = null): static
    {
        return $this->state([
            'type'         => VoucherType::Percent,
            'value'        => $value,
            'max_discount' => $maxDiscount,
        ]);
    }

    public function fixed(int $cents): static
    {
        return $this->state([
            'type'  => VoucherType::Fixed,
            'value' => $cents,
        ]);
    }

    public function expired(): static
    {
        return $this->state([
            'valid_from'  => now()->subDays(30),
            'valid_until' => now()->subDay(),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
