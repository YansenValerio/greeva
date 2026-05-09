<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Http\JsonResponse;

/**
 * Helper untuk format response API yang konsisten.
 *
 * @see CLAUDE.md section 9.1 — API Response Standard
 */
final class ApiResponse
{
    public static function success(mixed $data = null, int $status = 200, string $message = ''): JsonResponse
    {
        $payload = ['data' => $data];

        if ($message !== '') {
            $payload['message'] = $message;
        }

        return response()->json($payload, $status);
    }

    public static function error(string $message, string $code = '', int $status = 400): JsonResponse
    {
        $payload = ['message' => $message];

        if ($code !== '') {
            $payload['code'] = $code;
        }

        return response()->json($payload, $status);
    }

    public static function validationError(array $errors): JsonResponse
    {
        return response()->json([
            'message' => 'Data yang dikirim tidak valid.',
            'errors'  => $errors,
        ], 422);
    }

    public static function notFound(string $message = 'Data tidak ditemukan.'): JsonResponse
    {
        return response()->json(['message' => $message], 404);
    }

    public static function forbidden(string $message = 'Akses ditolak.'): JsonResponse
    {
        return response()->json(['message' => $message], 403);
    }
}
