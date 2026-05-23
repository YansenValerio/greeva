<?php

declare(strict_types=1);

namespace App\Http\Requests\Address;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAddressRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'label'          => ['nullable', 'string', 'max:50'],
            'recipient_name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone'          => ['sometimes', 'required', 'string', 'max:20'],
            'address'        => ['sometimes', 'required', 'string', 'max:500'],
            'province'       => ['sometimes', 'required', 'string', 'max:100'],
            'city'           => ['sometimes', 'required', 'string', 'max:100'],
            'district'       => ['nullable', 'string', 'max:100'],
            'postal_code'    => ['sometimes', 'required', 'string', 'size:5'],
            'is_default'     => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'postal_code.size' => 'Kode pos harus 5 digit.',
        ];
    }
}
