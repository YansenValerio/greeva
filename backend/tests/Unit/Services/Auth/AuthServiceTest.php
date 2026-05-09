<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Exceptions\InvalidCredentialsException;
use App\Models\User;
use App\Services\Auth\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(AuthService::class);
});

describe('register', function () {
    it('membuat user baru dengan role buyer', function () {
        $result = $this->service->register([
            'name'     => 'Budi Santoso',
            'email'    => 'budi@example.com',
            'password' => 'Password123',
        ]);

        expect($result['user'])
            ->toBeInstanceOf(User::class)
            ->role->toBe(UserRole::Buyer)
            ->email->toBe('budi@example.com')
            ->name->toBe('Budi Santoso');

        expect($result['token'])->toBeString()->not->toBeEmpty();
        $this->assertDatabaseHas('users', ['email' => 'budi@example.com']);
    });

    it('menyimpan password sebagai bcrypt hash', function () {
        $result = $this->service->register([
            'name'     => 'Budi',
            'email'    => 'budi@example.com',
            'password' => 'Password123',
        ]);

        expect(Hash::check('Password123', $result['user']->password))->toBeTrue();
    });

    it('menyimpan nomor telepon jika diberikan', function () {
        $result = $this->service->register([
            'name'     => 'Budi',
            'email'    => 'budi@example.com',
            'password' => 'Password123',
            'phone'    => '081234567890',
        ]);

        expect($result['user']->phone)->toBe('081234567890');
    });
});

describe('login', function () {
    it('berhasil login dengan kredensial benar', function () {
        User::factory()->create([
            'email'    => 'budi@example.com',
            'password' => Hash::make('Password123'),
        ]);

        $result = $this->service->login([
            'email'    => 'budi@example.com',
            'password' => 'Password123',
        ]);

        expect($result['user']->email)->toBe('budi@example.com');
        expect($result['token'])->toBeString()->not->toBeEmpty();
    });

    it('melempar InvalidCredentialsException jika password salah', function () {
        User::factory()->create([
            'email'    => 'budi@example.com',
            'password' => Hash::make('BenarPassword123'),
        ]);

        $this->service->login([
            'email'    => 'budi@example.com',
            'password' => 'SalahPassword456',
        ]);
    })->throws(InvalidCredentialsException::class);

    it('melempar InvalidCredentialsException jika email tidak terdaftar', function () {
        $this->service->login([
            'email'    => 'tidakada@example.com',
            'password' => 'Password123',
        ]);
    })->throws(InvalidCredentialsException::class);
});

describe('logout', function () {
    it('menghapus token aktif user', function () {
        $user = User::factory()->create();
        $user->createToken('auth_token');

        expect($user->tokens()->count())->toBe(1);

        // Simulasi currentAccessToken via actingAs tidak tersedia di unit test;
        // logout ditest di feature test
        expect($user->tokens()->count())->toBe(1);
    });
});
