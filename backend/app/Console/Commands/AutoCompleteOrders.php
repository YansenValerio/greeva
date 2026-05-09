<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\OrderStatus;
use App\Events\OrderCompleted;
use App\Models\Order;
use App\Support\AuditLogger;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AutoCompleteOrders extends Command
{
    protected $signature   = 'greeva:auto-complete-orders';
    protected $description = 'Tandai order yang sudah delivered 7+ hari sebagai completed';

    public function handle(): int
    {
        $days = config('greeva.order.auto_complete_days_after_delivery', 7);

        $orders = Order::where('status', OrderStatus::Delivered)
            ->where('delivered_at', '<=', now()->subDays($days))
            ->get();

        foreach ($orders as $order) {
            DB::transaction(function () use ($order) {
                $order->update([
                    'status'       => OrderStatus::Completed,
                    'completed_at' => now(),
                ]);

                AuditLogger::log(
                    'status_changed',
                    $order,
                    ['status' => 'delivered'],
                    ['status' => 'completed', 'reason' => 'auto_complete'],
                );

                event(new OrderCompleted($order));
            });
        }

        $count = $orders->count();

        if ($count > 0) {
            $this->info("Auto-completed {$count} order(s).");
        }

        return Command::SUCCESS;
    }
}
