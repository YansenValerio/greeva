<?php

declare(strict_types=1);

namespace App\Services\Cloudinary;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    public function upload(UploadedFile $file, string $folder = 'products'): string
    {
        $result = Cloudinary::upload($file->getRealPath(), [
            'folder'         => "greeva/{$folder}",
            'transformation' => [
                'quality'      => 'auto',
                'fetch_format' => 'auto',
            ],
        ]);

        return $result->getSecurePath();
    }

    public function delete(string $publicId): void
    {
        Cloudinary::destroy($publicId);
    }
}
