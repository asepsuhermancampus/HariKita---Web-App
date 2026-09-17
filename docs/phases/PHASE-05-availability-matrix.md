PHASE: 5 — Builder & Multi-Vendor Availability Matrix (realtime)
STATUS: COMPLETE
PEMILIK: CodeBuddy (integrasi; UI builder sudah ada dari agent)

OBJECTIVE:
Mengganti matriks ketersediaan mock di /builder dengan pengecekan nyata dari
tabel VendorAvailability (DB), memakai aksi yang sudah disiapkan.

FILE DIBUAT:
- src/server/actions/availability-matrix.ts  (checkAvailabilityMatrixAction)
- tests/availability-matrix.test.ts          (4 test)

FILE DIUBAH:
- src/app/builder/page.tsx  (integrasi: panggil matrix action; DB-first + fallback mock)

ACTION/QUERY YANG DIPANGGIL:
- checkAvailabilityMatrixAction({ eventDate, vendors:[{catalogVendorId, catalogPackageId}] })
  → resolve katalog→DB via catalog-bridge, baca status slot efektif
    (BLACKED_OUT / BOOKED / RESERVED / HELD aktif = bentrok).

DATABASE CHANGES: — (memakai model VendorAvailability yang sudah ada)

TEST DITAMBAHKAN: tests/availability-matrix.test.ts (4)

COMMAND DIJALANKAN:
- npm run typecheck   → EXIT 0
- npx tsx --test tests/*.test.ts → 143 tests, 143 pass, 0 fail
- npm run build       → sukses (/builder ada)

HASIL TEST/BUILD: SEMUA PASS (143/143)

CATATAN REKONSILIASI (sesuai roadmap Phase 5):
- UI builder TIDAK dirombak (sesuai zona agent). Hanya ditambah: import action,
  useEffect pemanggil matrix DB, dan pemilihan hasil (DB → fallback mock).
- Peta nama vendor → ID katalog dibuat dari MULTI_VENDOR_CATALOG di sisi client.
- Slot HELD yang sudah kedaluwarsa dianggap OPEN (konsisten dgn getEffectiveSlotStatus).

CATATAN OPERASIONAL:
- Build sempat ENOENT `.next/build-manifest.json` karena penghapusan .next
  bersamaan dengan build; ulangi build menyelesaikannya. Jalankan build terpisah
  dari pembersihan cache.

NEXT STEP:
Phase 10b (deploy live): Vercel + database cloud + gateway. Menunggu keputusan user.
