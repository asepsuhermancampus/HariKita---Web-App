PHASE: 7 (Design System Finalization, UI Polish & Accessibility)
STATUS: COMPLETE
PEMILIK: CodeBuddy
ZONA: UI/Styling/CSS + halaman statis baru + docs/phases (sesuai roadmap §4)

================================================================================
OBJECTIVE
================================================================================
Menyelaraskan seluruh UI agar konsisten, responsif (320–1440px), accessible (a11y),
dan siap produksi: finalisasi design tokens, state lengkap (loading/empty/error/
success/disabled/focus), dukungan prefers-reduced-motion, focus management modal,
serta perbaikan kontras/keyboard/touch-target.

================================================================================
FILE DIBUAT (BARU)
================================================================================
Token & utilitas:
- (diedit) src/styles/harikita-tokens.css  → +spacing/radius/shadow/motion/z-index/focus token
- (diedit) src/app/globals.css             → +sr-only, .skip-link, .focus-ring,
                                              global focus-visible fallback, .hk-skeleton,
                                              .scrollbar-none, @media prefers-reduced-motion,
                                              @media prefers-reduced-transparency

Primitif komponen UI (barrel: src/components/harikita/ui/index.ts):
- src/components/harikita/ui/Spinner.tsx       (loading indicator accessible)
- src/components/harikita/ui/Skeleton.tsx      (Skeleton + SkeletonList)
- src/components/harikita/ui/EmptyState.tsx    (empty-state konsisten)
- src/components/harikita/ui/Alert.tsx         (info/success/warning/error + role=alert/aria-live)
- src/components/harikita/ui/ErrorState.tsx    (presentational error boundary)
- src/components/harikita/ui/Modal.tsx         (Modal accessible: dialog+focus trap+Escape)

Hook:
- src/lib/hooks/useFocusTrap.ts            (focus trap + fokus awal + return focus)
  Catatan: file ini di src/lib/ tetapi BUKAN salah satu file terlarang
  (transaction-retry/date-utils/prisma/session). Murni util UI; aman.

App Router special files (root + per-segment):
- src/app/error.tsx
- src/app/global-error.tsx                  (self-contained <html>/<body>)
- src/app/not-found.tsx
- src/app/loading.tsx
- src/app/undangan/loading.tsx
- src/app/kategori/loading.tsx
- src/app/client/error.tsx
- src/app/vendor/error.tsx
- src/app/admin/error.tsx

================================================================================
FILE DIUBAH
================================================================================
- tailwind.config.ts         (+borderRadius/shadow/timing/zIndex token → alias hk-*)
- src/app/layout.tsx         (+skip-link "Lewati ke konten utama" + id="main-content")
- src/components/home/VendorPortfolioModal.tsx   (focus trap + fokus awal + focus-ring)
- src/components/invoicing/InvoiceModal.tsx      (focus trap + Escape via hook)
- src/components/invitation/InvitationPreviewModal.tsx (focus trap, hapus handler manual)
- src/components/invitation/cards/GalleryLightboxModal.tsx
      (+role=dialog/aria-modal, aria-label, focus trap, labels nav, body scroll lock)
- src/components/invitation/DigitalGiftModal.tsx (aria-live pada copy feedback + focus ring)
- src/components/invitation/RsvpGuestbookForm.tsx
      (label htmlFor/id, role=alert, aria-pressed tombol kehadiran, range aria-valuetext,
       tombol ≥44px, focus ring)
- src/components/pwa/InstallPrompt.tsx      (iOS guide → role=dialog + focus trap + aria-label + ≥44px)
- src/components/invitation/canvas/FloatingPetalsCanvas.tsx   (guard prefers-reduced-motion)
- src/components/invitation/canvas/AutumnLeavesCanvas.tsx     (guard prefers-reduced-motion)
- src/components/invitation/canvas/ConfettiCanvas.tsx         (guard prefers-reduced-motion)
- src/components/invitation/canvas/GoldenDustCanvas.tsx       (guard prefers-reduced-motion)
- src/app/auth/login/page.tsx                (autoComplete, htmlFor/id, role=alert, aria-pressed,
                                              aria-busy, focus ring, ≥44px)
- src/app/builder/page.tsx                   (checkout modal → dialog+focus trap; label binding;
                                              pax range label+aria-valuetext)
- src/app/client/jadwal/ClientJadwalClient.tsx (reschedule modal → komponen Modal; label binding)
- src/app/client/undangan/page.tsx           (add-guest modal → Modal; label binding; search &
                                              filter label; aria-label tombol icon-only; ≥36–44px)
- src/app/vendor/paket/VendorPaketClient.tsx (form modal → Modal; label binding; ≥44px)
- src/app/vendor/portofolio/VendorPortofolioClient.tsx
      (modal → Modal; label binding; role=alert; aria-label delete/like; focus ring)
- src/app/admin/verifikasi/page.tsx          (aria-pressed filter tabs, search label+type=search,
                                              focus ring, ≥36–44px)
- src/app/client/profil/ClientProfileForm.tsx (label htmlFor/id untuk 8 field; role=alert/status)
- src/app/vendor/profil/VendorProfileForm.tsx (label htmlFor/id untuk 15 field; role=alert/status)

================================================================================
ACTION/QUERY YANG DIPANGGIL
================================================================================
Tidak ada yang baru. Hanya memanggil Server Action yang SUDAH ADA (loginAction,
submitRsvpAction, vendor actions) — tidak menambah/mengubah service/action/query.

================================================================================
DATABASE CHANGES
================================================================================
Tidak ada perubahan schema dari sisi saya.
(Catatan: prisma/schema.prisma & prisma/dev.db sedang dimodifikasi oleh agent lain
 untuk model VendorPortfolio — di luar zona saya, tidak saya sentuh.)

================================================================================
TEST DITAMBAHKAN
================================================================================
Tidak ada test otomatis baru untuk Phase 7 (kerja UI/a11y murni presentasional).
Verifikasi via tsc + build + audit manual.

================================================================================
COMMAND DIJALANKAN
================================================================================
- npx tsc --noEmit              → EXIT 0 (0 error), dijalankan berulang selama kerja
- npm run build                 → SUKSES; 29 route ter-generate; /_not-found terdaftar
- npx tsx --test tests/*.test.ts → 119 total; 118 pass; 1 fail (BUKAN milik saya — lihat di bawah)
- npx tsx --test tests/archetypeRegistry.test.ts tests/pwa-manifest.test.ts
  tests/demoInvitation.test.ts  → 10/10 pass

================================================================================
HASIL TEST/BUILD
================================================================================
- TypeScript: PASS (0 error)
- Build produksi Next.js 15: PASS
- Test di zona saya (archetype/pwa/demo invitation): PASS
- 1 kegagalan (`tests/vendor-portfolio.test.ts` baris 80) berasal dari pekerjaan
  agent lain yang belum di-commit — DETAIL di bagian PERMINTAAN.

================================================================================
PERMINTAAN UNTUK AGENT LAIN (out-of-zone — JANGAN saya perbaiki sendiri)
================================================================================
🚩 BLOCKER (repotnya ada di zona Anda: src/lib/content-guard.ts)

Test `tests/vendor-portfolio.test.ts:80` — "content-guard allows clean caption" GAGAL.
Input bersih: "Sesi prewedding sunset di Pantai Menganti yang estetik."
Ekspektasi: isViolation === false. Aktual: true.

Akar masalah (analisa saya, tanpa mengubah file):
- `sanitizeContent()` menjalankan `normalizeLeetspeak()` yang memetakan huruf → digit
  (t→7, s→5, g→6, b→8, e→3, dst). Kalimat bersih apa pun menjadi deretan digit.
- `DIGIT_STREAM_REGEX = /\d{8,14}/g` lalu diuji pada `normalizedDigits` yang tidak
  punya pemisah, sehingga hampir semua teks >8 huruf memicu false positive
  "nomor telepon".

Saran arah perbaikan (pilih & uji di zona Anda):
1) Hanya jalankan DIGIT_STREAM_REGEX pada token yang memang mengandung digit mentah
   (mis. setelah mengganti non-digit dengan spasi), ATAU
2) Terapkan deteksi leetspeak HANYA jika teks asli memiliki pola kontak (kata kunci
   wa/hp/ig/tlp) ATAU minimal 3 digit mentah berurutan, ATAU
3) Turunkan agresivitas peta leetspeak (jangan petakan huruf umum seperti t/s/e) dan
   andalkan PHONE_REGEX + CONTACT_KEYWORDS untuk kasus normal.

Dampak ke saya: TIDAK ADA perubahan perilaku UI saya. Test ini murni domain Anda.

================================================================================
CATATAN REKONSILIASI
================================================================================
- Saya mematuhi Zona File (roadmap §4): TIDAK menyentuh src/server/**, src/types/**,
  prisma/**, src/lib/{transaction-retry,date-utils,prisma,session}.ts, dan tidak
  mengubah logika page.tsx server component milik halaman DB-terintegrasi
  (hanya menambah a11y pada client components & wrapper presentasional).
- Beberapa modal (builder checkout, client/jadwal, client/undangan, vendor/paket,
  vendor/portofolio) di-refactor memakai komponen `Modal` baru → menggantikan
  overlay ad-hoc tanpa dialog semantics/focus trap.
- Guard `prefers-reduced-motion` ditambahkan di level global CSS DAN di 4 canvas
  partikel (yang sebelumnya berjalan tanpa peduli preferensi pengguna).
- Backlog a11y minor yang BELUM dikerjakan (bukan blocker, item lanjutan):
  * aria-pressed pada beberapa filter/tab lain: ClientOrdersList, VendorInboxClient,
    home page.tsx tabs, undangan/page.tsx pills, VendorProfilWorkspace tabs.
  * Empty-state pada: VendorKalenderClient (blackout list), admin/audit-konten,
    admin/escrow (notifications/orders).
  * Ganti `alert()` di checkout/page.tsx dengan inline error (jika belum dilakukan).
  * Halaman invitation cover layouts & template cover gates (role dialog belum diberi;
    komponen ini full-screen gate, prioritas rendah).

================================================================================
NEXT STEP
================================================================================
Lanjut ke PHASE 8 (SEO, Landing/Marketing, Legal Pages & Analytics) — dokumen
terpisah: docs/phases/PHASE-08-seo-legal.md
