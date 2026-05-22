<?php

use App\Http\Controllers\Api\V1\Admin;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Buyer;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\Partner;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\Public\ProductController as PublicProductController;
use App\Http\Controllers\Api\V1\UploadController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Greeva REST API v1
|--------------------------------------------------------------------------
|
| Semua routes di sini secara otomatis diprefix dengan /api oleh Laravel.
| Versi endpoint: /api/v1/...
|
| Middleware:
|   auth:sanctum  — harus login (Bearer token)
|   role:admin    — hanya Admin Greeva
|   role:partner  — hanya Mitra
|
*/

Route::prefix('v1')->group(function () {

    // ── Authentication ──────────────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
            Route::put('profile', [AuthController::class, 'updateProfile']);
            Route::post('change-password', [AuthController::class, 'changePassword']);
        });
    });

    // ── Public — Kategori ───────────────────────────────────────────────────
    Route::get('categories', [CategoryController::class, 'index']);

    // ── Public — Produk ─────────────────────────────────────────────────────
    Route::get('products', [PublicProductController::class, 'index']);
    Route::get('products/{slug}', [PublicProductController::class, 'show']);
    Route::get('products/{slug}/reviews', [\App\Http\Controllers\Api\V1\Public\ProductReviewController::class, 'index']);

    // ── Public — Midtrans webhook ───────────────────────────────────────────
    Route::post('payment/webhook', [PaymentController::class, 'handle']);

    // ── Public — Chat Assistant (AI, rate-limited) ─────────────────────────────
    Route::middleware('throttle:30,1')->post('chat', [ChatController::class, 'stream']);

    // ── Upload (auth required) ──────────────────────────────────────────────
    Route::middleware('auth:sanctum')->post('upload/image', [UploadController::class, 'image']);

    // ── Protected routes ────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // ── Admin ───────────────────────────────────────────────────────────
        Route::middleware('role:admin')->prefix('admin')->group(function () {

            // Category management
            Route::get('categories', [Admin\CategoryController::class, 'index']);
            Route::post('categories', [Admin\CategoryController::class, 'store']);
            Route::get('categories/{category}', [Admin\CategoryController::class, 'show']);
            Route::put('categories/{category}', [Admin\CategoryController::class, 'update']);
            Route::delete('categories/{category}', [Admin\CategoryController::class, 'destroy']);

            // Partner management
            Route::get('partners', [Admin\PartnerController::class, 'index']);
            Route::post('partners', [Admin\PartnerController::class, 'store']);
            Route::get('partners/{partner}', [Admin\PartnerController::class, 'show']);
            Route::put('partners/{partner}', [Admin\PartnerController::class, 'update']);

            // Product management
            Route::get('products', [Admin\ProductController::class, 'index']);
            Route::get('products/{product}', [Admin\ProductController::class, 'show']);
            Route::put('products/{product}', [Admin\ProductController::class, 'update']);
            Route::patch('products/{product}/status', [Admin\ProductController::class, 'updateStatus']);

            // Variant management (admin)
            Route::post('products/{product}/variants', [Admin\VariantController::class, 'store']);
            Route::put('products/{product}/variants/{variant}', [Admin\VariantController::class, 'update']);
            Route::delete('products/{product}/variants/{variant}', [Admin\VariantController::class, 'destroy']);

            // Order management (admin)
            Route::get('orders', [Admin\OrderController::class, 'index']);
            Route::get('orders/{order}', [Admin\OrderController::class, 'show']);
            Route::patch('orders/{order}/status', [Admin\OrderController::class, 'updateStatus']);

            // Earnings (admin view per-partner)
            Route::get('partners/{partner}/earnings', [Admin\EarningController::class, 'index']);

            // Payout batches
            Route::get('payouts', [Admin\PayoutController::class, 'index']);
            Route::post('payouts', [Admin\PayoutController::class, 'store']);
            Route::get('payouts/{payout}', [Admin\PayoutController::class, 'show']);
            Route::patch('payouts/{payout}/process', [Admin\PayoutController::class, 'markProcessing']);
            Route::patch('payouts/{payout}/mark-paid', [Admin\PayoutController::class, 'markPaid']);
            Route::patch('payouts/{payout}/cancel', [Admin\PayoutController::class, 'cancel']);
        });

        // ── Partner ─────────────────────────────────────────────────────────
        Route::middleware('role:partner')->prefix('partner')->group(function () {

            // Profil mitra
            Route::get('profile', [Partner\ProfileController::class, 'show']);
            Route::put('profile', [Partner\ProfileController::class, 'update']);

            // Product CRUD
            Route::get('products', [Partner\ProductController::class, 'index']);
            Route::post('products', [Partner\ProductController::class, 'store']);
            Route::get('products/{product}', [Partner\ProductController::class, 'show']);
            Route::put('products/{product}', [Partner\ProductController::class, 'update']);
            Route::delete('products/{product}', [Partner\ProductController::class, 'destroy']);
            Route::post('products/{product}/submit', [Partner\ProductController::class, 'submit']);

            // Variant management (partner)
            Route::post('products/{product}/variants', [Partner\VariantController::class, 'store']);
            Route::put('products/{product}/variants/{variant}', [Partner\VariantController::class, 'update']);
            Route::delete('products/{product}/variants/{variant}', [Partner\VariantController::class, 'destroy']);

            // Earnings & Payouts (partner view)
            Route::get('earnings', [Partner\EarningController::class, 'index']);
            Route::get('earnings/summary', [Partner\EarningController::class, 'summary']);
            Route::get('payouts', [Partner\PayoutController::class, 'index']);
            Route::get('payouts/{payout}', [Partner\PayoutController::class, 'show']);

            // AI Copywriter (rate-limited)
            Route::middleware('throttle:20,1')->post('ai/generate-copy', [Partner\AiController::class, 'generateCopy']);
        });

        // ── Buyer ───────────────────────────────────────────────────────────

        // Cart (semua role yang login bisa pakai keranjang)
        Route::prefix('cart')->group(function () {
            Route::get('/', [CartController::class, 'show']);
            Route::post('items', [CartController::class, 'addItem']);
            Route::put('items/{variantId}', [CartController::class, 'updateItem']);
            Route::delete('items/{variantId}', [CartController::class, 'removeItem']);
            Route::delete('/', [CartController::class, 'clear']);
            Route::post('merge', [CartController::class, 'merge']);
        });

        // Checkout
        Route::middleware('role:buyer')->post('checkout', [Buyer\CheckoutController::class, 'store']);

        // Order history (buyer lihat milik sendiri; admin via /admin/orders)
        Route::middleware('role:buyer,admin')->prefix('orders')->group(function () {
            Route::get('/', [Buyer\OrderController::class, 'index']);
            Route::get('{orderNumber}', [Buyer\OrderController::class, 'show']);
        });

        // Product reviews (buyer create; owner/admin update & delete)
        Route::middleware('role:buyer')->post(
            'orders/{orderNumber}/items/{itemId}/review',
            [Buyer\ReviewController::class, 'store'],
        );
        Route::put('reviews/{review}', [Buyer\ReviewController::class, 'update']);
        Route::delete('reviews/{review}', [Buyer\ReviewController::class, 'destroy']);
    });
});
