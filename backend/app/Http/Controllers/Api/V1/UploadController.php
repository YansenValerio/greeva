<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Cloudinary\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function __construct(
        private readonly CloudinaryService $cloudinaryService,
    ) {}

    /**
     * POST /api/v1/upload/image
     * Upload gambar ke Cloudinary. Auth required.
     *
     * Body (multipart): file (image, max 5MB), folder? (products|partners|categories)
     */
    public function image(Request $request): JsonResponse
    {
        $request->validate([
            'file'   => ['required', 'file', 'image', 'max:5120', 'mimes:jpeg,jpg,png,webp'],
            'folder' => ['nullable', 'string', 'in:products,partners,categories'],
        ], [
            'file.required' => 'File gambar wajib diunggah.',
            'file.image'    => 'File harus berupa gambar.',
            'file.max'      => 'Ukuran gambar maksimal 5MB.',
            'file.mimes'    => 'Format gambar harus JPEG, PNG, atau WebP.',
        ]);

        $url = $this->cloudinaryService->upload(
            $request->file('file'),
            $request->input('folder', 'products'),
        );

        return response()->json([
            'data' => ['url' => $url],
        ]);
    }
}
