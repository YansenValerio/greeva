# Greeva

> **"Sustainable brands deserve better marketing."**

Greeva adalah ekosistem kurasi brand hijau lokal Indonesia. Bukan marketplace biasa — Greeva berperan sebagai **agency + platform konsinyasi**: produk dimiliki mitra brand, dijual atas nama Greeva, dengan bagi hasil **80–85%** per transaksi sukses.

**Mitra aktif:** Notic (aksesoris manik HDPE daur ulang) · Reperca (produk dari kain perca konveksi)

---

## Quick Start

### Dengan Docker (Rekomendasi)

```bash
# Clone repository
git clone <repo-url> greeva
cd greeva

# Jalankan semua services infra
docker-compose up -d

# Setup backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed

# Setup frontend
cd ../frontend
cp .env.example .env.local
pnpm install
pnpm dev
```

### Manual (tanpa Docker)

Pastikan sudah install: PostgreSQL 15+, Redis 7+, Meilisearch, PHP 8.3+, Node 18+, pnpm.

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env: sesuaikan DB_HOST, REDIS_HOST, MEILISEARCH_HOST
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve          # http://localhost:8000
php artisan queue:work     # Terminal terpisah
php artisan schedule:work  # Terminal terpisah

# Frontend
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev                   # http://localhost:3000
```

---

## Service URLs

| Service       | URL                        | Keterangan                  |
|---------------|----------------------------|-----------------------------|
| Frontend      | http://localhost:3000      | Next.js dev server          |
| Backend API   | http://localhost:8000/api/v1 | Laravel REST API           |
| Mailpit UI    | http://localhost:8025      | Email testing (dev)         |
| Meilisearch   | http://localhost:7700      | Search engine dashboard     |
| PostgreSQL    | localhost:5432             | DB: greeva / user: greeva   |
| Redis         | localhost:6379             | Cache, queue, session       |

---

## Dokumentasi

| File | Isi |
|------|-----|
| [docs/SETUP.md](docs/SETUP.md) | Setup lengkap, troubleshooting, IDE |
| [docs/01-prd.md](docs/01-prd.md) | Product Requirements Document |
| [docs/02-database-schema.md](docs/02-database-schema.md) | Skema database lengkap |
| [docs/03-folder-structure.md](docs/03-folder-structure.md) | Struktur folder FE & BE |
| [docs/04-api-endpoints.md](docs/04-api-endpoints.md) | API endpoint spec |
| [docs/05-consignment-payment-flow.md](docs/05-consignment-payment-flow.md) | Alur konsinyasi & pembayaran |
| [docs/07-roadmap.md](docs/07-roadmap.md) | Phase by phase development plan |
| [CLAUDE.md](CLAUDE.md) | Konteks project untuk Claude Code |

---

## Status Phase 0

### Step 1 — Foundation & Config ✅
- [x] `.gitignore`, `.editorconfig`
- [x] `docker-compose.yml` (postgres, redis, meilisearch, mailpit)
- [x] `backend/composer.json` + dependencies
- [x] `backend/.env.example`
- [x] `backend/config/greeva.php`
- [x] `backend/app/Support/Money.php`
- [x] `frontend/package.json` + dependencies
- [x] `frontend/tsconfig.json` (strict)
- [x] `frontend/tailwind.config.ts` (Greeva palette)
- [x] `frontend/next.config.js`
- [x] `docs/SETUP.md`

### Step 2 — Database Migrations & Models ✅
- [x] Migrations: users, partners, categories, products, product_variants
- [x] Migrations: orders, order_items, shipments
- [x] Migrations: partner_earnings, payout_batches, payout_items
- [x] Base Models + Eloquent relationships (11 models, 6 enums)
- [x] Database Seeders (Category, Partner, Database)

### Step 3 — Authentication & Authorization ✅
- [x] Sanctum setup + login/register/logout/me endpoints
- [x] Role-based middleware `EnsureRole` (buyer, partner, admin)
- [x] Policies: OrderPolicy, ProductPolicy, PartnerPolicy, PayoutBatchPolicy

### Step 4 — Business Logic & API ✅
- [x] Cart management (CartService + 4 endpoints)
- [x] Checkout + snapshot pricing (CheckoutService + StockReservationService)
- [x] Midtrans payment webhook (MidtransService + idempotency)
- [x] Product management — admin & partner CRUD (ProductService)
- [x] Order management + state machine (OrderService)
- [x] Image upload — Cloudinary (CloudinaryService)
- [x] Events & Listeners (OrderPaid, OrderCompleted, OrderPaymentFailed)
- [x] Console commands: ExpireUnpaidOrders, MatureEarnings, AutoCompleteOrders (scheduled)
- [x] Earnings & Payout system (cooling period 7d, batch generation, CreatePartnerEarnings listener)
- [x] AI Copywriter (Google Gemini 2.0 Flash) — generate product copy for partner form
- [x] AI Chat SSE (Google Gemini 2.0 Flash) — streaming chat assistant endpoint

### Step 5 — Backend Testing ✅
- [x] 58 tests hijau — Auth, Checkout, StockReservation, ProductService, PaymentWebhook, Earnings, Payout, WhatsApp
- [x] Framework: Pest · Runner: `php artisan test`

### Step 6 — Frontend Phase 1: Core & Catalog ✅
- [x] Layout: Navbar, Footer, route groups `(marketing)`, `(auth)`, `(partner)`, `(admin)`
- [x] Landing page — hero, featured products, sustainability strip
- [x] Shop catalog — filter by category/price, sort
- [x] Product detail page — gallery, add to cart
- [x] `<Price cents={} />` component, Greeva design tokens

### Step 7 — Frontend Phase 2: Cart, Checkout & Auth ✅
- [x] Cart drawer (Zustand) — add, update, remove, guest merge
- [x] Checkout page — alamat, Midtrans Snap popup
- [x] Buyer order history + detail halaman
- [x] Login & Register (Sanctum Bearer token, auth store Zustand)

### Step 8 — Frontend Phase 3: Partner & Admin Dashboards ✅
- [x] Partner dashboard — produk (CRUD + submit), earnings summary, payout history
- [x] Admin panel — mitra, produk (approve/reject), pesanan (update status), payout (generate + mark paid)
- [x] `useRoleGuard` hook — redirect unauthorized users
- [x] `DashboardShell` + `Sidebar` dengan active state detection

### Step 9 — AI Integration ✅
- [x] AI Copywriter di form produk mitra — generate description, short_description, sustainability_notes, meta SEO
- [x] Chat Widget floating — streaming SSE, typing indicator, mobile-friendly
- [x] Provider: Google Gemini 2.0 Flash (free tier 1.500 req/hari)

### Step 10 — Meilisearch Integration ✅
- [x] Laravel Scout + Meilisearch driver (laravel/scout ^11.1)
- [x] Product model: `Searchable` trait, `toSearchableArray()`, `shouldBeSearchable()` (active only)
- [x] Filterable: `status`, `category_id`, `partner_id`, `price` — filter langsung di index
- [x] Sortable: `published_at`, `price`, `name`
- [x] Hybrid strategy: Scout saat ada `search` param, Eloquent untuk browsing tanpa kata kunci
- [x] Sync otomatis via queue (`after_commit: true`) saat produk disimpan/status berubah

### Step 11 — Frontend Tests ✅
- [x] **Unit (Vitest · 24 tests)** — `npm test`
  - `cart.store`: addItem, updateItem, removeItem, fetch, clear, subtotal multi-item
  - `checkout schema`: semua validasi field — nama, telepon, alamat, provinsi, kota, kode pos
- [x] **E2E (Playwright · 8 scenarios)** — `npm run test:e2e` (butuh `npx playwright install chromium`)
  - `checkout.spec`: auth guard, form validation, full flow (mock API + snap.pay → redirect order)
  - `partner-product-submit.spec`: role guard, validasi, full submit (mock categories + API → redirect list)

### Step 12 — WhatsApp Notifications ✅
- [x] `WhatsAppService` — Fonnte API wrapper, phone normalization (0xxx → 628xxx), graceful failure (no throw)
- [x] `SendOrderPaidNotification` — buyer (shipping_phone) + setiap partner yang item-nya ada di order
- [x] `SendOrderCompletedNotification` — buyer (shipping_phone)
- [x] `SendOrderPaymentFailedNotification` — buyer (shipping_phone)
- [x] Semua listener queued (3 retries, 60s backoff) — notifikasi tidak memblokir request
- [x] Aktivasi: isi `WHATSAPP_API_KEY` di `.env`

### Step 13 — Admin & Account UX Enhancements ✅
- [x] **Admin Partner Detail** `/admin/partners/[id]` — info mitra lengkap, earning summary (pending/available/paid), 10 earning terbaru, form edit (nama, %, info bank, status aktif), shortcut ke produk & payout mitra
- [x] **Admin Categories CRUD** `/admin/categories` — list pohon (indentasi per depth + glyph `└`), inline form add/edit, parent select otomatis exclude self & descendants (cegah cycle), delete ditolak kalau masih ada produk/subkategori
- [x] **Buyer Account** `/account` — form info pribadi (nama/email/phone) + form ubah password (current_password wajib, min 8 + confirmed), sidebar pintasan role-specific, inline error per-field dari Laravel validation
- [x] **Search UI** — input pill-shaped di shop header sync dua arah dengan `?search=` URL + preserve filter kategori, navbar search icon buka overlay full-width (auto-focus, Escape to close), label "Hasil pencarian untuk: X (N produk)" di atas grid
- [x] Backend: `Admin\CategoryController` + `CategoryPolicy` + `StoreCategoryRequest`/`UpdateCategoryRequest`, `PUT /auth/profile` + `POST /auth/change-password` di `AuthController` (revoke token lain saat ganti password), email berubah → reset `email_verified_at`

### Step 14 — Product Reviews ✅
- [x] Migration `product_reviews` — `order_item_id` unique (satu review per item), index `(product_id, is_approved)` + `(user_id, created_at)`
- [x] `ProductReview` model + `ProductReviewPolicy` — `createForItem` cek order owner + status `completed` + belum direview; `update`/`delete` hanya owner (admin bisa delete)
- [x] Backend endpoints: `GET /products/{slug}/reviews` (publik, paginated, sort `newest`/`highest`/`lowest` + summary `{total, average_rating}`), `POST /orders/{orderNumber}/items/{itemId}/review` (buyer), `PUT|DELETE /reviews/{review}`
- [x] `ProductResource.reviews_count` + `average_rating` via `withCount` + `withAvg` — zero N+1 di list shop & search
- [x] `OrderItemResource.review` (jika relasi loaded) + `product_slug` — UI tahu sudah diulas atau belum
- [x] Komponen `StarRating` (display, support half-star) + `StarRatingInput` (interactive) + `ReviewForm` (rating wajib, body opsional max 2000 char)
- [x] `ReviewList` di product detail — summary card + sort dropdown + privacy-masked name ("Yansen V.")
- [x] Inline review CTA di order detail per item — tombol "Tulis Ulasan" muncul saat `status === 'completed'`, edit ulasan eksisting
- [x] Rating ringkas di `ProductCard` (shop list) + header product detail

### Step 15 — Shipment Tracking UI ✅
- [x] `lib/shipping.ts` — daftar kurir Indonesia (JNE, J&T, SiCepat, POS, AnterAja, Ninja, Lainnya) + helper `getCourierTrackUrl(courier, tracking)` generate link tracking eksternal
- [x] Admin order detail — form pengiriman saat status `shipped`: dropdown kurir + input layanan (REG/YES/dll) + nomor resi (wajib), validasi client + server (`required_if`)
- [x] Admin shipment display — card mint dengan kurir + service + resi monospace + tombol "Lacak ↗" eksternal + timeline tanggal kirim/terima
- [x] Buyer order detail — section "Pelacakan Pengiriman" muncul otomatis saat ada resi, card prominent dengan select-all friendly resi, tombol langsung ke situs kurir
- [x] Fix type mismatch: `OrderShipment` sebelumnya pakai `carrier` (tidak match backend `courier`/`courier_service`), tambah field `packed_at`/`shipped_at`/`delivered_at`

### Step 16 — Guest Cart ✅
- [x] Backend: cart routes (GET/POST/PUT/DELETE) keluar dari `auth:sanctum`, `merge` tetap auth. `CartController.resolveKey()` resolve key dari Auth guard atau `X-Cart-Token` header (regex-validated 8–100 alfanum/dash). `CartService.touchGuestTtl()` refresh TTL 30 hari (sesuai `GREEVA_GUEST_CART_TTL_DAYS`) di setiap write
- [x] Frontend: `lib/guestCart.ts` kelola UUID token di localStorage via `crypto.randomUUID`. Axios interceptor selalu attach `X-Cart-Token` header jika ada
- [x] `cart.store.addItem` auto-generate guest token kalau belum login. `mergeAfterLogin()` dipanggil dari LoginForm & RegisterForm — guest cart digabung ke akun (qty dijumlah kalau variant sama) lalu token guest dihapus
- [x] UX: `AddToCartButton` tidak lagi redirect ke login — guest langsung bisa belanja, login baru required saat checkout. Cart page accessible tanpa auth, tombol checkout adaptif ("Lanjut ke Checkout" vs "Masuk untuk Checkout")
- [x] Navbar auto-fetch cart saat hydrated untuk auth user atau guest yang sudah punya token — badge count konsisten antar reload

### Step 17 — Partner Analytics & Inventory History ✅
- [x] Migration `inventory_logs` + `InventoryReason` enum (sale/release/adjustment/initial) + `InventoryLog` model — catat setiap mutasi stok dengan `stock_before`/`stock_after` + referensi order
- [x] `InventoryService` di-wire ke semua titik mutasi stok: checkout (sale), kegagalan Midtrans & pembatalan order & payment-failed listener (release), buat varian (initial), edit stok varian (adjustment manual)
- [x] `PartnerAnalyticsService` + `GET /partner/analytics` — KPI (unit terjual, penjualan kotor, total pesanan, pendapatan, produk aktif, stok menipis), produk terlaris, tren 6 bulan (driver-aware Postgres/SQLite)
- [x] `GET /partner/inventory-logs` (filter `product_id`/`variant_id`/`reason`) + `InventoryLogResource`
- [x] Halaman `/partner/analytics` (KPI cards + bar chart tren tanpa dependency + produk terlaris) & `/partner/inventory` (filter produk + alasan, tampilan +/- dan before→after). Nav mitra: "Analitik" + "Riwayat Stok"
- [x] Tes: `InventoryServiceTest` (7) + `PartnerAnalyticsServiceTest` (4)

### Step 18 — Admin Dashboard KPI & Bulk Operations ✅
- [x] `AdminDashboardService` + `GET /admin/dashboard` — revenue bulan ini vs bulan lalu (+ % & tren 6 bulan), order perlu dikirim / menunggu bayar, payout berjalan + earning siap dicairkan, top mitra, top kategori, peringatan stok menipis lintas mitra
- [x] `/admin/dashboard` dirombak dari quick-links jadi KPI headline cards + bar chart revenue + top mitra/kategori + daftar stok menipis (link ke produk) + quick links
- [x] Bulk ops: `PATCH /admin/products/bulk-status` (aktifkan/nonaktifkan/arsipkan massal) + `PATCH /admin/orders/bulk-status` (packing/delivered/completed/cancelled massal; transisi tidak valid dilewati & dilaporkan, bukan menggagalkan batch; `shipped` dikecualikan karena butuh resi per-order)
- [x] UI bulk: checkbox per baris + pilih semua + bulk action bar (dropdown status + Terapkan) di halaman admin Produk & Pesanan, dengan confirm dialog + toast
- [x] Catatan: conversion rate & traffic (#19) dan bulk message ke buyer (#27) di-skip — butuh sistem pelacakan view & messaging broadcast yang belum ada
- [x] Tes: `AdminDashboardServiceTest` (6) + `BulkStatusUpdateTest` (3). Total backend: 77 tes hijau

### Backlog
- [ ] _(lihat [IMPROVEMENTS.md](IMPROVEMENTS.md) untuk daftar peningkatan lanjutan)_

---

## Tech Stack

**Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Shadcn/ui · TanStack Query · Zustand

**Backend:** Laravel 12 · PHP 8.3 · PostgreSQL 15 · Redis 7

**Infra:** Cloudinary · Meilisearch · Midtrans · Fonnte/Wablas

---

## Kontribusi

Branch dari `develop`. Ikuti convention Conventional Commits. Lihat [CLAUDE.md](CLAUDE.md) untuk coding standards lengkap.
