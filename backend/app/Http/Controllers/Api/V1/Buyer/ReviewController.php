<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Buyer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Requests\Review\UpdateReviewRequest;
use App\Http\Resources\ProductReviewResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductReview;
use App\Support\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * POST /api/v1/orders/{orderNumber}/items/{itemId}/review
     * Buyer me-review satu item dari order yang sudah completed.
     */
    public function store(StoreReviewRequest $request, string $orderNumber, int $itemId): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $item  = OrderItem::where('order_id', $order->id)
            ->where('id', $itemId)
            ->firstOrFail();

        $this->authorize('createForItem', [ProductReview::class, $item]);

        $review = ProductReview::create([
            'product_id'    => $item->product_id,
            'order_item_id' => $item->id,
            'user_id'       => $request->user()->id,
            'rating'        => $request->integer('rating'),
            'body'          => $request->input('body'),
            'is_approved'   => true,
        ]);

        AuditLogger::log('created', $review, [], $review->toArray());

        return ProductReviewResource::make($review->load('user', 'product'))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * PUT /api/v1/reviews/{review}
     */
    public function update(UpdateReviewRequest $request, ProductReview $review): JsonResponse
    {
        $this->authorize('update', $review);

        $old = $review->only(['rating', 'body']);
        $review->update($request->validated());

        AuditLogger::log('updated', $review, $old, $review->fresh()->only(array_keys($old)));

        return response()->json([
            'data' => ProductReviewResource::make($review->fresh()->load('user')),
        ]);
    }

    /**
     * DELETE /api/v1/reviews/{review}
     */
    public function destroy(Request $request, ProductReview $review): JsonResponse
    {
        $this->authorize('delete', $review);

        $snapshot = $review->toArray();
        $review->delete();

        AuditLogger::log('deleted', $review, $snapshot, []);

        return response()->json(null, 204);
    }
}
