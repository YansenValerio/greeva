<?php

declare(strict_types=1);

namespace App\Http\Requests\Voucher;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVoucherRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'code'             => ['required', 'string', 'max:50', 'unique:vouchers,code'],
            'description'      => ['nullable', 'string', 'max:255'],
            'type'             => ['required', Rule::in(['percent', 'fixed'])],
            // percent: 1–100, fixed: nominal sen (>= 0)
            'value'            => ['required', 'integer', 'min:1', 'max_digits:15'],
            'max_discount'     => ['nullable', 'integer', 'min:0'],
            'min_purchase'     => ['nullable', 'integer', 'min:0'],
            'valid_from'       => ['nullable', 'date'],
            'valid_until'      => ['nullable', 'date', 'after_or_equal:valid_from'],
            'usage_limit'      => ['nullable', 'integer', 'min:1'],
            'per_user_limit'   => ['nullable', 'integer', 'min:1'],
            'first_order_only' => ['nullable', 'boolean'],
            'is_active'        => ['nullable', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->input('type') === 'percent' && (int) $this->input('value') > 100) {
                $validator->errors()->add('value', 'Untuk tipe persentase, nilai maksimal 100.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'code.required'   => 'Kode voucher wajib diisi.',
            'code.unique'     => 'Kode voucher sudah digunakan.',
            'type.required'   => 'Tipe voucher wajib dipilih.',
            'type.in'         => 'Tipe voucher tidak valid.',
            'value.required'  => 'Nilai voucher wajib diisi.',
            'value.min'       => 'Nilai voucher minimal 1.',
            'valid_until.after_or_equal' => 'Tanggal berakhir tidak boleh sebelum tanggal mulai.',
        ];
    }
}
