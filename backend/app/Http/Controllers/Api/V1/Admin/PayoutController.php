<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GeneratePayoutRequest;
use App\Http\Requests\Admin\MarkPayoutPaidRequest;
use App\Http\Resources\PayoutBatchResource;
use App\Models\Partner;
use App\Models\PayoutBatch;
use App\Services\Payout\PayoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayoutController extends Controller
{
    public function __construct(
        private readonly PayoutService $payoutService,
    ) {}

    /**
     * GET /api/v1/admin/payouts
     * List semua batch payout. Filter: partner_id, status.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', PayoutBatch::class);

        $query = PayoutBatch::with('partner')->latest();

        if ($request->filled('partner_id')) {
            $query->where('partner_id', $request->integer('partner_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $batches = $query->paginate($request->integer('per_page', 20));

        return response()->json(
            PayoutBatchResource::collection($batches)->response()->getData(true)
        );
    }

    /**
     * POST /api/v1/admin/payouts
     * Generate batch payout baru untuk satu mitra.
     */
    public function store(GeneratePayoutRequest $request): JsonResponse
    {
        $this->authorize('create', PayoutBatch::class);

        $validated = $request->validated();
        $partner   = Partner::findOrFail($validated['partner_id']);

        $batch = $this->payoutService->generate(
            $partner,
            $request->user(),
            $validated['earning_ids'] ?? [],
            now()->parse($validated['period_start']),
            now()->parse($validated['period_end']),
        );

        return PayoutBatchResource::make($batch->load('partner'))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/v1/admin/payouts/{payout}
     * Detail batch + daftar earnings di dalamnya.
     */
    public function show(PayoutBatch $payout): JsonResponse
    {
        $this->authorize('view', $payout);

        return response()->json([
            'data' => PayoutBatchResource::make($payout->load(['partner', 'earnings'])),
        ]);
    }

    /**
     * PATCH /api/v1/admin/payouts/{payout}/process
     * Tandai batch sedang diproses (mulai transfer).
     */
    public function markProcessing(PayoutBatch $payout): JsonResponse
    {
        $this->authorize('update', $payout);

        $updated = $this->payoutService->markProcessing($payout, request()->user());

        return response()->json([
            'data'    => PayoutBatchResource::make($updated),
            'message' => 'Batch payout ditandai sedang diproses.',
        ]);
    }

    /**
     * PATCH /api/v1/admin/payouts/{payout}/mark-paid
     * Tandai batch sudah dibayar + upload bukti transfer.
     */
    public function markPaid(MarkPayoutPaidRequest $request, PayoutBatch $payout): JsonResponse
    {
        $this->authorize('update', $payout);

        $updated = $this->payoutService->markPaid(
            $payout,
            $request->user(),
            $request->validated('payment_proof'),
        );

        return response()->json([
            'data'    => PayoutBatchResource::make($updated),
            'message' => 'Payout berhasil ditandai sudah dibayar.',
        ]);
    }

    /**
     * PATCH /api/v1/admin/payouts/{payout}/cancel
     * Batalkan batch payout (earnings kembali ke available).
     */
    public function cancel(Request $request, PayoutBatch $payout): JsonResponse
    {
        $this->authorize('cancel', $payout);

        $updated = $this->payoutService->cancel(
            $payout,
            $request->user(),
            $request->input('reason'),
        );

        return response()->json([
            'data'    => PayoutBatchResource::make($updated),
            'message' => 'Batch payout berhasil dibatalkan.',
        ]);
    }
}
