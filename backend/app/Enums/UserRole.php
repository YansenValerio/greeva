<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case Buyer   = 'buyer';
    case Partner = 'partner';
    case Admin   = 'admin';

    public function label(): string
    {
        return match ($this) {
            UserRole::Buyer   => 'Pembeli',
            UserRole::Partner => 'Mitra',
            UserRole::Admin   => 'Admin Greeva',
        };
    }
}
