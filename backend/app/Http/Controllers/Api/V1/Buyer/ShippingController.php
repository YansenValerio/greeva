<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Buyer;

use App\Http\Controllers\Controller;
use App\Services\Cart\CartService;
use App\Services\Shipping\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly ShippingService $shippingService,
    ) {}

    /**
     * POST /api/v1/shipping/rates
     * Hitung opsi ongkir berdasarkan kode pos tujuan + berat isi keranjang.
     */
    public function rates(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'destination_postal_code' => ['required', 'string', 'size:5', 'regex:/^\d{5}$/'],
        ], [
            'destination_postal_code.required' => 'Kode pos tujuan wajib diisi.',
            'destination_postal_code.size'     => 'Kode pos harus 5 digit.',
            'destination_postal_code.regex'    => 'Kode pos harus berupa angka.',
        ]);

        $cartKey   = $this->cartService->getAuthKey($request->user()->id);
        $cartItems = $this->cartService->get($cartKey);

        if (empty($cartItems)) {
            abort(422, 'Keranjang belanja kosong.');
        }

        $rates = $this->shippingService->ratesForCart(
            $cartItems,
            $validated['destination_postal_code'],
        );

        return response()->json([
            'data' => array_map(fn ($rate) => $rate->toArray(), $rates),
        ]);
    }
}
