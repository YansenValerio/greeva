<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Buyer;

use App\Http\Controllers\Controller;
use App\Services\Cart\CartService;
use App\Services\Voucher\VoucherService;
use App\Support\Money;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    public function __construct(
        private readonly VoucherService $voucherService,
        private readonly CartService $cartService,
    ) {}

    /**
     * POST /api/v1/vouchers/preview
     * Validasi kode voucher terhadap subtotal cart user & kembalikan potongan.
     * Bersifat informatif; validasi otoritatif dilakukan ulang saat checkout.
     *
     * Body: { code: string }
     */
    public function preview(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'max:50'],
        ]);

        $user      = $request->user();
        $cartKey   = $this->cartService->getAuthKey($user->id);
        $cartItems = $this->cartService->get($cartKey);

        if (empty($cartItems)) {
            abort(422, 'Keranjang belanja kosong.');
        }

        $subtotal = 0;
        foreach ($cartItems as $item) {
            $subtotal += $item['price'] * $item['quantity'];
        }

        $voucher  = $this->voucherService->validate($request->input('code'), $subtotal, $user);
        $discount = $this->voucherService->computeDiscount($voucher, $subtotal);

        return response()->json([
            'data' => [
                'voucher_code'       => $voucher->code,
                'label'              => $voucher->description ?? $voucher->code,
                'discount_amount'    => $discount,
                'discount_formatted' => Money::format($discount),
            ],
            'message' => 'Voucher berhasil diterapkan.',
        ]);
    }
}
