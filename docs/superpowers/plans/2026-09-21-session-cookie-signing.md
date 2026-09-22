# Session Cookie Signing (HMAC) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Menandatangani cookie sesi `hk_session` dengan HMAC-SHA256 sehingga tidak dapat dipalsukan menjadi role apa pun.

**Architecture:** Token `base64url(payload).base64url(hmac)` dibuat & diverifikasi oleh satu modul murni (`src/lib/session-token.ts`) yang memakai **Web Crypto (`crypto.subtle`)**, sehingga jalan baik di Node runtime (server action/query) maupun Edge Runtime (middleware). `src/lib/session.ts` dan `src/middleware.ts` menjadi konsumen modul ini. Tidak ada dependency baru.

**Tech Stack:** TypeScript, Next.js App Router (middleware Edge), Web Crypto API (`crypto.subtle`, `TextEncoder`/`TextDecoder`, `btoa`/`atob`), test runner `node:test` via `tsx`.

**Spec:** `docs/superpowers/specs/2026-09-21-session-cookie-signing-design.md`

## Global Constraints

- Tanpa dependency npm baru.
- Secret diambil dari env `HARIKITA_SESSION_SECRET`. **Fail-closed**: `getSessionSecret()` throw bila kosong/tidak ada.
- Format token tepat dua bagian dipisah satu titik: `<payload>.<signature>`. Jumlah titik ≠ 1 → invalid.
- Base64url tanpa padding (alfabet `A–Z a–z 0–9 - _`), aman untuk UTF-8 (nama bisa non-ASCII).
- `verifySession` **tidak pernah throw** — semua kegagalan → `null`.
- Perbandingan signature **constant-time** (panjang dulu, lalu XOR loop).
- `SessionData` = `{ userId: string; role: string; name: string; phone: string }` — bentuk tidak berubah.
- Cookie tetap `httpOnly: true`, `sameSite: "lax"`, `path: "/"`, `maxAge` 7 hari.
- Node ≥ 20 (diverifikasi v26.5.0). `globalThis.crypto.subtle` tersedia.
- Perintah verifikasi akhir: `npm run typecheck`, `npm test`, `npm run build`.

---

### Task 1: Modul signing `session-token.ts` — base64url + secret + sign

**Files:**
- Create: `src/lib/session-token.ts`
- Test: `tests/session-token.test.ts`

**Interfaces:**
- Consumes: tidak ada (modul dasar).
- Produces:
  - `export interface SessionData { userId: string; role: string; name: string; phone: string }`
  - `export function getSessionSecret(): string`
  - `export async function signSession(data: SessionData): Promise<string>`
  - `export async function verifySession(token: string): Promise<SessionData | null>` (diimplementasikan penuh di Task 2; Task 1 membuat stub yang `return null` dulu supaya tipe lengkap — TIDAK; stub tidak boleh. Lihat catatan di Task 1 Step 1: Task 1 hanya menguji `signSession` & `getSessionSecret`, `verifySession` belum dibuat sampai Task 2).

> **Catatan urutan:** Plan ini menguji `signSession` (Task 1) dan `verifySession` (Task 2) secara terpisah. Task 1 TIDAK mendefinisikan `verifySession` sama sekali; Task 2 menambahkannya ke file yang sama. Ekspor akhir file baru lengkap setelah Task 2.

- [x] **Step 1: Tulis test yang gagal (secret + sign format)**

Buat `tests/session-token.test.ts`:

```ts
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  getSessionSecret,
  signSession,
  type SessionData,
} from "../src/lib/session-token";

const ORIGINAL_SECRET = process.env.HARIKITA_SESSION_SECRET;

beforeEach(() => {
  process.env.HARIKITA_SESSION_SECRET = "test-secret-please-change-0123456789";
});

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) {
    delete process.env.HARIKITA_SESSION_SECRET;
  } else {
    process.env.HARIKITA_SESSION_SECRET = ORIGINAL_SECRET;
  }
});

const sample = (overrides: Partial<SessionData> = {}): SessionData => ({
  userId: "usr_1",
  role: "CLIENT",
  name: "Bima & Citra",
  phone: "081987654321",
  ...overrides,
});

test("getSessionSecret returns the configured secret", () => {
  assert.equal(getSessionSecret(), "test-secret-please-change-0123456789");
});

test("getSessionSecret throws when secret is missing", () => {
  delete process.env.HARIKITA_SESSION_SECRET;
  assert.throws(() => getSessionSecret(), /HARIKITA_SESSION_SECRET/);
});

test("getSessionSecret throws when secret is blank", () => {
  process.env.HARIKITA_SESSION_SECRET = "   ";
  assert.throws(() => getSessionSecret(), /HARIKITA_SESSION_SECRET/);
});

test("signSession returns token with exactly one dot", async () => {
  const token = await signSession(sample());
  assert.equal(token.split(".").length, 2);
  assert.ok(token.length > 0);
});

test("signSession is deterministic for the same data + secret", async () => {
  const a = await signSession(sample());
  const b = await signSession(sample());
  assert.equal(a, b);
});
```

- [x] **Step 2: Jalankan test — pastikan gagal**

Run: `npx tsx --test tests/session-token.test.ts`
Expected: FAIL — modul `../src/lib/session-token` belum ada (`Cannot find module`).

- [x] **Step 3: Implementasi minimal `src/lib/session-token.ts`**

```ts
/**
 * HariKita - Signed Session Token
 *
 * Token format: `<base64url(JSON payload)>.<base64url(HMAC-SHA256(payload))>`
 * Memakai Web Crypto (crypto.subtle) agar jalan di Node runtime maupun Edge Runtime.
 * Modul murni string↔string — tidak mengimpor Next.js.
 */

export interface SessionData {
  userId: string;
  role: string;
  name: string;
  phone: string;
}

/** Ambil secret sesi. Fail-closed: throw bila kosong. */
export function getSessionSecret(): string {
  const secret = process.env.HARIKITA_SESSION_SECRET;
  if (!secret || secret.trim() === "") {
    throw new Error(
      "HARIKITA_SESSION_SECRET tidak di-set. Cookie sesi tidak dapat ditandatangani."
    );
  }
  return secret;
}

/** Encode string → base64url (UTF-8 aman, tanpa padding). */
function base64urlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decode base64url → string (UTF-8). Throw bila format tidak valid. */
function base64urlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Hitung HMAC-SHA256(payload, secret) → base64url. */
async function hmacBase64url(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const bytes = new Uint8Array(sig);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Tanda tangani SessionData → token "payload.signature". Throw bila secret kosong. */
export async function signSession(data: SessionData): Promise<string> {
  const secret = getSessionSecret();
  const payload = base64urlEncode(JSON.stringify(data));
  const signature = await hmacBase64url(payload, secret);
  return `${payload}.${signature}`;
}
```

- [x] **Step 4: Jalankan test — pastikan lulus**

Run: `npx tsx --test tests/session-token.test.ts`
Expected: PASS (5 tests).

- [x] **Step 5: Commit**

```bash
git add src/lib/session-token.ts tests/session-token.test.ts
git commit -m "feat(auth): add session token signing foundation (base64url + HMAC)"
```

---

### Task 2: `verifySession` — verifikasi constant-time + validasi payload

**Files:**
- Modify: `src/lib/session-token.ts` (tambah `safeEqual`, `verifySession`)
- Test: `tests/session-token.test.ts` (tambah test)

**Interfaces:**
- Consumes: `signSession`, `getSessionSecret`, `base64urlDecode`, `hmacBase64url` dari Task 1.
- Produces: `export async function verifySession(token: string): Promise<SessionData | null>`.

- [x] **Step 1: Tambah test yang gagal untuk `verifySession`**

Tambahkan ke `tests/session-token.test.ts` (di akhir file):

```ts
import { verifySession } from "../src/lib/session-token";

test("verifySession accepts a freshly signed token", async () => {
  const data = sample({ role: "VENDOR", name: "Menganti Cinematic" });
  const token = await signSession(data);
  assert.deepEqual(await verifySession(token), data);
});

test("verifySession rejects tampered signature", async () => {
  const token = await signSession(sample());
  const [payload, sig] = token.split(".");
  const flipped = (sig[0] === "A" ? "B" : "A") + sig.slice(1);
  assert.equal(await verifySession(`${payload}.${flipped}`), null);
});

test("verifySession rejects tampered payload (role escalation)", async () => {
  const token = await signSession(sample({ role: "CLIENT" }));
  const [, sig] = token.split(".");
  const forgedPayload = Buffer.from(JSON.stringify(sample({ role: "ADMIN" })))
    .toString("base64url");
  assert.equal(await verifySession(`${forgedPayload}.${sig}`), null);
});

test("verifySession rejects legacy base64 JSON token (no dot)", async () => {
  const legacy = Buffer.from(JSON.stringify(sample({ role: "ADMIN" }))).toString("base64");
  assert.equal(await verifySession(legacy), null);
});

test("verifySession rejects malformed tokens", async () => {
  assert.equal(await verifySession(""), null);
  assert.equal(await verifySession("abc"), null);
  assert.equal(await verifySession("a.b.c"), null);
  assert.equal(await verifySession("a."), null);
  assert.equal(await verifySession(".b"), null);
});

test("verifySession rejects token signed with different secret", async () => {
  const token = await signSession(sample());
  process.env.HARIKITA_SESSION_SECRET = "a-completely-different-secret";
  assert.equal(await verifySession(token), null);
});

test("verifySession rejects payload missing required fields", async () => {
  // Sign a payload whose JSON lacks `phone`, using the real secret, then verify.
  const { getSessionSecret } = await import("../src/lib/session-token");
  const secret = getSessionSecret();
  const badPayload = Buffer.from(JSON.stringify({ userId: "u", role: "ADMIN", name: "x" }))
    .toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(badPayload));
  const sig = Buffer.from(new Uint8Array(sigBuf)).toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  assert.equal(await verifySession(`${badPayload}.${sig}`), null);
});
```

> Catatan: `verifySession` memanggil `getSessionSecret()` di dalam `try/catch`, jadi token yang diverifikasi setelah secret diganti (atau hilang) → `null`, bukan throw. Test "different secret" bergantung pada ini.

- [x] **Step 2: Jalankan test — pastikan gagal**

Run: `npx tsx --test tests/session-token.test.ts`
Expected: FAIL — `verifySession` bukan bagian ekspor modul.

- [x] **Step 3: Implementasi `safeEqual` + `verifySession`**

Tambahkan ke `src/lib/session-token.ts` (setelah `signSession`):

```ts
/** Perbandingan string constant-time (panjang boleh bocor, isi tidak). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verifikasi token → SessionData, atau null bila invalid.
 * Tidak pernah throw.
 */
export async function verifySession(token: string): Promise<SessionData | null> {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    if (!payload || !signature) return null;

    const expected = await hmacBase64url(payload, getSessionSecret());
    if (!safeEqual(signature, expected)) return null;

    const json = base64urlDecode(payload);
    const data = JSON.parse(json) as Partial<SessionData>;
    if (
      typeof data.userId !== "string" ||
      typeof data.role !== "string" ||
      typeof data.name !== "string" ||
      typeof data.phone !== "string"
    ) {
      return null;
    }
    return {
      userId: data.userId,
      role: data.role,
      name: data.name,
      phone: data.phone,
    };
  } catch {
    return null;
  }
}
```

- [x] **Step 4: Jalankan test — pastikan lulus**

Run: `npx tsx --test tests/session-token.test.ts`
Expected: PASS (semua test, termasuk malformed & escalation).

- [x] **Step 5: Commit**

```bash
git add src/lib/session-token.ts tests/session-token.test.ts
git commit -m "feat(auth): add verifySession with constant-time signature check"
```

---

### Task 3: Alihkan `src/lib/session.ts` ke modul signing

**Files:**
- Modify: `src/lib/session.ts`
- Test: `tests/session-token.test.ts` (tidak berubah; verifikasi lewat typecheck & suite)

**Interfaces:**
- Consumes: `signSession`, `verifySession`, `type SessionData` dari `./session-token`.
- Produces (dipakai pemanggil lama — bentuk TIDAK berubah):
  - `export type { SessionData } from "./session-token"` (re-export)
  - `export async function getSession(): Promise<SessionData | null>`
  - `export async function setSessionCookie(data: SessionData): Promise<void>`
  - `clearSessionCookie`, `getDashboardPath`, `getLoginPath`, `setOtpCookie`, `readOtpCookie`, `clearOtpCookie` tetap.

- [x] **Step 1: Ubah impor & hapus definisi lokal `SessionData`**

Di `src/lib/session.ts`, ganti blok:

```ts
export interface SessionData {
  userId: string;
  role: string; // "CLIENT" | "VENDOR" | "ADMIN" | "BA"
  name: string;
  phone: string;
}
```

menjadi:

```ts
import { signSession, verifySession, type SessionData } from "./session-token";
export type { SessionData };
```

> **Kenapa `export type { SessionData }` (tanpa `from`):** kita sudah meng-`import` tipe `SessionData` di baris sebelumnya, jadi cukup re-export nama yang sudah ada. Menulis `export type { SessionData } from "./session-token"` bersamaan dengan impor bernama yang sama akan memicu konflik deklarasi. Bentuk di atas tetap membuat `import { SessionData } from "@/lib/session"` berfungsi untuk pemanggil lama.

- [x] **Step 2: Ganti body `getSession`**

Ganti seluruh fungsi `getSession` menjadi:

```ts
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return verifySession(raw);
}
```

- [x] **Step 3: Ganti body `setSessionCookie`**

Ganti seluruh fungsi `setSessionCookie` menjadi:

```ts
export async function setSessionCookie(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const token = await signSession(data);
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}
```

- [x] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: PASS — tidak ada error tipe (pastikan tidak ada referensi `Buffer` yang tertinggal di file ini; hapus impor tak terpakai bila ada).

- [x] **Step 5: Jalankan suite penuh**

Run: `npm test`
Expected: PASS — jumlah test = baseline 231 + test baru session-token (≥ 13). 0 fail.

- [x] **Step 6: Commit**

```bash
git add src/lib/session.ts
git commit -m "feat(auth): sign and verify hk_session cookie via session-token"
```

---

### Task 4: Alihkan `src/middleware.ts` ke `verifySession`

**Files:**
- Modify: `src/middleware.ts`

**Interfaces:**
- Consumes: `verifySession`, `type SessionData` dari `@/lib/session-token`.
- Produces: `export async function middleware(request: NextRequest)` (handler menjadi async).

- [x] **Step 1: Ganti helper `parseSession` dengan impor verifier**

Di `src/middleware.ts`, hapus blok:

```ts
const COOKIE_NAME = "hk_session";

interface SessionPayload {
  userId: string;
  role: string; // "CLIENT" | "VENDOR" | "ADMIN" | "BA"
  name: string;
  phone: string;
}

function parseSession(cookieValue: string | undefined): SessionPayload | null {
  if (!cookieValue) return null;
  try {
    const decoded = Buffer.from(cookieValue, "base64").toString("utf-8");
    const data = JSON.parse(decoded) as SessionPayload;
    if (!data.userId || !data.role) return null;
    return data;
  } catch {
    return null;
  }
}
```

ganti menjadi:

```ts
import { verifySession, type SessionData } from "@/lib/session-token";

const COOKIE_NAME = "hk_session";
```

> Catatan: `import` sebaiknya diletakkan di bagian atas file bersama impor lain. Susun ulang agar `import { verifySession, type SessionData } from "@/lib/session-token";` berada tepat setelah `import type { NextRequest } from "next/server";`. Konstanta `COOKIE_NAME` tetap di tempatnya semula.

- [x] **Step 2: Jadikan handler async & baca sesi lewat verifier**

Ganti tanda tangan & baris pembacaan sesi:

```ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawCookie = request.cookies.get(COOKIE_NAME)?.value;
  const session = parseSession(rawCookie);
```

menjadi:

```ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawCookie = request.cookies.get(COOKIE_NAME)?.value;
  const session: SessionData | null = rawCookie
    ? await verifySession(rawCookie)
    : null;
```

Sisa logika (redirect `/auth/*`, `/admin`, `/dashboard/vendor`, `/dashboard/ba`, `/client`, dan alias `profile`→`profil`) **tidak berubah**.

- [x] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS. Pastikan tidak ada sisa referensi `parseSession`.

- [x] **Step 4: Build (validasi Edge runtime menerima crypto.subtle)**

Run: `npm run build`
Expected: PASS — build sukses, middleware terkompilasi tanpa error Edge (mis. tidak ada `Buffer`/`node:crypto` di jalur middleware).

- [x] **Step 5: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(auth): verify signed session cookie in middleware (Edge)"
```

---

### Task 5: Env secret + dokumentasi + verifikasi akhir

**Files:**
- Modify: `.env.example`
- Modify: `.env.local` (lokal; TIDAK di-commit)
- Modify: `PROJECT_STATUS.md` (catat perubahan bila file ini memuat ringkasan fitur auth)

**Interfaces:** tidak ada ekspor baru.

- [x] **Step 1: Tambah `HARIKITA_SESSION_SECRET` di `.env.example`**

Tambahkan setelah blok `# ── Cron ──` (atau sebelum blok `# ── App ──`):

```dotenv
# ── Session ──────────────────────────────────────────────────────────────────
# Secret HMAC untuk menandatangani cookie sesi. WAJIB di-set (tanpa ini login gagal).
# Ganti dengan string acak panjang. Contoh generate: openssl rand -base64 48
HARIKITA_SESSION_SECRET="change-me-to-a-long-random-string"
```

- [x] **Step 2: Set secret lokal agar dev/test berjalan**

Tambahkan ke `.env.local` (dan `.env` bila dipakai dev):

```dotenv
HARIKITA_SESSION_SECRET="dev-local-session-secret-please-change-0123456789"
```

Verifikasi `.env.local`/`.env` ter-gitignore:

Run: `git check-ignore -v .env.local .env`
Expected: kedua path tercetak sebagai ignored. Bila TIDAK, tambahkan ke `.gitignore` sebelum melanjutkan.

- [x] **Step 3: Catat di `PROJECT_STATUS.md`**

Tambahkan satu baris di bagian auth/keamanan (sesuaikan heading yang ada):

```markdown
- [x] Cookie sesi `hk_session` ditandatangani HMAC-SHA256 (env `HARIKITA_SESSION_SECRET`); cookie lama tanpa tanda tangan ditolak → login ulang.
```

- [x] **Step 4: Verifikasi akhir lengkap**

Run: `npm run typecheck`
Expected: PASS.

Run: `npm test`
Expected: PASS — semua suite hijau.

Run: `npm run build`
Expected: PASS.

- [x] **Step 5: Uji manual (smoke)**

1. Start dev: `npm run dev`.
2. Login sebagai demo user (mis. client `081987654321` / PIN `123456`).
3. Cek cookie `hk_session` di DevTools → format mengandung satu titik.
4. Ubah cookie di DevTools menjadi base64 JSON `{"userId":"x","role":"ADMIN",...}` (tanpa tanda tangan) → reload `/admin` → harus ter-redirect ke login.
5. Logout, lalu login lagi → dashboard sesuai role.

- [x] **Step 6: Commit**

```bash
git add .env.example PROJECT_STATUS.md
git commit -m "docs(auth): document HARIKITA_SESSION_SECRET and update status"
```

---

## Self-Review

**1. Spec coverage**
- Format token `payload.signature` → Task 1 (sign) + Task 2 (verify). ✅
- HMAC-SHA256 via Web Crypto → Task 1 Step 3. ✅
- Secret `HARIKITA_SESSION_SECRET` fail-closed → Task 1 (+ test), Task 5 (env). ✅
- Constant-time compare → Task 2 Step 3 (`safeEqual`). ✅
- `verifySession` tak pernah throw → Task 2 (try/catch + test malformed). ✅
- `SessionData` dipindah & re-export dari `session-token` → Task 3 Step 1. ✅
- `session.ts` alih ke signing → Task 3. ✅
- `middleware.ts` async + verify (Edge) → Task 4 (+ build). ✅
- Cookie lama ditolak → Task 2 (test legacy) + Task 5 smoke. ✅
- Test di `tests/session-token.test.ts` (8 skenario spec) → Task 1+2 (≥13 test). ✅
- `.env.example` + verifikasi akhir (typecheck/test/build) → Task 5. ✅

**2. Placeholder scan:** Tidak ada TBD/TODO; semua step memuat kode perintah konkret. ✅

**3. Type consistency:** `SessionData` (4 field string) konsisten di Task 1/2/3/4. `signSession`/`verifySession`/`getSessionSecret` satu tanda tangan di semua pemakaian. Helper internal (`base64urlEncode/Decode`, `hmacBase64url`, `safeEqual`) hanya dipakai di dalam modul. ✅

**Catatan perbaikan inline:** Step Task 1 header sempat menyebut stub `verifySession`; dikoreksi — Task 1 tidak membuat `verifySession`, Task 2 yang menambahkannya.
