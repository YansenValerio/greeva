<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Product\AdminUpdateProductRequest;
use App\Http\Requests\Product\AdminUpdateStatusRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\Product\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $productService,
    ) {}

    /**
     * GET /api/v1/admin/products
     * Semua produk lintas status dan mitra.
     * Query params: status, partner_id, category_id, search, per_page
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Product::class);

        $products = $this->productService->listAll($request->only([
            'status', 'partner_id', 'category_id', 'search', 'per_page',
        ]));

        return response()->json(ProductResource::collection($products)->response()->getData(true));
    }

    /**
     * GET /api/v1/admin/products/{product}
     * Detail produk apa pun status-nya.
     */
    public function show(Product $product): JsonResponse
    {
        $this->authorize('view', $product);

        return response()->json([
            'data' => ProductResource::make($product->load(['partner', 'category', 'variants'])),
        ]);
    }

    /**
     * PUT /api/v1/admin/products/{product}
     * Update produk — admin bisa set revenue_share_percent.
     */
    public function update(AdminUpdateProductRequest $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $updated = $this->productService->adminUpdate($product, $request->validated());

        return response()->json(['data' => ProductResource::make($updated)]);
    }

    /**
     * PATCH /api/v1/admin/products/{product}/status
     * Ubah status produk (kurasi: approve, reject, nonaktifkan, arsipkan).
     */
    public function updateStatus(AdminUpdateStatusRequest $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $status  = ProductStatus::from($request->validated('status'));
        $updated = $this->productService->updateStatus($product, $status, $request->validated('note'));

        return response()->json([
            'data'    => ProductResource::make($updated),
            'message' => "Status produk diubah ke \"{$status->label()}\".",
        ]);
    }
}
