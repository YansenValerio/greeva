<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Profile\ChangePasswordRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthService;
use App\Support\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
    ) {}

    /**
     * POST /api/v1/auth/register
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return response()->json([
            'data'    => UserResource::make($result['user']),
            'token'   => $result['token'],
            'message' => 'Registrasi berhasil.',
        ], 201);
    }

    /**
     * POST /api/v1/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        return response()->json([
            'data'    => UserResource::make($result['user']),
            'token'   => $result['token'],
            'message' => 'Login berhasil.',
        ]);
    }

    /**
     * POST /api/v1/auth/logout
     * Requires: auth:sanctum
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json(['message' => 'Logout berhasil.']);
    }

    /**
     * GET /api/v1/auth/me
     * Requires: auth:sanctum
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing('partner');

        return response()->json([
            'data' => UserResource::make($user),
        ]);
    }

    /**
     * PUT /api/v1/auth/profile
     * Update profil user yang sedang login (nama, email, phone, avatar).
     * Requires: auth:sanctum
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $old  = $user->only(['name', 'email', 'phone', 'avatar']);

        $data = $request->validated();

        // Jika email berubah, reset verifikasi
        if (isset($data['email']) && $data['email'] !== $user->email) {
            $data['email_verified_at'] = null;
        }

        $user->update($data);

        AuditLogger::log('profile_updated', $user, $old, $user->fresh()->only(array_keys($old)));

        return response()->json([
            'data'    => UserResource::make($user->fresh()->loadMissing('partner')),
            'message' => 'Profil berhasil diperbarui.',
        ]);
    }

    /**
     * POST /api/v1/auth/change-password
     * Ganti password user yang sedang login.
     * Requires: auth:sanctum
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Password saat ini salah.',
                'errors'  => ['current_password' => ['Password saat ini salah.']],
            ], 422);
        }

        $user->update(['password' => $data['password']]); // hashed via cast

        // Revoke semua token lain — paksa logout dari device lain
        $currentTokenId = $user->currentAccessToken()?->id;
        $user->tokens()
            ->when($currentTokenId, fn ($q) => $q->where('id', '!=', $currentTokenId))
            ->delete();

        AuditLogger::log('password_changed', $user);

        return response()->json([
            'message' => 'Password berhasil diubah.',
        ]);
    }
}
