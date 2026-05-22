<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Http\Requests\Profile\ChangePasswordRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Auth\AuthService;
use App\Support\AuditLogger;
use App\Support\EmailVerificationToken;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

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
     * POST /api/v1/auth/forgot-password
     * Kirim email reset password. Selalu return 200 untuk hindari email enumeration.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        // Log audit hanya jika berhasil kirim
        if ($status === Password::RESET_LINK_SENT) {
            $user = User::where('email', $request->input('email'))->first();
            if ($user) {
                AuditLogger::log('password_reset_requested', $user);
            }
        }

        return response()->json([
            'message' => 'Jika email terdaftar, instruksi reset password sudah kami kirim.',
        ]);
    }

    /**
     * POST /api/v1/auth/reset-password
     * Reset password pakai token dari email.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password'       => $password, // di-hash via cast
                    'remember_token' => Str::random(60),
                ])->save();

                // Revoke semua token aktif — paksa login ulang
                $user->tokens()->delete();

                event(new PasswordReset($user));

                AuditLogger::log('password_reset', $user);
            },
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password berhasil di-reset. Silakan login dengan password baru.']);
        }

        return response()->json([
            'message' => __($status),
            'errors'  => ['email' => [__($status)]],
        ], 422);
    }

    /**
     * POST /api/v1/auth/email/verify
     * Verifikasi email pakai signed payload dari email notification.
     */
    public function verifyEmail(VerifyEmailRequest $request): JsonResponse
    {
        $user = User::find($request->integer('id'));
        if (! $user) {
            return response()->json(['message' => 'Tautan verifikasi tidak valid.'], 422);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email sudah diverifikasi sebelumnya.']);
        }

        $valid = EmailVerificationToken::isValid(
            userId: (int) $request->integer('id'),
            hash: $request->string('hash')->toString(),
            expires: (int) $request->integer('expires'),
            signature: $request->string('signature')->toString(),
            userEmail: $user->email,
        );

        if (! $valid) {
            return response()->json(['message' => 'Tautan verifikasi sudah kedaluwarsa atau tidak valid.'], 422);
        }

        $user->markEmailAsVerified();

        AuditLogger::log('email_verified', $user);

        return response()->json(['message' => 'Email berhasil diverifikasi.']);
    }

    /**
     * POST /api/v1/auth/email/verification-notification
     * Kirim ulang email verifikasi. Requires: auth:sanctum
     */
    public function resendVerificationEmail(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email sudah diverifikasi.']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Email verifikasi sudah dikirim ulang.']);
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
