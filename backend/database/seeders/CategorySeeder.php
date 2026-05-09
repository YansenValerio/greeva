<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name'        => 'Aksesoris',
                'slug'        => 'aksesoris',
                'description' => 'Gelang, coaster, dan aksesoris dari bahan daur ulang.',
                'sort_order'  => 1,
            ],
            [
                'name'        => 'Tas & Pouch',
                'slug'        => 'tas-pouch',
                'description' => 'Tote bag, pouch, dan tas serbaguna dari bahan perca.',
                'sort_order'  => 2,
            ],
            [
                'name'        => 'Rumah & Dapur',
                'slug'        => 'rumah-dapur',
                'description' => 'Produk sustainable untuk kebutuhan rumah dan dapur.',
                'sort_order'  => 3,
            ],
            [
                'name'        => 'Pakaian & Tekstil',
                'slug'        => 'pakaian-tekstil',
                'description' => 'Pakaian dan produk tekstil dari bahan ramah lingkungan.',
                'sort_order'  => 4,
            ],
            [
                'name'        => 'Stationery & Office',
                'slug'        => 'stationery-office',
                'description' => 'Perlengkapan kantor dan tulis dari bahan daur ulang.',
                'sort_order'  => 5,
            ],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->updateOrInsert(
                ['slug' => $category['slug']],
                array_merge($category, [
                    'is_active'  => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
