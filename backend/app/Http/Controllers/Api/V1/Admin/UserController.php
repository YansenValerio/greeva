<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * GET /api/v1/admin/users
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::latest();

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('search')) {
            $term = $request->input('search');
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%");
            });
        }

        if ($request->boolean('suspended')) {
            $query->where('is_suspended', true);
        }

        $users = $query->paginate($request->integer('per_page', 20));

        return response()->json(UserResource::collection($users)->response()->getData(true));
    }

    /**
     * GET /api/v1/admin/users/{user}
     */
    public function show(User $user): JsonResponse
    {
        return response()->json(['data' => UserResource::make($user)]);
    }

    /**
     * PATCH /api/v1/admin/users/{user}/suspend
     */
    public function toggleSuspend(User $user): JsonResponse
    {
        if ($user->isAdmin()) {
            abort(422, 'Tidak dapat suspend akun admin.');
        }

        $user->update(['is_suspended' => ! $user->is_suspended]);

        $status = $user->is_suspended ? 'disuspend' : 'diaktifkan kembali';

        return response()->json([
            'data'    => UserResource::make($user),
            'message' => "Akun pengguna berhasil {$status}.",
        ]);
    }
}
