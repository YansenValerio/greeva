<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerifyEmailRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'id'        => ['required', 'integer'],
            'hash'      => ['required', 'string', 'size:40'],   // sha1 hex length
            'expires'   => ['required', 'integer'],
            'signature' => ['required', 'string', 'size:64'],   // sha256 hex length
        ];
    }
}
