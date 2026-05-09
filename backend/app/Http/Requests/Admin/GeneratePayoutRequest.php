<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class GeneratePayoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'partner_id'    => ['required', 'integer', 'exists:partners,id'],
            'period_start'  => ['required', 'date'],
            'period_end'    => ['required', 'date', 'after_or_equal:period_start'],
            'earning_ids'   => ['nullable', 'array'],
            'earning_ids.*' => ['integer', 'exists:partner_earnings,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'partner_id.required'   => 'Mitra wajib dipilih.',
            'partner_id.exists'     => 'Mitra tidak ditemukan.',
            'period_start.required' => 'Tanggal awal periode wajib diisi.',
            'period_end.required'   => 'Tanggal akhir periode wajib diisi.',
            'period_end.after_or_equal' => 'Tanggal akhir harus sama atau setelah tanggal awal.',
        ];
    }
}
