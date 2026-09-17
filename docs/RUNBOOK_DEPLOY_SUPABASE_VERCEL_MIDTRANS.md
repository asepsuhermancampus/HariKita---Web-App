# HariKita — Runbook Deploy (Supabase PostgreSQL + Vercel + Midtrans)

Panduan langkah-demi-langkah untuk mencoba di Vercel (preview) sebelum publish,
menggunakan **Supabase (PostgreSQL)**, hosting **Vercel**, gateway **Midtrans (Snap)**.

> Ringkas: App memakai schema PostgreSQL (`prisma/schema.prisma`). Dev/test lokal
> memakai SQLite (`prisma/schema.sqlite.prisma`) — tidak perlu Postgres di lokal.

---

## 0. Arsitektur Database (dual-provider)

| Konteks | Provider | Schema | Client |
|---|---|---|---|
| Produksi (Supabase/Vercel) | PostgreSQL | `prisma/schema.prisma` | `@prisma/client` |
| Dev & test lokal | SQLite | `prisma/schema.sqlite.prisma` | `generated/sqlite-client` |

Scripts terkait:
- `npm run generate`          → generate client PostgreSQL
- `npm run generate:sqlite`   → generate client SQLite (test)
- `npm run db:migrate`        → buat/apply migration (Postgres, butuh DB nyata)
- `npm run db:migrate:deploy` → apply migration di produksi
- `npm run db:push:sqlite`    → sinkron SQLite lokal
- `postinstall` otomatis generate kedua client

---

## 1. Siapkan Supabase

1. Buat project baru di https://supabase.com (region terdekat, mis. Singapore).
2. **Project Settings → Database → Connection string**:
   - **Pooler / Transaction (port 6543)** → untuk `DATABASE_URL` (Vercel serverless).
     Tambahkan `?pgbouncer=true&connection_limit=1`.
   - **Direct (port 5432)** → untuk `DIRECT_URL` (migrasi/skema).
3. Catat kredensial.

Contoh:
```
DATABASE_URL="postgresql://postgres.<ref>:<pw>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.<ref>:<pw>@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

> Catatan: `schema.prisma` saat ini memakai satu `url = env("DATABASE_URL")`.
> Bila ingin memisahkan direct vs pooler, tambahkan `directUrl = env("DIRECT_URL")`
> pada blok `datasource`.

## 2. Migrasi & Seed (dari lokal, sekali)

```bash
# Set DATABASE_URL & DIRECT_URL ke Supabase di .env
npm run generate
npm run db:migrate        # buat migrasi awal + apply (membuat tabel)
npm run db:seed           # isi data awal (admin, vendor, paket)
```
> Bila `db:migrate` diminta nama migrasi, beri mis. `init`.

Setelah ini, `prisma/migrations/` akan berisi migrasi baseline — commit ke repo.

## 3. Deploy ke Vercel

1. Import repo ke Vercel (framework terdeteksi: Next.js).
2. **Environment Variables** (Production + Preview):
   | Variabel | Nilai |
   |---|---|
   | `DATABASE_URL` | Supabase pooler URL (6543) |
   | `DIRECT_URL` | Supabase direct URL (5432) — bila dipakai |
   | `HARIKITA_PAYMENT_PROVIDER` | `midtrans` |
   | `MIDTRANS_SERVER_KEY` | dari dashboard Midtrans |
   | `MIDTRANS_CLIENT_KEY` | dari dashboard Midtrans |
   | `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | sama dengan client key (untuk snap.js) |
   | `MIDTRANS_IS_PRODUCTION` | `false` (sandbox) |
   | `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` | `false` |
   | `MIDTRANS_SNAP_ENABLED` | `true` |
   | `CRON_SECRET` | string acak (dipakai Vercel Cron) |
   | `NEXT_PUBLIC_BASE_URL` | `https://<preview-domain>` |
3. Deploy → dapat **Preview URL** untuk dicoba.

> Build command Vercel: `npm run build`. `postinstall` otomatis generate kedua
> Prisma client. Migrasi TIDAK otomatis — jalankan `npm run db:migrate:deploy`
> sekali terhadap DB produksi (bisa via lokal / CI step).

## 4. Midtrans

1. Daftar akun **Sandbox**: https://dashboard.sandbox.midtrans.com.
2. Ambil **Server Key** & **Client Key** → set env (lihat tabel).
3. **Settings → Configuration → Payment Notification URL**:
   `https://<domain>/api/webhooks/payment?provider=midtrans`
4. Uji transaksi di preview URL (QRIS/Transfer). Status masuk via webhook.
5. Setelah lolos uji → ganti ke **Production keys**, set
   `MIDTRANS_IS_PRODUCTION="true"` & `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION="true"`.

## 5. Cron (Vercel)

`vercel.json` sudah memuat:
```json
{ "crons": [{ "path": "/api/cron/sweep", "schedule": "0 * * * *" }] }
```
Vercel mengirim `Authorization: Bearer <CRON_SECRET>` otomatis bila env
`CRON_SECRET` di-set. Endpoint juga menerima `?secret=` dan header `x-cron-secret`.

Yang dijalankan cron: expire order, sapu hold kedaluwarsa, proses webhook tertinggal,
kirim notifikasi outbox, dan payout (H-3 / H+2).

## 6. Verifikasi cepat

```bash
npm run verify   # typecheck + prisma validate + test (SQLite)
npm run build    # build produksi
```
- Health: `GET /api/health` → `{ status: "ok", checks: { database: "up" } }`.

---

## 7. Catatan penting

- **Jangan commit** `.env`. Hanya `.env.example`.
- Migrasi: **jangan** pakai `db push` di produksi; pakai `migrate deploy`.
- Rate limiter masih process-local; untuk trafik tinggi tambahkan Redis/Upstash.
- Backup DB produksi: Supabase menyediakan daily backup (sesuai plan).

## 8. Rollback

- **Vercel**: Deployments → pilih deployment sebelumnya → Promote to Production.
- **DB**: Supabase → Database → Backups → restore point; atau terapkan migrasi
  pembalik (buat migrasi baru yang mengembalikan perubahan).
