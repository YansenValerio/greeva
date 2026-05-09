<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\AdminUpdateOrderStatusRequest;
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
     * GET /api/v1/admin/orders
     * Semua order lintas status & buyer.
     * Query params: status, partner_id, search (order_number), per_page
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['items:id,order_id,product_name,quantity,subtotal'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $term = $request->input('search');
            $query->where('order_number', 'like', "%{$term}%");
        }

        if ($request->filled('partner_id')) {
            $partnerId = $request->integer('partner_id');
            $query->whereHas('items', fn ($q) => $q->where('partner_id', $partnerId));
        }

        $orders = $query->paginate($request->integer('per_page', 20));

        return response()->json(OrderResource::collection($orders)->response()->getData(true));
    }

    /**
     * GET /api/v1/admin/orders/{order}
     * Detail order lengkap.
     */
    public function show(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        return response()->json([
            'data' => OrderResource::make($order->load(['items', 'shipments'])),
        ]);
    }

    /**
     * PATCH /api/v1/admin/orders/{order}/status
     * Ubah status order (packing, shipped+resi, delivered, completed, cancelled).
     */
    public function updateStatus(AdminUpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $this->authorize('update', $order);

        $newStatus = OrderStatus::from($request->validated('status'));

        $updated = $this->orderService->updateStatus(
            $order,
            $newStatus,
            $request->only(['tracking_number', 'courier', 'courier_service', 'note']),
        );

        return response()->json([
            'data'    => OrderResource::make($updated),
            'message' => "Status order diubah ke \"{$newStatus->label()}\".",
        ]);
    }
}
