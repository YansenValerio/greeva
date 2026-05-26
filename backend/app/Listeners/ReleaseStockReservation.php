<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\OrderPaymentFailed;
use App\Models\ProductVariant;
use App\Services\Inventory\InventoryService;

class ReleaseStockReservation
{
    public function __construct(
        private readonly InventoryService $inventoryService,
    ) {}

    public function handle(OrderPaymentFailed $event): void
    {
        $order = $event->order->loadMissing('items');

        foreach ($order->items as $item) {
            if ($item->product_variant_id) {
                ProductVariant::where('id', $item->product_variant_id)
                    ->increment('stock', $item->quantity);
            }
        }

        $this->inventoryService->logRelease($order);
    }
}
