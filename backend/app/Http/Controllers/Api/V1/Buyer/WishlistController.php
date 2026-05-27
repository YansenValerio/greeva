<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Buyer;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * GET /api/v1/wishlist
     * Daftar produk yang disimpan user (paling baru di atas).
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $products = Product::query()
            ->whereIn('id', Wishlist::where('user_id', $userId)->select('product_id'))
            ->with(['partner:id,name,slug', 'category:id,name,slug', 'activeVariants'])
            ->withCount(['approvedReviews as reviews_count'])
            ->withAvg(['approvedReviews as average_rating'], 'rating')
            ->latest('id')
            ->get();

        return response()->json([
            'data' => ProductResource::collection($products),
        ]);
    }

    /**
     * POST /api/v1/wishlist/{product}
     * Tambahkan produk ke wishlist (idempotent).
     */
    public function store(Request $request, Product $product): JsonResponse
    {
        Wishlist::firstOrCreate([
            'user_id'    => $request->user()->id,
            'product_id' => $product->id,
        ]);

        return response()->json([
            'message' => 'Produk ditambahkan ke wishlist.',
        ], 201);
    }

    /**
     * DELETE /api/v1/wishlist/{product}
     * Hapus produk dari wishlist.
     */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->delete();

        return response()->json(null, 204);
    }
}
