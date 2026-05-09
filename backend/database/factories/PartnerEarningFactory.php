<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\EarningStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Partner;
use App\Models\PartnerEarning;
use Faker\Factory as FakerFactory;
use Illuminate\Database\Eloquent\Factories\Factory;

class PartnerEarningFactory extends Factory
{
    protected $model = PartnerEarning::class;

    public function definition(): array
    {
        $faker       = FakerFactory::create();
        $completedAt = now()->subDays(14);

        return [
            'partner_id'         => Partner::factory(),
            'order_id'           => Order::factory()->completed(),
            'order_item_id'      => OrderItem::factory(),
            'payout_batch_id'    => null,
            'amount'             => $faker->numberBetween(100000, 5000000), // sen
            'status'             => EarningStatus::Pending,
            'order_completed_at' => $completedAt,
            'available_at'       => $completedAt->copy()->addDays(7),
        ];
    }

    public function available(): static
    {
        return $this->state([
            'status'       => EarningStatus::Available,
            'available_at' => now()->subDay(),
        ]);
    }

    public function paid(): static
    {
        return $this->state([
            'status'  => EarningStatus::Paid,
            'paid_at' => now(),
        ]);
    }

    public function reversed(): static
    {
        return $this->state([
            'status'          => EarningStatus::Reversed,
            'reversed_at'     => now(),
            'reversal_reason' => 'refund',
        ]);
    }
}
