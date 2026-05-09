<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Faker\Factory as FakerFactory;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition(): array
    {
        $faker = FakerFactory::create();

        return [
            'product_id' => Product::factory(),
            'sku'        => strtoupper($faker->unique()->bothify('???-###')),
            'name'       => ucfirst($faker->word()),
            'price'      => null,
            'stock'      => $faker->numberBetween(0, 50),
            'images'     => [],
            'sort_order' => $faker->numberBetween(0, 10),
            'is_active'  => true,
        ];
    }
}
