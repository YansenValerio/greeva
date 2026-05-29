<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Voucher\StoreVoucherRequest;
use App\Http\Requests\Voucher\UpdateVoucherRequest;
use App\Http\Resources\VoucherResource;
use App\Models\Voucher;
use App\Support\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    /**
     * GET /api/v1/admin/vouchers
     * Query: search (code/description), active (bool), per_page
     */
    public function index(Request $request): JsonResponse
    {
        $query = Voucher::query()->latest();

        if ($request->filled('search')) {
            $term = $request->input('search');
            $query->where(function ($q) use ($term) {
                $q->where('code', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%");
            });
        }

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $vouchers = $query->paginate($request->integer('per_page', 20));

        return response()->json(VoucherResource::collection($vouchers)->response()->getData(true));
    }

    /**
     * POST /api/v1/admin/vouchers
     */
    public function store(StoreVoucherRequest $request): JsonResponse
    {
        $data         = $request->validated();
        $data['code'] = strtoupper(trim($data['code']));

        $voucher = Voucher::create($data);

        AuditLogger::log('created', $voucher, [], $voucher->toArray());

        return VoucherResource::make($voucher)->response()->setStatusCode(201);
    }

    /**
     * GET /api/v1/admin/vouchers/{voucher}
     */
    public function show(Voucher $voucher): JsonResponse
    {
        return response()->json(['data' => VoucherResource::make($voucher)]);
    }

    /**
     * PUT /api/v1/admin/vouchers/{voucher}
     */
    public function update(UpdateVoucherRequest $request, Voucher $voucher): JsonResponse
    {
        $old  = $voucher->only(['code', 'type', 'value', 'is_active', 'usage_limit']);
        $data = $request->validated();

        if (isset($data['code'])) {
            $data['code'] = strtoupper(trim($data['code']));
        }

        $voucher->update($data);

        AuditLogger::log('updated', $voucher, $old, $voucher->fresh()->only(array_keys($old)));

        return response()->json([
            'data'    => VoucherResource::make($voucher->fresh()),
            'message' => 'Voucher berhasil diperbarui.',
        ]);
    }

    /**
     * DELETE /api/v1/admin/vouchers/{voucher}
     */
    public function destroy(Voucher $voucher): JsonResponse
    {
        AuditLogger::log('deleted', $voucher, $voucher->toArray(), []);
        $voucher->delete();

        return response()->json(['message' => 'Voucher berhasil dihapus.']);
    }
}
