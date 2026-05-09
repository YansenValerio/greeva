<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Category;
use Faker\Factory as FakerFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $faker = FakerFactory::create();
        $name  = $faker->unique()->words(2, true);

        return [
            'parent_id'   => null,
            'name'        => ucfirst($name),
            'slug'        => Str::slug($name),
            'description' => $faker->sentence(),
            'image'       => null,
            'sort_order'  => $faker->numberBetween(0, 10),
            'is_active'   => true,
        ];
    }
}
