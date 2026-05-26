<?php

declare(strict_types=1);

namespace App\Services\Cloudinary;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    private Cloudinary $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key'    => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
            'url' => [
                'secure' => true,
            ],
        ]);
    }

    public function upload(UploadedFile $file, string $folder = 'products'): string
    {
        $result = $this->cloudinary->uploadApi()->upload($file->getRealPath(), [
            'folder'         => "greeva/{$folder}",
            'quality'        => 'auto',
            'fetch_format'   => 'auto',
        ]);

        return $result['secure_url'];
    }

    public function delete(string $publicId): void
    {
        $this->cloudinary->uploadApi()->destroy($publicId);
    }
}
