<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Return\ResolveReturnRequest;
use App\Http\Resources\ReturnRequestResource;
use App\Models\ReturnRequest;
use App\Services\Order\ReturnRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReturnRequestController extends Controller
{
    public function __construct(
        private readonly ReturnRequestService $returnService,
    ) {}

    /**
     * GET /api/v1/admin/returns
     * Semua pengajuan retur, bisa difilter by status.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ReturnRequest::with(['order:id,order_number,grand_total,status', 'user:id,name,email'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $returns = $query->paginate($request->integer('per_page', 20));

        return response()->json(
            ReturnRequestResource::collection($returns)->response()->getData(true)
        );
    }

    /**
     * GET /api/v1/admin/returns/{returnRequest}
     */
    public function show(ReturnRequest $returnRequest): JsonResponse
    {
        return response()->json([
            'data' => ReturnRequestResource::make(
                $returnRequest->load(['order', 'user:id,name,email', 'resolvedBy:id,name'])
            ),
        ]);
    }

    /**
     * PATCH /api/v1/admin/returns/{returnRequest}/approve
     */
    public function approve(ResolveReturnRequest $request, ReturnRequest $returnRequest): JsonResponse
    {
        $return = $this->returnService->approve(
            $returnRequest,
            $request->user(),
            $request->validated('admin_note'),
        );

        return response()->json([
            'data'    => ReturnRequestResource::make($return),
            'message' => 'Retur disetujui. Pesanan telah direfund.',
        ]);
    }

    /**
     * PATCH /api/v1/admin/returns/{returnRequest}/reject
     */
    public function reject(ResolveReturnRequest $request, ReturnRequest $returnRequest): JsonResponse
    {
        $return = $this->returnService->reject(
            $returnRequest,
            $request->user(),
            $request->validated('admin_note'),
        );

        return response()->json([
            'data'    => ReturnRequestResource::make($return),
            'message' => 'Pengajuan retur ditolak.',
        ]);
    }
}
