# Panduan Setup Development — Greeva

Dokumen ini menjelaskan cara menyiapkan environment development Greeva dari nol.

---

## Prerequisites

| Tool | Versi Minimum | Keterangan |
|------|--------------|------------|
| Docker Desktop | 4.x | Untuk menjalankan services infra |
| Docker Compose | v2 | Sudah bundled dengan Docker Desktop |
| Node.js | 18+ | Untuk frontend |
| pnpm | 8+ | Package manager frontend (`npm i -g pnpm`) |
| PHP | 8.3+ | Untuk backend tanpa Docker |
| Composer | 2.x | Package manager PHP |
| Git | 2.x | Version control |

---

## Quick Start dengan Docker (Rekomendasi)

Docker hanya menjalankan **services infra** (database, cache, search, email). Backend Laravel dan frontend Next.js dijalankan secara lokal.

### 1. Clone dan persiapkan repository

```bash
git clone <repo-url> greeva
cd greeva
```

### 2. Jalankan services infra

```bash
docker-compose up -d
```

Tunggu hingga semua container berstatus `healthy`:

```bash
docker-compose ps
```

### 3. Setup Backend

```bash
cd backend

# Salin environment file
cp .env.example .env

# Install dependencies
composer install

# Generate application key
php artisan key:generate

# Jalankan migrasi dan seeder
php artisan migrate --seed

# Jalankan server (terminal 1)
php artisan serve

# Jalankan queue worker (terminal 2)
php artisan queue:work --tries=3

# Jalankan scheduler (terminal 3)
php artisan schedule:work
```

### 4. Setup Frontend

```bash
cd frontend

# Salin environment file
cp .env.example .env.local

# Install dependencies
pnpm install

# Jalankan dev server
pnpm dev
```

---

## Setup Manual (tanpa Docker)

Pastikan semua service sudah berjalan di lokal:
- PostgreSQL 15+ (buat database `greeva`, user `greeva`)
- Redis 7+ (`redis-server`)
- Meilisearch (`./meilisearch --env development`)

Edit `backend/.env` untuk menyesuaikan host/port lokal:

```env
DB_HOST=127.0.0.1
REDIS_HOST=127.0.0.1
MEILISEARCH_HOST=http://127.0.0.1:7700
```

Lanjutkan dengan langkah 3 dan 4 dari Quick Start.

---

## Service URLs

| Service | URL | Keterangan |
|---------|-----|------------|
| Frontend | http://localhost:3000 | Next.js App Router |
| Backend API | http://localhost:8000/api/v1 | Laravel REST API |
| Backend (Laravel) | http://localhost:8000 | Root app |
| Mailpit UI | http://localhost:8025 | Preview email di development |
| Meilisearch | http://localhost:7700 | Search engine + dashboard |
| PostgreSQL | localhost:5432 | DB: `greeva`, user: `greeva`, pass: `secret` |
| Redis | localhost:6379 | Tidak ada password di development |

---

## Perintah Database

```bash
# Jalankan semua migrasi pending
php artisan migrate

# Reset database dan jalankan ulang semua migrasi + seeder
# PERHATIAN: Hanya gunakan di development
php artisan migrate:fresh --seed

# Buat migration baru
php artisan make:migration add_x_to_y_table

# Lihat status migrasi
php artisan migrate:status

# Rollback migrasi terakhir
php artisan migrate:rollback
```

---

## Perintah Testing

### Backend

```bash
cd backend

# Jalankan semua test
php artisan test
# atau
./vendor/bin/pest

# Jalankan test tertentu
php artisan test --filter=MoneyTest
php artisan test --filter=CheckoutServiceTest

# Test dengan coverage
./vendor/bin/pest --coverage

# Analisis static (PHPStan)
./vendor/bin/phpstan analyse

# Format kode
./vendor/bin/pint
```

### Frontend

```bash
cd frontend

# Unit test (Vitest)
pnpm test

# Unit test + watch mode
pnpm test --watch

# E2E test (Playwright)
pnpm test:e2e

# Type checking
pnpm type-check

# Lint
pnpm lint

# Format kode
pnpm format
```

---

## Troubleshooting

### `SQLSTATE[08006] connection refused` (PostgreSQL)

PostgreSQL container belum siap. Cek status:

```bash
docker-compose ps
docker-compose logs postgres
```

Tunggu hingga health check `healthy`, lalu coba lagi.

### `Connection refused` (Redis)

```bash
docker-compose restart redis
docker-compose logs redis
```

### `Meilisearch connection error`

```bash
docker-compose restart meilisearch
# Cek dashboard di http://localhost:7700
```

### Mailpit tidak menerima email

Pastikan `MAIL_HOST=127.0.0.1` dan `MAIL_PORT=1025` di `backend/.env`. Cek port tidak dipakai proses lain:

```bash
# Linux/Mac
lsof -i :1025

# Windows
netstat -ano | findstr :1025
```

### `php artisan migrate` error saat pertama kali

Pastikan user PostgreSQL `greeva` sudah punya akses ke database `greeva`:

```sql
-- Di psql sebagai superuser
CREATE USER greeva WITH PASSWORD 'secret';
CREATE DATABASE greeva OWNER greeva;
GRANT ALL PRIVILEGES ON DATABASE greeva TO greeva;
```

Dengan Docker, ini sudah otomatis dari environment variable di `docker-compose.yml`.

### `pnpm: command not found`

```bash
npm install -g pnpm
```

### Error `Cannot find module 'next'`

```bash
cd frontend && pnpm install
```

---

## Rekomendasi IDE

### VS Code

Extension yang direkomendasikan (buat `.vscode/extensions.json`):

- `dbaeumer.vscode-eslint` — ESLint
- `esbenp.prettier-vscode` — Prettier
- `bradlc.vscode-tailwindcss` — Tailwind CSS IntelliSense
- `ms-vscode.vscode-typescript-next` — TypeScript
- `bmewburn.vscode-intelephense-client` — PHP Intelephense
- `onecentlin.laravel-extension-pack` — Laravel pack

Setting yang direkomendasikan:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[php]": {
    "editor.defaultFormatter": "bmewburn.vscode-intelephense-client"
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### PhpStorm / WebStorm

- Aktifkan PHP 8.3 interpreter
- Setup Prettier sebagai formatter default untuk `.ts`, `.tsx`
- Install plugin: Laravel, Tailwind CSS, Prettier

---

## Variabel Environment Penting

Lihat:
- `backend/.env.example` untuk konfigurasi Laravel lengkap
- `frontend/.env.example` untuk konfigurasi Next.js

Untuk mendapatkan API key external:
- **Midtrans:** https://dashboard.midtrans.com (gunakan Sandbox untuk dev)
- **Cloudinary:** https://console.cloudinary.com
- **Meilisearch:** Generate master key dengan `./meilisearch --generate-master-key`
