<?php

declare(strict_types=1);

namespace App\Http\Requests\Voucher;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVoucherRequest extends FormRequest
{
    public function rules(): array
    {
        $voucherId = $this->route('voucher')?->id;

        return [
            'code'             => ['sometimes', 'string', 'max:50', Rule::unique('vouchers', 'code')->ignore($voucherId)],
            'description'      => ['nullable', 'string', 'max:255'],
            'type'             => ['sometimes', Rule::in(['percent', 'fixed'])],
            'value'            => ['sometimes', 'integer', 'min:1', 'max_digits:15'],
            'max_discount'     => ['nullable', 'integer', 'min:0'],
            'min_purchase'     => ['nullable', 'integer', 'min:0'],
            'valid_from'       => ['nullable', 'date'],
            'valid_until'      => ['nullable', 'date', 'after_or_equal:valid_from'],
            'usage_limit'      => ['nullable', 'integer', 'min:1'],
            'per_user_limit'   => ['nullable', 'integer', 'min:1'],
            'first_order_only' => ['sometimes', 'boolean'],
            'is_active'        => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->input('type') === 'percent' && $this->filled('value') && (int) $this->input('value') > 100) {
                $validator->errors()->add('value', 'Untuk tipe persentase, nilai maksimal 100.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'code.unique'                => 'Kode voucher sudah digunakan.',
            'type.in'                    => 'Tipe voucher tidak valid.',
            'valid_until.after_or_equal' => 'Tanggal berakhir tidak boleh sebelum tanggal mulai.',
        ];
    }
}
