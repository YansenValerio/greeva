<?php

declare(strict_types=1);

namespace App\Http\Requests\Address;

use Illuminate\Foundation\Http\FormRequest;

class StoreAddressRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'label'          => ['nullable', 'string', 'max:50'],
            'recipient_name' => ['required', 'string', 'max:255'],
            'phone'          => ['required', 'string', 'max:20'],
            'address'        => ['required', 'string', 'max:500'],
            'province'       => ['required', 'string', 'max:100'],
            'city'           => ['required', 'string', 'max:100'],
            'district'       => ['nullable', 'string', 'max:100'],
            'postal_code'    => ['required', 'string', 'size:5'],
            'is_default'     => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'recipient_name.required' => 'Nama penerima wajib diisi.',
            'phone.required'          => 'Nomor telepon wajib diisi.',
            'address.required'        => 'Alamat lengkap wajib diisi.',
            'province.required'       => 'Provinsi wajib diisi.',
            'city.required'           => 'Kota/kabupaten wajib diisi.',
            'postal_code.required'    => 'Kode pos wajib diisi.',
            'postal_code.size'        => 'Kode pos harus 5 digit.',
        ];
    }
}
