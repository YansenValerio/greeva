<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function seedLogs(): void
{
    AuditLog::create([
        'event'          => 'created',
        'auditable_type' => 'App\\Models\\Order',
        'auditable_id'   => 1,
        'new_values'     => ['order_number' => 'GRV-1'],
        'created_at'     => now(),
    ]);
    AuditLog::create([
        'event'          => 'status_changed',
        'auditable_type' => 'App\\Models\\Order',
        'auditable_id'   => 1,
        'old_values'     => ['status' => 'paid'],
        'new_values'     => ['status' => 'packing'],
        'created_at'     => now(),
    ]);
    AuditLog::create([
        'event'          => 'updated',
        'auditable_type' => 'App\\Models\\Product',
        'auditable_id'   => 5,
        'created_at'     => now(),
    ]);
}

it('admin bisa melihat daftar audit log', function () {
    seedLogs();
    Sanctum::actingAs(User::factory()->create(['role' => UserRole::Admin]));

    $this->getJson('/api/v1/admin/audit-logs')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonStructure([
            'data' => [['id', 'event', 'auditable_type', 'auditable_label', 'auditable_id', 'actor', 'created_at']],
            'meta' => ['current_page', 'last_page', 'total'],
        ]);
});

it('memetakan label entitas dan diff old/new', function () {
    seedLogs();
    Sanctum::actingAs(User::factory()->create(['role' => UserRole::Admin]));

    $data = $this->getJson('/api/v1/admin/audit-logs?event=status_changed')
        ->assertOk()
        ->json('data');

    expect($data)->toHaveCount(1)
        ->and($data[0]['auditable_label'])->toBe('Pesanan')
        ->and($data[0]['old_values']['status'])->toBe('paid')
        ->and($data[0]['new_values']['status'])->toBe('packing');
});

it('bisa difilter berdasarkan tipe entitas', function () {
    seedLogs();
    Sanctum::actingAs(User::factory()->create(['role' => UserRole::Admin]));

    $this->getJson('/api/v1/admin/audit-logs?auditable_type=Product')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.auditable_type', 'Product');
});

it('menolak akses non-admin', function () {
    seedLogs();
    Sanctum::actingAs(User::factory()->create(['role' => UserRole::Buyer]));

    $this->getJson('/api/v1/admin/audit-logs')->assertForbidden();
});
