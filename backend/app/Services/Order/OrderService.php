<?php

declare(strict_types=1);

namespace App\Services\Order;

use App\Enums\OrderStatus;
use App\Enums\ShipmentStatus;
use App\Events\OrderCompleted;
use App\Models\Order;
use App\Models\Shipment;
use App\Services\Checkout\StockReservationService;
use App\Services\Inventory\InventoryService;
use App\Support\AuditLogger;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class OrderService
{
    public function __construct(
        private readonly StockReservationService $stockService,
        private readonly InventoryService $inventoryService,
    ) {}

    /**
     * Status transitions yang diizinkan per status awal.
     */
    private array $allowedTransitions = [
        'paid'            => ['packing', 'cancelled', 'refunded'],
        'packing'         => ['shipped', 'cancelled'],
        'shipped'         => ['delivered'],
        'delivered'       => ['completed'],
        'pending_payment' => ['cancelled'],
    ];

    /**
     * Ubah status order.
     *
     * @param  array<string, mixed>  $data  e.g. ['tracking_number' => '...', 'courier' => '...']
     */
    public function updateStatus(Order $order, OrderStatus $newStatus, array $data = []): Order
    {
        $currentStatus = $order->status->value;

        $allowed = $this->allowedTransitions[$currentStatus] ?? [];
        if (! in_array($newStatus->value, $allowed, strict: true)) {
            abort(422, "Tidak dapat mengubah status dari \"{$order->status->label()}\" ke \"{$newStatus->label()}\".");
        }

        DB::transaction(function () use ($order, $newStatus, $data) {
            $old = $order->status;

            $updates = ['status' => $newStatus];

            match ($newStatus) {
                OrderStatus::Paid      => $updates['paid_at']       = now(),
                OrderStatus::Delivered => $updates['delivered_at']  = now(),
                OrderStatus::Completed => $updates['completed_at']  = now(),
                OrderStatus::Cancelled => $updates['cancelled_at']  = now(),
                default                => null,
            };

            $order->update($updates);

            // Kembalikan stok jika dibatalkan setelah stok sudah dipotong
            $stockWasDeducted = in_array($old->value, ['paid', 'packing', 'shipped', 'delivered', 'completed'], strict: true);
            if ($newStatus === OrderStatus::Cancelled && $stockWasDeducted) {
                $items = $order->items->map(fn ($i) => [
                    'variant_id' => $i->product_variant_id,
                    'quantity'   => $i->quantity,
                ])->toArray();
                $this->stockService->release($items);
                $this->inventoryService->logRelease($order);
            }

            // Buat shipment records saat status packing
            if ($newStatus === OrderStatus::Packing) {
                $this->createShipments($order);
            }

            // Update tracking number saat shipped
            if ($newStatus === OrderStatus::Shipped && ! empty($data['tracking_number'])) {
                $order->shipments()->update([
                    'tracking_number' => $data['tracking_number'],
                    'courier'         => $data['courier'] ?? null,
                    'courier_service' => $data['courier_service'] ?? null,
                    'status'          => ShipmentStatus::Shipped,
                    'shipped_at'      => now(),
                ]);
            }

            if ($newStatus === OrderStatus::Delivered) {
                $order->shipments()->update([
                    'status'       => ShipmentStatus::Delivered,
                    'delivered_at' => now(),
                ]);
            }

            AuditLogger::log(
                'status_changed',
                $order,
                ['status' => $old->value],
                ['status' => $newStatus->value, ...$data],
            );

            if ($newStatus === OrderStatus::Completed) {
                event(new OrderCompleted($order));
            }
        });

        return $order->fresh()->load(['items', 'shipments']);
    }

    /**
     * Ubah status banyak order sekaligus. Transisi tidak valid per-order
     * dikumpulkan sebagai kegagalan, bukan menggagalkan seluruh batch.
     *
     * @param  array<int, int>  $ids
     * @return array{updated: array<int, string>, failed: array<int, array{order_number: string, reason: string}>}
     */
    public function bulkUpdateStatus(array $ids, OrderStatus $newStatus): array
    {
        $orders  = Order::with('items')->whereIn('id', $ids)->get();
        $updated = [];
        $failed  = [];

        foreach ($orders as $order) {
            try {
                $this->updateStatus($order, $newStatus);
                $updated[] = $order->order_number;
            } catch (HttpExceptionInterface $e) {
                $failed[] = [
                    'order_number' => $order->order_number,
                    'reason'       => $e->getMessage(),
                ];
            }
        }

        return ['updated' => $updated, 'failed' => $failed];
    }

    private function createShipments(Order $order): void
    {
        // Satu shipment per mitra yang ada di order items
        $partnerIds = $order->items->pluck('partner_id')->unique();

        foreach ($partnerIds as $partnerId) {
            Shipment::firstOrCreate(
                [
                    'order_id'   => $order->id,
                    'partner_id' => $partnerId,
                ],
                [
                    'shipping_cost' => 0, // v1: free shipping
                    'status'        => ShipmentStatus::Packed,
                    'packed_at'     => now(),
                ],
            );
        }
    }
}
