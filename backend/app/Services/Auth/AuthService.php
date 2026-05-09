<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Enums\UserRole;
use App\Exceptions\InvalidCredentialsException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Daftarkan user baru sebagai Buyer.
     *
     * @param  array{name: string, email: string, password: string, phone?: string|null} $data
     * @return array{user: User, token: string}
     */
    public function register(array $data): array
    {
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'], // di-hash otomatis via cast 'hashed'
            'role'     => UserRole::Buyer,
            'phone'    => $data['phone'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Login dan kembalikan token Sanctum.
     *
     * @param  array{email: string, password: string} $credentials
     * @return array{user: User, token: string}
     * @throws InvalidCredentialsException jika kredensial salah
     */
    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw new InvalidCredentialsException();
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Hapus token aktif user (logout dari device saat ini).
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }
}
