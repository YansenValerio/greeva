<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

// ── POST /api/v1/auth/register ───────────────────────────────────────────────

describe('POST /api/v1/auth/register', function () {
    it('berhasil membuat akun baru', function () {
        $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Budi Santoso',
            'email'                 => 'budi@example.com',
            'password'              => 'Password123',
            'password_confirmation' => 'Password123',
        ])
            ->assertStatus(201)
            ->assertJsonStructure([
                'data'  => ['id', 'name', 'email', 'role', 'role_label'],
                'token',
                'message',
            ])
            ->assertJsonPath('data.role', 'buyer')
            ->assertJsonPath('message', 'Registrasi berhasil.');
    });

    it('gagal jika email sudah digunakan', function () {
        User::factory()->create(['email' => 'budi@example.com']);

        $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Budi Lain',
            'email'                 => 'budi@example.com',
            'password'              => 'Password123',
            'password_confirmation' => 'Password123',
        ])
            ->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Email sudah digunakan.');
    });

    it('gagal jika password tidak dikonfirmasi', function () {
        $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Budi',
            'email'                 => 'budi@example.com',
            'password'              => 'Password123',
            'password_confirmation' => 'BedaPassword',
        ])->assertStatus(422)->assertJsonPath('errors.password.0', 'Konfirmasi kata sandi tidak cocok.');
    });

    it('gagal jika field wajib kosong', function () {
        $this->postJson('/api/v1/auth/register', [])
            ->assertStatus(422)
            ->assertJsonStructure(['errors' => ['name', 'email', 'password']]);
    });
});

// ── POST /api/v1/auth/login ──────────────────────────────────────────────────

describe('POST /api/v1/auth/login', function () {
    it('berhasil login', function () {
        User::factory()->create([
            'email'    => 'budi@example.com',
            'password' => Hash::make('Password123'),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email'    => 'budi@example.com',
            'password' => 'Password123',
        ])
            ->assertOk()
            ->assertJsonStructure(['data', 'token', 'message'])
            ->assertJsonPath('message', 'Login berhasil.');
    });

    it('gagal login dengan kata sandi salah', function () {
        User::factory()->create(['email' => 'budi@example.com']);

        $this->postJson('/api/v1/auth/login', [
            'email'    => 'budi@example.com',
            'password' => 'SalahPassword',
        ])->assertStatus(401)->assertJsonPath('message', 'Email atau kata sandi salah.');
    });

    it('gagal login dengan email tidak terdaftar', function () {
        $this->postJson('/api/v1/auth/login', [
            'email'    => 'tidakada@example.com',
            'password' => 'Password123',
        ])->assertStatus(401);
    });
});

// ── GET /api/v1/auth/me ──────────────────────────────────────────────────────

describe('GET /api/v1/auth/me', function () {
    it('mengembalikan data user yang terautentikasi', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonPath('data.role', $user->role->value);
    });

    it('menolak akses tanpa token', function () {
        $this->getJson('/api/v1/auth/me')
            ->assertStatus(401)
            ->assertJsonPath('message', 'Tidak terautentikasi.');
    });
});

// ── POST /api/v1/auth/logout ─────────────────────────────────────────────────

describe('POST /api/v1/auth/logout', function () {
    it('berhasil logout dan token tidak bisa digunakan lagi', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logout berhasil.');
    });

    it('menolak logout tanpa token', function () {
        $this->postJson('/api/v1/auth/logout')
            ->assertStatus(401);
    });
});
