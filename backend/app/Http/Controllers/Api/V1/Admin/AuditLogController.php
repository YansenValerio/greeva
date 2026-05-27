<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Services\Audit\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogService,
    ) {}

    /**
     * GET /api/v1/admin/audit-logs
     * Riwayat perubahan entitas sensitif untuk audit & resolusi dispute.
     */
    public function index(Request $request): JsonResponse
    {
        $logs = $this->auditLogService->list($request->only([
            'event', 'auditable_type', 'auditable_id', 'user_id',
            'date_from', 'date_to', 'per_page', 'page',
        ]));

        return response()->json(
            AuditLogResource::collection($logs)->response()->getData(true),
        );
    }
}
