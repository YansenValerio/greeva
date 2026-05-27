<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockAlert\StoreStockAlertRequest;
use App\Services\StockAlert\StockAlertService;
use Illuminate\Http\JsonResponse;

class StockAlertController extends Controller
{
    public function __construct(
        private readonly StockAlertService $stockAlertService,
    ) {}

    /**
     * POST /api/v1/stock-alerts
     * Daftar notifikasi "beritahu saya saat stok tersedia". Bisa guest atau user login.
     */
    public function store(StoreStockAlertRequest $request): JsonResponse
    {
        $this->stockAlertService->subscribe(
            $request->validated(),
            $request->user('sanctum'),
        );

        return response()->json([
            'message' => 'Siap! Kami akan kabari via WhatsApp saat produk tersedia kembali.',
        ], 201);
    }
}
