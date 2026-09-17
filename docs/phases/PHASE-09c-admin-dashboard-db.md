PHASE: 9c (Admin Dashboard DB-wiring + A11y Audit escrow/kalender — gap closure)
STATUS: COMPLETE
PEMILIK: CodeBuddy
ZONA: UI/Client components + server wrapper /admin/page.tsx (koordinasi) + docs/phases

================================================================================
OBJECTIVE
================================================================================
Menutup 2 gap lanjutan yang dicatat pada PHASE-09b:
  (GAP#1) /admin dashboard masih memakai data funnel MOCK; query getFunnelTelemetry()
          (dibuat Phase 9) belum dipakai. Jadikan dashboard DB-backed.
  (GAP#2) Belum diaudit a11y: /admin/escrow & /admin/kalender.

================================================================================
GAP#1 — /admin DB-BACKED (funnel + kalender + escrow + GMV)
================================================================================
FILE DIUBAH:
- src/app/admin/page.tsx
    * Dari `"use client"` MOCK → SERVER COMPONENT (dynamic) yang fetch data DB:
      - getFunnelTelemetry()          → telemetri funnel
      - getAdminCalendarEvents()      → master calendar (queries/orders)
      - getAdminEscrowOverview()      → ringkasan escrow (orders + jurnal debit/kredit)
      - getSession()                  → flag isAdmin
    * GMV dihitung dari total order non-CANCELLED/EXPIRED (bukan angka hardcoded).
    * 10 tahap funnel dipetakan dari eventType AnalyticsTelemetry; jika belum ada
      data → count 0 (jujur, bukan angka fiktif). % dihitung relatif thd tahap tertinggi.
    * +metadata noindex (dashboard admin).

FILE DIBUAT:
- src/app/admin/AdminDashboardClient.tsx
    * Client presentasional untuk 3 tab: funnel, master calendar, escrow.
    * EmptyState bila data kosong; notice bila bukan admin.

ACTION/QUERY YANG DIPANGGIL (semua SUDAH ADA, tidak ada yang baru):
- getFunnelTelemetry, getAdminCalendarEvents, getAdminEscrowOverview

CATATAN ZONA:
- Mengubah /admin/page.tsx (server wrapper) memang masuk kategori "koordinasi"
  (roadmap §4). Dilakukan karena halaman ini SEBELUMNYA murni client/mock (bukan
  page.tsx DB-terintegrasi yang dilindungi), dan atas permintaan eksplisit user
  untuk menyelesaikan gap. Tidak menyentuh src/server/**.

================================================================================
GAP#2 — A11Y /admin/escrow & /admin/kalender
================================================================================
FILE DIUBAH:
- src/app/admin/escrow/AdminEscrowClient.tsx
    * Outbox table: +empty state (colSpan) bila tak ada notifikasi
    * Antrean escrow: +empty state bila tak ada order
    * Tombol "Rilis H-3"/"Rilis H+2": +focus-ring, +aria-label, min-h 32px
    * Breadcrumb & link WA: +focus-ring, +aria-label; ikon dekoratif +aria-hidden

- src/app/admin/kalender/AdminKalenderClient.tsx
    * Select "Wilayah": +htmlFor/id label, +focus-ring
    * Search: +htmlFor/id label (sr-only), type=search, +focus-ring
    * Link "Buka Visual Radar": +focus-ring, min-h 44px; breadcrumb +focus-ring
    * Ikon dekoratif +aria-hidden; separator breadcrumb aria-hidden

================================================================================
DATABASE CHANGES
================================================================================
Tidak ada.

================================================================================
TEST DITAMBAHKAN
================================================================================
Tidak ada test otomatis baru (kerja UI/wiring presentasional). Verifikasi via
tsc + build + suite penuh.

================================================================================
COMMAND DIJALANKAN
================================================================================
- npx tsc --noEmit              → EXIT 0
- npm run build                 → EXIT 0; 33 halaman; /admin kini ƒ (dynamic, DB-backed)
- npx tsx --test tests/*.test.ts → 143 tests, 143 pass, 0 fail

================================================================================
HASIL TEST/BUILD
================================================================================
SEMUA PASS. tsc 0 error; build exit 0; 143/143 hijau; /admin ter-render dinamis.

================================================================================
CATATAN REKONSILIASI
================================================================================
- Memakai query yang SUDAH ADA (buatan Phase 2/9). Tidak membuat query/service baru.
- Tidak menyentuh src/server/**, prisma/**, src/types/**, src/lib/{terlarang}.ts.
- Menghubungkan getFunnelTelemetry yang tadinya "orphan" (dibuat tapi tak dipakai).
- Funnel tetap menampilkan 10 tahap kanonik walau telemetry belum terisi, agar
  dashboard informatif selama pilot (angka 0% = belum ada data, transparan).

================================================================================
CATATAN LANJUTAN (bukan blocker)
================================================================================
- Agar funnel menghasilkan angka nyata, perlu ada penulisan AnalyticsTelemetry
  (event tracking) di titik-titik funnel — saat ini belum ada penulis telemetry.
  Itu pekerjaan server-side (agent service) bila diinginkan.
- /admin/kalender & /admin/escrow masih mempertahankan baseline/demo event sebagai
  fallback visual saat DB kosong (sesuai desain awal). Bila ingin 100% DB-only pada
  produksi, dapat dipisah sebagai task lanjutan.

================================================================================
NEXT STEP
================================================================================
Phase 5 (builder) sudah di-commit agent lain (e066855). Phase 10b (deploy live)
menunggu keputusan user (hosting/DB/gateway).
