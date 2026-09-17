PHASE: 8 (SEO, Landing/Marketing, Legal Pages & Analytics)
STATUS: COMPLETE
PEMILIK: CodeBuddy
ZONA: UI/Stlying + halaman statis baru (src/app/**) + docs/phases (sesuai roadmap §4)

================================================================================
OBJECTIVE
================================================================================
Menyiapkan aset peluncuran & kepatuhan legal: SEO teknis (robots/sitemap/metadata/
OG/structured data), halaman legal & bantuan, halaman sistem, serta analytics
ringan (GA4/Umami) yang opsional dan aman untuk lingkungan pilot.

================================================================================
FILE DIBUAT (BARU)
================================================================================
SEO core:
- src/lib/seo.ts                       (SSOT: SITE_URL, nama, deskripsi, keywords,
                                        absoluteUrl(), localBusinessJsonLd(),
                                        faqJsonLd(), breadcrumbJsonLd())
- src/app/robots.ts                    (robots.txt; blokir area privat)
- src/app/sitemap.ts                   (sitemap.xml; halaman publik + kategori + demo undangan)
- src/app/opengraph-image.tsx          (OG social card dinamis via next/og, edge runtime)

Komponen pendukung:
- src/components/seo/JsonLd.tsx        (penyuntik JSON-LD schema.org)
- src/components/analytics/Analytics.tsx (GA4 + Umami, opt-in via env)

Metadata per-halaman (layout.tsx tipis, tidak mengubah page.tsx):
- src/app/kategori/layout.tsx
- src/app/undangan/layout.tsx
- src/app/builder/layout.tsx

Halaman Legal:
- src/components/legal/LegalPageLayout.tsx  (layout bersama + breadcrumb JSON-LD)
- src/app/legal/privacy/page.tsx
- src/app/legal/terms/page.tsx
- src/app/legal/cookies/page.tsx
- src/app/legal/data-processing/page.tsx

Halaman Bantuan & Kontak:
- src/app/help/page.tsx                (FAQ + FAQPage JSON-LD, <details> accessible)
- src/app/contact/page.tsx             (kanal kontak WhatsApp/email, wilayah, jam operasional)

Halaman Sistem:
- src/app/unauthorized/page.tsx        (noindex)
- src/app/maintenance/page.tsx         (noindex)

Test:
- tests/seo.test.ts                    (5 test: SITE_URL, absoluteUrl, 3 JSON-LD builders)

================================================================================
FILE DIUBAH
================================================================================
- src/app/layout.tsx     (+metadataBase, title template, canonical, openGraph, twitter,
                           robots/googleBot, keywords; +<JsonLd> localBusiness; +<Analytics>)
- src/components/layout/Footer.tsx  (+nav tautan legal/help internal linking)
- next.config.ts         (CSP: +www.googletagmanager.com, analytics.umami.is, cloud.umami.is)
- .env.example           (+NEXT_PUBLIC_GA_MEASUREMENT_ID, NEXT_PUBLIC_UMAMI_WEBSITE_ID,
                           NEXT_PUBLIC_UMAMI_SRC; catatan canonical via NEXT_PUBLIC_BASE_URL)

================================================================================
ACTION/QUERY YANG DIPANGGIL
================================================================================
Tidak ada. Zero-dependency ke service layer / DB (sesuai roadmap: "Ketergantungan
NOL pada service layer — aman penuh paralel").

================================================================================
DATABASE CHANGES
================================================================================
Tidak ada.

================================================================================
TEST DITAMBAHKAN
================================================================================
- tests/seo.test.ts (5 test) → 5/5 pass

================================================================================
COMMAND DIJALANKAN
================================================================================
- npx tsc --noEmit              → EXIT 0 (0 error)
- npm run build                 → EXIT 0; 37 halaman ter-generate; route SEO terdaftar:
      ○ /robots.txt, ○ /sitemap.xml, ƒ /opengraph-image,
      ○ /help, ○ /contact, ○ /maintenance, ○ /unauthorized,
      ○ /legal/{privacy,terms,cookies,data-processing}
- npx tsx --test tests/*.test.ts → 126 tests, 126 pass, 0 fail (termasuk 5 test SEO baru)
- npx tsx --test tests/seo.test.ts → 5/5 pass

================================================================================
HASIL TEST/BUILD
================================================================================
SEMUA PASS. tsc 0 error, build exit 0, 126/126 test hijau.

================================================================================
PERMINTAAN KE CODEBUDDY / AGENT LAIN
================================================================================
Tidak ada permintaan service/action baru (Phase 8 sengaja zero-dependency).

Catatan untuk operator (bukan kode):
- Set NEXT_PUBLIC_BASE_URL ke domain produksi sebelum deploy agar canonical,
  sitemap, robots, dan OG card menghasilkan URL absolut yang benar.
- Analytics (GA4/Umami) OTOMATIS nonaktif bila env ID kosong → aman untuk pilot.
- CSP sudah mengizinkan domain GA & Umami; bila menambah vendor analytics lain,
  tambahkan hostname-nya ke script-src/connect-src di next.config.ts.

================================================================================
CATATAN REKONSILIASI
================================================================================
- Mematuhi Zona File (roadmap §4). Saya tidak menyentuh src/server/**, src/types/**,
  prisma/**, atau src/lib/{transaction-retry,date-utils,prisma,session}.ts.
- src/lib/seo.ts adalah file BARU (bukan file lib terlarang) — murni util SEO tanpa
  dependensi service/DB; diletakkan di src/lib/ agar konsisten dgn pola repo.
- Halaman klien ("use client") /, /kategori, /undangan, /builder tidak dapat
  mengekspor `metadata`; metadata ditambahkan via file layout.tsx baru (tanpa
  mengubah struktur page.tsx) untuk mematuhi batas "jangan ubah server component".
- Halaman legal dibuat sebagai server component statis (konten dinamis-safe).

================================================================================
NEXT STEP / BACKLOG PHASE 8 (opsional, tidak blocking)
================================================================================
- Landing page marketing tambahan (mis. /template-showcase marketing, studi kasus).
- OG image per-halaman (mis. per kategori/vendor) bila diperlukan.
- Cookie consent banner interaktif (saat ini hanya pemberitahuan statis).
- Integrasi analytics event spesifik (checkout_init, deal_closed) via dataLayer.
