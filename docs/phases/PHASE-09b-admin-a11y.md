PHASE: 9b (Admin Panel A11y & UI Polish — gap closure)
STATUS: COMPLETE
PEMILIK: CodeBuddy
ZONA: UI/Client components (src/app/admin/**) + docs/phases (sesuai roadmap §4)

================================================================================
OBJECTIVE
================================================================================
Menutup gap a11y/UI pada halaman admin hasil Phase 9 (agent lain) agar konsisten
dengan standar Phase 7: focus ring, label form, dialog aksesibel, touch target,
dan tablist yang benar. Tidak mengubah logika server/action/query.

================================================================================
LATAR BELAKANG
================================================================================
Phase 9 (`715d728`) menghasilkan /admin/dispute, /admin/verifikasi, /admin/audit-konten
(DB-backed, admin-only) dengan kualitas baik — bahkan sudah mengadopsi pola Phase 7
(aria-pressed, role=alert). Namun ditemukan sisa gap konsistensi a11y:
- Tombol filter/aksi tanpa `focus-ring`; sebagian touch target < 44px.
- Search input tanpa `<label>` (hanya placeholder).
- Textarea catatan resolusi dispute tanpa label.
- Verifikasi memakai `window.prompt()` (tidak accessible, diblokir di beberapa browser).
- Ikon dekoratif belum `aria-hidden`.

================================================================================
FILE DIUBAH
================================================================================
- src/app/admin/dispute/AdminDisputeClient.tsx
    * Filter: dibungkus role=group + group label (sr-only), +focus-ring, min-h 36px
    * Region pesan: aria-live="polite" aria-atomic
    * Textarea resolusi: +htmlFor/id label (sr-only per-order), +focus-ring
    * Tombol Tinjau/Tolak/Setujui: +focus-ring, +aria-busy, min-h 44px
    * Ikon dekoratif: +aria-hidden

- src/app/admin/verifikasi/AdminVerifikasiClient.tsx
    * GANTI window.prompt() -> <Modal> aksesibel (komponen Phase 7) dengan
      textarea "Catatan Revisi / Alasan Penolakan" + label, footer Batal/Kirim
    * Filter: +focus-ring, min-h 36px
    * Search: +htmlFor/id label (sr-only), +focus-ring
    * Region pesan: aria-live/atomic; tombol aksi: +focus-ring, +aria-busy, min-h 44px
    * Ikon dekoratif: +aria-hidden

- src/app/admin/audit-konten/AdminAuditKontenClient.tsx
    * Search: +htmlFor/id label (sr-only), +focus-ring
    * Ikon dekoratif: +aria-hidden

- src/app/admin/page.tsx (dashboard admin)
    * Tab nav: +role="tablist" +role="tab" +aria-selected, +focus-ring, min-h 44px
    * Ikon tab: +aria-hidden

================================================================================
ACTION/QUERY YANG DIPANGGIL
================================================================================
TIDAK berubah. Hanya memakai action yang sudah ada:
approveVendorAction, rejectVendorAction, reviewDisputeAction, resolveDisputeAction.
(Tidak menambah/mengubah service/action/query — sesuai batas zona.)

================================================================================
DATABASE CHANGES
================================================================================
Tidak ada.

================================================================================
TEST DITAMBAHKAN
================================================================================
Tidak ada test otomatis baru (kerja UI/a11y presentasional). Verifikasi via
tsc + build + suite penuh.

================================================================================
COMMAND DIJALANKAN
================================================================================
- npx tsc --noEmit              → EXIT 0 (0 error)
- npm run build                 → EXIT 0; 34 halaman; route admin ter-generate:
                                   ○ /admin, ƒ /admin/{audit-konten,dispute,verifikasi,escrow,kalender}
- npx tsx --test tests/*.test.ts → 143 tests, 143 pass, 0 fail

================================================================================
HASIL TEST/BUILD
================================================================================
SEMUA PASS. tsc 0 error; build exit 0; 143/143 test hijau.

================================================================================
CATATAN REKONSILIASI
================================================================================
- Mematuhi Zona File (roadmap §4). Hanya menyentuh client components di
  src/app/admin/**. Tidak menyentuh src/server/**, prisma/**, src/types/**, atau
  src/lib/{transaction-retry,date-utils,prisma,session}.ts.
- Menggunakan komponen `Modal` + util `focus-ring`/`sr-only` yang dibuat pada Phase 7
  → menunjukkan nilai reuse lintas phase.
- `window.prompt()` yang diblokir pada beberapa browser (mis. dalam iframe/CSP ketat)
  kini digantikan modal in-app yang dapat diuji & diakses keyboard.

================================================================================
GAP YANG MASIH TERSISA (bukan prioritas, catatan untuk fase lanjutan)
================================================================================
1. `/admin` dashboard masih memakai data funnel MOCK (hardcoded 10 tahap), sedangkan
   query `getFunnelTelemetry()` (dibuat pada Phase 9) BELUM dipakai di mana pun.
   Menyambungkannya butuh mengubah /admin/page.tsx menjadi server wrapper + client,
   yang berada di zona koordinasi (page.tsx server component) → perlu persetujuan.
   Rekomendasi: jadikan item Phase 9c / rekonsiliasi bersama agent service.
2. `/admin/escrow` & `/admin/kalender` (earlier) belum diaudit a11y menyeluruh pada
   sesi ini — kandidat audit lanjutan.

================================================================================
NEXT STEP
================================================================================
- Phase 5 (builder/availability) & Phase 10b (deploy) sedang dikerjakan agent lain.
- Bila disetujui, lanjutkan gap #1 (wire funnel telemetry ke /admin) sebagai
  rekonsiliasi koordinasi.
