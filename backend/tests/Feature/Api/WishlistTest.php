<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function buyer(): User
{
    return User::factory()->create(['role' => UserRole::Buyer]);
}

describe('POST /api/v1/wishlist/{product}', function () {
    it('menambahkan produk ke wishlist', function () {
        $user    = buyer();
        $product = Product::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson("/api/v1/wishlist/{$product->id}")
            ->assertStatus(201)
            ->assertJsonPath('message', 'Produk ditambahkan ke wishlist.');

        expect(Wishlist::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->exists())->toBeTrue();
    });

    it('idempotent — menambah dua kali tidak menggandakan baris', function () {
        $user    = buyer();
        $product = Product::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson("/api/v1/wishlist/{$product->id}")->assertStatus(201);
        $this->postJson("/api/v1/wishlist/{$product->id}")->assertStatus(201);

        expect(Wishlist::where('user_id', $user->id)->count())->toBe(1);
    });

    it('menolak akses tanpa login', function () {
        $product = Product::factory()->create();

        $this->postJson("/api/v1/wishlist/{$product->id}")->assertStatus(401);
    });
});

describe('GET /api/v1/wishlist', function () {
    it('mengembalikan produk milik user beserta agregat', function () {
        $user    = buyer();
        $product = Product::factory()->create();
        Wishlist::create(['user_id' => $user->id, 'product_id' => $product->id]);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/wishlist')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $product->id)
            ->assertJsonStructure([
                'data' => [['id', 'name', 'slug', 'price', 'reviews_count', 'average_rating']],
            ]);
    });

    it('hanya menampilkan wishlist milik user yang login', function () {
        $user  = buyer();
        $other = buyer();
        $mine  = Product::factory()->create();
        $theirs = Product::factory()->create();

        Wishlist::create(['user_id' => $user->id, 'product_id' => $mine->id]);
        Wishlist::create(['user_id' => $other->id, 'product_id' => $theirs->id]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/wishlist')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $mine->id);
    });
});

describe('DELETE /api/v1/wishlist/{product}', function () {
    it('menghapus produk dari wishlist', function () {
        $user    = buyer();
        $product = Product::factory()->create();
        Wishlist::create(['user_id' => $user->id, 'product_id' => $product->id]);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/v1/wishlist/{$product->id}")->assertStatus(204);

        expect(Wishlist::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->exists())->toBeFalse();
    });
});
