<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Buyer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Address\StoreAddressRequest;
use App\Http\Requests\Address\UpdateAddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    /**
     * GET /api/v1/addresses
     * Daftar alamat user yang sedang login. Default address di-list paling atas.
     */
    public function index(Request $request): JsonResponse
    {
        $addresses = Address::where('user_id', $request->user()->id)
            ->orderByDesc('is_default')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => AddressResource::collection($addresses),
        ]);
    }

    /**
     * POST /api/v1/addresses
     */
    public function store(StoreAddressRequest $request): JsonResponse
    {
        $this->authorize('create', Address::class);

        $userId = $request->user()->id;
        $data   = $request->validated();
        $data['user_id'] = $userId;

        // Pertama kali bikin alamat → otomatis default
        $hasAny = Address::where('user_id', $userId)->exists();
        if (! $hasAny) {
            $data['is_default'] = true;
        }

        $address = DB::transaction(function () use ($data, $userId) {
            $address = Address::create($data);

            if ($address->is_default) {
                Address::where('user_id', $userId)
                    ->where('id', '!=', $address->id)
                    ->update(['is_default' => false]);
            }

            return $address;
        });

        return AddressResource::make($address)
            ->response()
            ->setStatusCode(201);
    }

    /**
     * PUT /api/v1/addresses/{address}
     */
    public function update(UpdateAddressRequest $request, Address $address): JsonResponse
    {
        $this->authorize('update', $address);

        $data = $request->validated();

        DB::transaction(function () use ($address, $data) {
            $address->update($data);

            if (($data['is_default'] ?? false) === true) {
                Address::where('user_id', $address->user_id)
                    ->where('id', '!=', $address->id)
                    ->update(['is_default' => false]);
            }
        });

        return response()->json([
            'data' => AddressResource::make($address->fresh()),
        ]);
    }

    /**
     * DELETE /api/v1/addresses/{address}
     */
    public function destroy(Request $request, Address $address): JsonResponse
    {
        $this->authorize('delete', $address);

        $wasDefault = $address->is_default;
        $userId     = $address->user_id;

        $address->delete();

        // Kalau yang dihapus default, promote alamat terbaru jadi default
        if ($wasDefault) {
            $newDefault = Address::where('user_id', $userId)
                ->orderByDesc('created_at')
                ->first();
            $newDefault?->update(['is_default' => true]);
        }

        return response()->json(null, 204);
    }

    /**
     * PATCH /api/v1/addresses/{address}/default
     * Tetapkan alamat ini sebagai default.
     */
    public function setDefault(Request $request, Address $address): JsonResponse
    {
        $this->authorize('update', $address);

        DB::transaction(function () use ($address) {
            Address::where('user_id', $address->user_id)
                ->update(['is_default' => false]);

            $address->update(['is_default' => true]);
        });

        return response()->json([
            'data' => AddressResource::make($address->fresh()),
        ]);
    }
}
