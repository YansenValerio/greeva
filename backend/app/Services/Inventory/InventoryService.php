<?php

declare(strict_types=1);

namespace App\Services\Inventory;

use App\Enums\InventoryReason;
use App\Models\InventoryLog;
use App\Models\Order;
use App\Models\ProductVariant;

/**
 * Mencatat setiap perubahan stok varian ke inventory_logs untuk
 * riwayat stok mitra (audit & forecasting).
 *
 * Service ini HANYA mencatat — mutasi stok tetap dilakukan di
 * StockReservationService / ProductService. Pencatatan dilakukan setelah
 * mutasi agar stok before/after akurat dan terikat konteks bisnis (order, user).
 */
class InventoryService
{
    /**
     * Catat penjualan order. Stok sudah dipotong saat order dibuat,
     * jadi nilai stok sebelum dipotong diteruskan via $stockBefore.
     *
     * @param  array<int, int>  $stockBefore  Map variant_id => stok sebelum dipotong
     */
    public function logSale(Order $order, array $stockBefore): void
    {
        $rows = [];

        foreach ($order->items as $item) {
            $variantId = $item->product_variant_id;
            if ($variantId === null || ! isset($stockBefore[$variantId])) {
                continue;
            }

            $before = $stockBefore[$variantId];
            $after  = $before - $item->quantity;

            $rows[] = $this->buildRow(
                productVariantId: $variantId,
                productId: $item->product_id,
                partnerId: $item->partner_id,
                change: -$item->quantity,
                before: $before,
                after: $after,
                reason: InventoryReason::Sale,
                orderId: $order->id,
            );
        }

        $this->insert($rows);
    }

    /**
     * Catat pengembalian stok (order dibatalkan / pembayaran gagal).
     * Dipanggil SETELAH stok dikembalikan; stok terkini = stok sesudah.
     */
    public function logRelease(Order $order): void
    {
        $order->loadMissing('items');

        $variantIds   = $order->items->pluck('product_variant_id')->filter()->all();
        $currentStock = ProductVariant::whereIn('id', $variantIds)->pluck('stock', 'id');

        $rows = [];

        foreach ($order->items as $item) {
            $variantId = $item->product_variant_id;
            if ($variantId === null || ! isset($currentStock[$variantId])) {
                continue;
            }

            $after  = (int) $currentStock[$variantId];
            $before = $after - $item->quantity;

            $rows[] = $this->buildRow(
                productVariantId: $variantId,
                productId: $item->product_id,
                partnerId: $item->partner_id,
                change: $item->quantity,
                before: $before,
                after: $after,
                reason: InventoryReason::Release,
                orderId: $order->id,
            );
        }

        $this->insert($rows);
    }

    /**
     * Catat penyesuaian manual stok oleh mitra/admin.
     */
    public function logManualAdjustment(ProductVariant $variant, int $before, int $after, ?string $note = null): void
    {
        if ($before === $after) {
            return;
        }

        $variant->loadMissing('product');

        $this->insert([
            $this->buildRow(
                productVariantId: $variant->id,
                productId: $variant->product_id,
                partnerId: $variant->product->partner_id,
                change: $after - $before,
                before: $before,
                after: $after,
                reason: InventoryReason::Adjustment,
                note: $note,
            ),
        ]);
    }

    /**
     * Catat stok awal saat varian baru dibuat.
     */
    public function logInitialStock(ProductVariant $variant): void
    {
        if ($variant->stock <= 0) {
            return;
        }

        $variant->loadMissing('product');

        $this->insert([
            $this->buildRow(
                productVariantId: $variant->id,
                productId: $variant->product_id,
                partnerId: $variant->product->partner_id,
                change: $variant->stock,
                before: 0,
                after: $variant->stock,
                reason: InventoryReason::Initial,
            ),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildRow(
        int $productVariantId,
        ?int $productId,
        int $partnerId,
        int $change,
        int $before,
        int $after,
        InventoryReason $reason,
        ?int $orderId = null,
        ?string $note = null,
    ): array {
        return [
            'product_variant_id' => $productVariantId,
            'product_id'         => $productId,
            'partner_id'         => $partnerId,
            'order_id'           => $orderId,
            'user_id'            => auth()->id(),
            'change'             => $change,
            'stock_before'       => $before,
            'stock_after'        => $after,
            'reason'             => $reason->value,
            'note'               => $note,
            'created_at'         => now(),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $rows
     */
    private function insert(array $rows): void
    {
        if ($rows !== []) {
            InventoryLog::insert($rows);
        }
    }
}
