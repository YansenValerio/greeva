<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Ai\AiService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use RuntimeException;

class ChatController extends Controller
{
    public function __construct(
        private readonly AiService $aiService,
    ) {}

    /**
     * POST /api/v1/chat
     * SSE streaming endpoint. Returns text/event-stream.
     *
     * Request body:
     *   messages: [{role: 'user'|'assistant', content: string}]
     */
    public function stream(Request $request): StreamedResponse
    {
        $request->validate([
            'messages'          => ['required', 'array', 'min:1', 'max:20'],
            'messages.*.role'   => ['required', 'in:user,assistant'],
            'messages.*.content'=> ['required', 'string', 'max:2000'],
        ]);

        $messages = $request->input('messages');

        return response()->stream(function () use ($messages) {
            try {
                $this->aiService->streamChat($messages);
            } catch (RuntimeException $e) {
                echo 'data: ' . json_encode(['error' => $e->getMessage()]) . "\n\n";
                ob_flush();
                flush();
            }
        }, 200, [
            'Content-Type'     => 'text/event-stream',
            'Cache-Control'    => 'no-cache',
            'X-Accel-Buffering'=> 'no',
            'Connection'       => 'keep-alive',
        ]);
    }
}
