PHASE: 4 — Notifikasi (WhatsApp + Email + Persistence)
STATUS: COMPLETE
PEMILIK: CodeBuddy

OBJECTIVE:
Notifikasi otomatis multi-kanal dengan pola outbox (ditulis di tx bisnis,
dikirim di luar tx oleh scheduler).

FILE DIBUAT:
- src/server/notifications/types.ts              (kontrak adapter)
- src/server/notifications/whatsapp-adapter.ts   (Fonnte-compatible + mock)
- src/server/notifications/email-adapter.ts      (Resend-compatible + mock)
- src/server/notifications/registry.ts           (getNotificationAdapter)
- src/server/services/notification-service.ts    (enqueue/deliver/flush outbox)
- src/server/services/notification-templates.ts  (penyusun pesan dari data order)
- tests/notification.test.ts                     (7 test)

FILE DIUBAH:
- prisma/schema.prisma                 (+model Notification + index)
- src/server/services/order-service.ts (+notify order created & vendor decision)
- src/server/services/payment-service.ts (+notify DP paid)
- src/app/api/cron/sweep/route.ts      (+flushPendingNotifications)

ACTION/QUERY YANG DIPANGGIL: —
DATABASE CHANGES:
- Model `Notification` (channel, status, templateKey, recipientType/Name/Ref,
  orderId, payload JSON, body, attempts, lastError, sentAt). prisma db push
  dijalankan; backup `prisma/dev.db.backup_phase4_pre` dibuat lebih dulu.

TEST DITAMBAHKAN: tests/notification.test.ts (7)

COMMAND DIJALANKAN:
- npx prisma validate/db push/generate → valid, sync, OK
- npm run typecheck   → EXIT 0
- npx tsx --test tests/*.test.ts → 126 tests, 126 pass, 0 fail
- npm run build       → sukses

HASIL TEST/BUILD: SEMUA PASS (126/126)

TRIGGER TERPASANG:
- createOrder        → notifikasi ke tiap vendor terpilih
- processVendorDecision → notifikasi accept/reject ke klien
- processPaymentSuccess (DP_30) → notifikasi ke klien + vendor
- (template siap) notifikasi jadwal sesi fisik

CATATAN REKONSILIASI:
- Adapter notifikasi mengikuti pola payment-adapter: mock bila kredensial tidak
  diset → pilot tetap berjalan tanpa token.
- flushPendingNotifications dipanggil dari /api/cron/sweep (idempotent).
- Zona file dihormati.

NEXT STEP:
Phase 6 — Hub Koordinasi + rundown dari DB.
