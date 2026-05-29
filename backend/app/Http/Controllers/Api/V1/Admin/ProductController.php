<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Product\AdminUpdateProductRequest;
use App\Http\Requests\Product\AdminUpdateStatusRequest;
use App\Http\Requests\Product\BulkUpdateStatusRequest;
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

    /**
     * PATCH /api/v1/admin/products/{product}/toggle-featured
     * Tandai/lepas produk sebagai "pilihan".
     */
    public function toggleFeatured(Product $product): JsonResponse
    {
        $product->update(['is_featured' => ! $product->is_featured]);

        $label = $product->is_featured ? 'ditambahkan ke' : 'dilepas dari';

        return response()->json([
            'data'    => ProductResource::make($product->fresh(['partner', 'category', 'variants'])),
            'message' => "Produk berhasil {$label} Pilihan.",
        ]);
    }

    /**
     * PATCH /api/v1/admin/products/bulk-status
     * Ubah status banyak produk sekaligus (kurasi massal).
     */
    public function bulkUpdateStatus(BulkUpdateStatusRequest $request): JsonResponse
    {
        $status = ProductStatus::from($request->validated('status'));
        $count  = $this->productService->bulkUpdateStatus(
            $request->validated('product_ids'),
            $status,
            $request->validated('note'),
        );

        return response()->json([
            'data'    => ['updated' => $count],
            'message' => "{$count} produk diubah ke status \"{$status->label()}\".",
        ]);
    }
}
