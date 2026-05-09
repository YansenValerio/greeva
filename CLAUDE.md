# CLAUDE.md

> File ini menjadi sumber konteks utama untuk Claude Code saat development Greeva.
> Letakkan di **root repository** (`greeva/CLAUDE.md`).
> Update file ini setiap kali ada keputusan arsitektural baru.

---

## 1. Tentang Project

**Greeva** adalah ekosistem kurasi brand hijau lokal Indonesia — bukan marketplace biasa. Greeva berperan ganda sebagai **agency + platform konsinyasi**: produk dimiliki mitra brand, namun dijual atas nama Greeva. Greeva mengelola seluruh marketing, konten, fotografi, copywriting, SEO, dan iklan untuk semua mitra.

**Tagline:** _"Sustainable brands deserve better marketing."_

### Model Bisnis
- Produk sepenuhnya dimiliki mitra brand.
- Greeva menjual atas namanya sendiri (bukan nama mitra).
- Mitra menerima bagi hasil **80–85%** per transaksi sukses.
- Greeva menanggung biaya akuisisi marketing.

### Mitra Aktif (per Mei 2026)
1. **Notic** — aksesoris manik dari plastik HDPE daur ulang (gelang, coaster, dll).
2. **Reperca** — produk serbaguna dari kain perca sisa konveksi (tote bag, pouch, dll).

### User Roles (3)
- **Buyer** — browse, beli, review.
- **Partner / Seller** — dashboard mitra, lihat penjualan & bagi hasil, kelola produk konsinyasi.
- **Admin Greeva** — kurasi mitra, kelola produk + transaksi, atur bagi hasil, kelola konten marketing.

---

## 2. Tech Stack (FINAL — jangan diganti tanpa diskusi)

### Frontend
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **Shadcn/ui**
- **Zustand** untuk client UI state (cart drawer, modal, filter)
- **TanStack Query** untuk server state (semua data dari API)
- **react-hook-form** + **zod** untuk forms
- **Bahasa UI:** Bahasa Indonesia (default)

### Backend
- **Laravel 12** + **PHP 8.3+**
- **REST API** (versioned `/api/v1`)
- **Laravel Sanctum** (Bearer token auth)
- **Eloquent ORM**

### Infrastructure
- **PostgreSQL 15+** (primary database)
- **Redis 7+** (cache, queue, session, stock lock)
- **Cloudinary** (image storage & transformation)
- **Meilisearch** (product search, typo-tolerant)
- **Midtrans** (payment gateway Indonesia)
- **Fonnte / Wablas** (WhatsApp notification — TBD)

### Repository
- **Monorepo** dengan struktur `frontend/`, `backend/`, `docs/`.

---

## 3. Brand Identity & Design Language

### 3.1 Filosofi Visual

Greeva mengambil inspirasi dari **Starbucks** dalam tone visual: **kalem, percaya diri, hangat, dan craft-oriented**. Diterjemahkan menjadi:

- **Hierarki tipografi yang jelas** dengan kontras tinggi.
- **White space generous** — biarkan konten "bernapas".
- **Palette green dominan** dengan layering (deep emerald → forest → mint light).
- **Aksen warm** (Sand Warm `#F5F0E8`) untuk section alternatif yang terasa hangat — analog dengan "warm cream canvas" Starbucks.
- **Pill-shaped CTA** (border-radius full) untuk button utama — sentuhan craft-pride khas Starbucks.
- **Foto produk natural**, bukan over-processed.
- **Voice:** dua mode — _functional_ (helpful, untuk checkout & form) dan _expressive_ (untuk hero & marketing copy).

> **Catatan:** Greeva **bukan** clone Starbucks. Yang diambil hanya prinsip design (calm confidence, hierarchy, warm tone). Visual harus tetap punya identitas Greeva sendiri lewat green palette dan aksen sustainability.

### 3.2 Color Palette (FINAL)

| Token | Hex | Penggunaan |
|---|---|---|
| `--greeva-emerald` | `#006242` | Hero section, navbar, impact strip |
| `--greeva-starbucks-green` | `#00754A` | Links, hover states |
| `--greeva-forest` | `#16A34A` | CTA buttons (primary), icon aktif |
| `--greeva-forest-dark` | `#32462F` | Button primary dark, teks di bg terang |
| `--greeva-leaf` | `#4ADE80` | Badge, highlight, tag aktif |
| `--greeva-mint-light` | `#D1FAE5` | Card surface, section bg |
| `--greeva-sand-warm` | `#F5F0E8` | Section alternatif hangat (analog cream Starbucks) |
| `--greeva-black` | `#1C1C1C` | Headline text |
| `--greeva-text-body` | `#212121` | Body text |
| `--greeva-ocean-blue` | `#1D4ED8` | Identitas teknologi, secondary accent |
| `--greeva-white` | `#FFFFFF` | Background utama |

**Aturan kontras (WCAG AA):**
- Text di bg `--greeva-emerald`: gunakan `--greeva-white`.
- Text di bg `--greeva-mint-light` atau `--greeva-sand-warm`: gunakan `--greeva-forest-dark` atau `--greeva-black`.
- Link di bg putih: gunakan `--greeva-starbucks-green` (bukan `--greeva-leaf`).
- Jangan pernah pakai `--greeva-leaf` untuk body text — terlalu terang, gagal kontras.

### 3.3 Typography

**Font stack rekomendasi (free, dekat dengan SoDo Sans):**
```css
font-family: 'Inter', 'DM Sans', -apple-system, system-ui, sans-serif;
```

**Hirarki:**
| Element | Size | Weight | Line-height | Tracking |
|---|---|---|---|---|
| Display (hero) | 56–72px | 700 | 1.05 | -0.02em |
| H1 | 40–48px | 700 | 1.1 | -0.015em |
| H2 | 32px | 600 | 1.2 | -0.01em |
| H3 | 24px | 600 | 1.3 | normal |
| Body Large | 18px | 400 | 1.6 | normal |
| Body | 16px | 400 | 1.6 | normal |
| Small | 14px | 400 | 1.5 | normal |
| Caption | 12px | 500 | 1.4 | 0.02em |

**All-caps untuk label/badge dengan tracking `0.08em`** — pattern khas Starbucks.

### 3.4 Spacing & Layout

- **Container max-width:** 1280px desktop, padding 16px mobile / 24px tablet / 32px desktop.
- **Grid:** 12 kolom desktop, 4 kolom mobile, gap 24px.
- **Section padding:** 80px desktop / 48px mobile (vertical).
- **White space generous** — jangan padatkan hero & landing.

### 3.5 Component Style Guide

**Buttons (primary CTA):**
```
- Border-radius: full (pill-shaped)
- Padding: 14px 32px
- Background: --greeva-forest
- Text: white, 16px, weight 600
- Hover: --greeva-starbucks-green + slight scale 1.02
- Disabled: opacity 0.5, no pointer
- Focus ring: 3px outline --greeva-leaf with 2px offset
```

**Buttons (secondary):**
```
- Border: 1.5px solid --greeva-forest-dark
- Background: transparent
- Text: --greeva-forest-dark
- Hover: bg --greeva-mint-light
```

**Cards:**
```
- Background: --greeva-white
- Border: 1px solid --greeva-mint-light (atau no border, shadow saja)
- Border-radius: 12px
- Shadow: subtle (0 1px 3px rgba(0,0,0,0.08))
- Padding: 16-24px
- Hover: shadow lebih kuat + translate-y -2px transition
```

**Form inputs:**
```
- Border: 1.5px solid --gray-200
- Border-radius: 8px
- Padding: 12px 16px
- Focus: border --greeva-forest, ring 3px --greeva-leaf/40
- Error: border red-500, text helper red-600
```

**Badges (sustainability/tag):**
```
- Background: --greeva-mint-light
- Text: --greeva-forest-dark
- Border-radius: full
- Padding: 4px 10px
- Font-size: 12px, weight 500
```

### 3.6 Image Treatment

- **Produk:** background bersih, natural lighting, no heavy filter.
- **Lifestyle:** showcase produk in-context (tangan memegang gelang, tote di bahu), hangat, candid.
- **Cloudinary transformations:**
  - Catalog grid: `c_fill,w_400,h_400,q_auto,f_auto`
  - PDP main: `c_fill,w_1200,h_1200,q_auto,f_auto`
  - Thumbnail: `c_fill,w_120,h_120,q_auto,f_auto`
- **Format:** otomatis WebP/AVIF via Cloudinary.

### 3.7 Voice & Tone (Bahasa Indonesia)

**Functional copy (checkout, form, error):**
- Helpful, jelas, langsung.
- Contoh: "Stok tersisa 2. Yuk, segera checkout!"
- Hindari: "ERROR: Insufficient stock detected."

**Expressive copy (hero, marketing):**
- Optimistic, hangat, _make every word count_.
- Contoh: "Brand hijau lokal yang layak didengar."
- Hindari clickbait atau jargon korporat.

**Tidak pakai:**
- Bahasa gaul berlebihan ("bestie", "literally").
- Emoji di copy formal (boleh di notification WA dengan moderasi).
- ALL CAPS untuk paragraph (hanya untuk label/badge).

---

## 4. Domain Knowledge yang Wajib Diketahui

### 4.1 Konsep Inti

**Konsinyasi:**
- Greeva tidak beli stok mitra di awal.
- Mitra titip produk, Greeva jual, mitra dapat bagi hasil hanya saat sold.
- Mitra tetap pemilik produk (dari sisi legal).

**Snapshot Pricing & Revenue Share:**
- Saat order dibuat, `unit_price`, `revenue_share_percent`, dan `partner_earning_amount` di **snapshot** ke `order_items`.
- Perubahan harga atau % bagi hasil di masa depan **tidak retroaktif** — order lama tetap pakai nilai saat itu.
- **Critical untuk audit & dispute mitra.**

**Cooling Period (7 hari):**
- Setelah order `completed` (otomatis 7 hari setelah `delivered`), earning dibuat dengan status `pending`.
- 7 hari setelah `completed_at`, earning matured ke `available` (eligible payout).
- Total dari order paid → earning available ≈ 14 hari.

**Cycle Payout (2-mingguan):**
- Admin generate batch payout setiap tanggal 1 dan 16.
- Hanya earning status `available` yang masuk.
- Transfer manual oleh admin → upload bukti → mark paid.

**Multi-Partner per Order:**
- 1 order bisa berisi item dari banyak mitra.
- Earning di-split per `order_item` per `partner_id`.
- Schema mendukung multi-shipment per partner (kolom `partner_id` di `shipments`).

### 4.2 State Machines

**Order status:**
```
pending_payment → paid → packing → shipped → delivered → completed
                ↘ cancelled (sebelum shipped)
                ↘ payment_failed (timeout)
                ↘ refunded (after paid)
```

**Earning status:**
```
pending (order completed, dalam cooling)
  → available (cooling 7d selesai)
  → paid (masuk batch payout & ditransfer)
  → reversed (refund/dispute)
```

**Payout status:**
```
pending → processing → paid
       ↘ cancelled (release earnings)
       ↘ failed
```

**Product status:**
```
draft → pending_review → active → inactive → archived
```

### 4.3 Money Handling (CRITICAL)

**SEMUA kolom uang di database disimpan dalam SEN RUPIAH** (BIGINT).
- 1 IDR = 100 sen.
- Rp 85.000 disimpan sebagai `8500000`.

**Konversi hanya di response layer:**
```php
// app/Support/Money.php
class Money
{
    public static function toRupiah(int $cents): int
    {
        return (int) round($cents / 100);
    }
    
    public static function toCents(int|float $rupiah): int
    {
        return (int) round($rupiah * 100);
    }
    
    public static function format(int $cents): string
    {
        return 'Rp ' . number_format($cents / 100, 0, ',', '.');
    }
}
```

**Frontend juga dalam sen** — format ke rupiah hanya di komponen `<Price />`:
```tsx
// components/shared/Price.tsx
export function Price({ cents }: { cents: number }) {
  return <span>Rp {(cents / 100).toLocaleString('id-ID')}</span>;
}
```

**JANGAN PERNAH** pakai `float` atau `decimal` untuk uang. Floating point error = bug finance fatal.

---

## 5. Convention & Coding Standards

### 5.1 Backend (Laravel)

**Aturan keras:**
1. **Tidak ada query Eloquent di Controller.** Semua via Service.
2. **Tidak ada business logic di Model.** Model hanya: relationship, scope, accessor/mutator, cast.
3. **DB Transaction wajib** untuk operasi yang menyentuh > 1 tabel write (terutama checkout, payout).
4. **Idempotency** untuk webhook & critical mutations (checkout, refund).
5. **Form Request untuk validation**, **Resource untuk response**, **Service untuk logic**.
6. **Audit log** untuk semua perubahan di entity sensitif (Order, Partner, Payout, Earning).
7. **Soft delete** untuk semua entity transaksional.

**Naming convention:**
- Tabel: `snake_case`, plural (`order_items`).
- Kolom: `snake_case`, singular (`partner_id`).
- Model: PascalCase, singular (`OrderItem`).
- Service: `*Service` (`CheckoutService`).
- Job: imperative (`SendOrderEmail`).
- Event: past tense (`OrderCompleted`).
- Listener: imperative (`CreatePartnerEarnings`).

**Pattern wajib untuk Controller:**
```php
public function store(StoreXRequest $request): JsonResponse
{
    $this->authorize('create', X::class);              // 1. Authorize
    
    $result = $this->xService->create(                  // 2. Delegate ke Service
        $request->validated(),
        $request->user()
    );
    
    return XResource::make($result)                     // 3. Resource untuk response
        ->response()
        ->setStatusCode(201);
}
```

### 5.2 Frontend (Next.js)

**Aturan keras:**
1. **Server Components by default.** Tambah `'use client'` HANYA jika perlu state, event handler, atau hooks.
2. **API call HANYA via `lib/api/*`.** Jangan fetch langsung di komponen.
3. **TanStack Query** untuk server state. **Zustand** untuk UI state lokal.
4. **Form** wajib pakai `react-hook-form` + `zod` schema.
5. **Error boundary** per route group (`error.tsx`).
6. **Loading state** per route (`loading.tsx`).
7. **Format uang** wajib via `<Price cents={...} />` — jangan inline `${price/100}`.

**Naming:**
- Component file: PascalCase (`ProductCard.tsx`).
- Hook file: camelCase, prefix `use` (`useCart.ts`).
- Store file: `*.store.ts` (`cart.store.ts`).
- API module: per resource (`lib/api/products.ts`).
- Type: PascalCase di `types/` atau co-located.

**Pattern data fetching (Server Component):**
```tsx
// app/(marketing)/shop/page.tsx
import { getProducts } from '@/lib/api/products';
import { ProductGrid } from '@/components/catalog/ProductGrid';

export default async function ShopPage({ searchParams }: Props) {
  const products = await getProducts(searchParams);
  return <ProductGrid products={products.data} />;
}
```

**Pattern data fetching (Client Component dengan TanStack):**
```tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '@/lib/api/orders';

export function OrderList() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });
  // ...
}
```

### 5.3 TypeScript

- **Strict mode ON.** Tidak ada `any` (gunakan `unknown` jika perlu).
- **Type API dari Resource.** Idealnya generate dari OpenAPI, tapi v1 boleh manual.
- **Discriminated unions** untuk state (`OrderStatus = 'pending_payment' | 'paid' | ...`).

### 5.4 Git

**Branch naming:**
```
feature/{ticket-id}-{short-desc}    e.g. feature/GRV-12-checkout-flow
fix/{ticket-id}-{short-desc}
chore/{description}
```

**Commit convention (Conventional Commits):**
```
feat(checkout): tambah Midtrans Snap integration
fix(cart): perbaiki stock validation race
chore(deps): update Laravel ke 12.5
docs(api): tambah doc untuk endpoint payout
test(earnings): tambah test reversal logic
```

**PR rules:**
- Max 400 baris perubahan ideally.
- Include screenshot UI changes.
- Link ticket di description.
- Tulis test untuk logic baru.

---

## 6. Konfigurasi Penting

### 6.1 Environment Variables

**Backend (`.env`):**
```env
APP_NAME=Greeva
APP_ENV=local
APP_LOCALE=id
APP_FALLBACK_LOCALE=en

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_DATABASE=greeva

REDIS_HOST=redis
QUEUE_CONNECTION=redis
CACHE_STORE=redis

SANCTUM_STATEFUL_DOMAINS=localhost:3000

# Midtrans
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# Cloudinary
CLOUDINARY_CLOUD_NAME=greeva
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Meilisearch
MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_KEY=

# WhatsApp (Fonnte/Wablas)
WHATSAPP_PROVIDER=fonnte
WHATSAPP_API_KEY=

# Greeva Custom
GREEVA_DEFAULT_REVENUE_SHARE=80
GREEVA_COOLING_PERIOD_DAYS=7
GREEVA_DEFAULT_PAYOUT_PERIOD_DAYS=14
GREEVA_GUEST_CART_TTL_DAYS=30
GREEVA_ORDER_PAYMENT_EXPIRY_HOURS=24
```

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=greeva
NEXT_PUBLIC_MEILISEARCH_HOST=http://localhost:7700
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=
```

### 6.2 Custom Config File (`backend/config/greeva.php`)

```php
<?php
return [
    'revenue_share' => [
        'default_percent' => env('GREEVA_DEFAULT_REVENUE_SHARE', 80),
        'min_percent' => 80,
        'max_percent' => 85,
    ],
    'earnings' => [
        'cooling_period_days' => env('GREEVA_COOLING_PERIOD_DAYS', 7),
    ],
    'payout' => [
        'period_days' => env('GREEVA_DEFAULT_PAYOUT_PERIOD_DAYS', 14),
        'cycle_dates' => [1, 16], // tanggal generate payout
    ],
    'cart' => [
        'guest_ttl_days' => env('GREEVA_GUEST_CART_TTL_DAYS', 30),
    ],
    'order' => [
        'payment_expiry_hours' => env('GREEVA_ORDER_PAYMENT_EXPIRY_HOURS', 24),
        'auto_complete_days_after_delivery' => 7,
    ],
    'order_number_prefix' => 'GRV',
    'payout_number_prefix' => 'PYT',
];
```

---

## 7. Workflow Development

### 7.1 Local Setup

```bash
# Clone repo
git clone {repo}
cd greeva

# Backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed

# Frontend
cd ../frontend
cp .env.example .env.local
pnpm install

# Run all services via Docker
cd ..
docker-compose up -d

# Or run separately:
# Backend: cd backend && php artisan serve
# Frontend: cd frontend && pnpm dev
# Worker: cd backend && php artisan queue:work
# Scheduler: cd backend && php artisan schedule:work
```

### 7.2 Testing

**Backend:**
```bash
cd backend
php artisan test                  # All tests
php artisan test --filter=Checkout  # Filtered
php artisan test --coverage       # With coverage
```

**Frontend:**
```bash
cd frontend
pnpm test                # Unit + integration (Vitest)
pnpm test:e2e            # E2E (Playwright)
pnpm lint
pnpm type-check
```

**Wajib test untuk:**
- Service classes (`CheckoutService`, `EarningCalculator`, `PayoutService`).
- State machine transitions.
- Webhook handlers.
- Critical user flows E2E (buyer checkout, partner submit product).

### 7.3 Database

**Saat ada perubahan schema:**
```bash
php artisan make:migration add_x_to_y_table
# Edit migration file
php artisan migrate
```

**JANGAN PERNAH:**
- Edit migration yang sudah di-deploy ke production.
- Pakai `php artisan migrate:fresh` di production.
- Skip seeder saat fresh install (Notic, Reperca, kategori dasar wajib).

### 7.4 Deployment

**Branch strategy:**
- `main` → production
- `staging` → staging server
- `develop` → integration branch (default base untuk PR)

**Pre-deploy checklist:**
- [ ] All tests passing
- [ ] Migrations reviewed
- [ ] Environment variables updated
- [ ] Cloudinary folder structure verified
- [ ] Midtrans webhook URL updated (jika berubah)
- [ ] Cron schedule verified (`php artisan schedule:list`)

---

## 8. Aturan Khusus untuk Claude Code

### 8.1 Yang Selalu Dilakukan

1. **Baca file ini dulu** sebelum mengerjakan task.
2. **Pakai Bahasa Indonesia** untuk semua user-facing copy (error messages, validation, email subject, dll).
3. **Format uang via helper** (`Money::format`, `<Price cents={} />`) — jangan inline kalkulasi.
4. **Snapshot data** saat create order_items, payouts (jangan reference live data).
5. **DB Transaction** untuk semua operasi multi-table write.
6. **Audit log** saat ubah Order status, Partner data, Payout, Earning.
7. **Test** untuk setiap Service method yang punya branching logic.
8. **Sesuaikan dengan brand identity** — palette, typography, voice (lihat bagian 3).

### 8.2 Yang Tidak Boleh Dilakukan

1. ❌ **Tidak boleh** simpan uang sebagai float/decimal. **WAJIB** integer cents.
2. ❌ **Tidak boleh** buat endpoint baru tanpa update API spec di `docs/`.
3. ❌ **Tidak boleh** ubah `revenue_share_percent` di order yang sudah jadi (immutable snapshot).
4. ❌ **Tidak boleh** auto-pay payout dari sistem — selalu manual oleh admin (compliance).
5. ❌ **Tidak boleh** pakai `localStorage` untuk data sensitif (token cukup di httpOnly cookie atau Sanctum).
6. ❌ **Tidak boleh** expose data buyer lengkap ke partner (privacy by design).
7. ❌ **Tidak boleh** pakai library UI selain Shadcn/ui tanpa diskusi (jaga konsistensi).
8. ❌ **Tidak boleh** commit `.env` atau credentials.
9. ❌ **Tidak boleh** pakai bahasa English di UI (kecuali fallback i18n).
10. ❌ **Tidak boleh** skip validasi stok di checkout (race condition risk).

### 8.3 Saat Ragu

**Tanyakan sebelum eksekusi jika:**
- Akan ubah skema database (terutama tabel order/earning/payout).
- Akan tambah dependency baru.
- Akan ubah business logic core (cooling period, % bagi hasil, snapshot rules).
- Akan ubah design token (palette, typography).

**Default ke:**
- Solusi paling sederhana yang memenuhi requirement.
- Konsisten dengan kode yang sudah ada.
- Testable & observable (audit log, metrics).

### 8.4 Prioritas Saat Trade-off

Urutan prioritas ketika harus memilih:

1. **Data integrity** (audit, snapshot, transaction) — non-negotiable.
2. **Security** (auth, validation, rate limit) — non-negotiable.
3. **User experience** (loading state, error message, mobile-first).
4. **Performance** (caching, query optimization, image lazy load).
5. **Code elegance** — yang terakhir.

---

## 9. Common Patterns & Snippets

### 9.1 API Response Standard

```php
// Success
return ApiResponse::success($data, 200);
// or via Resource
return ProductResource::make($product);

// Collection with pagination
return ProductResource::collection($products);

// Error
return ApiResponse::error('Stok tidak mencukupi', 'INSUFFICIENT_STOCK', 409);
```

### 9.2 Service Pattern

```php
namespace App\Services\Checkout;

class CheckoutService
{
    public function __construct(
        private StockReservationService $stockService,
        private MidtransService $midtrans,
        private OrderNumberGenerator $numberGen,
    ) {}
    
    public function checkout(array $data, ?User $user): Order
    {
        return DB::transaction(function () use ($data, $user) {
            // 1. Reserve stock
            $this->stockService->reserve($data['items']);
            
            // 2. Create order with snapshot
            $order = $this->createOrder($data, $user);
            
            // 3. Snapshot order items
            $this->createOrderItems($order, $data['items']);
            
            // 4. Generate Midtrans Snap token
            $payment = $this->midtrans->createTransaction($order);
            
            // 5. Audit log
            AuditLogger::log('order.created', $order);
            
            return $order;
        });
    }
}
```

### 9.3 Event-Driven Side Effects

```php
// Event
event(new OrderCompleted($order));

// Listener (di EventServiceProvider)
protected $listen = [
    OrderCompleted::class => [
        CreatePartnerEarnings::class,
        SendCompletionEmail::class,
        TriggerReviewReminder::class,
    ],
];
```

### 9.4 Frontend API Module

```typescript
// lib/api/products.ts
import { client } from './client';
import type { Product, ProductListParams } from '@/types/product';

export async function getProducts(params?: ProductListParams) {
  return client.get<{ data: Product[]; meta: PaginationMeta }>('/products', { params });
}

export async function getProductBySlug(slug: string) {
  return client.get<{ data: Product }>(`/products/${slug}`);
}
```

### 9.5 Frontend Hook Pattern

```typescript
// hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/lib/api/products';

export function useProducts(params?: ProductListParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    staleTime: 60_000,
  });
}
```

---

## 10. Lokasi Dokumen Lain

Semua dokumen design ada di `/docs`:

| File | Isi |
|---|---|
| `docs/01-prd.md` | Product Requirements Document |
| `docs/02-database-schema.md` | Skema database lengkap |
| `docs/03-folder-structure.md` | Struktur folder FE & BE |
| `docs/04-api-endpoints.md` | API endpoint spec |
| `docs/05-consignment-payment-flow.md` | Alur konsinyasi & pembayaran |
| `docs/CLAUDE.md` | File ini (juga di-symlink di root) |
| `docs/07-roadmap.md` | Phase by phase development plan |

**Saat ada keputusan baru:** update file relevan + tambah ADR (Architecture Decision Record) di `docs/adr/{number}-{title}.md`.

---

## 11. Contacts & Resources

### 11.1 Stakeholder
- **Product Owner:** _(diisi)_
- **Tech Lead:** _(diisi)_
- **Mitra PIC Notic:** _(diisi)_
- **Mitra PIC Reperca:** _(diisi)_

### 11.2 Eksternal
- **Midtrans Dashboard:** https://dashboard.midtrans.com
- **Cloudinary Console:** https://console.cloudinary.com
- **Meilisearch:** local di docker-compose
- **Fonnte/Wablas:** _(URL provider terpilih)_

### 11.3 Dokumentasi Resmi
- Next.js 14 App Router: https://nextjs.org/docs
- Laravel 12: https://laravel.com/docs/12.x
- Shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com/docs
- Midtrans Snap: https://docs.midtrans.com/en/snap/overview

---

## 12. Changelog CLAUDE.md

| Versi | Tanggal | Perubahan | Author |
|---|---|---|---|
| 1.0 | 2026-05-07 | Initial draft, brand identity finalized, Starbucks-inspired tone | Greeva Team |

---

> **Last reminder untuk Claude Code:**
> Kamu adalah developer di tim Greeva. Hormati craft pride dari setiap mitra brand — kode yang kamu tulis menentukan apakah mitra dapat bagi hasil tepat waktu, apakah buyer percaya pada platform, dan apakah misi sustainability ini berhasil. _Calm confidence. Quality over speed._
