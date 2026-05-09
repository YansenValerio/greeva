<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Services\Product\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $productService,
    ) {}

    /**
     * GET /api/v1/products
     * Publik — browse produk aktif dengan filter & paginasi.
     *
     * Query params: category_id, partner_id, search, min_price, max_price,
     *               sort_by (published_at|price|name), sort_order (asc|desc), per_page
     */
    public function index(Request $request): JsonResponse
    {
        $products = $this->productService->listPublic($request->only([
            'category_id', 'partner_id', 'search',
            'min_price', 'max_price',
            'sort_by', 'sort_order', 'per_page',
        ]));

        return response()->json(ProductResource::collection($products)->response()->getData(true));
    }

    /**
     * GET /api/v1/products/{slug}
     * Publik — detail produk aktif.
     */
    public function show(string $slug): JsonResponse
    {
        $product = $this->productService->findPublicBySlug($slug);

        return response()->json([
            'data' => ProductResource::make($product),
        ]);
    }
}
