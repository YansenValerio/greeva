<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Buyer;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\CancelOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\Order\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
    ) {}

    /**
     * GET /api/v1/orders
     * Riwayat order milik buyer yang login.
     * Query params: status, per_page
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['items.product:id,slug', 'items.review'])
            ->forUser($request->user()->id)
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $orders = $query->paginate($request->integer('per_page', 15));

        return response()->json(OrderResource::collection($orders)->response()->getData(true));
    }

    /**
     * GET /api/v1/orders/{orderNumber}
     * Detail order.
     */
    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::with(['items.product:id,slug', 'items.review', 'shipments'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        $this->authorize('view', $order);

        return response()->json(['data' => OrderResource::make($order)]);
    }

    /**
     * POST /api/v1/orders/{orderNumber}/cancel
     * Buyer membatalkan order miliknya (selama belum dikirim).
     * Body: { reason?: string }
     */
    public function cancel(CancelOrderRequest $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        $this->authorize('cancel', $order);

        $updated = $this->orderService->updateStatus(
            $order,
            OrderStatus::Cancelled,
            ['note' => $request->input('reason')],
        );

        return response()->json([
            'data'    => OrderResource::make($updated),
            'message' => 'Pesanan berhasil dibatalkan.',
        ]);
    }
}
