<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class PartnerSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin Greeva ─────────────────────────────────────────────────────
        $adminId = DB::table('users')->insertGetId([
            'name'       => 'Admin Greeva',
            'email'      => 'admin@greeva.id',
            'password'   => Hash::make('password'),
            'role'       => UserRole::Admin->value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ── Mitra: Notic ─────────────────────────────────────────────────────
        // Aksesoris manik dari plastik HDPE daur ulang
        $noticUserId = DB::table('users')->insertGetId([
            'name'       => 'Notic Brand',
            'email'      => 'partner@notic.id',
            'password'   => Hash::make('password'),
            'role'       => UserRole::Partner->value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('partners')->insert([
            'user_id'               => $noticUserId,
            'name'                  => 'Notic',
            'slug'                  => 'notic',
            'description'           => 'Aksesoris manik cantik dari plastik HDPE daur ulang. Setiap produk Notic menggunakan plastik yang diselamatkan dari tempat pembuangan akhir dan diubah menjadi karya yang membanggakan.',
            'revenue_share_percent' => 82,
            'is_active'             => true,
            'joined_at'             => now(),
            'created_at'            => now(),
            'updated_at'            => now(),
        ]);

        // ── Mitra: Reperca ────────────────────────────────────────────────────
        // Produk serbaguna dari kain perca sisa konveksi
        $repercaUserId = DB::table('users')->insertGetId([
            'name'       => 'Reperca Brand',
            'email'      => 'partner@reperca.id',
            'password'   => Hash::make('password'),
            'role'       => UserRole::Partner->value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('partners')->insert([
            'user_id'               => $repercaUserId,
            'name'                  => 'Reperca',
            'slug'                  => 'reperca',
            'description'           => 'Tote bag, pouch, dan produk serbaguna dari kain perca sisa konveksi. Reperca membuktikan bahwa sisa kain pun bisa menjadi produk yang berguna dan bernilai tinggi.',
            'revenue_share_percent' => 82,
            'is_active'             => true,
            'joined_at'             => now(),
            'created_at'            => now(),
            'updated_at'            => now(),
        ]);
    }
}
