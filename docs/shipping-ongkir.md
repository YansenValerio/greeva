# Ongkir / Pengiriman — Greeva

Dokumentasi fitur kalkulasi ongkos kirim (improvement #16). Mendukung dua mode:
**mock** (default dev, tanpa API eksternal) dan **Biteship** (API nyata).

---

## 1. Arsitektur

- `config/shipping.php` — konfigurasi provider, origin (gudang Greeva), tarif mock, kredensial Biteship.
- `app/Services/Shipping/ShippingService.php` — memilih provider aktif, menghitung berat total dari isi cart, dan mencocokkan tarif terpilih (`resolveRate`).
- `app/Services/Shipping/Providers/`
  - `MockShippingProvider.php` — tarif lokal berbasis berat (kg), dalam SEN.
  - `BiteshipShippingProvider.php` — memanggil `POST /v1/rates/couriers` Biteship pakai kode pos asal & tujuan.
- `POST /api/v1/shipping/rates` — endpoint untuk frontend mengambil opsi kurir dari isi keranjang.
- Checkout (`CheckoutService`) menghitung **ulang ongkir di server** (harga tidak pernah dipercaya dari client) lalu disimpan sebagai snapshot di `orders.shipping_total`, `orders.shipping_courier`, `orders.shipping_service`.

**Fallback otomatis:** jika `SHIPPING_PROVIDER=biteship` tapi `BITESHIP_API_KEY` kosong, `ShippingService` otomatis memakai mock.

---

## 2. Konfigurasi `.env`

```env
# Mode: "mock" (default dev) atau "biteship"
SHIPPING_PROVIDER=mock

# Titik asal pengiriman (gudang Greeva) — ganti ke data sebenarnya
SHIPPING_ORIGIN_CITY=Bandung
SHIPPING_ORIGIN_POSTAL_CODE=40111

# Biteship (kosongkan untuk pakai mock)
BITESHIP_API_KEY=
BITESHIP_BASE_URL=https://api.biteship.com
BITESHIP_COURIERS=jne,jnt,sicepat,anteraja
```

Setelah mengubah `.env`, jalankan `php artisan config:clear`.

---

## 3. Cara mendapatkan Biteship API Key

1. Daftar akun di **https://biteship.com** (dashboard).
2. Di dashboard: **Integrasi → Pengaturan → Tambah Kunci API**.
3. Beri nama key → sistem generate **dan menampilkannya sekali saja** — langsung salin & simpan.
4. Jenis key:
   - **Test key** (`biteship_test.`) — aktifkan toggle **Mode Testing** di sidebar lalu buat key.
   - **Live key** (`biteship_live.`) — untuk produksi. Order API perlu pengajuan aktivasi terpisah.
5. Header autentikasi: `authorization: <API_KEY>` (dipakai langsung tanpa prefix `Bearer`). Sudah sesuai di `BiteshipShippingProvider`.

### Tes cepat key (tanpa lewat app)

```bash
curl -s https://api.biteship.com/v1/rates/couriers \
  -H "authorization: biteship_test.xxxxxxxx" \
  -H "content-type: application/json" \
  -d '{"origin_postal_code":40111,"destination_postal_code":12190,"couriers":"jne,jnt,sicepat","items":[{"name":"Test","quantity":1,"weight":1000,"value":100000}]}'
```

Sukses bila respons berisi array `pricing` (opsi kurir + `price` dalam rupiah).

---

## 4. ⚠️ Catatan penting: Rates API butuh saldo

Hasil tes (2026-05-27): key valid (autentikasi lolos), **tetapi** Biteship menolak dengan:

```json
{ "success": false, "error": "No sufficient balance to call rates API. Please top up your balance" }
```

Menurut dokumentasi Biteship, **Maps, Rates, dan Tracking dihitung sebagai paid usage — bahkan di sandbox/Mode Testing**. Jadi:

- **Rates API membutuhkan saldo akun**, sekalipun pakai test key.
- Solusi: **top up saldo** di dashboard (nominal kecil cukup untuk tes), atau **hubungi support Biteship** (jam 09:00–18:00) untuk minta kuota sandbox gratis.
- Sampai akun di-top-up, biarkan `SHIPPING_PROVIDER=mock` agar app tetap jalan tanpa biaya.

Referensi:
- https://biteship.com/en/docs/api/authentication
- https://biteship.com/en/docs/getting-started
- https://biteship.com/en/docs/sandbox

---

## 5. Keamanan kredensial

- **JANGAN** commit API key ke repo atau menempelkannya di chat/issue. Simpan hanya di `.env` (sudah di-gitignore).
- Jika key pernah terekspos (mis. terkirim di chat), **regenerate / hapus** key tersebut di dashboard Biteship — terutama **live key**, karena bisa membuat transaksi nyata & menarik saldo.

---

## 6. Status & langkah berikutnya

- [x] Backend: ShippingService + provider mock + adapter Biteship + endpoint rates.
- [x] Checkout menghitung ulang ongkir server-side + snapshot ke order.
- [x] Frontend: pemilihan kurir di CheckoutForm + ringkasan biaya.
- [x] Test backend lolos (mock).
- [ ] **Top up saldo Biteship** lalu set `SHIPPING_PROVIDER=biteship` + `BITESHIP_API_KEY` di `.env` untuk tarif nyata.
- [ ] Tes interaktif UI checkout end-to-end (butuh Redis menyala untuk cart/auth).
