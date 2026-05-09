<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Partner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Partner\UpdatePartnerRequest;
use App\Http\Resources\PartnerResource;
use App\Support\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * GET /api/v1/partner/profile
     * Profil mitra yang sedang login.
     */
    public function show(Request $request): JsonResponse
    {
        $partner = $request->user()->partner;

        $this->authorize('view', $partner);

        return response()->json(['data' => PartnerResource::make($partner)]);
    }

    /**
     * PUT /api/v1/partner/profile
     * Update profil mitra sendiri (deskripsi, logo, info bank).
     */
    public function update(UpdatePartnerRequest $request): JsonResponse
    {
        $partner = $request->user()->partner;

        $this->authorize('update', $partner);

        $old = $partner->only(['description', 'logo', 'bank_name', 'bank_account_number', 'bank_account_name']);

        $partner->update($request->validated());

        AuditLogger::log('updated', $partner, $old, $partner->fresh()->only(array_keys($old)));

        return response()->json(['data' => PartnerResource::make($partner->fresh())]);
    }
}
