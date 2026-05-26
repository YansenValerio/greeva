# Greeva — Design References & Layout Inspiration

**Versi:** 1.0
**Tanggal:** 8 Mei 2026
**Tujuan:** Acuan visual & layout untuk implementasi UI Greeva

---

## 1. Inspirasi Utama

Greeva mengambil inspirasi dari **3 brand**:

### 1.1 Starbucks (sudah di CLAUDE.md)
- **Diambil:** Calm confidence, layered green palette, pill-shaped CTA, voice dual-mode
- **Tidak diambil:** Coffee-specific aesthetic

### 1.2 Vitra (vitra.com) — **NEW**
- **Diambil:** Editorial hero, generous whitespace, product category grid besar, story-driven sections
- **Vibe:** Sophisticated, premium, design-conscious

### 1.3 Bite (bitetoothpastebits.com) — **NEW**
- **Diambil:** Sustainability storytelling, benefit grid dengan icons, social proof prominent, pill category tabs
- **Vibe:** Natural, earthy, transparent, friendly

---

## 2. Visual DNA — Sintesis 3 Brand

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  STARBUCKS         VITRA            BITE                 │
│  ─────────         ─────            ────                 │
│  Calm confidence   Editorial        Sustainability       │
│  Layered greens    White space      Earthy warmth        │
│  Craft pride       Premium feel     Friendly tone        │
│                                                          │
│              ↓ DISTILL TO ↓                              │
│                                                          │
│              GREEVA DESIGN LANGUAGE                      │
│              ─────────────────────                       │
│              • Editorial hero dengan green palette       │
│              • Whitespace generous                       │
│              • Story-driven sections (Notic, Reperca)    │
│              • Pill-shaped tabs & CTA                    │
│              • Benefit icons sustainability              │
│              • Social proof prominent                    │
│              • Bahasa Indonesia + warm tone              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Homepage Layout (Reference: Vitra + Bite)

### 3.1 Wireframe Sections (top to bottom)

```
┌──────────────────────────────────────────────────────────┐
│ [logo Greeva]    [Shop] [Mitra] [Cerita] [About]  [🔍][👤][🛒] │ ← Navbar
├──────────────────────────────────────────────────────────┤
│                                                           │
│                                                           │
│    [BESAR full-bleed image: lifestyle Notic gelang        │
│     atau tangan memegang Reperca tote di kafe]            │
│                                                           │
│    Brand hijau lokal yang layak didengar.                 │ ← Hero Editorial
│    Kurasi terbaik dari mitra ekonomi sirkular Indonesia.  │   (Vitra-style)
│                                                           │
│    [Jelajahi Koleksi]                                     │
│                                                           │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│                                                           │
│              "DARI MITRA TERPILIH"                        │ ← Strip section
│   [Notic logo] [Reperca logo] [Coming soon]               │   (small caps tracking)
│                                                           │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│                                                           │
│                  Belanja per Kategori                     │ ← Category Grid 2x2
│                                                           │   (Vitra-style)
│   ┌──────────────────┐    ┌──────────────────┐           │
│   │                   │    │                   │           │
│   │   Aksesoris       │    │   Tas & Pouch     │           │
│   │   [foto besar]    │    │   [foto besar]    │           │
│   │                   │    │                   │           │
│   └──────────────────┘    └──────────────────┘           │
│                                                           │
│   ┌──────────────────┐    ┌──────────────────┐           │
│   │   Home Living     │    │   Untuk Kantor    │           │
│   │   [foto besar]    │    │   [foto besar]    │           │
│   └──────────────────┘    └──────────────────┘           │
│                                                           │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│                                                           │
│              Produk Pilihan Minggu Ini                    │ ← Featured Products
│                                                           │   (4-col grid)
│   [card] [card] [card] [card]                             │
│                                                           │
│              [Lihat Semua Produk →]                       │
│                                                           │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ [bg sand-warm]                                            │
│                                                           │
│              Mengapa Greeva?                              │ ← Benefit Grid
│                                                           │   (Bite-style)
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│   │   🌱    │  │   🤝    │  │   ✨    │  │   📦    │    │
│   │ Kurasi  │  │ Mitra   │  │ Cerita  │  │ Aman   │    │
│   │ ketat   │  │ terjamin│  │ jujur   │  │ dikemas│    │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
│                                                           │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ [bg deep-emerald, white text]                             │
│                                                           │
│   2,500+ kg          12 mitra            10,000+         │ ← Impact Strip
│   plastik diolah     terkurasi           pelanggan        │   (counter style)
│                                                           │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│                                                           │
│    [foto besar mitra Notic]   Cerita di balik Notic.     │ ← Story Section
│                                Setiap manik HDPE punya    │   (split 50/50)
│                                cerita panjang...          │   (Vitra-style)
│                                [Baca selengkapnya →]      │
│                                                           │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│                                                           │
│   Cerita di balik Reperca.    [foto besar mitra Reperca] │ ← Story Section
│   Sisa konveksi yang dulu...                              │   (alternating)
│   [Baca selengkapnya →]                                   │
│                                                           │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│                                                           │
│              Apa kata pelanggan kami?                     │ ← Social Proof
│                                                           │   (Bite-style)
│   ⭐⭐⭐⭐⭐                                                  │
│   "Material kuat, tasnya bisa muat banyak."              │
│   — Sari W.                                               │
│                                                           │
│   [3 testimonial cards]                                   │
│                                                           │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ [bg mint-light]                                           │
│                                                           │
│              Anda brand hijau juga?                       │ ← Partner CTA
│              Mari berkolaborasi dengan Greeva.            │
│                                                           │
│              [Daftar sebagai Mitra]                       │
│                                                           │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│                                                           │
│              Ikuti @greeva.id                             │ ← Instagram Feed
│   [foto] [foto] [foto] [foto] [foto] [foto]              │   (Bite-style)
│                                                           │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ [bg white]                                                │
│                                                           │
│   Greeva                                                  │ ← Footer
│   Sustainable brands deserve better marketing.            │   (Vitra-style minimal)
│                                                           │
│   PRODUK         MITRA         TENTANG       BANTUAN     │
│   • Semua        • Notic       • Cerita kami • FAQ       │
│   • Aksesoris    • Reperca     • Misi        • Kontak    │
│   • Tas          • Daftar      • Dampak      • WA        │
│                                                           │
│   Newsletter: [email____________] [Berlangganan]         │
│                                                           │
│   [IG] [TikTok] [YouTube]              © 2026 Greeva.    │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Section Breakdown Detail

#### Hero (Vitra-inspired)
- **Full-bleed background image** (1440px wide, 600-700px tall desktop)
- **Image content:** Lifestyle photo, BUKAN packshot. Contoh:
  - Tangan memegang gelang Notic di kafe natural light
  - Tote Reperca di bahu dengan latar urban hangat
  - Coaster Notic di meja kayu dengan kopi
- **Text overlay:** Centered atau bottom-left
- **Typography:**
  - Headline: 56-72px, weight 700, line-height 1.05
  - Subheadline: 18-20px, weight 400, opacity 0.9
- **CTA:** Pill button "Jelajahi Koleksi" — outline atau solid white
- **Tone:** Editorial, BUKAN salesy. Hindari "BIG SALE" atau "FLASH DEAL"

**Contoh copy:**
```
Brand hijau lokal yang layak didengar.
Kurasi terbaik dari mitra ekonomi sirkular Indonesia.
[Jelajahi Koleksi →]
```

#### Partner Strip (Bite-inspired "AS SEEN IN")
- **Background:** white atau sand-warm
- **Label:** "DARI MITRA TERPILIH" — uppercase, tracking 0.1em, font-size 12px, color forest-dark
- **Logo grid:** 3-5 logo berurutan, height 32-40px, opacity 0.7 default → 1.0 on hover
- **Padding vertical:** 48px

#### Category Grid (Vitra-inspired)
- **Layout:** 2x2 grid desktop, 1 column mobile
- **Card aspect ratio:** 4:3 atau 3:2 (landscape, BUKAN square)
- **Image:** Editorial style, BUKAN packshot. Contoh "Aksesoris" pakai foto orang memakai gelang di kafe.
- **Text:** Di bawah image (BUKAN overlay) untuk readability
- **Typography:**
  - Category name: 24px, weight 600
  - Subtitle: 16px, weight 400, color text-body
- **Hover:** Image slight zoom (scale 1.03), text underline

#### Featured Products (Standard e-commerce)
- **Layout:** 4-col desktop, 2-col mobile
- **Card minimal** (Bite-style):
  - Image square 1:1 dengan padding mint-light bg
  - Product name di bawah, 16px weight 500
  - Partner badge ("by Notic") 12px tracking
  - Price 16px weight 600
  - Rating stars optional
- **No "Add to Cart" button di card** — user klik card untuk PDP

#### Benefit Grid (Bite-inspired "Why Bits are Better")
- **Layout:** 4-column icon grid
- **Background:** sand-warm `#F5F0E8`
- **Each item:**
  - Icon 48px (lucide-react: Sparkles, HandHeart, FileCheck, Package)
  - Title 18px weight 600
  - Description 14px line-height 1.5
- **Padding section:** 80px vertical

**4 Greeva benefits:**
1. **Kurasi Ketat** — Setiap mitra melalui review mendalam material & proses produksi.
2. **Mitra Terjamin** — Bagi hasil 80%+ untuk mitra. Transparan, tanpa biaya tersembunyi.
3. **Cerita Jujur** — Setiap produk punya cerita asal-usul material yang verifiable.
4. **Aman Dikemas** — Eco-packaging, asuransi pengiriman, garansi tukar rusak.

#### Impact Strip (Greeva original)
- **Background:** deep-emerald `#006242`
- **Text:** white
- **Layout:** 3 stat columns
- **Typography:**
  - Number: 48-64px, weight 700, font-feature-settings tabular-nums
  - Label: 14px, uppercase, tracking 0.1em, opacity 0.8
- **Animation:** Counter increment on scroll into view

#### Story Sections (Vitra-inspired alternating)
- **Layout:** 50/50 split image + text, alternating left/right
- **Image:** Editorial portrait/lifestyle dari mitra (orang sedang membuat produk)
- **Text side:**
  - Tagline kecil: "MITRA SEJAK 2024" — caps tracking
  - Headline: 32-40px weight 600
  - Body: 16-18px line-height 1.7, max-width 480px
  - CTA link: "Baca selengkapnya →" dengan underline animation
- **Padding:** 80px vertical, 64px gap antara image-text

#### Social Proof (Bite-inspired)
- **Layout:** 3-card horizontal grid
- **Card:**
  - Background: white dengan border 1px mint-light
  - Border-radius: 16px
  - Padding: 24px
  - Stars di top: 5x leaf-green
  - Quote: 16px italic
  - Attribution: 14px weight 600 + foto bulat 32px

#### Partner CTA (Bite-inspired bottom CTA)
- **Background:** mint-light `#D1FAE5`
- **Text alignment:** center
- **Headline:** 32-40px weight 600 forest-dark
- **CTA:** Pill button forest, "Daftar sebagai Mitra"

#### Instagram Feed (Bite-inspired)
- **Title:** "Ikuti @greeva.id" centered
- **Grid:** 6 image (3-col mobile, 6-col desktop)
- **Aspect:** square
- **Hover:** show like/comment count overlay

#### Footer (Vitra-inspired minimal)
- **Background:** white atau very light gray
- **Top section:**
  - Logo Greeva left
  - Tagline: "Sustainable brands deserve better marketing."
- **Mid section:** 4-column nav links
- **Newsletter signup:** inline input + button
- **Bottom:** Social icons + copyright + payment methods icon
- **Padding:** 64px top, 32px bottom

---

## 4. Component Specifications (dari Referensi)

### 4.1 Button Variants

```
PRIMARY CTA (Vitra-style)
┌─────────────────────┐
│  Jelajahi Koleksi   │  ← bg: white, border: 1px white, text: forest-dark
└─────────────────────┘     padding: 14px 32px, border-radius: full
                            (untuk hero di atas image)

PRIMARY CTA (Standard)
┌─────────────────────┐
│  Tambah ke Keranjang│  ← bg: forest, text: white, weight 600
└─────────────────────┘     padding: 14px 32px, border-radius: full

SECONDARY (Bite-style)
┌─────────────────────┐
│  Lihat Detail       │  ← bg: transparent, border: 1.5px forest-dark
└─────────────────────┘     text: forest-dark, padding: 12px 24px

PILL TAB ACTIVE (Bite-style)
┌──────────────┐
│ Best Sellers │  ← bg: forest-dark, text: white, padding: 10px 20px
└──────────────┘

PILL TAB INACTIVE
┌──────────────┐
│  Body Care   │  ← bg: white, border: 1.5px gray-200, text: forest-dark
└──────────────┘

LINK (Vitra-style)
Baca selengkapnya →   ← text: forest-dark, underline animated
                         hover: text-decoration-thickness 2px
```

### 4.2 Product Card (Bite-style minimal)

```
┌─────────────────────┐
│                     │
│                     │
│      [PRODUCT       │  ← bg: mint-light atau white
│       IMAGE]        │     padding: 24px, image fills
│                     │
│                     │
└─────────────────────┘
NOTIC                    ← partner badge: 11px uppercase tracking
Gelang Wave Coral
Rp 85.000               ← 16px weight 600
⭐ 4.8 (24 reviews)      ← optional
```

### 4.3 Story Section Layout

```
┌──────────────────┬──────────────────┐
│                  │                   │
│                  │  MITRA SEJAK 2024 │
│   [Editorial     │                   │
│    photo of      │  Cerita di balik  │
│    Notic         │  Notic.           │
│    artisan]      │                   │
│                  │  Setiap manik...  │
│                  │  [body text]      │
│                  │                   │
│                  │  Baca selengkapnya│
│                  │  →                │
│                  │                   │
└──────────────────┴──────────────────┘
50%                 50%
```

---

## 5. Color Application Guide

```
Hero section background:
  Default: full-bleed photo
  Overlay: linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)
  Text: white

Section "Mengapa Greeva":
  Background: sand-warm #F5F0E8
  Icons: forest-dark
  Headlines: black
  Body: text-body

Section "Impact Strip":
  Background: deep-emerald #006242
  Numbers: white, weight 700
  Labels: white opacity 0.8

Section "Partner CTA":
  Background: mint-light #D1FAE5
  Headline: forest-dark
  CTA button: forest (solid)

Footer:
  Background: white
  Links: text-body
  Hover: starbucks-green
```

---

## 6. Typography Hierarchy (Per Section)

```
HERO HEADLINE
  Font: Inter
  Size: clamp(40px, 5vw, 72px)
  Weight: 700
  Line-height: 1.05
  Tracking: -0.02em
  Color: white

SECTION HEADLINE
  Size: clamp(32px, 4vw, 48px)
  Weight: 600
  Line-height: 1.15
  Tracking: -0.01em
  Color: black

EYEBROW (small caps tracking)
  Size: 12-14px
  Weight: 600
  Tracking: 0.12em
  Text-transform: uppercase
  Color: forest-dark

BODY LARGE
  Size: 18px
  Line-height: 1.7
  Color: text-body
  Max-width: 65ch

PRODUCT NAME
  Size: 16px
  Weight: 500
  Color: black

PARTNER BADGE
  Size: 11px
  Weight: 600
  Tracking: 0.1em
  Text-transform: uppercase
  Color: forest-dark

PRICE
  Size: 16-18px
  Weight: 600
  Color: black
  Font-feature-settings: 'tnum' (tabular-nums)
```

---

## 7. Spacing System

```
Section vertical padding:
  Mobile: 48px
  Tablet: 64px
  Desktop: 80-96px

Container max-width: 1280px
Container horizontal padding:
  Mobile: 16px
  Tablet: 24px
  Desktop: 32px

Grid gap:
  Tight: 16px (product cards mobile)
  Standard: 24px (product cards desktop)
  Generous: 48-64px (story sections)

Component internal padding:
  Card: 16-24px
  Button: 14px 32px
  Pill tab: 10px 20px
```

---

## 8. Image Treatment Guidelines

### 8.1 Photography Direction

**ALWAYS:**
- ✅ Natural lighting, golden hour preferred
- ✅ Lifestyle context (orang menggunakan, BUKAN floating produk)
- ✅ Real environment (kafe, rumah, kantor) BUKAN studio putih
- ✅ Indonesian setting/feel — kontras dengan stock photo Western
- ✅ Hands & gestures (tangan memegang, memakai, menggunakan)

**NEVER:**
- ❌ Pure white background packshot untuk hero/category
- ❌ Over-saturated colors
- ❌ Heavy shadows or vignettes
- ❌ Text overlay yang ganggu image
- ❌ Stock photo Western yang tidak relate

### 8.2 Cloudinary Transformations

```
Hero (full-bleed):
  c_fill,w_1920,h_1080,q_auto:good,f_auto

Category card:
  c_fill,w_800,h_600,q_auto:good,f_auto

Product card:
  c_fill,w_600,h_600,q_auto:good,f_auto
  (square dengan bg mint-light)

Story section:
  c_fill,w_900,h_1100,q_auto:good,f_auto
  (portrait orientation)

Instagram grid:
  c_fill,w_400,h_400,q_auto,f_auto
```

---

## 9. Animation & Micro-interactions

### 9.1 Page Load
- Hero text: fade-in + slide-up 0.6s ease-out
- Hero image: subtle zoom 1.0 → 1.05 over 8s

### 9.2 On Scroll
- Sections: fade-in 0.4s when entering viewport
- Counter (impact strip): count-up animation 1.5s
- Story image: slight parallax (0.85x scroll speed)

### 9.3 Hover States
- Buttons: bg darken + scale 1.02
- Product card: image zoom 1.03, shadow lift
- Category card: image zoom 1.03, text underline grow
- Links: underline text-decoration-thickness 1px → 2px

### 9.4 Transitions
- Standard: 200ms cubic-bezier(0.4, 0, 0.2, 1)
- Page transition: 300ms fade
- Cart drawer: 300ms slide-in from right

---

## 10. Mobile Adaptations

### 10.1 Hero
- Image still full-bleed but height 70vh (not 100vh)
- Text smaller: 36px headline, 16px sub
- CTA full-width with margin

### 10.2 Category Grid
- Stack to 1 column
- Maintain aspect ratio
- Add "Lihat Kategori →" link below each

### 10.3 Story Section
- Stack image on top, text below
- Image 16:9 ratio
- Reduce padding to 48px

### 10.4 Footer
- Accordion-style untuk nav columns
- Newsletter di top sebelum nav

---

## 11. Anti-Patterns (Yang Harus Dihindari)

❌ **Carousel/slider auto-rotate** — distract, lower conversion
❌ **Pop-up modal di first visit** — kecuali essential (cookie consent)
❌ **Banner promo flash** — Greeva BUKAN tukang diskon, identitas premium
❌ **Animated GIF/video di hero** — slow, distract dari brand voice
❌ **Stock photo generic** — kill brand authenticity
❌ **Over-decorated card** — shadow heavy, multiple borders, gradient flashy
❌ **Excessive emoji di copy** — bisa di WA notif, tapi UI utama clean
❌ **Color outside palette** — orange, red, kecuali untuk error state

---

## 12. Implementation Priority

Saat implementasi homepage, ikuti urutan ini:

1. **Hero section** (P0 — most visible)
2. **Partner strip** (P0 — credibility)
3. **Featured products grid** (P0 — conversion)
4. **Category grid** (P1)
5. **Benefit grid "Mengapa Greeva"** (P1)
6. **Impact strip** (P1)
7. **Story sections** (P2)
8. **Social proof** (P2)
9. **Partner CTA** (P2)
10. **Instagram feed** (P3 — nice to have)
11. **Footer** (P0 — wajib di awal)

---

## Status

Dokumen ini menjadi acuan **wajib** untuk semua implementasi UI di Greeva.
Setiap deviasi dari guideline ini harus didiskusikan dengan tech lead.

Konsistensi visual = konsistensi brand = trust mitra & buyer.
