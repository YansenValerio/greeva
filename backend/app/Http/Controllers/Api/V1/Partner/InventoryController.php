<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Partner;

use App\Enums\InventoryReason;
use App\Http\Controllers\Controller;
use App\Http\Resources\InventoryLogResource;
use App\Models\InventoryLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    /**
     * GET /api/v1/partner/inventory-logs
     * Riwayat perubahan stok varian milik mitra yang sedang login.
     * Filter: product_id, variant_id, reason.
     */
    public function index(Request $request): JsonResponse
    {
        $partner = $request->user()->partner;

        $query = InventoryLog::with(['product:id,name', 'variant:id,name,sku', 'order:id,order_number'])
            ->forPartner($partner->id)
            ->latest('created_at')
            ->latest('id');

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->integer('product_id'));
        }

        if ($request->filled('variant_id')) {
            $query->where('product_variant_id', $request->integer('variant_id'));
        }

        if ($request->filled('reason')) {
            $reason = InventoryReason::tryFrom((string) $request->input('reason'));
            if ($reason !== null) {
                $query->where('reason', $reason->value);
            }
        }

        $logs = $query->paginate(min($request->integer('per_page', 20), 100));

        return response()->json(
            InventoryLogResource::collection($logs)->response()->getData(true)
        );
    }
}
