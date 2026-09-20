# Session Cookie Signing (HMAC) — Design Spec

> Status: Menunggu review. Setelah disetujui → lanjut ke implementation plan
> (`writing-plans`).
> Tanggal: 2026-09-21
> Branch: `feat/session-cookie-signing`

## 1. Latar Belakang & Masalah

Cookie sesi `hk_session` saat ini menyimpan data sesi sebagai:

```
base64(JSON.stringify({ userId, role, name, phone }))
```

Tanpa tanda tangan kriptografis. Artinya klien dapat **membuat cookie sesi sendiri**
dengan `role: "ADMIN"` dan `userId` apa pun, lalu mengakses seluruh portal tanpa
kredensial. Ini meniadakan seluruh model otorisasi berbasis role (CLIENT/VENDOR/BA/ADMIN)
dan merupakan celah **privilege escalation** yang kritikal — semua pemeriksaan role di
middleware dan server action bergantung pada nilai `role` di dalam cookie ini.

Kode pembaca cookie ada di dua tempat:
- `src/lib/session.ts` (`getSession`/`setSessionCookie`) — dipakai server action & query (Node runtime).
- `src/middleware.ts` (`parseSession`) — berjalan di **Edge Runtime**, membaca cookie langsung dari `request.cookies`.

## 2. Tujuan

1. Cookie sesi **ditandatangani HMAC-SHA256** sehingga tidak dapat dipalsukan tanpa secret.
2. Verifikasi **constant-time** (tahan timing attack).
3. Satu sumber kebenaran logika token, dipakai bersama oleh Node runtime dan Edge Runtime.
4. Tidak menambah dependency npm baru.
5. Cookie lama (tanpa tanda tangan) **ditolak** → pengguna login ulang.

**Non-tujuan (di luar lingkup):**
- Mengganti base64 ke enkripsi payload (payload tetap dapat dibaca — hanya integritas yang ditegakkan).
- Perubahan RBAC, pemisahan role admin, model BA, atau refund klien (spec terpisah).
- Penyimpanan sesi di database / revocation list.
- Perubahan bentuk `SessionData` atau alur login selain penandatanganan.

## 3. Keputusan Desain

| Pertanyaan | Keputusan |
|---|---|
| Teknologi signing | **Web Crypto API (`crypto.subtle`)** — tersedia di Edge & Node, tanpa dependency baru |
| Format token | `<base64url(payload)>.<base64url(hmac)>` (mirip JWT, minimal) |
| Algoritma | HMAC-SHA256 |
| Sumber secret | Env `HARIKITA_SESSION_SECRET` |
| Secret tidak di-set | **Fail-closed**: login gagal / error jelas (tidak ada fallback dev) |
| Cookie lama | **Ditolak** (wajib login ulang) |
| Perbandingan signature | **Constant-time** (loop XOR manual; Web Crypto tak punya `timingSafeEqual`) |

## 4. Format Token

```
<base64url(JSON payload)>.<base64url(HMAC-SHA256(base64url(payload), SECRET))>
```

- `payload` = JSON `{ userId, role, name, phone }` (bentuk `SessionData` — tidak berubah).
- Signature dihitung atas **string payload yang sudah di-encode base64url** (bukan JSON mentah), meniru pola `simulated-adapter.ts` yang meng-HMAC string.
- Pemisah: satu titik (`.`). Token dengan jumlah titik ≠ 1 → invalid.
- Base64url: alfabet URL-safe tanpa padding (`-`, `_`, tanpa `=`).

## 5. Modul Baru: `src/lib/session-token.ts`

Modul murni string↔string, **tidak** mengimpor Next.js atau `next/headers`. Ini yang
membuatnya dapat diuji unit tanpa konteks request.

```ts
import type { SessionData } from "./session";

/** Mengambil secret sesi. Fail-closed: throw bila HARIKITA_SESSION_SECRET kosong. */
export function getSessionSecret(): string;

/** Menandatangani SessionData → token "payload.signature". Throw bila secret kosong. */
export async function signSession(data: SessionData): Promise<string>;

/** Memverifikasi token → SessionData, atau null bila invalid/kedaluwarsa format. */
export async function verifySession(token: string): Promise<SessionData | null>;
```

**Catatan sirkularitas impor:** `SessionData` saat ini didefinisikan di `src/lib/session.ts`.
Untuk menghindari impor melingkar (`session.ts` ⇄ `session-token.ts`), **lokasi final
`SessionData` adalah `src/lib/session-token.ts`**; `src/lib/session.ts` meng-`import` dan
re-export tipe tersebut (`export type { SessionData } from "./session-token"`). Dengan
demikian seluruh pemanggil yang meng-`import { SessionData } from "@/lib/session"` tidak
perlu diubah.

Implementasi inti:

- `signSession`:
  1. `secret = getSessionSecret()` (throw bila kosong).
  2. `payload = base64url(JSON.stringify(data))`.
  3. `sig = base64url(HMAC_SHA256(payload, secret))` via `crypto.subtle.sign`.
  4. return `${payload}.${sig}`.
- `verifySession`:
  1. `try { ... } catch { return null }` — **tidak pernah throw**.
  2. Split token pada `.`; harus tepat 2 bagian.
  3. Hitung ulang signature atas `payload` dengan secret.
  4. `safeEqual(sig, expected)` → bila tidak sama, `null`.
  5. Decode payload → parse JSON → validasi field wajib (`userId`, `role`, `name`, `phone`).
  6. Bila semua valid → kembalikan `SessionData`; jika tidak → `null`.
- `safeEqual(a: string, b: string): boolean`:
  - Jika panjang berbeda → `false` (tanpa membocorkan lewat early-return yang bergantung isi).
  - Loop XOR atas seluruh byte, akumulasi perbedaan, kembalikan `diff === 0`.
  - (Panjang token bukan rahasia; hanya isi yang harus constant-time.)

## 6. Perubahan pada Modul yang Ada

### 6.1 `src/lib/session.ts`
- `setSessionCookie(data)`: ganti `base64(JSON)` → `await signSession(data)`.
- `getSession()`: ganti decode base64 → `await verifySession(raw)`.
- Hapus import `Buffer` bila tak lagi dipakai.
- Tetap menyimpan cookie dengan `httpOnly: true`, `sameSite: "lax"`, `path: "/"`, `maxAge` 7 hari (tidak berubah).
- `SessionData`: didefinisikan di `session-token.ts`, di-re-export agar kode pemanggil tidak berubah.

### 6.2 `src/middleware.ts`
- Hapus `parseSession` (base64+JSON) dan ganti dengan pemanggilan `await verifySession(rawCookie)` dari `session-token.ts`.
- `export function middleware` menjadi `export async function middleware` (verify async).
- Karena memakai `crypto.subtle`, middleware tetap dapat berjalan di Edge Runtime (Web Crypto tersedia di Edge).
- Guard role lainnya (redirect `/admin`, `/dashboard/vendor`, `/dashboard/ba`, `/client`, dan `/auth/*`) tidak berubah perilakunya — hanya sumber "apakah sesi valid" yang kini tepercaya.

### 6.3 `.env.example`
- Tambah bagian:
  ```
  # ── Session ──────────────────────────────────────────────────────────────────
  # Secret HMAC untuk menandatangani cookie sesi. WAJIB di-set. Ganti dengan string acak panjang.
  HARIKITA_SESSION_SECRET="change-me-to-a-long-random-string"
  ```

### 6.4 `.env` / `.env.local` (lokal)
- Tambahkan `HARIKITA_SESSION_SECRET` nyata agar dev & test tetap berjalan (fail-closed).

## 7. Alur

1. **Login** (`loginAction`) → `setSessionCookie` → `signSession` → cookie bertanda tangan.
2. **Registrasi** (`completeRegistrationAction`) → sama seperti login.
3. **Permintaan terproteksi** → middleware `verifySession` → valid? lanjut : redirect login.
4. **Server action/query** → `getSession` → `verifySession` → `SessionData` atau null.
5. **Logout** → `clearSessionCookie` (tidak berubah).
6. **Cookie lama / dipalsukan** → `verifySession` → null → diperlakukan sebagai belum login.

## 8. Error Handling

- `verifySession` **selalu** mengembalikan `null` pada kegagalan apa pun (format salah, signature salah, JSON rusak, field kurang). Tidak pernah throw → seluruh pemanggil yang sudah ada (yang menangani `null`) tetap benar.
- `signSession`/`getSessionSecret` **throw** hanya bila `HARIKITA_SESSION_SECRET` tidak di-set. Ini terjadi di jalur login → gagal terkontrol di server action (logged), bukan diam-diam membuat token tak aman.
- Tidak ada pengecualian "mode sandbox" (berbeda dari webhook) — penandatanganan sesi tidak boleh punya jalur bypass.

## 9. Testing Strategy

**Unit test baru: `tests/session-token.test.ts`** (mengikuti pola `tsx --test tests/*.test.ts`), dengan `HARIKITA_SESSION_SECRET` di-set di test:

1. `verifySession(await signSession(data))` mengembalikan payload setara `data`.
2. Signature diubah (satu char) → `null`.
3. Payload diubah (mis. `role` CLIENT→ADMIN) tapi signature asli → `null`.
4. Token gaya lama: `base64(JSON)` tanpa titik → `null`.
5. Token malformed: `""`, `"abc"`, `"a.b.c"`, `"a."`, `".b"` → `null`.
6. Secret berbeda saat verifikasi → `null`.
7. `getSessionSecret()` throw bila env kosong (dites dengan menyimpan & memulihkan `process.env`).
8. Payload JSON rusak setelah signature valid (sulit tanpa secret) → minimal: payload non-JSON dengan signature dihitung ulang → `null` (field validasi).

**Verifikasi akhir (wajib):**
- `npm run typecheck`
- `npm test`
- `npm run build` (memastikan middleware Edge tetap terkompilasi dengan `crypto.subtle`).

## 10. Risiko & Catatan

- **Edge compatibility:** `crypto.subtle` async → middleware harus async. Ini perubahan signature handler; perlu memastikan tidak ada pemanggilan sinkron ke `parseSession` yang tertinggal.
- **HMR/dev:** perubahan `.env` memerlukan restart dev server agar secret terbaca.
- **Semua sesi lama invalid:** setelah deploy, seluruh pengguna (termasuk demo) login ulang — sesuai keputusan desain.
- **Satu sumber secret:** `HARIKITA_SESSION_SECRET` berbeda dari `HARIKITA_WEBHOOK_SECRET`/`CRON_SECRET`; jangan campur.
- **b64url di Edge:** gunakan `btoa`/`atob` + penggantian alfabet URL-safe (tanpa `Buffer`, agar aman di Edge). Rencana implementasi menetapkan helper `base64urlEncode/Decode` berbasis Web API.

## 11. File yang Disentuh

| File | Aksi |
|---|---|
| `src/lib/session-token.ts` | **Baru** — signing/verify/secret/safeEqual/base64url |
| `src/lib/session.ts` | Ubah `setSessionCookie` & `getSession`; re-export `SessionData` |
| `src/middleware.ts` | Ganti `parseSession` → `verifySession`; handler jadi async |
| `tests/session-token.test.ts` | **Baru** — unit test |
| `.env.example` | Tambah `HARIKITA_SESSION_SECRET` |
| `.env` / `.env.local` | Tambah secret lokal (tidak di-commit bila ter-gitignore) |
