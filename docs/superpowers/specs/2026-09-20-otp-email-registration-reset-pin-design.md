# Registrasi & Reset PIN dengan OTP via Email — Design Spec

**Tanggal:** 2026-09-20
**Status:** Disetujui untuk implementasi
**Branch:** `feat/brand-ambassador-referral` (lanjutan)

---

## 1. Latar Belakang & Tujuan

Saat ini pendaftaran akun HariKita hanya meminta **Nama + Nomor HP + PIN** (untuk CLIENT/VENDOR),
tanpa pesan verifikasi apa pun. Akun BA dibuat manual oleh admin. Tidak ada mekanisme
verifikasi kepemilikan maupun pemulihan akses bila PIN lupa.

**Tujuan:** menambahkan **verifikasi OTP via email** pada alur registrasi semua role (selain
ADMIN) dan menyediakan fitur **Reset PIN**, dengan kebijakan anti-spam/anti-brute-force.

**Non-tujuan:** tidak mengubah peran ADMIN (dibuat manual), tidak menambah login sosial (Google, dsb),
tidak menyentuh alur bisnis lain (order, escrow, komisi BA).

---

## 2. Keputusan Produk (Disetujui)

| Topik | Keputusan |
|-------|-----------|
| Alur registrasi | `Nama Lengkap + No HP + Email` → **Send OTP** → input OTP → set PIN → akun dibuat & auto-login |
| Wajib email? | **Ya, wajib** untuk semua role (kecuali ADMIN dibuat manual) |
| Registrasi vendor | Hanya identitas (nama, HP, email) saat daftar; **detail usaha dilengkapi di dashboard** |
| Referral BA | Field "Kode Referral BA (opsional)" tetap ada di registrasi vendor |
| Penyimpanan OTP | Tabel DB baru `OtpCode` (hash, bukan plaintext) |
| Penyimpanan log ganti PIN | Tabel DB baru `PinChangeLog` |
| Pengiriman email | **Resend** (SDK `resend`), tier gratis |
| Dev fallback | Bila tanpa API key / `OTP_DEV_MODE=true`: log kode ke console server + banner kuning di UI |
| Reset PIN | Link "Lupa PIN?" di halaman login → `/auth/reset-pin` |
| Data dummy | Semua user demo diberi email valid + PIN `123456`; skema tetap `email String?` (validasi wajib di layer aplikasi) |

---

## 3. Arsitektur

```
┌─────────────┐   sendOtp    ┌──────────────┐   Resend SDK   ┌─────────┐
│  Client UI  │─────────────▶│ Server Action│───────────────▶│ Resend  │
│ (stepper)   │              │  /otp-service│                └─────────┘
└─────────────┘              └──────┬───────┘
       ▲                            │ simpan hash + rate-limit
       │ verify + setPin            ▼
       │                     ┌──────────────┐
       └─────────────────────│   OtpCode    │  (Postgres/SQLite)
                             └──────────────┘
```

### 3.1 Model Data Baru

```prisma
model OtpCode {
  id          String    @id @default(cuid())
  email       String                       // lowercase, ternormalisasi
  codeHash    String                       // bcrypt hash kode 6-digit
  purpose     String                       // "REGISTER" | "RESET_PIN"
  status      String    @default("PENDING") // PENDING | VERIFIED | LOCKED | CONSUMED
  attempts    Int       @default(0)        // jumlah percobaan verifikasi (maks 3)
  expiresAt   DateTime                     // createdAt + 5 menit
  lockedUntil DateTime?                    // now + 10 menit saat attempts mencapai 3
  verifiedAt  DateTime?
  createdAt   DateTime  @default(now())

  @@index([email, purpose, status])
  @@index([email, createdAt])
}

model PinChangeLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  changedAt DateTime @default(now())

  @@index([userId, changedAt])
}
```

Relasi baru pada `User`:
```prisma
pinChangeLogs PinChangeLog[]
```

`User.email` tetap `String?` (opsional di skema) untuk menghindari migrasi paksa pada data lama;
**kewajiban email ditegakkan di layer aplikasi** (Server Action). `User.pin` tetap `String?`.

> Dua skema Prisma (`schema.prisma` + `schema.sqlite.prisma`) WAJIB sinkron.

---

## 4. Alur Detail

### 4.1 Registrasi (semua role kecuali ADMIN)

Halaman: `/auth/register` (CLIENT), `/auth/register-vendor` (VENDOR). Satu card, tiga tahap.

**Tahap 1 — Identitas**
- Input: `Nama Lengkap`, `Nomor HP / WhatsApp Aktif`, `Email`, (khusus vendor: `Kode Referral BA` opsional).
- Tombol **Kirim Kode OTP**.
- Action `sendOtpAction({ name, phone, email, purpose: "REGISTER" })`:
  - Validasi: nama non-kosong, format HP Indonesia (`^08\d{8,12}$`), format email valid.
  - Cek `User.phone` belum terdaftar; `User.email` belum terdaftar.
  - **Rate limit kirim** (lihat §5).
  - Generate kode 6-digit acak (crypto), simpan `OtpCode { email, codeHash: bcrypt(code), purpose: "REGISTER", expiresAt: now+5m }`.
  - Kirim email via `email-service`. Dev fallback → kembalikan `{ devCode }`.
- Sukses → UI pindah ke Tahap 2, tampilkan banner info "Kode dikirim ke <email>".

**Tahap 2 — Verifikasi OTP**
- Input: 6 digit kode. Tombol **Verifikasi** dan **Kirim Ulang**.
- Action `verifyOtpAction({ email, purpose: "REGISTER", code })`:
  - Ambil `OtpCode` PENDING terbaru untuk email+purpose.
  - Cek `expiresAt` belum lewat; cek `status !== LOCKED`; cek `attempts < 3`.
  - Bandingkan `bcrypt.compare(code, codeHash)`.
  - **Valid** → `status = VERIFIED`, `verifiedAt = now`. Kembalikan `{ verified: true, otpId }`
    (otpId juga dititipkan ke cookie httpOnly sementara `hk_otp`).
  - **Invalid** → `attempts++`; bila mencapai 3 → `status = LOCKED`, `lockedUntil = now+10m`.
  - Catat percobaan harian (lihat §5).
- Sukses → notif hijau "OTP valid", UI pindah ke Tahap 3.

**Tahap 3 — Set PIN**
- Input: `PIN (6 digit)` + `Konfirmasi PIN`. Tombol **Buat Akun**.
- Action `completeRegistrationAction({ name, phone, email, pin, role, referralCode? })`:
  - **Anti-bypass:** baca cookie httpOnly `hk_otp` (berisi `otpId`). Wajib ada, dan `OtpCode`
    terkait harus berstatus `VERIFIED` untuk `email`+`REGISTER`. Cookie ini adalah SATU-SATUNYA
    sumber otoritas verifikasi (tidak menerima `otpId` dari body/args, agar tidak bisa dipalsukan).
  - Validasi PIN `^\d{6}$` dan cocok dengan konfirmasi.
  - Transaksi: buat `User` (role), `PinChangeLog` pertama, `VendorProfile` (bila VENDOR), atribusi referral.
  - `OtpCode.status = CONSUMED`. Hapus cookie `hk_otp`.
  - Set session cookie → redirect dashboard sesuai role.

### 4.2 Reset PIN

Halaman: `/auth/reset-pin` (link "Lupa PIN?" di ketiga login). Tiga tahap serupa:

1. **Input Email** → `sendOtpAction({ email, purpose: "RESET_PIN" })`.
   - Email **harus** terdaftar sebagai User; bila tidak → pesan generik (tidak membocorkan status email).
2. **Verifikasi OTP** → `verifyOtpAction({ email, purpose: "RESET_PIN", code })`.
3. **Set PIN Baru** → `resetPinAction({ email, pin })`:
   - **Anti-bypass:** baca cookie httpOnly `hk_otp`; `OtpCode` terkait harus `VERIFIED`
     untuk `email`+`RESET_PIN`.
   - **Cek 14 hari**: tolak bila `PinChangeLog` terakhir untuk user `< 14 hari`.
   - Update `User.pin`, tambah `PinChangeLog`, `OtpCode.status = CONSUMED`.
   - Kirim **email konfirmasi** "PIN berhasil diubah".
   - Kembalikan sukses; arahkan ke login.

---

## 5. Kebijakan Keamanan (semua dihitung per-email)

| Aturan | Nilai | Implementasi |
|--------|-------|--------------|
| Masa berlaku OTP | 5 menit | `expiresAt = createdAt + 5m`; verify menolak bila lewat |
| Batas salah per OTP | 3× | `attempts >= 3` → `status=LOCKED`, `lockedUntil=now+10m` |
| Cooldown resend setelah terkunci | 10 menit | `sendOtpAction` tolak bila ada OTP `lockedUntil > now` |
| Batas input OTP harian | 9× / hari (per email) | Hitung `attempts` di semua `OtpCode` email tsb untuk hari berjalan; `>= 9` → tolak sampai besok |
| Cooldown ganti PIN | 14 hari | `PinChangeLog` terakhir; tolak bila `< 14 hari` |
| Email konfirmasi | setelah reset PIN sukses | `sendPinChangedEmail` |

**Reset hitungan harian:** berdasarkan hari kalender WIB (Asia/Jakarta).

**Definisi "input OTP harian":** menjumlahkan jumlah percobaan verifikasi (`attempts`) pada
seluruh `OtpCode` dengan email sama yang `createdAt` berada di hari WIB berjalan.

---

## 6. Email Service (Resend)

Modul: `src/server/services/email-service.ts`.

- `sendOtpEmail(to, code, purpose): Promise<{ sent: boolean; devCode?: string; devMode: boolean }>`
- `sendPinChangedEmail(to, name): Promise<{ sent: boolean; devMode: boolean }>`

**Dev fallback** (bila `!process.env.RESEND_API_KEY` ATAU `process.env.OTP_DEV_MODE === "true"`):
- Tidak memanggil Resend.
- `console.log("[OTP][DEV] <email> kode: <code>")`.
- Mengembalikan `{ sent: false, devCode: code, devMode: true }` → UI menampilkan banner kuning
  "MODE DEV: kode OTP = 123456".

**Environment variable** (dokumentasikan di `.env.example`, isi aktual di `.env.local`):
```
RESEND_API_KEY=
OTP_EMAIL_FROM="HariKita <onboarding@resend.dev>"
OTP_DEV_MODE=true
```

**Template email:** HTML sederhana, tema HariKita (ivory/champagne/charcoal), dua varian
(OTP & konfirmasi PIN). Teks berbahasa Indonesia.

---

## 7. UI/UX

- Stepper visual 3 langkah (indikator progres) di dalam satu card, memakai token design system
  (`hk-*`, `font-editorial`, `font-manrope`) — selaras `/design-system-showcase?hub=brand`.
- Notifikasi:
  - Hijau: "OTP valid" / "PIN berhasil diubah".
  - Kuning (DEV): menampilkan kode OTP.
  - Merah: pesan error (kode salah, terkunci + sisa cooldown, batas harian, dll).
- Banner cooldown menampilkan hitung mundur (mm:ss) bila terkunci.
- Aksesibilitas: label `htmlFor`, `aria-live` untuk notifikasi, `autocomplete="one-time-code"`.

---

## 8. Dampak & Migrasi

- **User lama (dummy)**: skrip non-destruktif mengisi `email` yang kosong & set PIN `123456`.
- **`prisma/seed.ts`**: semua user demo (admin, client, 11 vendor, 3 BA) diberi email valid + PIN `123456`.
  - `admin@harikita.id`, `bima.citra@gmail.com`, `vendor1@harikita.id` … `vendor11@harikita.id`, `ba@harikita.id`, dll.
- `registerVendorAction` lama (satu langkah) **digantikan** oleh alur OTP. Field detail usaha
  tidak lagi diisi saat registrasi (dilengkapi vendor di `/dashboard/vendor/profil`).
- `registerClientAction` lama **digantikan** alur OTP.
- Login tetap `Nomor HP + PIN` (tidak berubah).

---

## 9. File yang Disentuh

| File | Perubahan |
|------|-----------|
| `prisma/schema.prisma` | Model `OtpCode`, `PinChangeLog`, relasi `User.pinChangeLogs` |
| `prisma/schema.sqlite.prisma` | Sinkron |
| `package.json` | Tambah `resend` |
| `src/server/services/email-service.ts` | **Baru** — kirim email + dev fallback |
| `src/server/services/otp-service.ts` | **Baru** — generate, verify, rate limit |
| `src/server/actions/auth.ts` | `sendOtpAction`, `verifyOtpAction`, `completeRegistrationAction`, `resetPinAction`; ganti register lama |
| `src/app/auth/register/page.tsx` | Stepper 3 tahap (CLIENT) |
| `src/app/auth/register-vendor/page.tsx` | Stepper 3 tahap (VENDOR) + referral |
| `src/app/auth/reset-pin/page.tsx` | **Baru** |
| `src/components/auth/LoginCard.tsx` | Link "Lupa PIN?" |
| `src/components/auth/OtpStepper.tsx` (opsional) | Komponen stepper reusable |
| `.env.example` | Dokumentasi var baru |
| `prisma/seed.ts` | Email + PIN untuk semua user demo |
| `tests/otp-service.test.ts` | **Baru** |

---

## 10. Testing

- **Unit (`otp-service`)**: generate kode format, expiry 5 menit, lock setelah 3× salah,
  cooldown resend 10 menit, batas harian 9×, cooldown ganti PIN 14 hari.
- **Unit (`email-service`)**: dev fallback mengembalikan `devCode` & tidak memanggil Resend.
- **Integrasi**: registrasi 3 tahap (dev mode) → user dibuat + sesi; reset PIN → PIN berubah +
  log tercatat; tolak ganti PIN dalam 14 hari.
- **Regresi**: 218 test lama tetap hijau; typecheck & build bersih.

---

## 11. Risiko & Catatan

- **Domain email**: untuk produksi, `onboarding@resend.dev` hanya bisa kirim ke email pemilik
  akun Resend. Perlu domain terverifikasi (`harikita.id`) agar email sampai ke user nyata.
- **Kebocoran API key**: key Resend yang pernah dikirim via chat **harus di-revoke**. Key baru
  hanya di `.env.local` (di-`.gitignore`).
- **Cookie OTP sementara**: `hk_otp` (httpOnly, short-lived) mencegah bypass "langsung set PIN
  tanpa verifikasi".
- **Email opsional di skema**: kewajiban ditegakkan aplikasi; user lama tanpa email tetap bisa
  login (HP+PIN), tetapi tidak bisa reset PIN sampai email diisi.
