<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Partner;

use App\Http\Controllers\Controller;
use App\Http\Resources\PartnerOrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * GET /api/v1/partner/orders
     * Daftar order yang mengandung produk mitra ini.
     * Data buyer tidak diekspos (privacy by design).
     */
    public function index(Request $request): JsonResponse
    {
        $partner = $request->user()->partner;

        $query = Order::with(['items' => function ($q) use ($partner) {
            $q->where('partner_id', $partner->id);
        }])
        ->whereHas('items', fn ($q) => $q->where('partner_id', $partner->id))
        ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $orders = $query->paginate($request->integer('per_page', 20));

        return response()->json(PartnerOrderResource::collection($orders)->response()->getData(true));
    }

    /**
     * GET /api/v1/partner/orders/{orderNumber}
     */
    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $partner = $request->user()->partner;

        $order = Order::with(['items' => function ($q) use ($partner) {
            $q->where('partner_id', $partner->id);
        }, 'shipments'])
        ->whereHas('items', fn ($q) => $q->where('partner_id', $partner->id))
        ->where('order_number', $orderNumber)
        ->firstOrFail();

        return response()->json(['data' => PartnerOrderResource::make($order)]);
    }
}
