<?php

declare(strict_types=1);

namespace App\Services\Notification;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private const FONNTE_URL = 'https://api.fonnte.com/send';

    private ?string $apiKey;

    public function __construct()
    {
        $apiKey = config('services.whatsapp.api_key');
        $this->apiKey = (is_string($apiKey) && $apiKey !== '') ? $apiKey : null;
    }

    public function send(string $phone, string $message): void
    {
        if ($this->apiKey === null) {
            Log::warning('WhatsApp notification skipped: WHATSAPP_API_KEY tidak dikonfigurasi.');
            return;
        }

        $normalized = $this->normalizePhone($phone);

        $response = Http::withHeaders([
            'Authorization' => $this->apiKey,
        ])->post(self::FONNTE_URL, [
            'target'      => $normalized,
            'message'     => $message,
            'countryCode' => '62',
        ]);

        if ($response->failed()) {
            Log::error('WhatsApp send gagal via Fonnte', [
                'phone'  => $normalized,
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
        }
    }

    // ── Private ──────────────────────────────────────────────────────────────

    private function normalizePhone(string $phone): string
    {
        // Strip spaces and dashes
        $phone = preg_replace('/[\s\-]/', '', $phone);

        // Remove leading +
        $phone = ltrim($phone, '+');

        // 08xxx → 628xxx (Fonnte's countryCode param also handles this,
        // but normalize here for consistency in logs)
        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        return $phone;
    }
}
