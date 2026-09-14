# HariKita — Auth Middleware & Route Guard Design
**Spec Date:** 2026-09-14  
**Status:** Menunggu Review  
**Scope:** Auth session sederhana tanpa next-auth, berbasis cookie httpOnly + Next.js middleware

---

## Latar Belakang

Saat ini seluruh portal HariKita (`/admin`, `/vendor`, `/client`) dapat diakses oleh siapapun tanpa autentikasi. Halaman login (`/auth/login`) sudah memiliki UI yang lengkap, namun fungsi `handleLogin` hanya mensimulasikan login dengan `setTimeout` lalu redirect — **tidak ada verifikasi DB, tidak ada sesi, tidak ada proteksi route**.

Spec ini mendefinisikan implementasi auth minimal yang tuntas: dari login sungguhan hingga middleware yang memproteksi semua portal berdasarkan role.

---

## Keputusan Desain

### 1. Strategi Kredensial: Nomor HP + PIN 6-Digit

- **Identifikasi user:** Nomor HP (`phone`) — sudah ada di `User` model, unique
- **Verifikasi:** PIN 6 digit numerik — ditambahkan sebagai field baru `pin` (disimpan sebagai hash bcrypt)
- **Alasan:** Familiar untuk semua kalangan di Kebumen, tidak butuh email, mudah diingat

### 2. Session Management: Cookie httpOnly (tanpa next-auth)

- Setelah login sukses, server membuat **cookie httpOnly** bernama `hk_session`
- Isi cookie: JSON string `{ userId, role, name }` — di-encode sederhana untuk MVP lokal
- Cookie: `httpOnly: true`, `sameSite: 'lax'`, `maxAge: 7 hari`
- Tidak menggunakan JWT signing kompleks — cukup untuk MVP lokal SQLite

> **Catatan:** Untuk deployment production nanti, cookie perlu diganti dengan signed JWT menggunakan `iron-session` atau `jose`. Spec ini fokus pada MVP lokal yang berfungsi penuh.

### 3. Route Protection: Next.js Middleware

- File `src/middleware.ts` dibuat di root `src/`
- Middleware membaca cookie `hk_session` pada setiap request
- Logika proteksi:
  - `/client/*` → wajib login dengan role `CLIENT` atau `ADMIN`
  - `/vendor/*` kecuali `/vendor/[slug]` (profil publik) → wajib role `VENDOR` atau `ADMIN`
  - `/admin/*` → wajib role `ADMIN`
  - `/auth/*` → jika sudah login, redirect ke dashboard sesuai role
  - Semua route publik → bebas diakses

---

## Perubahan yang Diperlukan

### A. Prisma Schema — Tambah field `pin`

```prisma
model User {
  id    String  @id @default(cuid())
  name  String
  phone String  @unique
  email String? @unique
  pin   String? // bcrypt hash PIN 6-digit (nullable untuk backward compat)
  role  String  @default("CLIENT")
  ...
}
```

Jalankan: `npx prisma db push` (tidak butuh migration file untuk SQLite dev)

### B. File Baru yang Dibuat

| File | Deskripsi |
|------|-----------|
| `src/middleware.ts` | Next.js middleware — route guard berdasarkan cookie `hk_session` |
| `src/lib/session.ts` | Helper: `getSession()`, `setSessionCookie()`, `clearSessionCookie()` |
| `src/server/actions/auth.ts` | Server Actions: `loginAction()`, `logoutAction()`, `registerAction()` |
| `src/components/layout/UserProfileBadge.tsx` | Badge nama user + tombol logout di navbar portal |

### C. File yang Dimodifikasi

| File | Perubahan |
|------|-----------|
| `prisma/schema.prisma` | Tambah field `pin` ke model `User` |
| `src/app/auth/login/page.tsx` | Ganti `handleLogin` simulasi → panggil `loginAction()` |
| `src/app/auth/register/page.tsx` | Sambungkan ke `registerAction()` — buat User baru di DB |
| `src/app/auth/register-vendor/page.tsx` | Sambungkan ke `registerAction()` dengan role VENDOR |
| `prisma/seed.ts` | Tambah PIN default `123456` (hashed) untuk semua user seed |

---

## Alur Lengkap

```
[Pengguna buka /admin]
    │
    ▼
middleware.ts
  → baca cookie `hk_session`
  → tidak ada / role bukan ADMIN
    │
    ▼
redirect ke /auth/login?callbackUrl=/admin

[Di halaman Login]
  → pilih role "Super Admin"
  → masukkan No HP + PIN 6-digit
  → submit → loginAction() (Server Action)
    │
    ▼
loginAction():
  1. Cari User di DB by phone
  2. Verifikasi role sesuai yang dipilih
  3. Verifikasi PIN dengan bcrypt.compare()
  4. Jika valid → set cookie `hk_session`
  5. Return { success: true }

[Client side]
  → redirect ke callbackUrl (/admin) ✅
```

---

## Seed Data Default (Development)

| Nama | Nomor HP | PIN | Role |
|------|----------|-----|------|
| Admin HariKita | `08001000001` | `123456` | ADMIN |
| Aditya Pratama | `08001000002` | `123456` | CLIENT |
| Menganti Cinematic | `08001000003` | `123456` | VENDOR |

---

## Out of Scope (Tidak Dikerjakan Sekarang)

- ❌ OTP / SMS verification
- ❌ Email verification & lupa PIN
- ❌ OAuth (Google, Facebook)
- ❌ JWT signing dengan secret key
- ❌ Rate limiting login

---

## Definition of Done ✅

Implementasi selesai jika seluruh kondisi ini terpenuhi:

- [ ] `GET /admin` tanpa login → redirect ke `/auth/login?callbackUrl=/admin`
- [ ] `GET /vendor/inbox` tanpa login → redirect ke `/auth/login`
- [ ] `GET /client` tanpa login → redirect ke `/auth/login`
- [ ] Login HP `08001000001` + PIN `123456` → masuk `/admin`
- [ ] Login HP `08001000002` + PIN `123456` → masuk `/client`
- [ ] Login HP `08001000003` + PIN `123456` → masuk `/vendor`
- [ ] CLIENT login → coba akses `/admin` → redirect ke `/client`
- [ ] Tombol logout → hapus cookie → redirect ke `/auth/login`
- [ ] `/vendor/[slug]` profil publik tetap bisa diakses tanpa login
- [ ] Route publik (`/`, `/builder`, `/undangan/*`) tetap bebas diakses
- [ ] `npx tsc --noEmit` → tidak ada TypeScript error baru
