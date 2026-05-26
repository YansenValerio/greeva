<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Partner;

use App\Http\Controllers\Controller;
use App\Services\Analytics\PartnerAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(
        private readonly PartnerAnalyticsService $analyticsService,
    ) {}

    /**
     * GET /api/v1/partner/analytics
     * Ringkasan performa penjualan mitra: KPI, produk terlaris, tren bulanan.
     */
    public function index(Request $request): JsonResponse
    {
        $partner = $request->user()->partner;

        return response()->json([
            'data' => $this->analyticsService->overview($partner),
        ]);
    }
}
