PHASE: 9 — Admin Panel (Verifikasi, Audit, Dispute/Resolution Center)
STATUS: COMPLETE
PEMILIK: CodeBuddy

OBJECTIVE:
Melengkapi fungsi admin yang belum ada: verifikasi vendor, audit anti-disintermediasi,
dan pusat penyelesaian sengketa (dispute) — semuanya DB-backed, admin-only.

FILE DIBUAT:
- src/server/services/dispute-service.ts      (open/review/resolve/list dispute)
- src/server/services/content-audit.ts        (scanner read-only content-guard)
- src/server/queries/admin.ts                 (verifikasi, audit findings, disputes, funnel)
- src/server/actions/admin.ts                 (approve/reject vendor, dispute actions)
- src/app/admin/dispute/page.tsx + AdminDisputeClient.tsx   (Resolution Center — BARU)
- src/app/admin/verifikasi/AdminVerifikasiClient.tsx        (client DB-first)
- src/app/admin/audit-konten/AdminAuditKontenClient.tsx     (client DB-first)
- tests/dispute.test.ts                        (8 test)

FILE DIUBAH:
- prisma/schema.prisma          (+VendorProfile.verificationStatus & verificationNote)
- src/app/admin/verifikasi/page.tsx   (jadi server component)
- src/app/admin/audit-konten/page.tsx (jadi server component)

ACTION/QUERY YANG DIPANGGIL:
- approveVendorAction / rejectVendorAction
- openDisputeAction / reviewDisputeAction / resolveDisputeAction
- getVendorVerifications / getContentAuditFindings / getDisputes / getFunnelTelemetry

DATABASE CHANGES:
- VendorProfile: +verificationStatus (default APPROVED), +verificationNote.
  prisma db push dijalankan; backup `prisma/dev.db.backup_phase9_pre` dibuat lebih dulu.
- Model Dispute sudah ada sejak Phase 1B (tidak berubah).

TEST DITAMBAHKAN: tests/dispute.test.ts (8)

COMMAND DIJALANKAN:
- npx prisma validate/db push/generate → valid, sync, OK
- npm run typecheck   → EXIT 0
- npx tsx --test tests/*.test.ts → 139 tests, 139 pass, 0 fail
- npm run build       → sukses (admin/dispute, admin/verifikasi, admin/audit-konten: ƒ)

HASIL TEST/BUILD: SEMUA PASS (139/139)

CATATAN:
- DisputeService hanya mengelola state sengketa; refund aktual (reversal ledger)
  tetap ditangani PaymentService.processRefund → menjaga pemisahan tanggung jawab.
- Alur dispute: OPEN → UNDER_REVIEW → RESOLVED (order → REFUND_PENDING) atau
  REJECTED (order kembali operasional). Order di-freeze ke DISPUTED saat dibuka.
- Audit konten bersifat read-only terhadap konten tersimpan; penyaringan preventif
  tetap di sisi vendor (Portfolio CMS).
- Build sempat gagal karena stale `.next` cache; dibersihkan lalu sukses. Bila
  berulang, jalankan `Remove-Item -Recurse .next` sebelum build.

NEXT STEP:
Fase tersisa yang BUKAN milik CodeBuddy: Phase 5 (builder/availability — rekonsiliasi),
Phase 10b (deploy live — menunggu keputusan user).
