<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\OrderStatus;
use App\Events\OrderPaymentFailed;
use App\Models\Order;
use App\Support\AuditLogger;
use Illuminate\Console\Command;

class ExpireUnpaidOrders extends Command
{
    protected $signature   = 'greeva:expire-payments';
    protected $description = 'Tandai order yang sudah expired dan belum dibayar sebagai payment_failed';

    public function handle(): int
    {
        $expired = Order::expiredPayment()->get();

        foreach ($expired as $order) {
            $order->update(['status' => OrderStatus::PaymentFailed]);

            AuditLogger::log(
                'status_changed',
                $order,
                ['status' => 'pending_payment'],
                ['status' => 'payment_failed', 'reason' => 'payment_expired'],
            );

            event(new OrderPaymentFailed($order));
        }

        $count = $expired->count();

        if ($count > 0) {
            $this->info("Expired {$count} order(s).");
        }

        return Command::SUCCESS;
    }
}
