<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Faker\Factory as FakerFactory;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $faker      = FakerFactory::create();
        $subtotal   = $faker->numberBetween(5000000, 50000000);
        $grandTotal = $subtotal;

        return [
            'order_number'         => 'GRV-' . now()->format('Ymd') . '-' . str_pad((string) $faker->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'user_id'              => User::factory()->state(['role' => 'buyer']),
            'status'               => OrderStatus::PendingPayment,
            'subtotal'             => $subtotal,
            'shipping_total'       => 0,
            'discount_total'       => 0,
            'grand_total'          => $grandTotal,
            'shipping_name'        => $faker->name(),
            'shipping_phone'       => '08' . $faker->numerify('#########'),
            'shipping_address'     => $faker->address(),
            'shipping_province'    => 'Jawa Barat',
            'shipping_city'        => 'Bandung',
            'shipping_postal_code' => $faker->numerify('#####'),
            'payment_expired_at'   => now()->addHours(24),
        ];
    }

    public function paid(): static
    {
        return $this->state([
            'status'  => OrderStatus::Paid,
            'paid_at' => now(),
        ]);
    }

    public function completed(): static
    {
        return $this->state([
            'status'       => OrderStatus::Completed,
            'paid_at'      => now()->subDays(14),
            'delivered_at' => now()->subDays(7),
            'completed_at' => now(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state([
            'status'       => OrderStatus::Cancelled,
            'cancelled_at' => now(),
        ]);
    }
}
