<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Partner;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PartnerSeeder extends Seeder
{
    /**
     * Seeder ini idempoten — aman dijalankan berulang kali.
     * Menggunakan firstOrCreate sehingga data yang sudah ada tidak diduplikasi.
     *
     * Akun demo (password: "password"):
     *   admin@greeva.id       — Admin Greeva
     *   partner@notic.id      — Mitra Notic
     *   partner@reperca.id    — Mitra Reperca
     *   buyer@greeva.id       — Buyer demo
     */
    public function run(): void
    {
        // ── Admin Greeva ─────────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@greeva.id'],
            [
                'name'              => 'Admin Greeva',
                'password'          => Hash::make('password'),
                'role'              => UserRole::Admin->value,
                'email_verified_at' => now(),
            ],
        );

        // ── Buyer demo ───────────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'buyer@greeva.id'],
            [
                'name'              => 'Buyer Demo',
                'password'          => Hash::make('password'),
                'role'              => UserRole::Buyer->value,
                'email_verified_at' => now(),
            ],
        );

        // ── Mitra: Notic ─────────────────────────────────────────────────────
        $noticUser = User::firstOrCreate(
            ['email' => 'partner@notic.id'],
            [
                'name'              => 'Notic Brand',
                'password'          => Hash::make('password'),
                'role'              => UserRole::Partner->value,
                'email_verified_at' => now(),
            ],
        );

        Partner::firstOrCreate(
            ['slug' => 'notic'],
            [
                'user_id'               => $noticUser->id,
                'name'                  => 'Notic',
                'description'           => 'Aksesoris manik cantik dari plastik HDPE daur ulang. Setiap produk Notic menggunakan plastik yang diselamatkan dari tempat pembuangan akhir dan diubah menjadi karya yang membanggakan.',
                'revenue_share_percent' => 82,
                'is_active'             => true,
                'joined_at'             => now(),
            ],
        );

        // ── Mitra: Reperca ────────────────────────────────────────────────────
        $repercaUser = User::firstOrCreate(
            ['email' => 'partner@reperca.id'],
            [
                'name'              => 'Reperca Brand',
                'password'          => Hash::make('password'),
                'role'              => UserRole::Partner->value,
                'email_verified_at' => now(),
            ],
        );

        Partner::firstOrCreate(
            ['slug' => 'reperca'],
            [
                'user_id'               => $repercaUser->id,
                'name'                  => 'Reperca',
                'description'           => 'Tote bag, pouch, dan produk serbaguna dari kain perca sisa konveksi. Reperca membuktikan bahwa sisa kain pun bisa menjadi produk yang berguna dan bernilai tinggi.',
                'revenue_share_percent' => 82,
                'is_active'             => true,
                'joined_at'             => now(),
            ],
        );
    }
}
