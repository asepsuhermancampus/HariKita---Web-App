PHASE: 9d (Admin Data Integrity — purging mock/demo data dari panel admin)
STATUS: COMPLETE
PEMILIK: CodeBuddy
ZONA: UI/Client components (src/app/admin/**) + docs/phases

================================================================================
OBJECTIVE
================================================================================
Menghilangkan SEMUA data mock/demo yang menyusup ke panel admin (governance &
finansial). Sebelumnya panel admin mencampur data DB nyata dengan data palsu,
sehingga admin dapat melihat acara/transaksi fiktif seolah-olah nyata. Ini adalah
BUG integritas data (bukan sekadar kosmetik).

================================================================================
LATAR BELAKANG (temuan audit)
================================================================================
Panel admin sebelumnya mengandung:
- /admin/kalender: 4 event pernikahan HARDCODED (Aditya & Larasati Rp18.5jt,
  Bima & Citra Rp24.75jt, dll) yang SELALU di-merge ke daftar DB — jadi produksi
  menampilkan acara palsu bercampur acara asli. Juga memakai `useOrders()` mock.
- /admin/escrow: fallback ke `useOrders()` (mock) saat DB kosong, dan outbox
  memakai `useNotifications()` (mock localStorage dengan notif demo "Siti & Dimas").

================================================================================
FILE DIUBAH
================================================================================
- src/app/admin/kalender/AdminKalenderClient.tsx
    * HAPUS `baselineEvents` (4 acara palsu) sepenuhnya.
    * HAPUS `useOrders()` mock & penggabungan dynamicEvents.
    * Sumber tunggal = `dbEvents` (dari getAdminCalendarEvents).
    * Empty state jujur via komponen `EmptyState` (bedakan "DB kosong" vs "filter
      tak cocok"), menegaskan tidak ada data contoh yang ditampilkan.
    * Bersihkan import ikon yang tak terpakai (Calendar, Clock, Users, Building,
      CheckCircle2).

- src/app/admin/kalender/page.tsx
    * Perbarui komentar (menegaskan DB-only, tanpa demo/baseline). Logika tidak diubah.

- src/app/admin/escrow/AdminEscrowClient.tsx
    * HAPUS fallback ke `useOrders()` mock — `orders = dbOrders` (DB-only).
    * HAPUS outbox berbasis `useNotifications()` mock; ganti dengan kartu
      informatif jujur yang menjelaskan notifikasi dikelola sistem (outbox
      persisten + scheduler), TANPA menampilkan data contoh.
    * Bersihkan import mock & ikon tak terpakai.

- src/app/admin/escrow/page.tsx
    * Perbarui komentar (DB-only, tanpa fallback mock). Logika tidak diubah.

- src/app/admin/AdminDashboardClient.tsx (dibuat pada phase-09c)
    * Sudah bersih (tidak ada mock). Diverifikasi, tidak diubah.

================================================================================
ACTION/QUERY YANG DIPANGGIL
================================================================================
Tidak ada yang baru. Tetap memakai query yang sudah ada:
getAdminCalendarEvents, getAdminOrderViewModels, getEscrowBalance, getFunnelTelemetry,
getAdminEscrowOverview.

================================================================================
DATABASE CHANGES
================================================================================
Tidak ada.

================================================================================
TEST DITAMBAHKAN
================================================================================
Tidak ada test otomatis baru (pembersihan data/presentasional). Verifikasi via
tsc + build + grep (memastikan tak ada referensi mock) + suite penuh.

Verifikasi grep: `useOrders|useNotifications|baselineEvents|INITIAL_DEMO|mockOrders`
di src/app/admin/** → 0 hasil.

================================================================================
COMMAND DIJALANKAN
================================================================================
- npx tsc --noEmit              → EXIT 0
- npm run build                 → EXIT 0; /admin, /admin/kalender, /admin/escrow: ƒ (dynamic)
- npx tsx --test tests/*.test.ts → 143 tests, 143 pass, 0 fail

================================================================================
HASIL TEST/BUILD
================================================================================
SEMUA PASS. tsc 0 error; build exit 0; 143/143 hijau; panel admin bebas mock.

================================================================================
PERMINTAAN KE CODEBUDDY / AGENT SERVICE (zona server — di luar zona saya)
================================================================================
🚩 GAP #1 — AnalyticsTelemetry TIDAK PERNAH DITULIS

Temuan: `AnalyticsTelemetry` HANYA dibaca (di getFunnelTelemetry), TIDAK PERNAH
ditulis di mana pun. Akibatnya fitur "Master 10-Tahapan Funnel Konversi" di /admin
SELALU menampilkan 0% — secara fungsional kosong.

Permintaan implementasi (server-side):
1. Buat `analytics-service.ts` (pola serupa payment/notification adapter):
   - `recordEvent({ eventType, path, metadata? })` → prisma.analyticsTelemetry.create
   - Non-blocking (fire-and-forget / outbox) agar tidak memperlambat request.
2. Panggil `recordEvent()` di titik-titik funnel kanonik berikut (eventType),
   yang sudah dipetakan di /admin/page.tsx:
   - PAGE_VIEW          → kunjungan halaman publik (landing/kategori/vendor)
   - VENDOR_VIEW        → buka detail vendor/portofolio
   - BUILDER_OPEN       → buka /builder
   - PRICELIST_CLICK    → interaksi simulator (ganti pax/baki/tema)
   - CART_ADD           → tambah item ke racikan
   - CHECKOUT_INIT      → mulai checkout / lazy registration
   - INVOICE_ISSUED     → order dibuat (createOrder sukses)
   - DP_PAID            → DP 30% terbayar (payment-service)
   - SETTLEMENT_PAID    → pelunasan 70% terbayar
   - DEAL_CLOSED        → acara sukses H+2 / order COMPLETED
3. Pertimbangkan endpoint/Server Action ringan `trackEventAction` untuk event
   dari klien (PAGE_VIEW, BUILDER_OPEN, dst), dengan rate-limit & tanpa PII.

Setelah ini, funnel di /admin akan otomatis menampilkan angka nyata (UI sudah siap,
tinggal menunggu penulis telemetry). Tidak ada perubahan UI tambahan yang diperlukan.

CATATAN: eventType di atas hanya usulan; bila agent service memakai penamaan lain,
mohon selaraskan — UI /admin/page.tsx memetakan eventType via FUNNEL_DEFINITION
(satu tempat) sehingga mudah disesuaikan.

================================================================================
CATATAN REKONSILIASI
================================================================================
- Mematuhi zona: tidak menyentuh src/server/**, src/types/**, prisma/**,
  src/lib/{terlarang}.ts. Perubahan pada page.tsx (kalender/escrow) HANYA komentar.
- Tidak ada query/service baru dibuat di sisi saya.
- Dua file page.tsx wrapper (kalender/escrow) sudah DB-backed sebelumnya; saya
  tidak mengubah logikanya, hanya memastikan klien tidak lagi menambah mock.

================================================================================
HASIL AKHIR
================================================================================
✅ Panel admin KINI 100% sumber dari database — tidak ada acara/transaksi/notifikasi
   palsu yang dapat tampil di produksi.
⚠️ Funnel telemetry menunggu implementasi penulis event (permintaan #1 di atas).

================================================================================
NEXT STEP
================================================================================
- Agent service: implementasikan #1 (analytics telemetry writer) agar funnel hidup.
- Phase 10b (deploy live) menunggu keputusan user.
