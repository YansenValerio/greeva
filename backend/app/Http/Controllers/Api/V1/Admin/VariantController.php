<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Variant\StoreVariantRequest;
use App\Http\Requests\Variant\UpdateVariantRequest;
use App\Http\Resources\VariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Product\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VariantController extends Controller
{
    public function __construct(
        private readonly ProductService $productService,
    ) {}

    /**
     * POST /api/v1/admin/products/{product}/variants
     */
    public function store(StoreVariantRequest $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $variant = $this->productService->addVariant($product, $request->validated());

        return VariantResource::make($variant)
            ->response()
            ->setStatusCode(201);
    }

    /**
     * PUT /api/v1/admin/products/{product}/variants/{variant}
     */
    public function update(
        UpdateVariantRequest $request,
        Product $product,
        ProductVariant $variant,
    ): JsonResponse {
        $this->authorize('update', $product);

        if ($variant->product_id !== $product->id) {
            abort(404, 'Varian tidak ditemukan.');
        }

        $updated = $this->productService->updateVariant($variant, $request->validated());

        return response()->json(['data' => VariantResource::make($updated)]);
    }

    /**
     * DELETE /api/v1/admin/products/{product}/variants/{variant}
     */
    public function destroy(Request $request, Product $product, ProductVariant $variant): JsonResponse
    {
        $this->authorize('update', $product);

        if ($variant->product_id !== $product->id) {
            abort(404, 'Varian tidak ditemukan.');
        }

        $this->productService->deleteVariant($variant);

        return response()->json(['message' => 'Varian berhasil dihapus.']);
    }
}
