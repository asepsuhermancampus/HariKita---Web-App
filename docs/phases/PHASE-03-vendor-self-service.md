PHASE: 3 — Vendor Self-Service
STATUS: COMPLETE (dengan 1 item dipertahankan sengaja)
PEMILIK: CodeBuddy

OBJECTIVE:
Menghubungkan surface vendor ke database: portofolio, inbox pesanan, dan
skema pendukungnya.

FILE DIBUAT:
- src/app/vendor/portofolio/VendorPortofolioClient.tsx   (client, DB-first + mock fallback)
- src/app/vendor/inbox/VendorInboxClient.tsx             (client, DB inbox + accept/reject)
- tests/vendor-portfolio.test.ts                         (5 test)

FILE DIUBAH:
- prisma/schema.prisma            (+model VendorPortfolio + relasi VendorProfile.portfolios)
- src/server/queries/vendor.ts    (+getVendorPortfolios, getVendorPortfoliosByName, getVendorInbox, VendorInboxItemDTO/VendorPortfolioDTO)
- src/server/actions/vendor.ts    (+createPortfolioAction, updatePortfolioAction, deletePortfolioAction)
- src/app/vendor/portofolio/page.tsx (jadi server component)
- src/app/vendor/inbox/page.tsx      (jadi server component)
- src/lib/content-guard.ts        (FIX false-positive: digit-run per-token)

ACTION/QUERY YANG DIPANGGIL:
- createPortfolioAction / updatePortfolioAction / deletePortfolioAction
- getVendorPortfolios / getVendorInbox (owner-scoped)

DATABASE CHANGES:
- Model baru `VendorPortfolio` (title, locationTag, categoryTag, styleTags JSON,
  caption, imageUrl, likes, isPublished, createdAt) + index [vendorId, createdAt].
- `prisma db push` dijalankan; backup `prisma/dev.db.backup_phase3_pre` dibuat lebih dulu.

TEST DITAMBAHKAN: tests/vendor-portfolio.test.ts (5)

COMMAND DIJALANKAN:
- npx prisma validate    → valid
- npx prisma db push     → sync
- npx prisma generate    → OK
- npm run typecheck      → EXIT 0
- npx tsx --test tests/*.test.ts → 119 tests, 119 pass, 0 fail
- npm run build          → sukses (vendor/portofolio & vendor/inbox jadi ƒ dynamic)

HASIL TEST/BUILD: SEMUA PASS (119/119)

BUG YANG DIPERBAIKI (temuan penting):
- `content-guard.ts` menghasilkan FALSE POSITIVE: kata biasa seperti "Pantai
  Menganti yang estetik" dinormalisasi leetspeak lalu digabung menjadi deretan
  angka palsu (memicu regex nomor telepon). Diperbaiki dengan mendeteksi
  digit-run PER-TOKEN (dipisah whitespace). Sekarang prosa bersih lolos, nomor
  telepon/leetspeak nyata tetap tersensor.

KEPUTUSAN DESAIN:
- `/vendor/[slug]` (profil publik toko) SENGAJA dipertahankan membaca katalog
  statis (`multi-vendor-catalog.ts`) karena: (a) katalog sudah menyediakan data
  presentasi lengkap (avatar, cover, paket, portofolio, blackout) yang dikurasi;
  (b) migrasi ke DB (401 baris, coupling erat) berisiko tinggi nilai tambah rendah.
  Portofolio dinamis dari DB kini tetap tampil karena digabung di client.
  Dapat dimigrasi di masa depan bila profil vendor sepenuhnya self-service.

CATATAN REKONSILIASI:
- Zona file dihormati: tidak menyentuh file UI milik agent (error/loading/UI kit).
- Rate limiter & hardening Phase 10a tidak terpengaruh.

NEXT STEP:
Phase 4 — Notifikasi (WhatsApp gateway + email + persistence).
