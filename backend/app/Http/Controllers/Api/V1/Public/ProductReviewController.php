<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductReviewResource;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
    /**
     * GET /api/v1/products/{slug}/reviews
     * Publik — daftar review approved untuk satu produk.
     *
     * Query params: per_page, sort (newest|highest|lowest)
     */
    public function index(Request $request, string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $sort = $request->input('sort', 'newest');

        $query = ProductReview::with('user:id,name')
            ->where('product_id', $product->id)
            ->approved();

        match ($sort) {
            'highest' => $query->orderByDesc('rating')->orderByDesc('created_at'),
            'lowest'  => $query->orderBy('rating')->orderByDesc('created_at'),
            default   => $query->orderByDesc('created_at'),
        };

        $reviews = $query->paginate($request->integer('per_page', 10));

        // Compute summary
        $stats = ProductReview::where('product_id', $product->id)
            ->approved()
            ->selectRaw('count(*) as total, avg(rating) as avg_rating')
            ->first();

        $data = ProductReviewResource::collection($reviews)->response()->getData(true);
        $data['summary'] = [
            'total'          => (int) ($stats->total ?? 0),
            'average_rating' => $stats->total ? round((float) $stats->avg_rating, 2) : null,
        ];

        return response()->json($data);
    }
}
