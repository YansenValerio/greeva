<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddToCartRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Services\Cart\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
    ) {}

    /**
     * GET /api/v1/cart
     * Tampilkan isi keranjang beserta subtotal.
     */
    public function show(Request $request): JsonResponse
    {
        $key   = $this->cartService->getAuthKey($request->user()->id);
        $items = $this->cartService->get($key);

        return response()->json([
            'data' => [
                'items'    => $items,
                'count'    => $this->cartService->count($key),
                'subtotal' => $this->cartService->subtotal($key),
            ],
        ]);
    }

    /**
     * POST /api/v1/cart/items
     * Tambah item ke keranjang.
     */
    public function addItem(AddToCartRequest $request): JsonResponse
    {
        $key  = $this->cartService->getAuthKey($request->user()->id);
        $item = $this->cartService->addItem(
            $key,
            $request->integer('variant_id'),
            $request->integer('quantity'),
        );

        return response()->json(['data' => $item], 201);
    }

    /**
     * PUT /api/v1/cart/items/{variantId}
     * Update qty item. Kirim qty=0 untuk hapus.
     */
    public function updateItem(UpdateCartItemRequest $request, int $variantId): JsonResponse
    {
        $key  = $this->cartService->getAuthKey($request->user()->id);
        $item = $this->cartService->updateItem($key, $variantId, $request->integer('quantity'));

        if ($item === null) {
            return response()->json(['message' => 'Item berhasil dihapus dari keranjang.']);
        }

        return response()->json(['data' => $item]);
    }

    /**
     * DELETE /api/v1/cart/items/{variantId}
     * Hapus satu item dari keranjang.
     */
    public function removeItem(Request $request, int $variantId): JsonResponse
    {
        $key = $this->cartService->getAuthKey($request->user()->id);
        $this->cartService->removeItem($key, $variantId);

        return response()->json(['message' => 'Item berhasil dihapus dari keranjang.']);
    }

    /**
     * DELETE /api/v1/cart
     * Kosongkan seluruh keranjang.
     */
    public function clear(Request $request): JsonResponse
    {
        $key = $this->cartService->getAuthKey($request->user()->id);
        $this->cartService->clear($key);

        return response()->json(['message' => 'Keranjang berhasil dikosongkan.']);
    }

    /**
     * POST /api/v1/cart/merge
     * Merge guest cart ke auth cart setelah login.
     * Body: { guest_token: "uuid" }
     */
    public function merge(Request $request): JsonResponse
    {
        $request->validate(['guest_token' => ['required', 'string', 'max:100']]);

        $guestKey = $this->cartService->getGuestKey($request->input('guest_token'));
        $authKey  = $this->cartService->getAuthKey($request->user()->id);

        $this->cartService->mergeGuestToAuth($guestKey, $authKey);

        $items = $this->cartService->get($authKey);

        return response()->json([
            'data'    => ['items' => $items, 'count' => count($items)],
            'message' => 'Keranjang berhasil digabungkan.',
        ]);
    }
}
