<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Partner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
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
     * GET /api/v1/partner/products
     * Daftar produk milik mitra yang sedang login.
     * Query params: status, per_page
     */
    public function index(Request $request): JsonResponse
    {
        $partner   = $request->user()->partner;
        $products  = $this->productService->listForPartner($partner, $request->only(['status', 'per_page']));

        return response()->json(ProductResource::collection($products)->response()->getData(true));
    }

    /**
     * POST /api/v1/partner/products
     * Buat produk baru (status: draft).
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $this->authorize('create', Product::class);

        $product = $this->productService->create(
            $request->validated(),
            $request->user()->partner,
        );

        return ProductResource::make($product)
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/v1/partner/products/{product}
     * Detail produk milik mitra.
     */
    public function show(Request $request, Product $product): JsonResponse
    {
        $this->authorize('view', $product);

        return response()->json([
            'data' => ProductResource::make($product->load(['category', 'variants'])),
        ]);
    }

    /**
     * PUT /api/v1/partner/products/{product}
     * Update produk milik mitra (tidak bisa update jika sudah active).
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $updated = $this->productService->update($product, $request->validated());

        return response()->json(['data' => ProductResource::make($updated)]);
    }

    /**
     * DELETE /api/v1/partner/products/{product}
     * Hapus produk (hanya draft/inactive).
     */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        $this->authorize('delete', $product);

        $this->productService->delete($product);

        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }

    /**
     * POST /api/v1/partner/products/{product}/submit
     * Ajukan produk ke admin untuk review (draft → pending_review).
     */
    public function submit(Request $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $updated = $this->productService->submitForReview($product);

        return response()->json([
            'data'    => ProductResource::make($updated),
            'message' => 'Produk berhasil diajukan untuk review.',
        ]);
    }
}
