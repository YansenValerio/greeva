<?php

declare(strict_types=1);

namespace App\Http\Requests\Return;

use Illuminate\Foundation\Http\FormRequest;

class StoreReturnRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'reason'      => ['required', 'string', 'in:damaged,not_as_described,wrong_item,changed_mind,other'],
            'description' => ['required', 'string', 'min:10', 'max:1000'],
            'photos'      => ['nullable', 'array', 'max:5'],
            'photos.*'    => ['string', 'url'],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required'      => 'Alasan retur wajib dipilih.',
            'reason.in'            => 'Alasan retur tidak valid.',
            'description.required' => 'Jelaskan kondisi/masalah produk.',
            'description.min'      => 'Penjelasan minimal 10 karakter.',
            'description.max'      => 'Penjelasan maksimal 1000 karakter.',
            'photos.max'           => 'Maksimal 5 foto bukti.',
        ];
    }
}
