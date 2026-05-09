<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Partner;
use Faker\Factory as FakerFactory;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        $faker     = FakerFactory::create();
        $unitPrice = $faker->numberBetween(500000, 10000000);
        $quantity  = $faker->numberBetween(1, 5);
        $subtotal  = $unitPrice * $quantity;
        $rsp       = 80;
        $earning   = (int) round($unitPrice * $rsp / 100) * $quantity;

        return [
            'order_id'               => Order::factory(),
            'product_id'             => null,
            'product_variant_id'     => null,
            'partner_id'             => Partner::factory(),
            'product_name'           => $faker->words(3, true),
            'variant_name'           => 'Merah',
            'sku'                    => strtoupper($faker->bothify('???-###')),
            'product_image'          => null,
            'unit_price'             => $unitPrice,
            'quantity'               => $quantity,
            'subtotal'               => $subtotal,
            'revenue_share_percent'  => $rsp,
            'partner_earning_amount' => $earning,
        ];
    }
}
