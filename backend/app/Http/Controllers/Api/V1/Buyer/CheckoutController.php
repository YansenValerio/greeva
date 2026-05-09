<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Buyer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Services\Checkout\CheckoutService;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CheckoutService $checkoutService,
    ) {}

    /**
     * POST /api/v1/checkout
     * Proses checkout: validasi cart → buat order → Midtrans Snap.
     */
    public function store(CheckoutRequest $request): JsonResponse
    {
        $result = $this->checkoutService->checkout(
            $request->validated(),
            $request->user(),
        );

        return response()->json([
            'data'        => OrderResource::make($result['order']),
            'snap_token'  => $result['snap_token'],
            'payment_url' => $result['payment_url'],
            'message'     => 'Order berhasil dibuat. Selesaikan pembayaran dalam 24 jam.',
        ], 201);
    }
}
