<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;

/**
 * Dilempar saat login gagal akibat email/password salah.
 * Dipetakan ke HTTP 401 via bootstrap/app.php exception handler.
 */
final class InvalidCredentialsException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('Email atau kata sandi salah.');
    }
}
