<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Partner;
use App\Models\User;
use Faker\Factory as FakerFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PartnerFactory extends Factory
{
    protected $model = Partner::class;

    public function definition(): array
    {
        $faker = FakerFactory::create('en_US');
        $name  = $faker->unique()->company();

        return [
            'user_id'               => User::factory()->partner(),
            'name'                  => $name,
            'slug'                  => Str::slug($name),
            'description'           => $faker->paragraph(),
            'logo'                  => null,
            'revenue_share_percent' => 80,
            'bank_name'             => 'BCA',
            'bank_account_number'   => $faker->numerify('##########'),
            'bank_account_name'     => $faker->name(),
            'is_active'             => true,
            'joined_at'             => now(),
        ];
    }
}
