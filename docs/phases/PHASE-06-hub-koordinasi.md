PHASE: 6 — Hub Koordinasi + Rundown dari DB
STATUS: COMPLETE
PEMILIK: CodeBuddy

OBJECTIVE:
Hub Koordinasi mengambil daftar acara dari database (owner-scoped) alih-alih
mock store, dengan fallback mock.

FILE DIBUAT:
- src/app/hub-koordinasi/HubKoordinasiClient.tsx  (client, DB-first + mock fallback)

FILE DIUBAH:
- src/app/hub-koordinasi/page.tsx  (jadi server component + Suspense)

ACTION/QUERY YANG DIPANGGIL:
- getClientOrderViewModels() (query/orders.ts) → order klien untuk selector acara

DATABASE CHANGES: —

TEST DITAMBAHKAN: (dicakup oleh test query/servis yang ada)

COMMAND DIJALANKAN:
- npm run typecheck  → EXIT 0
- npx tsx --test tests/*.test.ts → 126 pass (baseline hijau)
- npm run build      → sukses (hub-koordinasi jadi ƒ dynamic)

HASIL TEST/BUILD: SEMUA PASS

CATATAN:
- EventConstellationHub & InvoiceModal tetap seperti semula (komponen demo visual).
  Yang dimigrasi: sumber daftar acara → DB.
- Query getCoordinationData(orderId) sudah tersedia untuk wiring rundown nyata
  di iterasi mendatang bila diagram constellation mau dihubungkan ke rundown DB.

NEXT STEP:
Verifikasi menyeluruh + update status roadmap. Sisa phase yang BUKAN milik
CodeBuddy: 5 (builder/availability, rekonsiliasi), 7 & 8 (agent lain),
9 (admin/dispute, rekonsiliasi), 10B (deploy live — menunggu keputusan user).
