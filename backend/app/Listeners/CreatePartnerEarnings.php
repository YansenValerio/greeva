<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Enums\EarningStatus;
use App\Events\OrderCompleted;
use App\Models\PartnerEarning;
use Illuminate\Support\Facades\DB;

class CreatePartnerEarnings
{
    public function handle(OrderCompleted $event): void
    {
        $order       = $event->order->loadMissing('items');
        $completedAt = $order->completed_at ?? now();
        $coolingDays = config('greeva.earnings.cooling_period_days', 7);

        DB::transaction(function () use ($order, $completedAt, $coolingDays) {
            foreach ($order->items as $item) {
                // Idempotent — skip jika earning sudah pernah dibuat untuk item ini
                PartnerEarning::firstOrCreate(
                    ['order_item_id' => $item->id],
                    [
                        'partner_id'         => $item->partner_id,
                        'order_id'           => $order->id,
                        'amount'             => $item->partner_earning_amount,
                        'status'             => EarningStatus::Pending,
                        'order_completed_at' => $completedAt,
                        'available_at'       => $completedAt->copy()->addDays($coolingDays),
                    ]
                );
            }
        });
    }
}
