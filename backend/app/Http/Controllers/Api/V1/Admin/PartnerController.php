<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Partner\AdminStorePartnerRequest;
use App\Http\Requests\Partner\AdminUpdatePartnerRequest;
use App\Http\Resources\PartnerResource;
use App\Models\Partner;
use App\Support\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PartnerController extends Controller
{
    /**
     * GET /api/v1/admin/partners
     * Daftar semua mitra dengan filter.
     * Query params: is_active, search, per_page
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Partner::class);

        $query = Partner::with('user:id,name,email');

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('search')) {
            $term = strtolower($request->input('search'));
            $query->whereRaw('lower(name) like ?', ["%{$term}%"]);
        }

        $partners = $query->latest()->paginate($request->integer('per_page', 20));

        return response()->json(PartnerResource::collection($partners)->response()->getData(true));
    }

    /**
     * POST /api/v1/admin/partners
     * Buat mitra baru dan daftarkan ke user yang dipilih.
     */
    public function store(AdminStorePartnerRequest $request): JsonResponse
    {
        $this->authorize('create', Partner::class);

        $data = $request->validated();

        $partner = Partner::create([
            'user_id'                => $data['user_id'],
            'name'                   => $data['name'],
            'slug'                   => Str::slug($data['name']),
            'description'            => $data['description'] ?? null,
            'logo'                   => $data['logo'] ?? null,
            'revenue_share_percent'  => $data['revenue_share_percent'] ?? config('greeva.revenue_share.default_percent'),
            'bank_name'              => $data['bank_name'] ?? null,
            'bank_account_number'    => $data['bank_account_number'] ?? null,
            'bank_account_name'      => $data['bank_account_name'] ?? null,
            'is_active'              => true,
            'joined_at'              => now(),
        ]);

        // Promosikan user ke role partner
        $partner->user()->update(['role' => UserRole::Partner]);

        AuditLogger::log('created', $partner, [], $partner->toArray());

        return PartnerResource::make($partner->load('user'))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/v1/admin/partners/{partner}
     * Detail mitra.
     */
    public function show(Partner $partner): JsonResponse
    {
        $this->authorize('view', $partner);

        return response()->json([
            'data' => PartnerResource::make($partner->load('user:id,name,email')),
        ]);
    }

    /**
     * PUT /api/v1/admin/partners/{partner}
     * Update mitra — termasuk revenue_share_percent dan is_active.
     */
    public function update(AdminUpdatePartnerRequest $request, Partner $partner): JsonResponse
    {
        $this->authorize('update', $partner);

        $old  = $partner->only(['name', 'is_active', 'revenue_share_percent']);
        $data = $request->validated();

        if (isset($data['name']) && $data['name'] !== $partner->name) {
            $data['slug'] = Str::slug($data['name']);
        }

        $partner->update($data);

        AuditLogger::log('updated', $partner, $old, $partner->fresh()->only(array_keys($old)));

        return response()->json(['data' => PartnerResource::make($partner->fresh())]);
    }
}
