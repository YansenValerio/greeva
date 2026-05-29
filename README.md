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
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | **Checklist deploy produksi** — env, migrasi, cron, smoke test |
| [docs/SETUP.md](docs/SETUP.md) | Setup development lengkap, troubleshooting, IDE |
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

### Step 19 — UX Polish: Empty States, Skeleton, Mobile, Image Lightbox ✅

- [x] **`<EmptyState />`** — komponen reusable (icon Lucide opsional, title, description, primary + secondary action sebagai href/onClick, 3 size). Refactor 15 call site (cart, orders, wishlist, addresses, partner & admin lists, ReviewList) jadi konsisten dengan icon + CTA yang jelas
- [x] **`<Skeleton />` set** — primitif `Skeleton` (rect/pill/circle/text) + `ProductCardSkeleton`, `ProductGridSkeleton`, `OrderRowSkeleton`, `TableSkeleton`, `ListSkeleton`, `PageHeaderSkeleton`, `KpiCardSkeleton`. Menggantikan 12 inline `animate-pulse div` di berbagai halaman
- [x] **Mobile navbar hamburger** — tombol Menu di viewport `<md`, drawer slide-in dari kanan (link nav, akun/login/logout), Escape & backdrop tap untuk tutup, body scroll dikunci saat terbuka
- [x] **Dashboard Sidebar adaptif** — horizontal pill tabs scrollable di mobile/tablet (`<lg`), vertical sidebar di desktop. `DashboardShell` ikut adjust padding & gap
- [x] **Admin tables responsive** — list row `/admin/products` & `/admin/orders` pakai `flex-wrap` + basis trick supaya info naik baris atas dan aksi/badge tetap kanan saat mobile
- [x] **Product image lightbox** — `ProductImageLightbox` modal full-screen dengan keyboard nav (Esc/←/→), swipe via Pointer Events, dot indicator mobile, counter `n / total`. Main gallery jadi `<button>` click-to-zoom dengan hover badge "Perbesar". Zero dependency baru

### Step 20 — Fitur Platform Lanjutan (Sesi Mei 2026) ✅

#### Refund Flow
- [x] Transisi `delivered`/`completed` → `refunded` ditambahkan ke state machine `OrderService`
- [x] Saat order direfund: stok dikembalikan, earning mitra di-reverse otomatis, notifikasi dikirim ke buyer
- [x] Kolom `refunded_at` di tabel `orders`; `OrderResource` menyertakan `refunded_at`
- [x] Admin order detail: pilihan "Refunded" tersedia di dropdown status update

#### Return Request (Pengajuan Retur)
- [x] Tabel `return_requests` (return_number `RTN-…`, reason, description, photos, status, admin_note)
- [x] `ReturnRequestService`: buat retur (validasi delivered/completed, cegah duplikat pending), approve (refund order + reverse earning + notifikasi), reject (alasan wajib + notifikasi)
- [x] Buyer: tombol "Ajukan Retur" di halaman detail pesanan (muncul saat `can_request_return`), form inline (pilih alasan + deskripsi)
- [x] Admin: `/admin/returns` — list dengan filter status + approve/reject inline; `/admin/returns/[id]` — detail lengkap dengan foto bukti
- [x] Tests: `ReturnRequestServiceTest` (6) + `ReturnAndReportTest` (5 — feature test endpoint)

#### Notifikasi In-App
- [x] Tabel `app_notifications` (user_id, type, title, body, data JSON, read_at); query pemakaian otomatis melepas kuota
- [x] `NotificationController`: list (paginated + unread_count), mark-read satu, mark-all-read, unread-count
- [x] Trigger otomatis: perubahan status order (packing/shipped/delivered/completed/cancelled/refunded), approve/reject retur
- [x] `NotificationBell` di Navbar: badge merah unread, dropdown 20 notifikasi terbaru, polling tiap 60s, tombol "Tandai semua dibaca"
- [x] Halaman `/account/notifications` — daftar penuh, paginated, mark-read per item & semua
- [x] Sidebar akun: pintasan "Notifikasi →"

#### Manajemen Pengguna (Admin)
- [x] `Admin\UserController` + endpoint `GET /admin/users`, `PATCH /admin/users/{user}/suspend`
- [x] Kolom `is_suspended` di tabel `users`; middleware `EnsureRole` memblokir akun tersuspend (403)
- [x] Admin tidak bisa di-suspend; toggle suspend/aktifkan via API dan UI
- [x] Halaman `/admin/users` — filter role, search nama/email, tombol Suspend/Aktifkan
- [x] Tests: suspend toggle, guard admin, blokir akses user tersuspend

#### Visibilitas Order Mitra (Penjualan)
- [x] `Partner\OrderController` — daftar order yang mengandung produk mitra, tanpa PII buyer (privacy by design)
- [x] `PartnerOrderResource` — hanya ekspos `order_number`, status, total, items mitra (bukan alamat/nama pembeli)
- [x] Halaman `/partner/sales` — filter status, breakdown item per order
- [x] Nav mitra: "Penjualan" ditambahkan

#### Manajemen Earning Admin
- [x] Endpoint `GET /admin/earnings` — semua earning lintas mitra + filter status/partner
- [x] Endpoint `PATCH /admin/earnings/{earning}/reverse` — batalkan earning pending/available dengan alasan (audit log)
- [x] Perbaikan bug: `EarningController@reverse` sebelumnya memanggil `$request->validated()` pada base `Request` (bukan FormRequest) → crash 500 di produksi; diperbaiki via test
- [x] Halaman `/admin/earnings` — list + filter status + tombol "Batalkan" per earning
- [x] Nav admin: "Earning" ditambahkan

#### Produk Pilihan (Featured)
- [x] Kolom `is_featured` (boolean) di tabel `products` + index
- [x] Endpoint `PATCH /admin/products/{product}/toggle-featured`
- [x] Admin product detail: tombol "Jadikan Pilihan" / "★ Pilihan"
- [x] Home page: prioritas fetch produk `is_featured`, fallback ke latest jika < 4
- [x] Meilisearch: `is_featured` ditambahkan ke `filterableAttributes` (jalankan `scout:sync-index-settings`)
- [x] Filter `featured=1` aktif di jalur Eloquent & Meilisearch

#### SEO & Metadata
- [x] `app/robots.ts` — crawler rules + URL sitemap
- [x] `app/sitemap.ts` — fetch semua produk aktif (revalidate 1 jam) + halaman statis
- [x] Product detail: OpenGraph, Twitter card, JSON-LD `schema.org/Product` (nama, harga, stok, rating aggregate)
- [x] Root layout: keywords, Twitter card default

#### Halaman Statis Marketing
- [x] `/tentang` — cerita Greeva, misi sustainability, CTA mitra & toko
- [x] `/mitra` — daftar mitra dengan link ke brand page masing-masing
- [x] `/mitra/[slug]` (Notic & Reperca) — brand story, dampak, nilai, produk mitra
- [x] `/kontak` — email layanan, kemitraan, media; kriteria mitra
- [x] `/kebijakan-privasi` — data yang dikumpulkan, penggunaan, hak pengguna, cookie
- [x] `/syarat-ketentuan` — pembelian, pengiriman, retur, larangan
- [x] Navbar: link `/about` diubah ke `/tentang`; `generateMetadata` per halaman

#### Laporan Admin (Export CSV)
- [x] `ReportService` — 3 laporan: penjualan (orders), earning per mitra, rekap payout; rentang tanggal default 30 hari; uang dalam rupiah integer (Excel-ready)
- [x] `Admin\ReportController` — streaming `streamDownload` + BOM UTF-8 (agar karakter Indonesia tampil benar di Excel)
- [x] Endpoint `GET /admin/reports/{sales|earnings|payouts}`
- [x] Halaman `/admin/reports` — date range picker + 3 kartu unduhan; tombol "Unduh CSV" via blob (Bearer token otomatis)
- [x] Nav admin: "Laporan" ditambahkan

### Step 21 — Sistem Voucher / Promo Code ✅

- [x] **Tabel `vouchers`**: `code` (UPPERCASE unique), `type` (percent/fixed), `value`, `max_discount` (cap persen), `min_purchase`, `valid_from`/`valid_until`, `usage_limit` (kuota total), `per_user_limit`, `first_order_only` (khusus pelanggan baru), `is_active`; soft delete
- [x] **Pemakaian dihitung dari tabel `orders`** (bukan counter denormalized) → kuota otomatis lepas saat order `cancelled`/`payment_failed`
- [x] **Snapshot**: `voucher_id` + `voucher_code` tersimpan di order (immutable, konsisten dengan prinsip snapshot CLAUDE.md)
- [x] **`VoucherService`**:
  - `validate()` — abort 422 (Bahasa Indonesia) untuk: kode invalid/nonaktif, belum berlaku, kedaluwarsa, min. belanja kurang, kuota total habis, per-user limit, bukan pelanggan baru. Param `lock=true` untuk `lockForUpdate` saat di dalam transaksi checkout (cegah race condition kuota)
  - `computeDiscount()` — persen + cap `max_discount`; nominal; selalu di-cap ≤ subtotal
- [x] **`CheckoutService`** terintegrasi — validasi otoritatif voucher di dalam transaksi, `discount_total` dan `grand_total` dihitung ulang; `grand_total = subtotal + shipping - discount`
- [x] **Admin CRUD** (`/admin/vouchers`) — buat/edit/hapus voucher; form: tipe, nilai, maks. potongan, min. belanja, tanggal berlaku, kuota total & per-user, toggle pelanggan baru & aktif; input uang dalam rupiah (dikonversi ke sen)
- [x] **Buyer preview** — `POST /vouchers/preview` — validasi kode terhadap isi cart, kembalikan potongan (informatif; validasi otoritatif ulang saat submit checkout)
- [x] **Checkout UI** — input "Kode Voucher" + tombol Terapkan, baris "Diskon" di ringkasan, total real-time; kode dikirim dalam payload checkout
- [x] **Order detail** — `voucher_code` + `discount_total_formatted` ditampilkan
- [x] **Nav admin**: "Voucher" ditambahkan
- [x] **Tests**: `VoucherServiceTest` (12) + `VoucherTest` (5 — admin CRUD + guard) + `CheckoutServiceTest` (+2 — apply voucher & tolak voucher invalid dengan rollback stok)

### Backlog
- [ ] _(lihat [IMPROVEMENTS.md](IMPROVEMENTS.md) untuk daftar peningkatan lanjutan)_

---

## Fitur Utama

| Area | Fitur |
|------|-------|
| **Buyer** | Browse & search produk, cart (guest + auth), checkout Midtrans Snap, ongkir otomatis, wishlist, order tracking, ulasan, pengajuan retur, voucher promo, notifikasi in-app |
| **Partner** | Dashboard analitik, CRUD produk + varian, AI copywriter, riwayat stok, penjualan (tanpa PII buyer), pendapatan & riwayat payout |
| **Admin** | KPI dashboard, kurasi produk (featured, bulk status), manajemen pesanan + refund, pengajuan retur (approve/reject), earning (reverse), payout batch, voucher CRUD, kategori, mitra, pengguna (suspend), laporan CSV, audit log |
| **Platform** | Meilisearch full-text + filter, SEO (sitemap/robots/JSON-LD), WhatsApp notifikasi, halaman statis marketing, sistem voucher (persen/nominal + aturan lengkap) |

---

## Tech Stack

**Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Shadcn/ui · Zustand

**Backend:** Laravel 12 · PHP 8.3 · PostgreSQL 15 · Redis 7

**Infra:** Cloudinary · Meilisearch · Midtrans · Fonnte (WhatsApp)

**Tests:** 142 backend tests (Pest) · Vitest unit · Playwright E2E

---

## Kontribusi

Branch dari `develop`. Ikuti convention Conventional Commits. Lihat [CLAUDE.md](CLAUDE.md) untuk coding standards lengkap.
