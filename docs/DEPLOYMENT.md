# Panduan Deployment — Greeva

Checklist menaikkan Greeva ke **staging/production**. Status kode saat ini: `next build`
dan `php artisan test` (142 lulus) hijau — yang tersisa murni penyiapan environment &
integrasi pihak ketiga.

> **Arsitektur**: backend Laravel 12 (PHP 8.3+) + frontend Next.js 14. Infra: PostgreSQL 15+,
> Redis 7+, Meilisearch, Cloudinary, Midtrans, WhatsApp (Fonnte). Uang selalu disimpan dalam **sen**.

---

## 0. Prasyarat server

- PHP 8.3+ dengan ekstensi: `pdo_pgsql`, `redis` (atau pakai `predis`), `mbstring`, `bcmath`, `intl`, `gd`/`imagick`
- Composer 2, Node.js 18+, pnpm 8+
- PostgreSQL 15+, Redis 7+, Meilisearch (binary/container)
- Web server (Nginx) + process manager (systemd/supervisor) untuk queue & scheduler

---

## 1. Backend — environment (`.env`)

Salin `backend/.env.example` → `.env`, lalu set untuk produksi:

```env
APP_NAME=Greeva
APP_ENV=production          # WAJIB diubah dari "local"
APP_DEBUG=false             # WAJIB false di produksi (jangan bocorkan stack trace)
APP_KEY=                    # isi via: php artisan key:generate
APP_URL=https://api.greeva.id
FRONTEND_URL=https://greeva.id
APP_LOCALE=id

# Database
DB_CONNECTION=pgsql
DB_HOST=...                 # host PostgreSQL produksi
DB_DATABASE=greeva
DB_USERNAME=...
DB_PASSWORD=...

# Cache / Queue / Session — Redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
REDIS_CLIENT=predis         # gunakan predis bila ekstensi phpredis tak terpasang
REDIS_HOST=...
REDIS_PASSWORD=...
REDIS_PORT=6379

# Sanctum / CORS — domain frontend produksi
SANCTUM_STATEFUL_DOMAINS=greeva.id

# Midtrans — GANTI ke kredensial production
MIDTRANS_SERVER_KEY=Mid-server-xxxx     # bukan SB-Mid-... (sandbox)
MIDTRANS_CLIENT_KEY=Mid-client-xxxx
MIDTRANS_IS_PRODUCTION=true

# Pengiriman — pakai provider nyata bila sudah siap
SHIPPING_PROVIDER=biteship              # "mock" hanya untuk dev
BITESHIP_API_KEY=...
SHIPPING_ORIGIN_CITY=...
SHIPPING_ORIGIN_POSTAL_CODE=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Meilisearch
MEILISEARCH_HOST=https://search.greeva.id
MEILISEARCH_KEY=...                      # master/api key produksi
SCOUT_DRIVER=meilisearch

# WhatsApp (Fonnte)
WHATSAPP_PROVIDER=fonnte
WHATSAPP_API_KEY=...

# Mail (SMTP produksi, bukan Mailpit)
MAIL_MAILER=smtp
MAIL_HOST=...
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="hello@greeva.id"
```

> ⚠️ **Jangan commit `.env`**. Jika `MIDTRANS_SERVER_KEY` kosong, sistem fallback ke
> *mock payment* (`GREEVA_MOCK_…`) — pastikan ini TIDAK terjadi di produksi.

### Langkah backend di server

```bash
cd backend
composer install --no-dev --optimize-autoloader
php artisan key:generate            # hanya jika APP_KEY masih kosong
php artisan migrate --force         # 7 migrasi baru (vouchers, returns, notifications, dll)
php artisan scout:sync-index-settings   # WAJIB — agar filter is_featured aktif di Meilisearch
php artisan config:cache
php artisan route:cache
php artisan event:cache
```

---

## 2. Queue worker & scheduler (WAJIB)

Tanpa keduanya: earning tidak matang, order tak kedaluwarsa otomatis, notifikasi/email tertunda.

**Scheduler** (cron) — tambahkan satu baris crontab:
```cron
* * * * * cd /path/greeva/backend && php artisan schedule:run >> /dev/null 2>&1
```
Job terjadwal yang aktif (`routes/console.php`): `greeva:expire-payments` (tiap 5 menit),
`greeva:mature-earnings` (per jam), `greeva:auto-complete-orders` (harian),
`sanctum:prune-expired` (harian).

**Queue worker** — jalankan sebagai service (systemd/supervisor):
```bash
php artisan queue:work --tries=3 --queue=default
```
Restart worker setiap deploy: `php artisan queue:restart`.

---

## 3. Frontend (Next.js)

`frontend/.env.local` produksi:
```env
NEXT_PUBLIC_API_URL=https://api.greeva.id/api/v1
NEXT_PUBLIC_APP_URL=https://greeva.id
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-xxxx
NEXT_PUBLIC_MIDTRANS_SNAP_URL=https://app.midtrans.com/snap/snap.js   # produksi (bukan sandbox)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_MEILISEARCH_HOST=https://search.greeva.id
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=...    # gunakan search-key, bukan master key
```

Build & jalankan:
```bash
cd frontend
pnpm install --frozen-lockfile
pnpm build
pnpm start        # atau via PM2/systemd; atau deploy ke Vercel
```

> Catatan: `APP_URL` frontend dipakai untuk `sitemap.xml` & `robots.txt`. Pastikan domain benar.

---

## 4. Integrasi pihak ketiga

| Layanan | Yang harus dilakukan |
|---|---|
| **Midtrans** | Set production key; daftarkan **Payment Notification URL** ke `https://api.greeva.id/api/v1/payment/webhook` di dashboard. Uji 1 transaksi nyata. |
| **Meilisearch** | Jalankan instance, set master key; `php artisan scout:import "App\Models\Product"` untuk index awal; `scout:sync-index-settings`. |
| **Cloudinary** | Isi kredensial; verifikasi upload gambar produk berhasil. |
| **Fonnte (WhatsApp)** | Isi API key; uji notifikasi order. |
| **Biteship** (opsional) | Jika `SHIPPING_PROVIDER=biteship`, isi API key & origin; jika kosong otomatis fallback ke mock. |

---

## 5. Smoke test pasca-deploy

- [ ] `GET /api/v1/products` mengembalikan data (DB & API hidup)
- [ ] Registrasi + login buyer → token Sanctum berfungsi
- [ ] Checkout → Snap Midtrans **produksi** muncul (bukan mock) → webhook mengubah order ke `paid`
- [ ] Voucher: buat di `/admin/vouchers`, terapkan di checkout, diskon muncul & ter-snapshot di order
- [ ] Pencarian produk (Meilisearch) jalan; filter produk "Pilihan" muncul di beranda
- [ ] Notifikasi in-app (lonceng) bertambah saat status order berubah
- [ ] Retur: buyer ajukan → admin approve → order `refunded` & earning ter-reverse
- [ ] Export laporan CSV di `/admin/reports` terunduh
- [ ] `php artisan schedule:list` menampilkan 4 job; queue worker aktif

---

## 6. Checklist rilis (ringkas)

- [ ] `.env` produksi terisi, `APP_ENV=production`, `APP_DEBUG=false`, `APP_KEY` ada
- [ ] `composer install --no-dev`, `migrate --force`, `scout:sync-index-settings`
- [ ] `config:cache` / `route:cache` / `event:cache`
- [ ] Queue worker + cron scheduler jalan sebagai service
- [ ] Midtrans production key + webhook terdaftar
- [ ] `frontend/.env.local` produksi + `pnpm build` sukses
- [ ] Backup DB & rencana rollback migrasi siap
- [ ] HTTPS aktif di domain api & frontend; CORS/Sanctum domain benar

---

## 7. Catatan rollback

- Migrasi sesi ini aditif (tabel/kolom baru) — relatif aman. `php artisan migrate:rollback`
  membatalkan batch terakhir, tapi **selalu backup DB dulu** dan jangan `migrate:fresh` di produksi.
- Setiap deploy: jalankan `php artisan queue:restart` agar worker memuat kode baru.
