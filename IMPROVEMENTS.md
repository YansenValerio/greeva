# Greeva — Improvement Backlog

Observasi & rekomendasi pengembangan setelah core feature complete (Step 1–16 selesai).
Dikelompokkan berdasarkan dampak terhadap user vs investasi yang dibutuhkan.

---

## High Impact, Effort Sedang

### 1. Cart Drawer / Mini Cart
CLAUDE.md menyebut cart drawer (Zustand), tapi implementasi sekarang langsung ke `/cart` page. Drawer slide-in dari kanan saat add-to-cart = friction lebih rendah, conversion lebih tinggi. Pattern yang sudah established di e-commerce modern.

### 2. Forgot Password & Email Verification ✅
Tabel `email_verified_at` sudah ada tapi tidak dipakai. Kalau user lupa password = stuck. Ini blocker serius untuk launch publik.

**Done:** custom Notification ID, `EmailVerificationToken` HMAC helper, 4 endpoints (forgot/reset/verify/resend), pages `/forgot-password`, `/reset-password`, `/verify-email`, banner di account, throttle 6/menit. Commit `4342421`.

### 3. Order Cancellation oleh Buyer ✅
Backend `Order::canBeCancelled()` sudah ada (`pending_payment`, `paid`, `packing`), tapi UI buyer tidak punya tombol. Saat ini buyer harus contact admin manual.

**Done:** `POST /orders/{orderNumber}/cancel`, `OrderPolicy::cancel` (sudah ada), `OrderResource.can_be_cancelled` flag, inline form di order detail dengan reason opsional + warning kontekstual refund. Commit `1a1d60f`.

### 4. Order Status Timeline (Visual) ✅
Sekarang buyer cuma lihat status badge. Visual stepper (paid → packing → shipped → delivered → completed) dengan tanggal di setiap step = trust signal kuat dan kurangi pertanyaan "pesanan saya di mana".

**Done:** komponen `<OrderTimeline />` dengan 6 step happy path + card terminal khusus untuk cancelled/payment_failed/refunded, current step ada ring leaf + badge "SEKARANG". Commit `4342421`.

### 5. Toast Notification System ✅
Saat ini banyak inline error/success messages yang tidak konsisten. Setiap halaman bikin sendiri. Library kecil seperti `sonner` atau `react-hot-toast` plus 1 hook `useToast` = UX lebih polished.

**Done:** in-house tanpa dependency baru — `toast.store` (Zustand), `<Toaster />` mounted di root layout, API `toast.success/error/info(msg, opts?)`, auto-dismiss timer per toast. Commit `328cbc7`.

### 6. Saved Addresses (Address Book) ✅
Buyer harus isi alamat dari nol setiap checkout. Tabel `addresses` + UI di `/account/addresses` + pilih saat checkout = reduce friction signifikan.

**Done:** migration + Address model + Policy + 5 endpoints (CRUD + setDefault), page `/account/addresses` dengan card grid + inline form, dropdown selector di CheckoutForm auto-pilih default + auto-isi form. Commit `736feec`.

---

## Tampilan / UX Polish

### 7. Empty States Konsisten
Sekarang setiap "list kosong" beda style — beberapa pakai icon, beberapa cuma text. Bikin komponen `<EmptyState icon label description action />` reusable.

### 8. Confirmation Modal Reusable ✅
Banyak pakai `confirm()` native browser ("Hapus kategori X?"). Tampilan jelek di mobile, tidak match brand. Bikin `<ConfirmDialog />` pakai Shadcn dialog.

**Done:** `confirm.store` + `<ConfirmDialog />` modal centered, API imperatif `await confirm({title, message, danger})`, refactor 6 call site (`admin/categories`, `admin/payouts` ×2, `account/addresses`, `partner/products`, `VariantManager`) — zero `window.confirm()` / `alert()` tersisa. Commit `328cbc7`.

### 9. Loading Skeleton Konsisten
Ada di beberapa halaman, missing di yang lain. Bikin set `<ProductCardSkeleton />`, `<OrderRowSkeleton />`, `<TableSkeleton />` standardized.

### 10. Pagination Component Real
Saat ini cuma "Halaman 1 dari 5" — tidak ada navigation. Bikin `<Pagination />` dengan prev/next + jump-to-page + URL-synced.

### 11. Mobile Responsiveness Audit
Beberapa halaman admin/partner dashboard belum sepenuhnya mobile-friendly. Sidebar fixed di desktop tapi mobile harus ada hamburger. Tabel admin akan overflow di mobile.

### 12. Product Image Zoom & Carousel
PDP image gallery dasar. Tambah click-to-zoom (lightbox) + swipe support mobile = standar e-commerce.

---

## Fitur Marketing / Conversion

### 13. Wishlist
Tabel `wishlists(user_id, product_id)`, heart icon di ProductCard, `/account/wishlist` page. Standar e-commerce, retention booster.

### 14. Voucher / Promo Code
Skema discount tidak ada. Untuk launch campaign awal, "GREEVA10" diskon 10% = strategi marketing standar. Tabel `vouchers` + apply di checkout.

### 15. Related Products / Recently Viewed
Di PDP, tampilkan "Produk Serupa" (sama kategori atau partner) + "Pernah Dilihat" (dari localStorage). Cross-sell efektif.

### 16. Ongkir Kalkulasi Beneran
Sekarang `shipping_total = 0` (free). Integrasi RajaOngkir/Biteship API berdasarkan alamat tujuan + berat produk = mandatory sebelum scale.

### 17. Stock Alert Subscription
"Beritahu saya saat stok kembali" untuk produk habis. Email/WA notification saat partner restock.

---

## Partner Dashboard

### 18. Partner Shipment Tools
Sekarang admin yang input resi. Partner sebenarnya yang mengirim, harusnya mereka yang input — bukan admin. Refactor: partner lihat order yang ada produknya, input resi sendiri, admin tinggal monitoring.

### 19. Partner Analytics Dashboard
Dashboard partner sekarang cuma earning summary. Tambah: top produk, conversion rate, traffic ke produk mereka, trend bulanan = nilai jual platform.

### 20. Partner Inventory History
Perubahan stok tidak ada log. Partner perlu tahu "kapan stok varian X drop dari 10 ke 3" untuk forecasting.

---

## Infrastructure & Quality

### 21. OpenAPI Spec + Auto-generated Client
Sekarang types frontend di-maintain manual. Generate via `php artisan scribe` atau l5-swagger → openapi-typescript = sumber truth tunggal.

### 22. Test Coverage untuk Fitur Baru
Review, shipment, guest cart, account page = nyaris tidak ada test. Backend Feature test untuk happy path masing-masing = essential sebelum production.

### 23. Error Tracking (Sentry)
Tidak ada observability ke production error. Sentry free tier cukup untuk MVP.

### 24. SEO: Sitemap + JSON-LD
`next-sitemap` generate sitemap.xml. Tambah JSON-LD `Product` schema di PDP = trust signal Google + rich snippet di SERP. Penting untuk acquisition organik.

### 25. Performance: Image lazy loading + LCP optimization
Hero image di landing pakai Next Image priority? Audit Lighthouse score → identify quick wins.

---

## Admin Tools

### 26. Dashboard Beneran (KPI Cards + Charts)
Admin dashboard sekarang basic. Tambah: revenue bulan ini vs bulan lalu, top mitra, top kategori, pending payouts, low stock alerts. Pakai `recharts` atau `tremor`.

### 27. Bulk Operations
Approve 10 produk sekaligus, bulk status update, bulk message ke buyer. Hemat waktu admin saat scale.

### 28. Audit Log Viewer
Tabel `audit_logs` sudah diisi tapi belum ada UI admin untuk browse history. Penting untuk dispute resolution dengan mitra.

### 29. Invoice PDF Generation
Buyer butuh invoice fisik untuk reimbursement kantor. `barryvdh/laravel-dompdf` generate PDF dari blade template.

---

## Top 5 Prioritas (Subjective)

Kalau jadi tech lead dengan timeline ketat:

1. ✅ **Forgot Password + Email Verification** (#2) — blocker launch
2. ✅ **Order Cancellation + Status Timeline** (#3, #4) — UX critical untuk trust
3. ✅ **Toast System + Confirmation Modal** (#5, #8) — quality multiplier di seluruh app
4. ✅ **Saved Addresses** (#6) — friction reducer terbesar di checkout
5. ⏳ **Partner Shipment Tools** (#18) — fix arsitektur "admin input resi" yang aneh

Top 5 sebagian besar sudah selesai. Tinggal #18 (Partner Shipment Tools) + 24 item lain di list utama yang bisa nyusul saat ada traffic dan feedback nyata.
