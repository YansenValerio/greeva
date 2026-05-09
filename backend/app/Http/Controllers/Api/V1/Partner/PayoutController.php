<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Partner;

use App\Http\Controllers\Controller;
use App\Http\Resources\PayoutBatchResource;
use App\Models\PayoutBatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayoutController extends Controller
{
    /**
     * GET /api/v1/partner/payouts
     * Daftar payout batch milik mitra yang sedang login.
     */
    public function index(Request $request): JsonResponse
    {
        $partner = $request->user()->partner;

        $batches = PayoutBatch::where('partner_id', $partner->id)
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json(
            PayoutBatchResource::collection($batches)->response()->getData(true)
        );
    }

    /**
     * GET /api/v1/partner/payouts/{payout}
     * Detail batch beserta daftar earnings di dalamnya.
     */
    public function show(Request $request, PayoutBatch $payout): JsonResponse
    {
        $this->authorize('view', $payout);

        return response()->json([
            'data' => PayoutBatchResource::make($payout->load('earnings')),
        ]);
    }
}
