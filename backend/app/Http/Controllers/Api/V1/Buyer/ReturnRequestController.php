<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Buyer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Return\StoreReturnRequest;
use App\Http\Resources\ReturnRequestResource;
use App\Models\Order;
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
     * GET /api/v1/returns
     * Riwayat pengajuan retur milik buyer.
     */
    public function index(Request $request): JsonResponse
    {
        $returns = ReturnRequest::with('order:id,order_number')
            ->forUser($request->user()->id)
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json(
            ReturnRequestResource::collection($returns)->response()->getData(true)
        );
    }

    /**
     * POST /api/v1/orders/{orderNumber}/return
     * Buyer mengajukan retur untuk order miliknya.
     */
    public function store(StoreReturnRequest $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        $this->authorize('view', $order); // pastikan order milik buyer ini

        $return = $this->returnService->create(
            $order,
            $request->user(),
            $request->validated(),
        );

        return ReturnRequestResource::make($return->load('order:id,order_number'))
            ->response()
            ->setStatusCode(201);
    }
}
