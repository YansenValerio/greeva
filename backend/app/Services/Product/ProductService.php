<?php

declare(strict_types=1);

namespace App\Services\Product;

use App\Enums\ProductStatus;
use App\Models\Partner;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Inventory\InventoryService;
use App\Support\AuditLogger;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductService
{
    public function __construct(
        private readonly InventoryService $inventoryService,
    ) {}

    // ── Public browse ────────────────────────────────────────────────────────

    public function listPublic(array $filters): LengthAwarePaginator
    {
        $perPage = min((int) ($filters['per_page'] ?? 20), 100);
        $search  = trim($filters['search'] ?? '');

        if ($search !== '') {
            return $this->searchViaMeilisearch($search, $filters, $perPage);
        }

        return $this->buildPublicQuery($filters)->paginate($perPage);
    }

    private function searchViaMeilisearch(string $term, array $filters, int $perPage): LengthAwarePaginator
    {
        return Product::search($term, function ($meilisearch, string $query, array $options) use ($filters) {
            $meiliFilters = ['status = "active"'];

            if (! empty($filters['category_id'])) {
                $meiliFilters[] = 'category_id = ' . (int) $filters['category_id'];
            }
            if (! empty($filters['partner_id'])) {
                $meiliFilters[] = 'partner_id = ' . (int) $filters['partner_id'];
            }
            if (! empty($filters['min_price'])) {
                $meiliFilters[] = 'price >= ' . (int) $filters['min_price'];
            }
            if (! empty($filters['max_price'])) {
                $meiliFilters[] = 'price <= ' . (int) $filters['max_price'];
            }

            $options['filter'] = implode(' AND ', $meiliFilters);
            $options['sort']   = $this->buildMeiliSort($filters);

            return $meilisearch->search($query, $options);
        })
            ->query(fn ($q) => $q
                ->with(['partner:id,name,slug', 'category:id,name,slug', 'activeVariants'])
                ->withCount(['approvedReviews as reviews_count'])
                ->withAvg(['approvedReviews as average_rating'], 'rating'))
            ->paginate($perPage);
    }

    private function buildPublicQuery(array $filters)
    {
        $query = Product::with(['partner:id,name,slug', 'category:id,name,slug', 'activeVariants'])
            ->withCount(['approvedReviews as reviews_count'])
            ->withAvg(['approvedReviews as average_rating'], 'rating')
            ->active();

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
        if (! empty($filters['partner_id'])) {
            $query->where('partner_id', $filters['partner_id']);
        }
        if (! empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }
        if (! empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        $sortBy    = $filters['sort_by'] ?? 'published_at';
        $sortOrder = ($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['published_at', 'price', 'name'];
        if (in_array($sortBy, $allowedSorts, strict: true)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        return $query;
    }

    private function buildMeiliSort(array $filters): array
    {
        $sortBy    = $filters['sort_by'] ?? 'published_at';
        $sortOrder = ($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $allowed   = ['published_at', 'price', 'name'];

        return in_array($sortBy, $allowed, strict: true)
            ? ["{$sortBy}:{$sortOrder}"]
            : ['published_at:desc'];
    }

    public function findPublicBySlug(string $slug): Product
    {
        return Product::with([
            'partner:id,name,slug,logo',
            'category:id,name,slug',
            'variants' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order'),
        ])
            ->withCount(['approvedReviews as reviews_count'])
            ->withAvg(['approvedReviews as average_rating'], 'rating')
            ->active()
            ->where('slug', $slug)
            ->firstOrFail();
    }

    // ── Partner ──────────────────────────────────────────────────────────────

    public function listForPartner(Partner $partner, array $filters): LengthAwarePaginator
    {
        $query = Product::with(['category:id,name,slug', 'variants'])
            ->forPartner($partner->id);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest()->paginate($filters['per_page'] ?? 20);
    }

    public function findForPartner(int $id, Partner $partner): Product
    {
        return Product::with(['category', 'variants'])
            ->forPartner($partner->id)
            ->findOrFail($id);
    }

    public function create(array $data, Partner $partner): Product
    {
        $product = Product::create([
            ...$data,
            'partner_id'             => $partner->id,
            'slug'                   => $this->generateSlug($data['name']),
            'status'                 => ProductStatus::Draft,
            'revenue_share_percent'  => $partner->revenue_share_percent,
        ]);

        AuditLogger::log('created', $product, [], $product->toArray());

        return $product->load(['category', 'variants']);
    }

    public function update(Product $product, array $data): Product
    {
        $old = $product->only(['name', 'price', 'status', 'category_id']);

        if (isset($data['name']) && $data['name'] !== $product->name) {
            $data['slug'] = $this->generateSlug($data['name'], $product->id);
        }

        $product->update($data);

        AuditLogger::log('updated', $product, $old, $product->fresh()->only(array_keys($old)));

        return $product->load(['category', 'variants']);
    }

    public function submitForReview(Product $product): Product
    {
        if ($product->status !== ProductStatus::Draft) {
            abort(422, 'Hanya produk berstatus draf yang dapat diajukan review.');
        }

        $product->update(['status' => ProductStatus::PendingReview]);

        AuditLogger::log('status_changed', $product, ['status' => 'draft'], ['status' => 'pending_review']);

        return $product;
    }

    public function delete(Product $product): void
    {
        AuditLogger::log('deleted', $product, $product->toArray(), []);
        $product->delete();
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    public function listAll(array $filters): LengthAwarePaginator
    {
        $query = Product::with(['partner:id,name,slug', 'category:id,name,slug'])
            ->withCount('variants');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['partner_id'])) {
            $query->where('partner_id', $filters['partner_id']);
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['search'])) {
            $term = strtolower($filters['search']);
            $query->whereRaw('lower(name) like ?', ["%{$term}%"]);
        }

        return $query->latest()->paginate($filters['per_page'] ?? 20);
    }

    public function adminUpdate(Product $product, array $data): Product
    {
        $old = $product->only(['name', 'price', 'status', 'category_id', 'revenue_share_percent']);

        if (isset($data['name']) && $data['name'] !== $product->name) {
            $data['slug'] = $this->generateSlug($data['name'], $product->id);
        }

        $product->update($data);

        AuditLogger::log('updated', $product, $old, $product->fresh()->only(array_keys($old)));

        return $product->load(['partner', 'category', 'variants']);
    }

    public function updateStatus(Product $product, ProductStatus $newStatus, ?string $note = null): Product
    {
        $oldStatus = $product->status;

        $publishedAt = $product->published_at;
        if ($newStatus === ProductStatus::Active && $publishedAt === null) {
            $publishedAt = now();
        }

        $product->update([
            'status'       => $newStatus,
            'published_at' => $publishedAt,
        ]);

        AuditLogger::log(
            'status_changed',
            $product,
            ['status' => $oldStatus->value, 'note' => null],
            ['status' => $newStatus->value, 'note' => $note],
        );

        return $product;
    }

    /**
     * Ubah status banyak produk sekaligus (kurasi massal).
     *
     * @param  array<int, int>  $ids
     * @return int  Jumlah produk yang berhasil diubah
     */
    public function bulkUpdateStatus(array $ids, ProductStatus $status, ?string $note = null): int
    {
        return DB::transaction(function () use ($ids, $status, $note) {
            $products = Product::whereIn('id', $ids)->get();

            foreach ($products as $product) {
                $this->updateStatus($product, $status, $note);
            }

            return $products->count();
        });
    }

    // ── Variants ─────────────────────────────────────────────────────────────

    public function addVariant(Product $product, array $data): ProductVariant
    {
        $variant = $product->variants()->create($data);

        AuditLogger::log('created', $variant, [], $variant->toArray());

        $variant->setRelation('product', $product);
        $this->inventoryService->logInitialStock($variant);

        return $variant;
    }

    public function updateVariant(ProductVariant $variant, array $data): ProductVariant
    {
        $old        = $variant->only(['sku', 'name', 'price', 'stock', 'is_active']);
        $stockOld   = $variant->stock;

        $variant->update($data);

        AuditLogger::log('updated', $variant, $old, $variant->fresh()->only(array_keys($old)));

        $this->inventoryService->logManualAdjustment($variant, $stockOld, $variant->stock);

        return $variant->fresh();
    }

    public function deleteVariant(ProductVariant $variant): void
    {
        AuditLogger::log('deleted', $variant, $variant->toArray(), []);
        $variant->delete();
    }

    // ── Private ──────────────────────────────────────────────────────────────

    private function generateSlug(string $name, ?int $excludeId = null): string
    {
        $base    = Str::slug($name);
        $slug    = $base;
        $counter = 1;

        while (
            Product::where('slug', $slug)
                ->when($excludeId !== null, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
