<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Partner;

use App\Http\Controllers\Controller;
use App\Http\Resources\PartnerEarningResource;
use App\Models\PartnerEarning;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EarningController extends Controller
{
    /**
     * GET /api/v1/partner/earnings
     * Daftar earnings mitra yang sedang login. Filter: status.
     */
    public function index(Request $request): JsonResponse
    {
        $partner = $request->user()->partner;

        $query = PartnerEarning::with('orderItem')
            ->where('partner_id', $partner->id)
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $earnings = $query->paginate($request->integer('per_page', 20));

        return response()->json(
            PartnerEarningResource::collection($earnings)->response()->getData(true)
        );
    }

    /**
     * GET /api/v1/partner/earnings/summary
     * Total earning per status untuk dashboard mitra.
     */
    public function summary(Request $request): JsonResponse
    {
        $partner = $request->user()->partner;

        $summary = PartnerEarning::where('partner_id', $partner->id)
            ->selectRaw("status, COUNT(*) as count, SUM(amount) as total")
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        return response()->json([
            'data' => [
                'pending'   => $summary['pending']   ?? 0,
                'available' => $summary['available'] ?? 0,
                'paid'      => $summary['paid']      ?? 0,
            ],
        ]);
    }
}
