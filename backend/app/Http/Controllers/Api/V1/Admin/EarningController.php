<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\EarningStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\PartnerEarningResource;
use App\Models\Partner;
use App\Models\PartnerEarning;
use App\Support\AuditLogger;
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

    /**
     * GET /api/v1/admin/earnings
     * Semua earnings lintas mitra.
     */
    public function allEarnings(Request $request): JsonResponse
    {
        $query = PartnerEarning::with(['orderItem', 'partner'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('partner_id')) {
            $query->where('partner_id', $request->integer('partner_id'));
        }

        $earnings = $query->paginate($request->integer('per_page', 20));

        return response()->json(
            PartnerEarningResource::collection($earnings)->response()->getData(true)
        );
    }

    /**
     * PATCH /api/v1/admin/earnings/{earning}/reverse
     * Batalkan earning (refund/dispute).
     */
    public function reverse(Request $request, PartnerEarning $earning): JsonResponse
    {
        $validated = $request->validate(['reason' => 'required|string|max:255']);

        if (! in_array($earning->status, [EarningStatus::Pending, EarningStatus::Available], strict: true)) {
            abort(422, 'Hanya earning berstatus "pending" atau "available" yang bisa dibatalkan.');
        }

        $old = $earning->status->value;

        $earning->update([
            'status'          => EarningStatus::Reversed,
            'reversed_at'     => now(),
            'reversal_reason' => $validated['reason'],
        ]);

        AuditLogger::log('earning.reversed', $earning, ['status' => $old], [
            'status'          => EarningStatus::Reversed->value,
            'reversal_reason' => $validated['reason'],
        ]);

        return response()->json([
            'data'    => PartnerEarningResource::make($earning->fresh()),
            'message' => 'Earning berhasil dibatalkan.',
        ]);
    }
}
