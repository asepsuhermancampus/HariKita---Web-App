PHASE: 9e (Hotfix kritis — Dev Lokal Broken setelah Phase 10b: DB dual-provider)
STATUS: COMPLETE
PEMILIK: CodeBuddy (hotfix lintas-zona; perlu tinjauan agent server)
ZONA: src/lib/prisma.ts (zona server — diubah karena BLOCKER KRITIS)

================================================================================
GEJALA YANG DILAPORKAN USER
================================================================================
"Routing kacau: klik menu apa malah direct ke menu lain, klik menu tidak
kemana-mana. Sebelumnya routing aman."

================================================================================
AKAR MASALAH (root cause)
================================================================================
Setelah Phase 10b (migrasi ke Supabase PostgreSQL):
1. `prisma/schema.prisma` diubah ke provider `postgresql` (sumber kebenaran produksi).
2. `.env` `DATABASE_URL` diubah ke URL PostgreSQL placeholder:
   `postgresql://postgres:password@localhost:5432/harikita` — TIDAK ADA server-nya.
3. NAMUN `src/lib/prisma.ts` TETAP memakai `@prisma/client` (kini = client Postgres).

Akibatnya SETIAP query database di lokal gagal:
  `Can't reach database server at localhost:5432`
→ Server Components melempar error saat render / RSC navigation gagal
→ Perilaku navigasi klien rusak: klik menu "tidak kemana-mana" atau landing salah.
(Terlihat sebagai masalah routing, padahal sebenarnya kegagalan koneksi DB.)

Verifikasi:
  node -e "const{PrismaClient}=require('@prisma/client');new PrismaClient().vendorProfile.count()..."
  → ERROR: Can't reach database server at localhost:5432

CATATAN: Arsitektur dual-provider sudah DIDESAIN di
docs/RUNBOOK_DEPLOY_SUPABASE_VERCEL_MIDTRANS.md §0:
  Produksi → @prisma/client (Postgres)
  Dev/test → generated/sqlite-client (SQLite)
Tetapi langkah "prisma.ts memilih client sesuai konteks" belum diimplementasikan —
itulah celah yang menyebabkan dev lokal rusak.

================================================================================
PERBAIKAN
================================================================================
FILE DIUBAH:
- src/lib/prisma.ts
    * Kini memilih client berdasarkan skema `DATABASE_URL`:
        - `file:`            → generated/sqlite-client  (SQLite, dev lokal)
        - `postgresql://...` → @prisma/client           (Postgres, produksi)
    * Loader SQLite memakai `require()` dinamis (lazy) agar BUILD PRODUKSI tidak
      memerlukan folder `generated/` (yang di-gitignore).
    * Pesan error jelas bila env SQLite tapi client belum di-generate
      (instruksi: `npm run generate:sqlite`).

- .env (LOKAL, gitignored — tidak di-commit)
    * DATABASE_URL dikembalikan ke `file:./dev.db` untuk dev lokal.

================================================================================
HASIL VERIFIKASI
================================================================================
- npx tsc --noEmit              → EXIT 0
- npm run build                 → EXIT 0 (compiled successfully)
- npx tsx --test tests/*.test.ts → 145 tests, 145 pass, 0 fail
- Runtime (npm run start):
    * /kategori/prewed → 200, 102KB HTML, data vendor nyata (Menganti) terbaca
    * /undangan/demo   → 200, 96KB HTML, data undangan terbaca
    * Semua halaman publik → 200; TIDAK ada error Prisma di log
- Prisma langsung: `vendorProfile.count()` → OK (11) via SQLite.

================================================================================
CATATAN ZONA & REKONSILIASI
================================================================================
⚠️ `src/lib/prisma.ts` berada di ZONA SERVER (roadmap §4 — hanya agent server).
Saya mengubahnya HANYA karena ini BLOCKER KRITIS: aplikasi sama sekali tidak bisa
dipakai di lokal (semua halaman DB error). Perubahan bersifat minimal & selaras
dengan desain dual-provider yang sudah didokumentasikan.

PERMINTAAN TINJAUAN ke agent server:
1. Konfirmasi strategi pemilihan client ini (deteksi via skema DATABASE_URL) dapat
   diterima, atau ganti dengan pendekatan lain (mis. env flag DATABASE_PROVIDER).
2. Pastikan build/deploy produksi (Vercel) tetap memakai @prisma/client:
   di Vercel, DATABASE_URL = postgresql://... → otomatis memakai client Postgres. OK.
3. Pertimbangkan menambah guard di CI: bila `.env` menunjuk `file:` tapi
   `generated/sqlite-client` tidak ada → jalankan `npm run generate:sqlite`.
4. Perbarui `.env.example` agar jelas: dev lokal = `file:./dev.db`, prod = postgres.

================================================================================
PELAJARAN UNTUK MASA DEPAN
================================================================================
- Perubahan `.env`/schema DB untuk produksi TIDAK BOLEH merusak dev lokal.
- Setiap migrasi provider wajib disertai "local dev smoke test":
  jalankan server + buka 1 halaman DB-backed.
- Gejala "routing rusak" pada App Router seringkali = kegagalan fetch/RSC
  (mis. DB down), BUKAN masalah router. Cek error server dulu.

================================================================================
NEXT STEP
================================================================================
- Agent server: tinjau perbaikan prisma.ts + sinkronkan `.env.example`.
- Untuk menjalankan lokal: pastikan `.env` DATABASE_URL = `file:./dev.db` dan
  `npm run generate:sqlite` sudah dijalankan (postinstall sudah otomatis).
