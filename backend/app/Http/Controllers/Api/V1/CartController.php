<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddToCartRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Services\Cart\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
    ) {}

    /**
     * GET /api/v1/cart
     * Tampilkan isi keranjang beserta subtotal.
     * Buyer login atau guest (via X-Cart-Token header).
     */
    public function show(Request $request): JsonResponse
    {
        $key = $this->resolveKey($request, required: false);

        if ($key === null) {
            return response()->json([
                'data' => ['items' => [], 'count' => 0, 'subtotal' => 0],
            ]);
        }

        return response()->json([
            'data' => [
                'items'    => $this->cartService->get($key),
                'count'    => $this->cartService->count($key),
                'subtotal' => $this->cartService->subtotal($key),
            ],
        ]);
    }

    /**
     * POST /api/v1/cart/items
     */
    public function addItem(AddToCartRequest $request): JsonResponse
    {
        $key  = $this->resolveKey($request, required: true);
        $item = $this->cartService->addItem(
            $key,
            $request->integer('variant_id'),
            $request->integer('quantity'),
        );

        return response()->json(['data' => $item], 201);
    }

    /**
     * PUT /api/v1/cart/items/{variantId}
     */
    public function updateItem(UpdateCartItemRequest $request, int $variantId): JsonResponse
    {
        $key  = $this->resolveKey($request, required: true);
        $item = $this->cartService->updateItem($key, $variantId, $request->integer('quantity'));

        if ($item === null) {
            return response()->json(['message' => 'Item berhasil dihapus dari keranjang.']);
        }

        return response()->json(['data' => $item]);
    }

    /**
     * DELETE /api/v1/cart/items/{variantId}
     */
    public function removeItem(Request $request, int $variantId): JsonResponse
    {
        $key = $this->resolveKey($request, required: true);
        $this->cartService->removeItem($key, $variantId);

        return response()->json(['message' => 'Item berhasil dihapus dari keranjang.']);
    }

    /**
     * DELETE /api/v1/cart
     */
    public function clear(Request $request): JsonResponse
    {
        $key = $this->resolveKey($request, required: true);
        $this->cartService->clear($key);

        return response()->json(['message' => 'Keranjang berhasil dikosongkan.']);
    }

    /**
     * POST /api/v1/cart/merge
     * Merge guest cart ke auth cart setelah login. Requires auth.
     * Body: { guest_token: "uuid" }
     */
    public function merge(Request $request): JsonResponse
    {
        $request->validate([
            'guest_token' => ['required', 'string', 'regex:/^[a-zA-Z0-9-]{8,100}$/'],
        ]);

        $guestKey = $this->cartService->getGuestKey($request->input('guest_token'));
        $authKey  = $this->cartService->getAuthKey($request->user()->id);

        $this->cartService->mergeGuestToAuth($guestKey, $authKey);

        $items = $this->cartService->get($authKey);

        return response()->json([
            'data'    => [
                'items'    => $items,
                'count'    => $this->cartService->count($authKey),
                'subtotal' => $this->cartService->subtotal($authKey),
            ],
            'message' => 'Keranjang berhasil digabungkan.',
        ]);
    }

    /**
     * Resolve cart key dari auth user atau X-Cart-Token header.
     *
     * @param  bool  $required  jika true: abort 400 kalau tidak ada user dan tidak ada token valid.
     * @return string|null  key Redis atau null (jika $required = false dan tidak ada apa pun)
     */
    private function resolveKey(Request $request, bool $required): ?string
    {
        $user = Auth::guard('sanctum')->user();
        if ($user) {
            return $this->cartService->getAuthKey($user->id);
        }

        $token = $request->header('X-Cart-Token');
        if ($token && preg_match('/^[a-zA-Z0-9-]{8,100}$/', $token)) {
            return $this->cartService->getGuestKey($token);
        }

        if ($required) {
            abort(400, 'Header X-Cart-Token wajib untuk guest cart.');
        }

        return null;
    }
}
