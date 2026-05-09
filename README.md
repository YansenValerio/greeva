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
- [x] 49 backend tests hijau (Auth, Checkout, StockReservation, ProductService, PaymentWebhook, Earnings, Payout)

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

### Backlog
- [ ] Meilisearch integration (full-text search, saat ini pakai filter DB)
- [ ] Frontend tests (Vitest + Playwright E2E)
- [ ] WhatsApp notifications (Fonnte — config sudah ada, implementasi belum)

---

## Tech Stack

**Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Shadcn/ui · TanStack Query · Zustand

**Backend:** Laravel 12 · PHP 8.3 · PostgreSQL 15 · Redis 7

**Infra:** Cloudinary · Meilisearch · Midtrans · Fonnte/Wablas

---

## Kontribusi

Branch dari `develop`. Ikuti convention Conventional Commits. Lihat [CLAUDE.md](CLAUDE.md) untuk coding standards lengkap.
