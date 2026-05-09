<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;

final class AuditLogger
{
    public static function log(
        string $event,
        Model $model,
        array $oldValues = [],
        array $newValues = [],
    ): void {
        DB::table('audit_logs')->insert([
            'event'           => $event,
            'auditable_type'  => $model::class,
            'auditable_id'    => $model->getKey(),
            'user_id'         => auth()->id(),
            'old_values'      => $oldValues ? json_encode($oldValues) : null,
            'new_values'      => $newValues ? json_encode($newValues) : null,
            'ip_address'      => Request::ip(),
            'user_agent'      => Request::userAgent(),
            'created_at'      => now(),
        ]);
    }
}
