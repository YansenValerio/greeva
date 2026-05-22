<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * GET /api/v1/admin/categories
     * Daftar semua kategori (flat, dengan parent dan jumlah produk).
     */
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Category::class);

        $categories = Category::query()
            ->with('parent:id,name,slug')
            ->withCount('products')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * POST /api/v1/admin/categories
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $this->authorize('create', Category::class);

        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['name']);
        $data['is_active'] = $data['is_active'] ?? true;
        $data['sort_order'] = $data['sort_order'] ?? 0;

        $category = Category::create($data);

        AuditLogger::log('created', $category, [], $category->toArray());

        return CategoryResource::make($category->load('parent'))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/v1/admin/categories/{category}
     */
    public function show(Category $category): JsonResponse
    {
        $this->authorize('view', $category);

        return response()->json([
            'data' => CategoryResource::make(
                $category->load('parent', 'children')->loadCount('products'),
            ),
        ]);
    }

    /**
     * PUT /api/v1/admin/categories/{category}
     */
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $this->authorize('update', $category);

        $data = $request->validated();
        $old = $category->only(['name', 'parent_id', 'sort_order', 'is_active']);

        // Cegah kategori jadi parent dirinya sendiri
        if (isset($data['parent_id']) && (int) $data['parent_id'] === $category->id) {
            return response()->json([
                'message' => 'Kategori tidak boleh menjadi induk dirinya sendiri.',
            ], 422);
        }

        if (isset($data['name']) && $data['name'] !== $category->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], $category->id);
        }

        $category->update($data);

        AuditLogger::log('updated', $category, $old, $category->fresh()->only(array_keys($old)));

        return response()->json([
            'data' => CategoryResource::make($category->fresh()->load('parent')),
        ]);
    }

    /**
     * DELETE /api/v1/admin/categories/{category}
     * Tolak jika masih punya produk atau subkategori.
     */
    public function destroy(Category $category): JsonResponse
    {
        $this->authorize('delete', $category);

        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Kategori tidak bisa dihapus karena masih memiliki produk.',
            ], 422);
        }

        if ($category->children()->exists()) {
            return response()->json([
                'message' => 'Kategori tidak bisa dihapus karena masih memiliki subkategori.',
            ], 422);
        }

        $snapshot = $category->toArray();
        $category->delete();

        AuditLogger::log('deleted', $category, $snapshot, []);

        return response()->json(null, 204);
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 2;

        $query = fn (string $s) => Category::where('slug', $s)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists();

        while ($query($slug)) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
