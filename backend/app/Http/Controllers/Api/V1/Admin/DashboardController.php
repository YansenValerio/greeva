<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\Analytics\AdminDashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        private readonly AdminDashboardService $dashboardService,
    ) {}

    /**
     * GET /api/v1/admin/dashboard
     * Ringkasan operasional Greeva: revenue, order, payout, top mitra/kategori, stok menipis.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->dashboardService->overview(),
        ]);
    }
}
