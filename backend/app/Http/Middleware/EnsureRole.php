<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware untuk membatasi akses berdasarkan role user.
 *
 * Penggunaan di routes:
 *   ->middleware('role:admin')
 *   ->middleware('role:partner,admin')   // multi-role (OR)
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()) {
            return response()->json(['message' => 'Tidak terautentikasi.'], 401);
        }

        $userRole = $request->user()->role->value;

        if (! in_array($userRole, $roles, strict: true)) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        return $next($request);
    }
}
