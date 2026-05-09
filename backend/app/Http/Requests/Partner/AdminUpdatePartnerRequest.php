<?php

declare(strict_types=1);

namespace App\Http\Requests\Partner;

use Illuminate\Foundation\Http\FormRequest;

class AdminUpdatePartnerRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name'                   => ['sometimes', 'string', 'max:255'],
            'description'            => ['nullable', 'string'],
            'logo'                   => ['nullable', 'string', 'url'],
            'bank_name'              => ['nullable', 'string', 'max:100'],
            'bank_account_number'    => ['nullable', 'string', 'max:50'],
            'bank_account_name'      => ['nullable', 'string', 'max:255'],
            'is_active'              => ['sometimes', 'boolean'],
            'revenue_share_percent'  => ['sometimes', 'integer', 'min:80', 'max:85'],
        ];
    }

    public function messages(): array
    {
        return [
            'revenue_share_percent.min' => 'Persentase bagi hasil minimal 80%.',
            'revenue_share_percent.max' => 'Persentase bagi hasil maksimal 85%.',
        ];
    }
}
