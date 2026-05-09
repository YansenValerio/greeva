<?php

declare(strict_types=1);

namespace App\Http\Requests\Partner;

use Illuminate\Foundation\Http\FormRequest;

class AdminStorePartnerRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'user_id'                => ['required', 'integer', 'exists:users,id'],
            'name'                   => ['required', 'string', 'max:255'],
            'description'            => ['nullable', 'string'],
            'logo'                   => ['nullable', 'string', 'url'],
            'revenue_share_percent'  => ['nullable', 'integer', 'min:80', 'max:85'],
            'bank_name'              => ['nullable', 'string', 'max:100'],
            'bank_account_number'    => ['nullable', 'string', 'max:50'],
            'bank_account_name'      => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required'              => 'User wajib dipilih.',
            'user_id.exists'               => 'User tidak ditemukan.',
            'name.required'                => 'Nama mitra wajib diisi.',
            'revenue_share_percent.min'    => 'Persentase bagi hasil minimal 80%.',
            'revenue_share_percent.max'    => 'Persentase bagi hasil maksimal 85%.',
        ];
    }
}
