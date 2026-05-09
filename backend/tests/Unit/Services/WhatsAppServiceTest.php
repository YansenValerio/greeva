<?php

declare(strict_types=1);

use App\Services\Notification\WhatsAppService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

it('sends a message via Fonnte with correct headers and payload', function () {
    config(['services.whatsapp.api_key' => 'test-api-key']);

    Http::fake([
        'https://api.fonnte.com/send' => Http::response(['status' => true], 200),
    ]);

    $service = new WhatsAppService();
    $service->send('081234567890', 'Halo dari Greeva!');

    Http::assertSent(function ($request) {
        return $request->url() === 'https://api.fonnte.com/send'
            && $request->header('Authorization')[0] === 'test-api-key'
            && $request['target'] === '6281234567890'
            && $request['message'] === 'Halo dari Greeva!'
            && $request['countryCode'] === '62';
    });
});

it('skips sending and logs a warning when API key is not configured', function () {
    config(['services.whatsapp.api_key' => null]);
    Http::fake();

    Log::shouldReceive('warning')
        ->once()
        ->withArgs(fn (string $msg) => str_contains($msg, 'WHATSAPP_API_KEY'));

    $service = new WhatsAppService();
    $service->send('081234567890', 'Test');

    Http::assertNothingSent();
});

it('skips sending when API key is an empty string', function () {
    config(['services.whatsapp.api_key' => '']);
    Http::fake();

    Log::shouldReceive('warning')->once();

    $service = new WhatsAppService();
    $service->send('081234567890', 'Test');

    Http::assertNothingSent();
});

it('logs an error when Fonnte returns a non-2xx status but does not throw', function () {
    config(['services.whatsapp.api_key' => 'test-api-key']);

    Http::fake([
        'https://api.fonnte.com/send' => Http::response(['error' => 'invalid token'], 401),
    ]);

    Log::shouldReceive('error')
        ->once()
        ->withArgs(fn (string $msg, array $ctx) => str_contains($msg, 'gagal'));

    $service = new WhatsAppService();

    // Must not throw
    expect(fn () => $service->send('081234567890', 'Test'))->not->toThrow(Exception::class);
});

it('normalizes phone numbers correctly', function (string $input, string $expected) {
    config(['services.whatsapp.api_key' => 'test-api-key']);

    Http::fake(['*' => Http::response([], 200)]);

    $service = new WhatsAppService();
    $service->send($input, 'Test');

    Http::assertSent(fn ($req) => $req['target'] === $expected);
})->with([
    'local format 0xxx'    => ['081234567890',   '6281234567890'],
    'already 62xxx'        => ['6281234567890',  '6281234567890'],
    'with + prefix'        => ['+6281234567890', '6281234567890'],
    'with spaces'          => ['0812 3456 7890', '6281234567890'],
    'with dashes'          => ['0812-3456-7890', '6281234567890'],
]);
