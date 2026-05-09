<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PartnerEarningResource;
use App\Models\Partner;
use App\Models\PartnerEarning;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EarningController extends Controller
{
    /**
     * GET /api/v1/admin/partners/{partner}/earnings
     * Semua earnings milik satu mitra, bisa difilter by status.
     */
    public function index(Request $request, Partner $partner): JsonResponse
    {
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
}
