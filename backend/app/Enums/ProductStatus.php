<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Status produk konsinyasi.
 *
 * Alur normal: draft → pending_review → active
 * Admin bisa: active ↔ inactive, active → archived
 */
enum ProductStatus: string
{
    case Draft         = 'draft';
    case PendingReview = 'pending_review';
    case Active        = 'active';
    case Inactive      = 'inactive';
    case Archived      = 'archived';

    public function label(): string
    {
        return match ($this) {
            ProductStatus::Draft         => 'Draf',
            ProductStatus::PendingReview => 'Menunggu Review',
            ProductStatus::Active        => 'Aktif',
            ProductStatus::Inactive      => 'Nonaktif',
            ProductStatus::Archived      => 'Diarsipkan',
        };
    }

    public function isPublic(): bool
    {
        return $this === ProductStatus::Active;
    }
}
