<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class MarkPayoutPaidRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'payment_proof' => ['required', 'string', 'url:https'],
        ];
    }

    public function messages(): array
    {
        return [
            'payment_proof.required' => 'URL bukti pembayaran wajib diisi.',
            'payment_proof.url'      => 'URL bukti pembayaran tidak valid.',
        ];
    }
}
