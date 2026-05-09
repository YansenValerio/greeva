<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Partner;

use App\Http\Controllers\Controller;
use App\Services\Ai\AiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class AiController extends Controller
{
    public function __construct(
        private readonly AiService $aiService,
    ) {}

    /**
     * POST /api/v1/partner/ai/generate-copy
     * Generate product copy (description, sustainability notes, SEO meta) from product info.
     */
    public function generateCopy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'              => ['required', 'string', 'max:255'],
            'material'          => ['nullable', 'string', 'max:500'],
            'short_description' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $copy = $this->aiService->generateProductCopy(
                name:             $validated['name'],
                material:         $validated['material'] ?? null,
                shortDescription: $validated['short_description'] ?? null,
            );

            return response()->json(['data' => $copy]);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }
    }
}
