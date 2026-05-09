<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Buyer;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * GET /api/v1/orders
     * Riwayat order milik buyer yang login.
     * Query params: status, per_page
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['items'])
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
        $order = Order::with(['items', 'shipments'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        $this->authorize('view', $order);

        return response()->json(['data' => OrderResource::make($order)]);
    }
}
