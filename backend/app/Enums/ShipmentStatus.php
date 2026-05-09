<?php

declare(strict_types=1);

namespace App\Enums;

enum ShipmentStatus: string
{
    case Pending   = 'pending';
    case Packed    = 'packed';
    case Shipped   = 'shipped';
    case Delivered = 'delivered';

    public function label(): string
    {
        return match ($this) {
            ShipmentStatus::Pending   => 'Menunggu Pengepakan',
            ShipmentStatus::Packed    => 'Sudah Dikemas',
            ShipmentStatus::Shipped   => 'Dalam Pengiriman',
            ShipmentStatus::Delivered => 'Terkirim',
        };
    }
}
