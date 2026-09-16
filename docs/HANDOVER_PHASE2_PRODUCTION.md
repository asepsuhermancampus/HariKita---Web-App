# HariKita — Phase 2 Production Handover

**Status:** Phase 2 (integrasi service → aplikasi) selesai.
**Cakupan:** payment gateway adapter, jalur migrasi database, scheduler cron.
**Terakhir diperbarui:** otomatis oleh implementasi Phase 2.

---

## 1. Arsitektur Ringkas

```
┌──────────────────────────┐   ┌───────────────────────────┐
│  UI (Next.js App Router) │   │  API Routes               │
│  - checkout/pembayaran   │   │  - /api/webhooks/payment  │
│  - portal client/vendor/ │   │  - /api/cron/sweep        │
│    admin (server comps)  │   └─────────────┬─────────────┘
└────────────┬─────────────┘                 │
             │ Server Actions                │
             ▼                               ▼
┌───────────────────────────────────────────────────────────┐
│  Server Actions (transport)                                │
│  actions/{availability,order,payment,vendor,...}.ts        │
└────────────┬──────────────────────────────────────────────┘
             ▼
┌───────────────────────────────────────────────────────────┐
│  Service Layer (Phase 1D)                                  │
│  availability / order / payment / payment-webhook /        │
│  ledger / payout / order-lifecycle / catalog-bridge        │
│  + lib/{transaction-retry,date-utils}                      │
└────────────┬──────────────────────────────────────────────┘
             ▼
┌───────────────────────────────────────────────────────────┐
│  Prisma ORM → DATABASE_URL (SQLite | PostgreSQL | libSQL)  │
└───────────────────────────────────────────────────────────┘
```

Prinsip kunci:
- Semua mutasi finansial melewati **shared `tx`** dalam `withTransactionRetry`.
- Export-only append pada ledger (koreksi via reversal journal).
- Idempotency: webhook `@@unique(provider,eventId)`, payout via `journalNumber`
  deterministik, attempt via `idempotencyKey`.

---

## 2. Konfigurasi Environment

Salin `.env.example` → `.env` lalu isi. Variabel penting:

| Variabel | Wajib | Default | Keterangan |
|---|---|---|---|
| `DATABASE_URL` | Ya | `file:./dev.db` | Koneksi database Prisma. |
| `HARIKITA_PAYMENT_PROVIDER` | Tidak | `simulated_qris` | `simulated_qris` \| `midtrans` \| `xendit`. |
| `HARIKITA_WEBHOOK_SECRET` | Sandbox | — | HMAC untuk provider simulated. |
| `HARIKITA_CRON_SECRET` | Ya (produksi) | — | Auth endpoint cron. |
| `MIDTRANS_SERVER_KEY` / `MIDTRANS_IS_PRODUCTION` | Midtrans | — | Kredensial Midtrans. |
| `XENDIT_SECRET_KEY` / `XENDIT_CALLBACK_TOKEN` | Xendit | — | Kredensial Xendit. |

> `.env` **tidak** di-commit (lihat `.gitignore`). Hanya `.env.example` yang di-track.

---

## 3. Payment Gateway

Lokasi: `src/server/payments/`

- `types.ts` — kontrak `PaymentGatewayAdapter` (`verifyWebhook`, `createCharge`).
- `simulated-adapter.ts` — pilot/sandbox (HMAC atau mode sandbox eksplisit).
- `midtrans-adapter.ts` — verifikasi SHA512
  `SHA512(order_id + status_code + gross_amount + serverKey)`.
- `xendit-adapter.ts` — verifikasi header `x-callback-token`.
- `registry.ts` — `getGatewayAdapter(provider)`, `getDefaultProvider()`.

### Alur pembayaran

```
Checkout → createOrderWithAutoHoldAction  (TX: order + item + slot)
        → createChargeAction              (TX1 attempt → external charge → TX2 simpan ref)
        → halaman /pembayaran
Gateway → POST /api/webhooks/payment?provider=<p>  (verifikasi signature)
        → Fase A: persist PaymentWebhookEvent (idempotent)
        → Fase B: processWebhookEvent → PaymentService (TX atomik: payment + order + availability + ledger)
```

### Mengaktifkan provider live
1. Set `HARIKITA_PAYMENT_PROVIDER="midtrans"` (atau `xendit`).
2. Isi kredensial terkait di `.env`.
3. Daftarkan URL webhook di dashboard provider:
   `https://<domain>/api/webhooks/payment?provider=midtrans`.
4. Uji dengan sandbox sebelum production (`MIDTRANS_IS_PRODUCTION="false"`).

> Ganti `simulatePaymentSuccessAction` di UI pembayaran hanya untuk demo; pada
> provider live, status berubah melalui webhook.

---

## 4. Migrasi Database (SQLite → Cloud)

Saat ini datastore memakai `env("DATABASE_URL")` default SQLite.

### SQLite → PostgreSQL
1. Ubah `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set `DATABASE_URL="postgresql://user:pass@host:5432/harikita?sslmode=require"`.
3. `npx prisma migrate deploy` (atau `prisma db push` untuk pertama kali).
4. Jalankan `npm run db:seed` bila perlu.

### SQLite → Turso (libSQL)
1. Tambah driver adapter `@prisma/adapter-libsql`.
2. Inisialisasi PrismaClient dengan adapter libSQL di `src/lib/prisma.ts`.
3. Set `DATABASE_URL="libsql://<db>-<org>.turso.io?authToken=<token>"`.

> Mesin transaksi (`withTransactionRetry`) tetap kompatibel. Untuk multi-node,
> mekanisme distributed lease (SweeperLease) adalah prasyarat Phase berikutnya
> (lihat dokumen Phase 1D `[LIMIT]`).

---

## 5. Scheduler / Cron

Endpoint: `GET|POST /api/cron/sweep?secret=<HARIKITA_CRON_SECRET>`
(atau header `x-cron-secret`).

Pekerjaan yang dijalankan (semua idempotent):
1. `expireOrdersSweep` — order melewati SLA vendor / batas DP → `EXPIRED`.
2. `sweepExpiredHolds` — slot `HELD` kedaluwarsa (15 menit) → `OPEN`.
3. `sweepUnprocessedEvents` — event webhook `processed=false` tertinggal → diproses.
4. Payout sweep — DP `H-3` & pelunasan `H+2` yang memenuhi 5 financial guards dicairkan.

### Penjadwalan
- **Vercel**: tambahkan `vercel.json`:
  ```json
  { "crons": [{ "path": "/api/cron/sweep?secret=XXX", "schedule": "0 * * * *" }] }
  ```
- **GitHub Actions / cron server**: panggil endpoint tiap jam dengan secret.
- **Manual**: `curl "https://<domain>/api/cron/sweep?secret=XXX"`.

> Amankan `HARIKITA_CRON_SECRET`; tanpa secret, endpoint menolak (401).

---

## 6. Verifikasi

```bash
npm run lint            # (opsional)
npx tsc --noEmit        # type-check
npx prisma validate     # validasi schema
npx prisma generate     # generate client (hentikan dev server dulu — file lock DLL)
npx tsx --test tests/*.test.ts   # 108 test (106 pass; 2 pre-existing archetype)
npm run build           # build produksi
```

Catatan Windows: `prisma generate` dapat gagal `EPERM` bila dev server masih
memegang `query_engine-windows.dll.node`. Hentikan proses node lalu ulangi.

---

## 7. Peta Modul

| Area | Path |
|---|---|
| Services | `src/server/services/*.ts` |
| Server Actions | `src/server/actions/*.ts` |
| Queries | `src/server/queries/*.ts` |
| Payments | `src/server/payments/*.ts` |
| API Routes | `src/app/api/{webhooks/payment,cron/sweep}/route.ts` |
| Domain types | `src/types/{domain,errors,dto}.ts` |
| Lib utils | `src/lib/{transaction-retry,date-utils,prisma,session}.ts` |
