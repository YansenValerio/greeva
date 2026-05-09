<?php

declare(strict_types=1);

namespace App\Services\Ai;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class AiService
{
    private string $apiKey;
    private string $model;
    private string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

    public function __construct()
    {
        $this->apiKey = config('services.google_ai.api_key', '');
        $this->model  = config('services.google_ai.model', 'gemini-2.0-flash');
    }

    /**
     * Generate product copy for partner product form.
     * Returns structured array: description, short_description,
     * sustainability_notes, meta_title, meta_description.
     */
    public function generateProductCopy(
        string $name,
        ?string $material = null,
        ?string $shortDescription = null,
    ): array {
        $this->assertApiKeyConfigured();

        $userPrompt = $this->buildCopyPrompt($name, $material, $shortDescription);

        $response = $this->callGenerateContent(
            systemPrompt: $this->copywriterSystemPrompt(),
            userMessage:  $userPrompt,
            jsonOutput:   true,
        );

        $text = $response->json('candidates.0.content.parts.0.text', '');

        $json = $this->extractJson($text);

        return $json ?? [
            'description'          => $text,
            'short_description'    => null,
            'sustainability_notes' => null,
            'meta_title'           => null,
            'meta_description'     => null,
        ];
    }

    /**
     * Stream a chat response via SSE.
     * Converts frontend message format (role: user|assistant) to Gemini format (role: user|model).
     *
     * @param  array  $messages  [{role: 'user'|'assistant', content: string}]
     */
    public function streamChat(array $messages): void
    {
        $this->assertApiKeyConfigured();

        // Convert assistant → model (Gemini role names)
        $contents = array_map(fn (array $msg) => [
            'role'  => $msg['role'] === 'assistant' ? 'model' : 'user',
            'parts' => [['text' => $msg['content']]],
        ], $messages);

        $url = "{$this->baseUrl}/{$this->model}:streamGenerateContent?alt=sse&key={$this->apiKey}";

        $client   = new \GuzzleHttp\Client();
        $response = $client->post($url, [
            'headers' => ['Content-Type' => 'application/json'],
            'json'    => [
                'system_instruction' => [
                    'parts' => [['text' => $this->chatSystemPrompt()]],
                ],
                'contents'           => $contents,
                'generationConfig'   => ['maxOutputTokens' => 1024],
            ],
            'stream' => true,
        ]);

        $body   = $response->getBody();
        $buffer = '';

        while (!$body->eof()) {
            $chunk  = $body->read(1024);
            $buffer .= $chunk;

            while (($pos = strpos($buffer, "\n")) !== false) {
                $line   = rtrim(substr($buffer, 0, $pos));
                $buffer = substr($buffer, $pos + 1);

                if (!str_starts_with($line, 'data: ')) {
                    continue;
                }

                $data = json_decode(substr($line, 6), true);

                if (!is_array($data)) {
                    continue;
                }

                $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

                if ($text !== null && $text !== '') {
                    echo 'data: ' . json_encode(['text' => $text]) . "\n\n";
                    ob_flush();
                    flush();
                }

                // Gemini sends finishReason when done
                $finishReason = $data['candidates'][0]['finishReason'] ?? null;
                if ($finishReason !== null && $finishReason !== 'STOP') {
                    // Safety block or error
                    Log::warning('Gemini stream stopped', ['reason' => $finishReason]);
                }
            }
        }

        echo "data: [DONE]\n\n";
        ob_flush();
        flush();
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private function callGenerateContent(
        string $systemPrompt,
        string $userMessage,
        bool $jsonOutput = false,
    ): Response {
        $url = "{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}";

        $payload = [
            'system_instruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
            'contents' => [
                [
                    'role'  => 'user',
                    'parts' => [['text' => $userMessage]],
                ],
            ],
            'generationConfig' => array_filter([
                'maxOutputTokens'  => 1024,
                'responseMimeType' => $jsonOutput ? 'application/json' : null,
            ]),
        ];

        $response = Http::post($url, $payload);

        if ($response->failed()) {
            Log::error('Gemini API error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            throw new RuntimeException('AI service tidak tersedia saat ini. Coba lagi nanti.');
        }

        return $response;
    }

    private function buildCopyPrompt(string $name, ?string $material, ?string $shortDescription): string
    {
        $lines = ["Nama produk: {$name}"];

        if ($material) {
            $lines[] = "Material: {$material}";
        }

        if ($shortDescription) {
            $lines[] = "Info tambahan dari mitra: {$shortDescription}";
        }

        return implode("\n", $lines);
    }

    private function copywriterSystemPrompt(): string
    {
        return <<<'PROMPT'
Kamu adalah copywriter ahli untuk Greeva, platform kurasi brand hijau lokal Indonesia.
Greeva menjual produk sustainable dari mitra seperti Notic (aksesoris manik HDPE daur ulang)
dan Reperca (produk dari kain perca sisa konveksi).

Tone brand Greeva: warm, percaya diri, craft-oriented. Seperti Starbucks tapi untuk
produk sustainability Indonesia. Gunakan Bahasa Indonesia yang natural dan expressive,
bukan kaku atau korporat.

Tugasmu: dari input nama produk + material, hasilkan copy produk dalam format JSON berikut:

{
  "description": "Deskripsi lengkap 2-3 paragraf, cerita di balik produk, benefit, cara penggunaan",
  "short_description": "1 kalimat tagline produk, menarik dan ringkas",
  "sustainability_notes": "Penjelasan dampak positif lingkungan dari bahan/proses produksi",
  "meta_title": "Judul SEO maks 60 karakter",
  "meta_description": "Deskripsi SEO maks 160 karakter"
}

Kembalikan HANYA JSON valid, tanpa teks lain.
PROMPT;
    }

    private function chatSystemPrompt(): string
    {
        return <<<'PROMPT'
Kamu adalah asisten virtual Greeva, platform kurasi brand hijau lokal Indonesia.

Tentang Greeva:
- Platform e-commerce untuk brand sustainable lokal Indonesia
- Mitra aktif: Notic (aksesoris manik dari plastik HDPE daur ulang) dan Reperca (produk dari kain perca sisa konveksi)
- Pengiriman ke seluruh Indonesia
- Pembayaran via Midtrans (transfer bank, e-wallet, kartu kredit)
- Kebijakan return: 7 hari setelah produk diterima (kondisi belum dipakai)

Cara merespons:
- Selalu gunakan Bahasa Indonesia yang ramah dan natural
- Jawab pertanyaan tentang produk, sustainability, pengiriman, pembayaran, dan pesanan
- Jika tidak tahu jawaban pasti, arahkan buyer hubungi tim Greeva via email di hello@greeva.id
- Jangan buat-buat informasi yang tidak kamu ketahui
- Untuk cek status pesanan, arahkan ke halaman /orders atau email support
- Tetap singkat dan langsung ke poin

Nilai Greeva:
- Sustainability adalah inti, bukan sekadar tren
- Setiap pembelian mendukung UKM lokal
- Produk dari material daur ulang dan sisa produksi
PROMPT;
    }

    private function extractJson(string $text): ?array
    {
        $decoded = json_decode(trim($text), true);
        if (is_array($decoded)) {
            return $decoded;
        }

        if (preg_match('/```(?:json)?\s*([\s\S]+?)\s*```/', $text, $matches)) {
            $decoded = json_decode($matches[1], true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return null;
    }

    private function assertApiKeyConfigured(): void
    {
        if (empty($this->apiKey)) {
            throw new RuntimeException('GOOGLE_AI_API_KEY belum dikonfigurasi.');
        }
    }
}
