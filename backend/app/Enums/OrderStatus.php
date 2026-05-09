<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Status order Greeva.
 *
 * Alur normal:
 *   pending_payment → paid → packing → shipped → delivered → completed
 *
 * Alur alternatif:
 *   pending_payment → payment_failed  (timeout)
 *   pending_payment/paid/packing → cancelled  (sebelum shipped)
 *   paid → refunded  (setelah bayar, sebelum/sesudah shipped)
 */
enum OrderStatus: string
{
    case PendingPayment = 'pending_payment';
    case Paid           = 'paid';
    case Packing        = 'packing';
    case Shipped        = 'shipped';
    case Delivered      = 'delivered';
    case Completed      = 'completed';
    case Cancelled      = 'cancelled';
    case PaymentFailed  = 'payment_failed';
    case Refunded       = 'refunded';

    public function label(): string
    {
        return match ($this) {
            OrderStatus::PendingPayment => 'Menunggu Pembayaran',
            OrderStatus::Paid           => 'Pembayaran Diterima',
            OrderStatus::Packing        => 'Sedang Dikemas',
            OrderStatus::Shipped        => 'Dalam Pengiriman',
            OrderStatus::Delivered      => 'Terkirim',
            OrderStatus::Completed      => 'Selesai',
            OrderStatus::Cancelled      => 'Dibatalkan',
            OrderStatus::PaymentFailed  => 'Pembayaran Gagal',
            OrderStatus::Refunded       => 'Dikembalikan',
        };
    }
}
