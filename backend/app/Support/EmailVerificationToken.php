<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Support\Carbon;

/**
 * Helper untuk generate & validate signed token verifikasi email.
 * Digunakan saat frontend menerima parameter dari email lalu POST ke backend.
 */
class EmailVerificationToken
{
    /**
     * Generate payload bertanda untuk dikirim ke email.
     *
     * @return array{id: int, hash: string, expires: int, signature: string}
     */
    public static function generate(int $userId, string $email): array
    {
        $payload = [
            'id'      => $userId,
            'hash'    => sha1($email),
            'expires' => Carbon::now()->addMinutes(
                (int) config('auth.verification.expire', 60),
            )->timestamp,
        ];

        $payload['signature'] = self::sign($payload);

        return $payload;
    }

    /**
     * Validasi payload. Mengembalikan true jika signature cocok dan belum expired.
     */
    public static function isValid(int $userId, string $hash, int $expires, string $signature, string $userEmail): bool
    {
        if ($expires < Carbon::now()->timestamp) {
            return false;
        }

        if (! hash_equals(sha1($userEmail), $hash)) {
            return false;
        }

        $expected = self::sign([
            'id'      => $userId,
            'hash'    => $hash,
            'expires' => $expires,
        ]);

        return hash_equals($expected, $signature);
    }

    /**
     * Tanda tangan HMAC-SHA256 pakai APP_KEY.
     *
     * @param  array{id: int, hash: string, expires: int}  $payload
     */
    private static function sign(array $payload): string
    {
        ksort($payload);

        return hash_hmac(
            'sha256',
            http_build_query($payload),
            config('app.key'),
        );
    }
}
