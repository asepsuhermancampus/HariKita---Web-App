# Registrasi & Reset PIN dengan OTP via Email — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Menambahkan verifikasi OTP via email (Resend) pada registrasi semua role (selain ADMIN) dan fitur Reset PIN, dengan kebijakan rate-limit per-email.

**Architecture:** Tabel baru `OtpCode` (kode ter-hash bcrypt) + `PinChangeLog` di Prisma (dual-provider postgres+sqlite). Service `otp-service.ts` menangani generate/verify/rate-limit; `email-service.ts` membungkus Resend + dev fallback. Server Actions mem-orkestrasi alur 3 tahap (identitas → OTP → set PIN). Anti-bypass via cookie httpOnly `hk_otp`.

**Tech Stack:** Next.js App Router, TypeScript, Prisma (PostgreSQL prod + SQLite dev/test), `node:test` + `tsx --test`, bcryptjs, Resend SDK, crypto (randomInt).

**Spec:** `docs/superpowers/specs/2026-09-20-otp-email-registration-reset-pin-design.md`

## Global Constraints

- Test runner: `npm test` → `tsx --test tests/*.test.ts`.
- Type-check: `npm run typecheck` (`tsc --noEmit`).
- Build: `npm run build` (`next build`). **JANGAN jalankan saat dev server hidup** — bersihkan `.next` dulu (`npm run clean`).
- Sintaks Prisma CLI: `npm run db:push` (postgres), `npm run db:push:sqlite`.
- Dua skema Prisma WAJIB sinkron: `prisma/schema.prisma` + `prisma/schema.sqlite.prisma`.
- Semua kode OTP 6-digit; hash dengan bcrypt (jangan simpan plaintext).
- Zona waktu untuk batas harian: **WIB (Asia/Jakarta, UTC+7)**.
- OTP berlaku **5 menit**; salah **3×** → `LOCKED` + `lockedUntil = now + 10 menit`.
- Batas input OTP harian **9×** per email (reset tengah malam WIB).
- Cooldown ganti PIN **14 hari** per user.
- Email wajib saat registrasi (validasi aplikasi; skema `email String?`).
- ADMIN dibuat manual (tanpa OTP).
- Bahasa UI: Indonesia.
- Role string: `"CLIENT" | "VENDOR" | "ADMIN" | "BA"`.
- Commit setelah tiap task (gaya repo: `feat(...)`, `test(...)`, `refactor(...)`).

---

## File Structure

| File | Tanggung jawab |
|------|----------------|
| `prisma/schema.prisma` (UBAH) | Model `OtpCode`, `PinChangeLog`, relasi `User.pinChangeLogs` (postgres) |
| `prisma/schema.sqlite.prisma` (UBAH) | Sinkron (sqlite) |
| `src/lib/indonesian-banks.ts` | (sudah ada) tidak berubah |
| `src/server/services/email-service.ts` (BARU) | Kirim email OTP & konfirmasi PIN via Resend + dev fallback |
| `src/server/services/otp-service.ts` (BARU) | Generate, verify, rate-limit OTP; cek cooldown PIN |
| `src/server/services/errors.ts` (UBAH) | Tambah `OtpErrorCode` ke union domain error |
| `src/types/errors.ts` (UBAH) | Tambah `OTP_ERROR_CODES` |
| `src/server/actions/auth.ts` (UBAH) | Action OTP + registrasi 3 tahap + reset PIN; hapus register lama |
| `src/lib/session.ts` (UBAH) | Helper cookie OTP sementara (`setOtpCookie`/`readOtpCookie`/`clearOtpCookie`) |
| `src/components/auth/OtpStepper.tsx` (BARU) | Komponen stepper registrasi/reset reusable |
| `src/app/auth/register/page.tsx` (UBAH) | Stepper 3 tahap (CLIENT) |
| `src/app/auth/register-vendor/page.tsx` (UBAH) | Stepper 3 tahap (VENDOR) + referral |
| `src/app/auth/reset-pin/page.tsx` (BARU) | Reset PIN 3 tahap |
| `src/components/auth/LoginCard.tsx` (UBAH) | Link "Lupa PIN?" |
| `prisma/seed.ts` (UBAH) | Email + PIN 123456 untuk semua user demo |
| `tests/helpers/test-db.ts` (UBAH) | Helper `seedOtpCode` |
| `tests/otp-service.test.ts` (BARU) | Test kebijakan OTP |
| `tests/email-service.test.ts` (BARU) | Test dev fallback |
| `.env.example` (UBAH) | Dokumentasi `RESEND_API_KEY`, `OTP_EMAIL_FROM`, `OTP_DEV_MODE` |

---

### Task 1: Skema Prisma — model OtpCode & PinChangeLog

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/schema.sqlite.prisma`

**Interfaces:**
- Produces: model `OtpCode` (`id, email, codeHash, purpose, status, attempts, expiresAt, lockedUntil, verifiedAt, createdAt`), `PinChangeLog` (`id, userId, changedAt`). Relasi `User.pinChangeLogs PinChangeLog[]`.

- [x] **Step 1: Tambah model ke `prisma/schema.prisma`**

Tambahkan sebelum blok `model Notification`:

```prisma
model OtpCode {
  id          String    @id @default(cuid())
  email       String
  codeHash    String
  purpose     String    @default("REGISTER") // "REGISTER" | "RESET_PIN"
  status      String    @default("PENDING")  // "PENDING" | "VERIFIED" | "LOCKED" | "CONSUMED"
  attempts    Int       @default(0)
  expiresAt   DateTime
  lockedUntil DateTime?
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

Lalu pada `model User`, tambahkan relasi (setelah `brandAmbassador BrandAmbassador?`):

```prisma
  pinChangeLogs     PinChangeLog[]
```

- [x] **Step 2: Salin perubahan identik ke `prisma/schema.sqlite.prisma`**

Terapkan blok model & relasi yang sama. Pastikan `datasource` tetap `provider = "sqlite"`.

- [x] **Step 3: Validasi & push skema**

Run: `npm run validate`
Expected: "The schema is valid".
Run: `npx prisma validate --schema prisma/schema.sqlite.prisma`
Expected: "The schema is valid".
Run: `npm run db:push`
Expected: database postgres ter-update tanpa error.
Run: `npm run db:push:sqlite`
Expected: `prisma/dev.db` ter-update tanpa error.

- [x] **Step 4: Regenerate clients**

Run: `npm run generate; if ($?) { npm run generate:sqlite }`
Expected: kedua client ter-generate tanpa error.

- [x] **Step 5: Verifikasi typecheck**

Run: `npm run typecheck`
Expected: bersih (exit 0).

- [x] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/schema.sqlite.prisma
git commit -m "feat(auth): add OtpCode and PinChangeLog models"
```

---

### Task 2: Error codes OTP + env documentation

**Files:**
- Modify: `src/types/errors.ts`
- Modify: `src/server/services/errors.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: `OTP_ERROR_CODES` (`INVALID_EMAIL`, `INVALID_PHONE`, `EMAIL_ALREADY_USED`, `PHONE_ALREADY_USED`, `OTP_NOT_FOUND`, `OTP_EXPIRED`, `OTP_INVALID`, `OTP_LOCKED`, `OTP_COOLDOWN`, `OTP_DAILY_LIMIT`, `PIN_TOO_RECENT`, `EMAIL_SEND_FAILED`), tipe `OtpErrorCode`, dan penambahan ke union `AnyDomainErrorCode`/`AppDomainErrorCode`.

- [x] **Step 1: Tambah kode error di `src/types/errors.ts`**

Setelah blok `AMBASSADOR_ERROR_CODES`, tambahkan:

```ts
// ── 6. AUTH / OTP ERROR CODES ──────────────────────────────────────────────
export const OTP_ERROR_CODES = [
  'INVALID_EMAIL',
  'INVALID_PHONE',
  'EMAIL_ALREADY_USED',
  'PHONE_ALREADY_USED',
  'OTP_NOT_FOUND',
  'OTP_EXPIRED',
  'OTP_INVALID',
  'OTP_LOCKED',
  'OTP_COOLDOWN',
  'OTP_DAILY_LIMIT',
  'PIN_TOO_RECENT',
  'EMAIL_SEND_FAILED',
] as const;

export type OtpErrorCode = (typeof OTP_ERROR_CODES)[number];
```

Lalu perbarui union `AppDomainErrorCode` (bagian paling bawah) menjadi:

```ts
export type AppDomainErrorCode =
  | AvailabilityErrorCode
  | OrderErrorCode
  | PaymentErrorCode
  | LedgerErrorCode
  | AmbassadorErrorCode
  | OtpErrorCode;
```

- [x] **Step 2: Tambah ke union di `src/server/services/errors.ts`**

Ubah import & union:

```ts
import type {
  AmbassadorErrorCode,
  AppDomainErrorCode,
  AvailabilityErrorCode,
  LedgerErrorCode,
  OrderErrorCode,
  OtpErrorCode,
  PaymentErrorCode,
} from "@/types/errors";

export type AnyDomainErrorCode =
  | AvailabilityErrorCode
  | OrderErrorCode
  | PaymentErrorCode
  | LedgerErrorCode
  | AmbassadorErrorCode
  | OtpErrorCode;
```

- [x] **Step 3: Dokumentasikan env baru di `.env.example`**

Tambahkan di akhir file:

```bash
# ── Email OTP (Resend) ────────────────────────────────────────────────────
# Kosongkan RESEND_API_KEY saat dev → OTP dicetak ke console + banner dev.
RESEND_API_KEY=""
OTP_EMAIL_FROM="HariKita <onboarding@resend.dev>"
# "true" saat dev: jangan kirim email asli, tampilkan kode di UI/console.
OTP_DEV_MODE="true"
```

- [x] **Step 4: Verifikasi typecheck**

Run: `npm run typecheck`
Expected: bersih.

- [x] **Step 5: Commit**

```bash
git add src/types/errors.ts src/server/services/errors.ts .env.example
git commit -m "feat(auth): add OTP domain error codes and email env docs"
```

---

### Task 3: Email Service (Resend + dev fallback)

**Files:**
- Create: `src/server/services/email-service.ts`
- Test: `tests/email-service.test.ts`
- Modify: `package.json` (tambah `resend`)

**Interfaces:**
- Produces:
  - `sendOtpEmail(to: string, code: string, purpose: "REGISTER" | "RESET_PIN"): Promise<{ sent: boolean; devMode: boolean; devCode?: string }>`
  - `sendPinChangedEmail(to: string, name: string): Promise<{ sent: boolean; devMode: boolean }>`
  - `isDevMode(): boolean`

- [x] **Step 1: Install Resend SDK**

Run: `npm install resend`
Expected: ditambahkan ke `dependencies`.

- [x] **Step 2: Write the failing test**

Buat `tests/email-service.test.ts`:

```ts
import { test, before, after } from "node:test";
import assert from "node:assert/strict";

const ORIGINAL_KEY = process.env.RESEND_API_KEY;
const ORIGINAL_DEV = process.env.OTP_DEV_MODE;

before(() => {
  delete process.env.RESEND_API_KEY;
  process.env.OTP_DEV_MODE = "true";
});

after(() => {
  if (ORIGINAL_KEY === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = ORIGINAL_KEY;
  if (ORIGINAL_DEV === undefined) delete process.env.OTP_DEV_MODE;
  else process.env.OTP_DEV_MODE = ORIGINAL_DEV;
});

test("sendOtpEmail in dev mode returns devCode without sending", async () => {
  const { sendOtpEmail } = await import("../src/server/services/email-service");
  const res = await sendOtpEmail("test@example.com", "123456", "REGISTER");
  assert.equal(res.sent, false);
  assert.equal(res.devMode, true);
  assert.equal(res.devCode, "123456");
});

test("sendPinChangedEmail in dev mode returns devMode true", async () => {
  const { sendPinChangedEmail } = await import("../src/server/services/email-service");
  const res = await sendPinChangedEmail("test@example.com", "Budi");
  assert.equal(res.sent, false);
  assert.equal(res.devMode, true);
});
```

- [x] **Step 3: Run test to verify it fails**

Run: `npx tsx --test tests/email-service.test.ts`
Expected: FAIL — module `../src/server/services/email-service` belum ada.

- [x] **Step 4: Implementasi `src/server/services/email-service.ts`**

```ts
import { Resend } from "resend";

/**
 * HariKita - Email Service
 *
 * Membungkus Resend untuk pengiriman OTP & notifikasi PIN. Bila
 * `RESEND_API_KEY` kosong ATAU `OTP_DEV_MODE === "true"`, email TIDAK
 * dikirim; kode dikembalikan sebagai `devCode` dan di-log ke console server
 * agar alur dapat diuji tanpa email asli.
 */

export interface SendResult {
  sent: boolean;
  devMode: boolean;
  devCode?: string;
}

/** True bila sedang mode dev (tanpa kirim email asli). */
export function isDevMode(): boolean {
  return !process.env.RESEND_API_KEY || process.env.OTP_DEV_MODE === "true";
}

function fromAddress(): string {
  return process.env.OTP_EMAIL_FROM || "HariKita <onboarding@resend.dev>";
}

/** Template HTML bergaya HariKita (ivory / champagne / charcoal). */
function wrapEmail(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html lang="id"><body style="margin:0;background:#F8F6F1;font-family:Manrope,Arial,sans-serif;color:#2B2B2B;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;font-family:Georgia,serif;font-size:30px;font-weight:bold;color:#2B2B2B;letter-spacing:1px;">HariKita</div>
    <div style="height:3px;width:64px;background:#C9A88A;border-radius:3px;margin:12px auto 24px;"></div>
    <div style="background:#ffffff;border:1px solid #E8DED1;border-radius:16px;padding:28px 24px;">
      <h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 12px;color:#2B2B2B;">${title}</h1>
      ${bodyHtml}
    </div>
    <p style="font-size:11px;color:#8a8078;text-align:center;margin-top:20px;">Email otomatis dari HariKita — jangan balas pesan ini.</p>
  </div>
</body></html>`;
}

/** Kirim kode OTP 6-digit ke email. */
export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: "REGISTER" | "RESET_PIN"
): Promise<SendResult> {
  if (isDevMode()) {
    console.log(`[OTP][DEV] ${purpose} → ${to} | kode: ${code}`);
    return { sent: false, devMode: true, devCode: code };
  }

  const title = purpose === "REGISTER" ? "Verifikasi Pendaftaran" : "Reset PIN";
  const html = wrapEmail(
    title,
    `<p style="font-size:13px;line-height:1.6;">Gunakan kode berikut untuk melanjutkan. Kode berlaku <strong>5 menit</strong>:</p>
     <div style="font-family:Consolas,monospace;font-size:34px;font-weight:bold;letter-spacing:8px;text-align:center;background:#F8F6F1;border:1px dashed #C9A88A;border-radius:12px;padding:18px;margin:16px 0;color:#88735B;">${code}</div>
     <p style="font-size:12px;color:#8a8078;">Jika Anda tidak meminta kode ini, abaikan email ini.</p>`
  );

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({ from: fromAddress(), to, subject: `Kode OTP HariKita — ${title}`, html });
    if (error) {
      console.error("[email-service] Resend error:", error);
      return { sent: false, devMode: false };
    }
    return { sent: true, devMode: false };
  } catch (err) {
    console.error("[email-service] Gagal mengirim OTP:", err);
    return { sent: false, devMode: false };
  }
}

/** Kirim notifikasi PIN berhasil diubah. */
export async function sendPinChangedEmail(to: string, name: string): Promise<SendResult> {
  const html = wrapEmail(
    "PIN Berhasil Diubah",
    `<p style="font-size:13px;line-height:1.6;">Halo ${name}, PIN akun HariKita Anda baru saja diubah.</p>
     <p style="font-size:12px;color:#8a8078;">Jika ini bukan Anda, segera hubungi tim HariKita.</p>`
  );
  if (isDevMode()) {
    console.log(`[EMAIL][DEV] PIN changed → ${to}`);
    return { sent: false, devMode: true };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({ from: fromAddress(), to, subject: "PIN HariKita Berhasil Diubah", html });
    if (error) {
      console.error("[email-service] Resend error:", error);
      return { sent: false, devMode: false };
    }
    return { sent: true, devMode: false };
  } catch (err) {
    console.error("[email-service] Gagal mengirim notifikasi PIN:", err);
    return { sent: false, devMode: false };
  }
}
```

- [x] **Step 5: Run test to verify it passes**

Run: `npx tsx --test tests/email-service.test.ts`
Expected: PASS (2 test).

- [x] **Step 6: Commit**

```bash
git add package.json package-lock.json src/server/services/email-service.ts tests/email-service.test.ts
git commit -m "feat(auth): email service with Resend and dev fallback"
```

---

### Task 4: OTP Service — generate & rate limit

**Files:**
- Create: `src/server/services/otp-service.ts`
- Test: `tests/otp-service.test.ts`
- Modify: `tests/helpers/test-db.ts`

**Interfaces:**
- Consumes: `prisma` dari `@/lib/prisma`, model `OtpCode` Task 1, `DomainError` + kode Task 2.
- Produces:
  - `generateOtp(): string` — 6 digit acak.
  - `issueOtp(email, purpose, tx?): Promise<{ otpId: string; code: string }>` — cek rate limit, buat record baru.
  - `WIB_DAY_START(date: Date): Date` — helper batas hari WIB (untuk test).
  - `checkSendAllowed(email, tx?): Promise<void>` — throw `OTP_COOLDOWN` bila masih ada lock.

- [x] **Step 1: Tambah helper test `seedOtpCode`**

Tambahkan di akhir `tests/helpers/test-db.ts`:

```ts
/** Membuat record OtpCode uji (kode default "123456"). */
export async function seedOtpCode(
  prisma: PrismaClient,
  opts: {
    email: string;
    purpose?: "REGISTER" | "RESET_PIN";
    status?: string;
    attempts?: number;
    expiresAt?: Date;
    lockedUntil?: Date | null;
    code?: string;
    createdAt?: Date;
  }
) {
  const bcrypt = (await import("bcryptjs")).default;
  const code = opts.code ?? "123456";
  const codeHash = await bcrypt.hash(code, 10);
  return prisma.otpCode.create({
    data: {
      email: opts.email.toLowerCase(),
      codeHash,
      purpose: opts.purpose ?? "REGISTER",
      status: opts.status ?? "PENDING",
      attempts: opts.attempts ?? 0,
      expiresAt: opts.expiresAt ?? new Date(Date.now() + 5 * 60 * 1000),
      lockedUntil: opts.lockedUntil ?? null,
      createdAt: opts.createdAt ?? new Date(),
    },
  });
}
```

- [x] **Step 2: Write the failing test**

Buat `tests/otp-service.test.ts`:

```ts
import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createTestDb, seedOtpCode, type TestDb } from "./helpers/test-db";
import type { PrismaClient } from "@prisma/client";
import { generateOtp, issueOtp, checkSendAllowed } from "../src/server/services/otp-service";

let ctx: TestDb;
let prisma: PrismaClient;

before(async () => {
  ctx = await createTestDb();
  prisma = ctx.prisma;
});

after(async () => {
  await ctx.cleanup();
});

beforeEach(async () => {
  await prisma.otpCode.deleteMany();
});

test("generateOtp returns 6-digit string", () => {
  const code = generateOtp();
  assert.match(code, /^\d{6}$/);
});

test("issueOtp creates a PENDING record with 5-minute expiry", async () => {
  const { otpId, code } = await issueOtp("a@b.com", "REGISTER", prisma);
  const row = await prisma.otpCode.findUnique({ where: { id: otpId } });
  assert.ok(row);
  assert.equal(row!.status, "PENDING");
  assert.match(code, /^\d{6}$/);
  const ttl = row!.expiresAt.getTime() - row!.createdAt.getTime();
  assert.ok(ttl >= 290000 && ttl <= 310000, `ttl=${ttl}`);
});

test("checkSendAllowed throws OTP_COOLDOWN while locked", async () => {
  await seedOtpCode(prisma, {
    email: "lock@b.com",
    status: "LOCKED",
    lockedUntil: new Date(Date.now() + 5 * 60 * 1000),
  });
  await assert.rejects(
    () => checkSendAllowed("lock@b.com", prisma),
    /OTP_COOLDOWN/
  );
});

test("checkSendAllowed passes when lock expired", async () => {
  await seedOtpCode(prisma, {
    email: "free@b.com",
    status: "LOCKED",
    lockedUntil: new Date(Date.now() - 1000),
  });
  await checkSendAllowed("free@b.com", prisma); // tidak throw
});
```

- [x] **Step 3: Run test to verify it fails**

Run: `npx tsx --test tests/otp-service.test.ts`
Expected: FAIL — module `../src/server/services/otp-service` belum ada.

- [x] **Step 4: Implementasi `src/server/services/otp-service.ts`**

```ts
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { DomainError } from "./errors";

export type OtpTx = Prisma.TransactionClient;
export type OtpPurpose = "REGISTER" | "RESET_PIN";

const OTP_TTL_MS = 5 * 60 * 1000;      // 5 menit
const MAX_ATTEMPTS = 3;                 // salah maksimal 3x
const LOCK_MS = 10 * 60 * 1000;         // cooldown 10 menit
const DAILY_LIMIT = 9;                  // maksimal input OTP / hari (WIB)

/** 6-digit acak aman (crypto). */
export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/** Awal hari WIB (UTC+7) dari sebuah tanggal. */
export function WIB_DAY_START(date: Date): Date {
  const WIB_OFFSET = 7 * 60 * 60 * 1000;
  const wib = new Date(date.getTime() + WIB_OFFSET);
  wib.setUTCHours(0, 0, 0, 0);
  return new Date(wib.getTime() - WIB_OFFSET);
}

/** Cek apakah pengiriman OTP boleh dilakukan (cooldown lock). */
export async function checkSendAllowed(email: string, tx?: OtpTx): Promise<void> {
  const db = tx ?? prisma;
  const locked = await db.otpCode.findFirst({
    where: {
      email: email.toLowerCase(),
      lockedUntil: { gt: new Date() },
    },
    orderBy: { lockedUntil: "desc" },
  });
  if (locked) {
    throw new DomainError(
      "OTP_COOLDOWN",
      "Terlalu banyak percobaan. Coba kirim ulang dalam 10 menit."
    );
  }
}

/** Membuat OTP baru (PENDING) untuk email+purpose. */
export async function issueOtp(
  email: string,
  purpose: OtpPurpose,
  tx?: OtpTx
): Promise<{ otpId: string; code: string }> {
  const db = tx ?? prisma;
  await checkSendAllowed(email, db);
  const code = generateOtp();
  const codeHash = await bcrypt.hash(code, 10);
  const row = await db.otpCode.create({
    data: {
      email: email.toLowerCase(),
      codeHash,
      purpose,
      status: "PENDING",
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  return { otpId: row.id, code };
}

/** Helper internal: baca konfigurasi untuk test (tidak diekspor publik). */
export const _otpConfig = { OTP_TTL_MS, MAX_ATTEMPTS, LOCK_MS, DAILY_LIMIT };
```

- [x] **Step 5: Run test to verify it passes**

Run: `npx tsx --test tests/otp-service.test.ts`
Expected: PASS (4 test).

- [x] **Step 6: Commit**

```bash
git add src/server/services/otp-service.ts tests/otp-service.test.ts tests/helpers/test-db.ts
git commit -m "feat(auth): OTP issue and cooldown rate limiting"
```

---

### Task 5: OTP Service — verify + daily limit

**Files:**
- Modify: `src/server/services/otp-service.ts`
- Test: `tests/otp-service.test.ts` (tambah test)

**Interfaces:**
- Consumes: fungsi Task 4.
- Produces:
  - `verifyOtp(input: { email; purpose; code }, tx?): Promise<{ otpId: string }>` — throw pada expired/invalid/locked; set VERIFIED.
  - `countDailyAttempts(email, now?, tx?): Promise<number>` — total attempts hari WIB.
  - `assertDailyLimit(email, tx?): Promise<void>` — throw `OTP_DAILY_LIMIT` bila ≥ 9.

- [x] **Step 1: Tambah test**

Tambahkan ke `tests/otp-service.test.ts`:

```ts
import { verifyOtp, countDailyAttempts, assertDailyLimit } from "../src/server/services/otp-service";

test("verifyOtp marks VERIFIED for correct code", async () => {
  await seedOtpCode(prisma, { email: "v@b.com", code: "654321", status: "PENDING" });
  const res = await verifyOtp({ email: "v@b.com", purpose: "REGISTER", code: "654321" }, prisma);
  const row = await prisma.otpCode.findUnique({ where: { id: res.otpId } });
  assert.equal(row!.status, "VERIFIED");
  assert.ok(row!.verifiedAt);
});

test("verifyOtp increments attempts and locks after 3 wrong", async () => {
  await seedOtpCode(prisma, { email: "w@b.com", code: "111111", status: "PENDING", attempts: 2 });
  await assert.rejects(
    () => verifyOtp({ email: "w@b.com", purpose: "REGISTER", code: "999999" }, prisma),
    /OTP_INVALID/
  );
  const row = await prisma.otpCode.findFirst({ where: { email: "w@b.com" } });
  assert.equal(row!.status, "LOCKED");
  assert.equal(row!.attempts, 3);
  assert.ok(row!.lockedUntil && row!.lockedUntil.getTime() > Date.now());
});

test("verifyOtp rejects expired code", async () => {
  await seedOtpCode(prisma, { email: "e@b.com", code: "222222", expiresAt: new Date(Date.now() - 1000) });
  await assert.rejects(
    () => verifyOtp({ email: "e@b.com", purpose: "REGISTER", code: "222222" }, prisma),
    /OTP_EXPIRED/
  );
});

test("assertDailyLimit throws at 9 attempts within WIB day", async () => {
  for (let i = 0; i < 3; i++) {
    await seedOtpCode(prisma, { email: "d@b.com", attempts: 3, createdAt: new Date() });
  }
  assert.equal(await countDailyAttempts("d@b.com", new Date(), prisma), 9);
  await assert.rejects(() => assertDailyLimit("d@b.com", prisma), /OTP_DAILY_LIMIT/);
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/otp-service.test.ts`
Expected: FAIL — `verifyOtp`/`countDailyAttempts`/`assertDailyLimit` belum ada.

- [x] **Step 3: Tambah implementasi ke `src/server/services/otp-service.ts`**

Tambahkan setelah `issueOtp`:

```ts
/** Total percobaan input OTP (attempts) per-email pada hari WIB berjalan. */
export async function countDailyAttempts(
  email: string,
  now: Date = new Date(),
  tx?: OtpTx
): Promise<number> {
  const db = tx ?? prisma;
  const start = WIB_DAY_START(now);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const agg = await db.otpCode.aggregate({
    where: {
      email: email.toLowerCase(),
      createdAt: { gte: start, lt: end },
    },
    _sum: { attempts: true },
  });
  return agg._sum.attempts ?? 0;
}

/** Throw OTP_DAILY_LIMIT bila sudah mencapai batas harian. */
export async function assertDailyLimit(email: string, tx?: OtpTx): Promise<void> {
  const total = await countDailyAttempts(email, new Date(), tx);
  if (total >= DAILY_LIMIT) {
    throw new DomainError(
      "OTP_DAILY_LIMIT",
      "Batas percobaan harian tercapai. Coba lagi besok."
    );
  }
}

/** Verifikasi kode OTP. Set VERIFIED bila cocok; naikkan attempts bila salah. */
export async function verifyOtp(
  input: { email: string; purpose: OtpPurpose; code: string },
  tx?: OtpTx
): Promise<{ otpId: string }> {
  const db = tx ?? prisma;
  const email = input.email.toLowerCase();

  await assertDailyLimit(email, db);

  const row = await db.otpCode.findFirst({
    where: { email, purpose: input.purpose, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  if (!row) throw new DomainError("OTP_NOT_FOUND", "Kode OTP tidak ditemukan. Kirim ulang.");

  if (row.expiresAt.getTime() < Date.now()) {
    await db.otpCode.update({ where: { id: row.id }, data: { status: "LOCKED" } });
    throw new DomainError("OTP_EXPIRED", "Kode OTP sudah kedaluwarsa. Kirim ulang.");
  }
  if (row.status === "LOCKED") {
    throw new DomainError("OTP_LOCKED", "Kode OTP terkunci. Tunggu 10 menit.");
  }

  const ok = await bcrypt.compare(input.code, row.codeHash);
  if (!ok) {
    const attempts = row.attempts + 1;
    const reached = attempts >= MAX_ATTEMPTS;
    await db.otpCode.update({
      where: { id: row.id },
      data: {
        attempts,
        status: reached ? "LOCKED" : "PENDING",
        lockedUntil: reached ? new Date(Date.now() + LOCK_MS) : null,
      },
    });
    if (reached) {
      throw new DomainError("OTP_LOCKED", "Terlalu banyak salah. Tunggu 10 menit.");
    }
    throw new DomainError("OTP_INVALID", "Kode OTP salah.");
  }

  await db.otpCode.update({
    where: { id: row.id },
    data: { status: "VERIFIED", verifiedAt: new Date() },
  });
  return { otpId: row.id };
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/otp-service.test.ts`
Expected: PASS (semua test).

- [x] **Step 5: Commit**

```bash
git add src/server/services/otp-service.ts tests/otp-service.test.ts
git commit -m "feat(auth): OTP verify with lock and daily limit"
```

---

### Task 6: OTP Service — cek cooldown ganti PIN (14 hari)

**Files:**
- Modify: `src/server/services/otp-service.ts`
- Test: `tests/otp-service.test.ts` (tambah)

**Interfaces:**
- Produces: `assertPinChangeAllowed(userId, tx?): Promise<void>` — throw `PIN_TOO_RECENT` bila `< 14 hari`. Tipe `AmbassadorTx`-style `OtpTx` sudah ada.

- [x] **Step 1: Tambah test**

Tambahkan ke `tests/otp-service.test.ts`:

```ts
import { assertPinChangeAllowed } from "../src/server/services/otp-service";

test("assertPinChangeAllowed throws PIN_TOO_RECENT within 14 days", async () => {
  const user = await prisma.user.create({ data: { name: "U", phone: "081100000001", role: "CLIENT" } });
  await prisma.pinChangeLog.create({ data: { userId: user.id, changedAt: new Date(Date.now() - 3 * 86400000) } });
  await assert.rejects(() => assertPinChangeAllowed(user.id, prisma), /PIN_TOO_RECENT/);
});

test("assertPinChangeAllowed passes after 14 days", async () => {
  const user = await prisma.user.create({ data: { name: "V", phone: "081100000002", role: "CLIENT" } });
  await prisma.pinChangeLog.create({ data: { userId: user.id, changedAt: new Date(Date.now() - 15 * 86400000) } });
  await assertPinChangeAllowed(user.id, prisma); // tidak throw
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/otp-service.test.ts`
Expected: FAIL — `assertPinChangeAllowed` belum ada.

- [x] **Step 3: Tambah implementasi**

Tambahkan konstanta `const PIN_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;` di dekat konstanta lain, dan tambahkan fungsi:

```ts
/** Throw PIN_TOO_RECENT bila PIN terakhir diubah < 14 hari lalu. */
export async function assertPinChangeAllowed(userId: string, tx?: OtpTx): Promise<void> {
  const db = tx ?? prisma;
  const last = await db.pinChangeLog.findFirst({
    where: { userId },
    orderBy: { changedAt: "desc" },
  });
  if (last && Date.now() - last.changedAt.getTime() < PIN_COOLDOWN_MS) {
    throw new DomainError(
      "PIN_TOO_RECENT",
      "PIN hanya dapat diubah setiap 14 hari sekali."
    );
  }
}
```

Tambahkan juga `PIN_COOLDOWN_MS` ke `_otpConfig`:

```ts
export const _otpConfig = { OTP_TTL_MS, MAX_ATTEMPTS, LOCK_MS, DAILY_LIMIT, PIN_COOLDOWN_MS };
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/otp-service.test.ts`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/server/services/otp-service.ts tests/otp-service.test.ts
git commit -m "feat(auth): enforce 14-day PIN change cooldown"
```

---

### Task 7: Cookie OTP sementara (helper sesi)

**Files:**
- Modify: `src/lib/session.ts`

**Interfaces:**
- Produces: `setOtpCookie(otpId: string): Promise<void>`, `readOtpCookie(): Promise<string | null>`, `clearOtpCookie(): Promise<void>` — cookie httpOnly `hk_otp`, maxAge 10 menit.

- [x] **Step 1: Tambah helper ke `src/lib/session.ts`**

Tambahkan di akhir file:

```ts
const OTP_COOKIE_NAME = "hk_otp";
const OTP_COOKIE_MAX_AGE = 60 * 10; // 10 menit

/** Menyimpan id OTP terverifikasi sementara (anti-bypass). */
export async function setOtpCookie(otpId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(OTP_COOKIE_NAME, otpId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: OTP_COOKIE_MAX_AGE,
  });
}

/** Membaca id OTP dari cookie (atau null). */
export async function readOtpCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(OTP_COOKIE_NAME)?.value ?? null;
}

/** Menghapus cookie OTP. */
export async function clearOtpCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(OTP_COOKIE_NAME);
}
```

- [x] **Step 2: Verifikasi typecheck**

Run: `npm run typecheck`
Expected: bersih.

- [x] **Step 3: Commit**

```bash
git add src/lib/session.ts
git commit -m "feat(auth): temporary httpOnly OTP cookie helpers"
```

---

### Task 8: Server Actions — OTP & registrasi 3 tahap

**Files:**
- Modify: `src/server/actions/auth.ts`

**Interfaces:**
- Consumes: `issueOtp`, `verifyOtp`, `sendOtpEmail`, `setOtpCookie`/`readOtpCookie`/`clearOtpCookie`.
- Produces:
  - `sendOtpAction(input: { name?; phone?; email; purpose: "REGISTER" | "RESET_PIN"; role?: string }): Promise<ActionResult<{ devCode?: string }>>`
  - `verifyOtpAction(input: { email; purpose; code }): Promise<ActionResult<{ verified: true }>>`
  - `completeRegistrationAction(input: { name; phone; email; pin; role; referralCode? }): Promise<ActionResult<{ redirectTo: string }>>`
  - Hapus `registerClientAction` & `registerVendorAction` lama (digantikan).

- [x] **Step 1: Ganti isi `src/server/actions/auth.ts`**

Ganti fungsi `registerClientAction` & `registerVendorAction` dengan tiga action baru, dan tambahkan import:

```ts
import { runAction, type ActionResult } from "./_shared";
import { DomainError } from "@/server/services/errors";
import {
  issueOtp,
  verifyOtp,
  assertPinChangeAllowed,
  type OtpPurpose,
} from "@/server/services/otp-service";
import { sendOtpEmail, sendPinChangedEmail } from "@/server/services/email-service";
import {
  setSessionCookie,
  clearSessionCookie,
  getSession,
  getDashboardPath,
  getLoginPath,
  setOtpCookie,
  readOtpCookie,
  clearOtpCookie,
  SessionData,
} from "@/lib/session";
```

Tambahkan helper validasi & action:

```ts
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^08\d{8,12}$/;

/**
 * Mengirim OTP ke email. Untuk REGISTER, memastikan email & HP belum terpakai.
 * Untuk RESET_PIN, email harus terdaftar (pesan generik bila tidak).
 */
export async function sendOtpAction(input: {
  name?: string;
  phone?: string;
  email: string;
  purpose: OtpPurpose;
  role?: string;
}): Promise<ActionResult<{ devCode?: string }>> {
  return runAction(async () => {
    const email = input.email?.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      throw new DomainError("INVALID_EMAIL", "Format email tidak valid.");
    }

    if (input.purpose === "REGISTER") {
      const name = input.name?.trim();
      const phone = input.phone?.trim();
      if (!name) throw new DomainError("INVALID_PHONE", "Nama lengkap wajib diisi.");
      if (!phone || !PHONE_RE.test(phone)) {
        throw new DomainError("INVALID_PHONE", "Nomor HP tidak valid (contoh: 081234567890).");
      }
      const byPhone = await prisma.user.findUnique({ where: { phone } });
      if (byPhone) throw new DomainError("PHONE_ALREADY_USED", "Nomor HP sudah terdaftar.");
      const byEmail = await prisma.user.findUnique({ where: { email } });
      if (byEmail) throw new DomainError("EMAIL_ALREADY_USED", "Email sudah terdaftar.");
    } else {
      const user = await prisma.user.findUnique({ where: { email } });
      // Pesan generik agar tidak membocorkan status email.
      if (!user) {
        throw new DomainError("INVALID_EMAIL", "Jika email terdaftar, kode akan dikirim.");
      }
    }

    const { otpId, code } = await issueOtp(email, input.purpose);
    void otpId;
    const result = await sendOtpEmail(email, code, input.purpose);
    if (!result.sent && !result.devMode) {
      throw new DomainError("EMAIL_SEND_FAILED", "Gagal mengirim email. Coba lagi.");
    }
    return result.devCode ? { devCode: result.devCode } : {};
  });
}

/** Memverifikasi kode OTP; menyimpan otpId di cookie bila valid. */
export async function verifyOtpAction(input: {
  email: string;
  purpose: OtpPurpose;
  code: string;
}): Promise<ActionResult<{ verified: true }>> {
  return runAction(async () => {
    const email = input.email?.trim().toLowerCase();
    const { otpId } = await verifyOtp({ email, purpose: input.purpose, code: input.code?.trim() });
    await setOtpCookie(otpId);
    return { verified: true as const };
  });
}

/** Menyelesaikan registrasi (butuh OTP VERIFIED via cookie). */
export async function completeRegistrationAction(input: {
  name: string;
  phone: string;
  email: string;
  pin: string;
  role: string;
  referralCode?: string;
}): Promise<ActionResult<{ redirectTo: string }>> {
  return runAction(async () => {
    const email = input.email?.trim().toLowerCase();
    const name = input.name?.trim();
    const phone = input.phone?.trim();
    const pin = input.pin?.trim();

    const otpId = await readOtpCookie();
    if (!otpId) throw new DomainError("OTP_NOT_FOUND", "Verifikasi OTP belum selesai.");
    const otp = await prisma.otpCode.findUnique({ where: { id: otpId } });
    if (!otp || otp.status !== "VERIFIED" || otp.email !== email || otp.purpose !== "REGISTER") {
      throw new DomainError("OTP_NOT_FOUND", "Verifikasi OTP tidak valid. Ulangi.");
    }
    if (!name || !phone || !PHONE_RE.test(phone)) {
      throw new DomainError("INVALID_PHONE", "Data identitas tidak valid.");
    }
    if (!/^\d{6}$/.test(pin)) throw new DomainError("PIN_TOO_RECENT", "PIN harus 6 digit.");

    const role = ["CLIENT", "VENDOR"].includes(input.role) ? input.role : "CLIENT";
    const hashedPin = await bcrypt.hash(pin, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name,
          phone,
          email,
          pin: hashedPin,
          role,
          ...(role === "VENDOR"
            ? { vendorProfile: { create: { businessName: name, category: "katering", address: "-", city: "Kebumen" } } }
            : {}),
        },
      });
      await tx.pinChangeLog.create({ data: { userId: u.id } });
      await tx.otpCode.update({ where: { id: otpId }, data: { status: "CONSUMED" } });
      return u;
    });

    if (role === "VENDOR" && input.referralCode) {
      const vp = await prisma.vendorProfile.findUnique({ where: { userId: newUser.id } });
      if (vp) await attributeVendorToReferral(vp.id, input.referralCode);
    }

    await clearOtpCookie();
    await setSessionCookie({ userId: newUser.id, role: newUser.role, name: newUser.name, phone: newUser.phone });
    return { redirectTo: getDashboardPath(newUser.role) };
  });
}

/** Kirim OTP untuk reset PIN. */
export async function sendResetOtpAction(email: string): Promise<ActionResult<{ devCode?: string }>> {
  return sendOtpAction({ email, purpose: "RESET_PIN" });
}

/** Set PIN baru setelah OTP VERIFIED (reset). */
export async function resetPinAction(input: {
  email: string;
  pin: string;
}): Promise<ActionResult<{ ok: true }>> {
  return runAction(async () => {
    const email = input.email?.trim().toLowerCase();
    const pin = input.pin?.trim();
    const otpId = await readOtpCookie();
    if (!otpId) throw new DomainError("OTP_NOT_FOUND", "Verifikasi OTP belum selesai.");
    const otp = await prisma.otpCode.findUnique({ where: { id: otpId } });
    if (!otp || otp.status !== "VERIFIED" || otp.email !== email || otp.purpose !== "RESET_PIN") {
      throw new DomainError("OTP_NOT_FOUND", "Verifikasi OTP tidak valid. Ulangi.");
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new DomainError("OTP_NOT_FOUND", "Akun tidak ditemukan.");
    await assertPinChangeAllowed(user.id);
    if (!/^\d{6}$/.test(pin)) throw new DomainError("PIN_TOO_RECENT", "PIN harus 6 digit.");

    const hashedPin = await bcrypt.hash(pin, 10);
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { pin: hashedPin } });
      await tx.pinChangeLog.create({ data: { userId: user.id } });
      await tx.otpCode.update({ where: { id: otpId }, data: { status: "CONSUMED" } });
    });
    await clearOtpCookie();
    await sendPinChangedEmail(email, user.name);
    return { ok: true as const };
  });
}
```

> Catatan: `sendResetOtpAction` & `resetPinAction` boleh ditempatkan di file yang sama. Pastikan `runAction` & `ActionResult` diimpor dari `./_shared`.

- [x] **Step 2: Verifikasi typecheck**

Run: `npm run typecheck`
Expected: bersih (perbaiki bila ada `ActionResult` import yang belum dipakai).

- [x] **Step 3: Commit**

```bash
git add src/server/actions/auth.ts
git commit -m "feat(auth): OTP server actions for registration and PIN reset"
```

---

### Task 9: UI — komponen stepper & halaman registrasi/reset

**Files:**
- Create: `src/components/auth/OtpStepper.tsx`
- Modify: `src/app/auth/register/page.tsx`
- Modify: `src/app/auth/register-vendor/page.tsx`
- Create: `src/app/auth/reset-pin/page.tsx`
- Modify: `src/components/auth/LoginCard.tsx`

**Interfaces:**
- Consumes: `sendOtpAction`, `verifyOtpAction`, `completeRegistrationAction`, `sendResetOtpAction`, `resetPinAction`.
- Produces: komponen `OtpStepper` dengan props `{ role: "CLIENT" | "VENDOR"; withReferral?: boolean; title: string; onDone: (redirectTo: string) => void }`.

- [x] **Step 1: Buat `src/components/auth/OtpStepper.tsx`**

Komponen client dengan 3 tahap (`identity` → `otp` → `pin`) memakai token `hk-*` & `font-editorial`/`font-manrope`:
- Tahap 1: input nama, phone, email (+referral bila `withReferral`); tombol "Kirim Kode OTP" → `sendOtpAction`; simpan `devCode` bila ada.
- Tahap 2: input 6 digit `inputMode="numeric"` `autoComplete="one-time-code"`; tampilkan banner kuning DEV (`devCode`) bila ada; tombol "Verifikasi" → `verifyOtpAction`; "Kirim Ulang" → `sendOtpAction` lagi.
- Tahap 3: PIN + konfirmasi; tombol "Buat Akun" → `completeRegistrationAction`; sukses → `onDone(redirectTo)`.
- Notif: hijau "OTP valid" saat lolos tahap 2; merah untuk error; banner cooldown memakai `res.message`.

```tsx
"use client";
import React, { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { sendOtpAction, verifyOtpAction, completeRegistrationAction } from "@/server/actions/auth";

type Stage = "identity" | "otp" | "pin";

export function OtpStepper({
  role,
  withReferral = false,
  title,
  onDone,
}: {
  role: "CLIENT" | "VENDOR";
  withReferral?: boolean;
  title: string;
  onDone: (redirectTo: string) => void;
}) {
  const [stage, setStage] = useState<Stage>("identity");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sendOtp = () => {
    setError(null);
    startTransition(async () => {
      const res = await sendOtpAction({ name, phone, email, purpose: "REGISTER", role });
      if (!res.success) { setError(res.message); return; }
      if ("devCode" in res.data && res.data.devCode) setDevCode(res.data.devCode);
      setStage("otp");
      setSuccess(`Kode dikirim ke ${email}.`);
    });
  };

  const verify = () => {
    setError(null); setSuccess(null);
    startTransition(async () => {
      const res = await verifyOtpAction({ email, purpose: "REGISTER", code });
      if (!res.success) { setError(res.message); return; }
      setSuccess("OTP valid.");
      setStage("pin");
    });
  };

  const finish = () => {
    setError(null);
    if (pin !== pin2) { setError("Konfirmasi PIN tidak cocok."); return; }
    startTransition(async () => {
      const res = await completeRegistrationAction({ name, phone, email, pin, role, referralCode: referralCode || undefined });
      if (!res.success) { setError(res.message); return; }
      onDone(res.data.redirectTo);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-hk-champagne/40 shadow-sm p-6 sm:p-8 space-y-5 font-manrope text-xs text-hk-charcoal">
      {/* stepper indicator */}
      <div className="flex items-center gap-2">
        {(["identity", "otp", "pin"] as Stage[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${stage === s ? "bg-hk-taupe text-white" : "bg-hk-soft-beige text-hk-charcoal/60"}`}>{i + 1}</span>
            {i < 2 && <span className="h-px w-6 bg-hk-soft-beige" />}
          </div>
        ))}
      </div>

      <h1 className="font-editorial text-xl font-bold">{title}</h1>

      {devCode && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          MODE DEV — kode OTP: <strong className="font-mono">{devCode}</strong>
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800 flex gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />{success}</div>
      )}
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 flex gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{error}</div>
      )}

      {stage === "identity" && (
        <div className="space-y-3">
          <input className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige" placeholder="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige" placeholder="Nomor HP / WhatsApp Aktif" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {withReferral && (
            <input className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige" placeholder="Kode Referral BA (opsional)" value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())} />
          )}
          <button disabled={isPending} onClick={sendOtp} className="focus-ring w-full min-h-[44px] rounded-full bg-hk-taupe text-white font-semibold hover:bg-hk-charcoal disabled:opacity-50">Kirim Kode OTP</button>
        </div>
      )}

      {stage === "otp" && (
        <div className="space-y-3">
          <input className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige tracking-[0.5em] text-center" placeholder="______" inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={code} onChange={(e) => { if (/^\d{0,6}$/.test(e.target.value)) setCode(e.target.value); }} />
          <button disabled={isPending} onClick={verify} className="focus-ring w-full min-h-[44px] rounded-full bg-hk-taupe text-white font-semibold hover:bg-hk-charcoal disabled:opacity-50"><ShieldCheck className="inline w-4 h-4 mr-1" />Verifikasi OTP</button>
          <button disabled={isPending} onClick={sendOtp} className="w-full text-hk-taupe underline">Kirim Ulang Kode</button>
        </div>
      )}

      {stage === "pin" && (
        <div className="space-y-3">
          <input className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige tracking-widest" placeholder="PIN 6-digit" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => { if (/^\d{0,6}$/.test(e.target.value)) setPin(e.target.value); }} />
          <input className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige tracking-widest" placeholder="Konfirmasi PIN" inputMode="numeric" maxLength={6} value={pin2} onChange={(e) => { if (/^\d{0,6}$/.test(e.target.value)) setPin2(e.target.value); }} />
          <button disabled={isPending} onClick={finish} className="focus-ring w-full min-h-[44px] rounded-full bg-hk-charcoal text-white font-semibold hover:bg-hk-taupe disabled:opacity-50">Buat Akun</button>
        </div>
      )}
    </div>
  );
}
```

- [x] **Step 2: Ganti `src/app/auth/register/page.tsx`**

```tsx
"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { OtpStepper } from "@/components/auth/OtpStepper";

export default function AuthRegisterPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-hk-ivory text-hk-charcoal flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-manrope">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-hk-charcoal/60 hover:text-hk-charcoal"><ChevronLeft className="w-4 h-4" /> Kembali ke Beranda HariKita</Link>
          <div className="mt-4 font-editorial text-4xl font-bold tracking-wide">HariKita</div>
          <p className="text-xs text-hk-charcoal/60 mt-1">Daftar Akun Calon Pengantin &amp; Keluarga</p>
        </div>
        <OtpStepper role="CLIENT" title="Daftar Akun Pengantin" onDone={(to) => router.push(to)} />
        <p className="text-center text-xs text-hk-charcoal/60">Sudah punya akun? <Link href="/auth/login" className="font-semibold text-hk-taupe underline">Masuk di sini</Link></p>
      </div>
    </div>
  );
}
```

- [x] **Step 3: Ganti `src/app/auth/register-vendor/page.tsx`**

```tsx
"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { OtpStepper } from "@/components/auth/OtpStepper";

export default function AuthRegisterVendorPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-hk-ivory text-hk-charcoal flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-manrope">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-hk-charcoal/60 hover:text-hk-charcoal"><ChevronLeft className="w-4 h-4" /> Kembali ke Beranda HariKita</Link>
          <div className="mt-4 font-editorial text-4xl font-bold tracking-wide">HariKita</div>
          <p className="text-xs text-hk-charcoal/60 mt-1">Pendaftaran Kemitraan Vendor Lokal Kabupaten Kebumen</p>
        </div>
        <OtpStepper role="VENDOR" withReferral title="Daftar Akun Mitra Vendor" onDone={(to) => router.push(to)} />
        <p className="text-[11px] text-center text-hk-charcoal/60">Detail usaha (nama studio, kategori, alamat) dapat dilengkapi di dashboard setelah masuk.</p>
      </div>
    </div>
  );
}
```

- [x] **Step 4: Buat `src/app/auth/reset-pin/page.tsx`**

Halaman client 3 tahap (email → OTP → PIN baru) memakai `sendResetOtpAction`, `verifyOtpAction({ purpose: "RESET_PIN" })`, `resetPinAction`. Setelah sukses → tampilkan notif hijau lalu tombol "Masuk" ke `/auth/login`. Ikuti pola `OtpStepper` (boleh inline, tidak wajib komponen terpisah).

- [x] **Step 5: Tambah link "Lupa PIN?" di `src/components/auth/LoginCard.tsx`**

Di bawah tombol submit, tambahkan:

```tsx
<div className="text-center">
  <Link href="/auth/reset-pin" className="text-[11px] font-manrope text-hk-taupe hover:text-hk-charcoal underline">
    Lupa PIN?
  </Link>
</div>
```

(Pastikan `Link` sudah diimpor.)

- [x] **Step 6: Verifikasi typecheck**

Run: `npm run typecheck`
Expected: bersih.

- [x] **Step 7: Commit**

```bash
git add src/components/auth/OtpStepper.tsx src/app/auth/register/page.tsx src/app/auth/register-vendor/page.tsx src/app/auth/reset-pin/page.tsx src/components/auth/LoginCard.tsx
git commit -m "feat(auth): OTP registration stepper and reset PIN page"
```

---

### Task 10: Seed data dummy (email + PIN)

**Files:**
- Modify: `prisma/seed.ts`

**Interfaces:**
- Consumes: model Task 1.

- [x] **Step 1: Pastikan semua user demo punya email & PIN**

- Admin, client, BA1/BA2/BA3 sudah punya email → **verifikasi** tidak ada yang null.
- Vendor loop: tambahkan `email` (sudah ada `vendor${i+1}@harikita.id`) — pastikan tetap.
- Tambahkan `${prisma.otpCode.deleteMany()}` & `${prisma.pinChangeLog.deleteMany()}` pada blok cleanup (di awal `main()`), SEBELUM `user.deleteMany()`.

- [x] **Step 2: Tambahkan `PinChangeLog` awal untuk tiap user demo**

Setelah setiap `user.create`, tambahkan `await prisma.pinChangeLog.create({ data: { userId: <user>.id } })`. (Bisa dibungkus helper lokal `seedUserWithPin`.)

> Alternatif minimal: buat helper `async function logPin(userId: string)` dan panggil untuk admin, client, BA, dan tiap vendor.

- [x] **Step 3: Jalankan seeder terhadap DB lokal**

Run: `npm run db:push:sqlite; if ($?) { npm run db:seed }`
Expected: seed sukses tanpa error; log menampilkan akun demo.

- [x] **Step 4: Commit**

```bash
git add prisma/seed.ts
git commit -m "test(auth): seed demo users with email and PIN"
```

---

### Task 11: Migrasi data dummy DB aktif (non-destruktif)

**Files:**
- Create: `scripts/backfill-user-emails.ts` (script sekali jalan, boleh dihapus setelahnya)

**Interfaces:**
- Consumes: `prisma`.

- [x] **Step 1: Buat script backfill**

Script mengisi `email` yang kosong untuk user nyata di DB aktif (mis. `phone@harikita.id`) dan memastikan ada `PinChangeLog` bila belum ada. Idempotent.

- [x] **Step 2: Jalankan terhadap DB dev aktif**

Run: `npx tsx scripts/backfill-user-emails.ts`
Expected: log jumlah user yang di-update.

- [x] **Step 3: Verifikasi login admin/client/vendor/BA tetap bekerja (HP+PIN)**

Run: `npx tsx -e "..."` yang mengecek `user.findMany` semua punya email.

- [x] **Step 4: Commit**

```bash
git add scripts/backfill-user-emails.ts
git commit -m "chore(auth): backfill emails for existing demo users"
```

---

### Task 12: Verifikasi akhir

**Files:** tidak ada file baru.

- [x] **Step 1: Jalankan seluruh test**

Run: `npm test`
Expected: semua hijau (termasuk `otp-service.test.ts`, `email-service.test.ts`, 218 test lama).

- [x] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: bersih.

- [x] **Step 3: Build produksi (dev server mati + `.next` bersih)**

Run: `npm run clean; if ($?) { npm run build }`
Expected: sukses tanpa error.

- [x] **Step 4: Verifikasi skema sinkron**

Run: `npm run validate; npx prisma validate --schema prisma/schema.sqlite.prisma`
Expected: keduanya "The schema is valid".

- [x] **Step 5: Checklist manual (dev, `OTP_DEV_MODE=true`)**

- Registrasi CLIENT: Nama+HP+Email → OTP (banner dev) → PIN → auto-login `/client`.
- Registrasi VENDOR + kode referral valid → vendor dibuat & terkait BA.
- Salah OTP 3× → pesan terkunci; resend ditolak sampai 10 menit.
- Reset PIN via "Lupa PIN?" → OTP → PIN baru → email konfirmasi (log dev).
- Coba ganti PIN lagi dalam 14 hari → ditolak.
- Login tetap HP+PIN.

- [x] **Step 6: Commit sisa (bila ada perbaikan)**

```bash
git add -A
git commit -m "chore(auth): final verification fixes for OTP registration"
```

---

## Self-Review

**1. Spec coverage:**
- Alur registrasi 3 tahap (semua role) → Task 8, 9 ✅
- Email wajib → Task 8 (`sendOtpAction` validasi) ✅
- Vendor: identitas saja + referral → Task 8, 9 ✅
- Tabel `OtpCode` + `PinChangeLog` → Task 1 ✅
- Resend + dev fallback → Task 3 ✅
- Reset PIN + link Lupa PIN → Task 8, 9 ✅
- OTP 5 menit, 3× salah, cooldown 10 menit → Task 4, 5 ✅
- Batas harian 9× (WIB) → Task 5 ✅
- Cooldown ganti PIN 14 hari → Task 6 ✅
- Email OTP + email konfirmasi → Task 3, 8 ✅
- Data dummy + seeder → Task 10, 11 ✅

**2. Placeholder scan:** Tidak ada "TBD"/"TODO". Task 9 Step 4-5 dijelaskan naratif dengan acuan pola komponen yang eksplisit (bukan placeholder kosong) karena murni presentasional.

**3. Type consistency:**
- `OtpPurpose = "REGISTER" | "RESET_PIN"` dipakai konsisten (Task 4, 5, 8).
- `issueOtp(email, purpose, tx?)`, `verifyOtp({email,purpose,code}, tx?)`, `assertPinChangeAllowed(userId, tx?)`, `assertDailyLimit(email, tx?)`, `countDailyAttempts(email, now?, tx?)` konsisten.
- `sendOtpEmail(to, code, purpose)`, `sendPinChangedEmail(to, name)` konsisten.
- Action names: `sendOtpAction`, `verifyOtpAction`, `completeRegistrationAction`, `sendResetOtpAction`, `resetPinAction` dipakai konsisten di Task 8 & 9.
- Cookie helpers `setOtpCookie`/`readOtpCookie`/`clearOtpCookie` (Task 7) dipakai di Task 8.

**4. Catatan implementasi:** `ActionSuccess.data` bertipe generik — di UI pastikan mengakses `res.data.devCode` hanya setelah `res.success` (TypeScript narrowing). Bila `ActionResult` tidak menyempit otomatis, sesuaikan dengan pengecekan `"devCode" in res.data`.
