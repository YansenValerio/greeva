<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Partner;
use App\Models\Product;
use Faker\Factory as FakerFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $faker = FakerFactory::create();
        $name  = $faker->unique()->words(3, true);

        return [
            'partner_id'            => Partner::factory(),
            'category_id'           => Category::factory(),
            'name'                  => ucfirst($name),
            'slug'                  => Str::slug($name),
            'description'           => $faker->paragraphs(2, true),
            'short_description'     => $faker->sentence(),
            'status'                => ProductStatus::Active,
            'price'                 => $faker->numberBetween(500000, 20000000),
            'compare_price'         => null,
            'images'                => [],
            'weight'                => $faker->numberBetween(50, 500),
            'material'              => 'Plastik HDPE daur ulang',
            'sustainability_notes'  => $faker->sentence(),
            'meta_title'            => null,
            'meta_description'      => null,
            'revenue_share_percent' => 80,
            'published_at'          => now(),
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => ProductStatus::Draft, 'published_at' => null]);
    }

    public function pendingReview(): static
    {
        return $this->state(['status' => ProductStatus::PendingReview, 'published_at' => null]);
    }

    public function inactive(): static
    {
        return $this->state(['status' => ProductStatus::Inactive]);
    }
}
