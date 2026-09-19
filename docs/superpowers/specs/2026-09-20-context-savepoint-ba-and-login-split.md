# Context Savepoint — Brand Ambassador + Pemisahan Portal Login

**Tanggal:** 2026-09-20
**Branch:** `feat/brand-ambassador-referral`
**Status:** Selesai & terverifikasi. Siap merge / review.

---

## 1. Ringkasan Cepat (Baca Ini Dulu)

Dua pekerjaan besar telah selesai di branch ini:

1. **Fitur Brand Ambassador (BA) Referral & Komisi** — Task 1–13 dari
   `docs/superpowers/plans/2026-09-19-brand-ambassador-referral.md`. **Semua 64 checkbox
   plan sudah `[x]`.**
2. **Pemisahan Portal Login menjadi 3 route berbeda** — client/vendor, Brand Ambassador,
   dan Super Admin punya halaman login masing-masing.

**Target "T7" (Tahap 7 — milestone berikutnya): belum ada definisi milestone T7 di dokumen
mana pun.** Yang paling mendekati adalah **Task 7** pada plan BA (Registrasi vendor menerima
kode referral), yang **sudah selesai**. Lihat §5 untuk catatan.

Tidak ada tugas tertunda di local plan docs saat ini — pekerjaan plan BA tuntas.

---

## 2. Fitur Brand Ambassador — Status (Task 1–13)

Semua task di `docs/superpowers/plans/2026-09-19-brand-ambassador-referral.md` sudah
`[x]` (ditandai pada commit `93147e4`). Ringkas per task:

| Task | Capaian | Test |
|------|---------|------|
| 1 | Model Prisma `BrandAmbassador`, `AmbassadorCommission`, `AmbassadorWithdrawal` (dual skema postgres+sqlite, byte-identical) | — |
| 2 | Helper test `seedAmbassador`, `seedVendorWithRecruiter` | — |
| 3 | `generateReferralCode`, `resolveReferral`, `attributionBaLocked` | `ambassador-referral.test.ts` |
| 4 | `creditCommissionForOrder` (exact-once) + `AMBASSADOR_PAYABLE` + `ambassadorJournalNumber` | `ambassador-commission.test.ts` |
| 5 | Hook komisi ke `runPayoutSweep` setelah `SETTLEMENT_PAYOUT` | integrasi |
| 6 | `requestWithdrawal`, `resolveWithdrawal` (dompet BA) | withdraw tests |
| 7 | `attributeVendorToReferral` + `registerVendorAction` terima `referralCode` | atribusi tests |
| 8 | `getDashboardPath("BA")`, `ROUTES.BA`, middleware guard `/dashboard/ba/*` | — |
| 9 | Query layer `src/server/queries/ambassador.ts` | — |
| 10 | Server actions `src/server/actions/ambassador.ts` | — |
| 11 | Dashboard BA (`/dashboard/ba`, `/vendor`, `/komisi`, `/dompet`) | — |
| 12 | Panel admin BA (`/admin/ba`) | — |
| 13 | Verifikasi akhir | 218/218 pass |

### File kunci fitur BA

| File | Peran |
|------|-------|
| `prisma/schema.prisma` + `prisma/schema.sqlite.prisma` | Model BA (WAJIB sinkron) |
| `src/server/services/ambassador-service.ts` | Kode referral, atribusi, komisi, withdraw |
| `src/server/services/ledger-service.ts` | `LEDGER_ACCOUNTS.AMBASSADOR_PAYABLE` (`2040_AMBASSADOR_PAYABLE`), `ambassadorJournalNumber` |
| `src/server/services/payment-service.ts` | Hook komisi di `runPayoutSweep` |
| `src/server/queries/ambassador.ts` | Query dashboard BA + admin |
| `src/server/actions/ambassador.ts` | Server actions withdraw & kelola BA |
| `src/app/dashboard/ba/**` | Halaman dashboard BA |
| `src/app/admin/ba/**` | Panel admin BA |
| `src/components/ba/BaHeaderNav.tsx` | Header nav portal BA |

### Keputusan desain penting (dari plan §Self-Review)
- Akun BA dibuat oleh **Admin** (bukan self-register).
- Persen komisi default **5%**, dapat diubah admin per-BA.
- Komisi = `floor(subtotal * pct / 100)`, **exact-once** via `@@unique(orderItemId)`
  + journalNumber deterministik `ADVCOM-{orderItemId}`.
- Item `REJECTED`/`CANCELLED` **tidak** dapat komisi (filter `status: "ACCEPTED"`).
- COA `AMBASSADOR_PAYABLE` memakai kode `2040_` (bukan `2030_` seperti di plan) karena
  `2030_REFUND_PAYABLE` sudah terpakai — ini keputusan benar.
- `AMBASSADOR_COMMISSION` ditambahkan ke `LEDGER_JOURNAL_TYPES` di `src/types/domain.ts`
  (fix pada commit `dfda5b1`).

---

## 3. Pemisahan Portal Login (BARU)

Dibuat pada commit `f0162c9`.

### Tiga portal login terpisah

| Portal | URL | Role | Landing setelah login |
|--------|-----|------|------------------------|
| Pengantin & Mitra | `/auth/login` | CLIENT, VENDOR | `/client/profil` · `/dashboard/vendor/profil` |
| **Brand Ambassador** | **`/auth/login/ba`** | BA | `/dashboard/ba` |
| Super Admin | `/auth/login/admin` | ADMIN | `/admin` |

### Jawaban atas pertanyaan: "Di file mana route `/auth/login/ba` didefinisikan?"

**File halaman (page component) route tersebut:**

```
src/app/auth/login/ba/page.tsx
```

Ini adalah **file utama** yang Anda cari. Isinya sebuah client component tipis yang
merender komponen bersama `LoginCard` dengan `allowedRoles={["BA"]}`.

**Path absolut:**
`C:\Users\asep.suherman\SETTUP TESTING\Build Project In Here\IDE\HariKita - Web App\src\app\auth\login\ba\page.tsx`

Route `/auth/login/ba` **tidak** dideklarasikan sebagai string di file konfigurasi —
Next.js App Router memetakan route berdasarkan struktur folder. Yang mengaitkan string
`/auth/login/ba` di kode adalah:

| Lokasi | Baris / isi | Fungsi |
|--------|-------------|--------|
| `src/app/auth/login/ba/page.tsx` | file halaman | **Definisi route utama** (folder → URL) |
| `src/lib/routes.ts` | `AUTH.LOGIN_BA: '/auth/login/ba'` | Konstanta rute (registry) |
| `src/lib/session.ts` | `getLoginPath()` → `case "BA": return "/auth/login/ba"` | Redirect login per-role |
| `src/middleware.ts` | guard `/dashboard/ba/*` → redirect ke `/auth/login/ba` | Proteksi portal |
| `src/server/actions/auth.ts` | `logoutAction` → `getLoginPath(role)` | Redirect setelah logout |

### File kunci pemisahan login

| File | Peran |
|------|-------|
| `src/components/auth/LoginCard.tsx` | **Komponen login reusable** — dipakai oleh ke-3 halaman. Props: `allowedRoles`, `roleTabs`, `heading`, dll. |
| `src/app/auth/login/page.tsx` | Halaman login client + vendor (tab Pengantin/Mitra Vendor) |
| `src/app/auth/login/ba/page.tsx` | Halaman login Brand Ambassador |
| `src/app/auth/login/admin/page.tsx` | Halaman login Super Admin |
| `src/server/actions/auth.ts` | `loginAction` terima `allowedRoles` (CSV) → menolak role tak sesuai; `logoutAction` redirect per-role |
| `src/lib/session.ts` | Tambah `getLoginPath(role)` |
| `src/lib/routes.ts` | Tambah `AUTH.LOGIN_BA`, `AUTH.LOGIN_ADMIN` |
| `src/middleware.ts` | Redirect tiap portal ke halaman login yang sesuai + `getLoginPath()` |
| `src/app/admin/AdminDashboardClient.tsx` | Link "Masuk sebagai Admin" → `/auth/login/admin` |

### Perilaku yang ditegakkan
- `/auth/login` **menolak** role BA & ADMIN (pesan generik, tidak membocorkan URL privat).
- Portal BA & Admin **tidak ditautkan** dari navigasi/footer publik mana pun.
- **Semua tombol demo dihapus** dari ketiga halaman login.
- **Logout** mengembalikan user ke portal login tempat perannya masuk.
- Desain ketiga halaman **selaras design system**: `font-editorial` + `font-manrope`,
  token `hk-*` (charcoal/taupe/champagne/soft-beige/ivory), **0 hex hardcoded**, **0 `font-serif`**.

---

## 4. Data Dummy / Seeder Brand Ambassador

Diperkaya pada commit `ec5907e` (`prisma/seed.ts`).

### Akun demo (PIN semua: `123456`)

| Peran | Nama | Nomor HP | Login di |
|-------|------|----------|----------|
| Super Admin | Super Admin HariKita | `081234567890` | `/auth/login/admin` |
| Pengantin | Bima & Citra | `081987654321` | `/auth/login` |
| Vendor | Menganti Cinematic & Studio | `081300000001` | `/auth/login` |
| **BA (aktif)** | **Rina BA Kebumen** — kode `BA-KEBUMEN-2026`, 5%, saldo Rp50.000, 2 vendor rekrutan, 2 komisi (Rp385.000), 2 penarikan | **`081200000001`** | `/auth/login/ba` |
| **BA (aktif)** | **Dwi BA Gombong** — kode `BA-GOMBONG-2026`, 7%, saldo Rp140.000, 1 vendor rekrutan, 1 komisi (Rp315.000) | **`081200000002`** | `/auth/login/ba` |
| **BA (nonaktif)** | Sari BA Karanganyar — kode `BA-KARANGANYAR-2026`, 5% | **`081200000003`** | `/auth/login/ba` |

Vendor rekrutan: Menganti & Pradana Cinema → Rina; Dapur Rasa Boga → Dwi.
Riwayat penarikan: 1 PAID, 1 PENDING (untuk uji panel admin), 1 REJECTED.

> **Catatan penting:** `prisma/seed.ts` bersifat **destruktif** (menghapus semua tabel
> sebelum seed). **JANGAN** jalankan di DB dengan data yang ingin dipertahankan.
> Data BA di atas **sudah dimasukkan** ke DB dev aktif secara non-destruktif, jadi
> Anda tidak perlu jalankan seeder ulang.

---

## 5. Status "T7" (milestone berikutnya)

Tidak ditemukan dokumen yang mendefinisikan milestone bernama **"T7"**. Kemungkinan maksudnya:

- **"Task 7" pada plan BA** → *Registrasi vendor menerima kode referral*. **Sudah selesai**
  (commit `18c1ded`). Catatan: `src/app/auth/register-vendor/page.tsx` masih memakai mock
  `setTimeout` untuk **seluruh** form (isu app-wide pra-eksisting, di luar scope plan BA).
  Field `referralCode` sudah benar dan `registerVendorAction` sudah memprosesnya —
  atribusi BA otomatis jalan begitu form disambungkan ke action.
- **"Tahap 7" / "Phase 7"** → `docs/phases/PHASE-07-ui-polish.md` sudah ada.

Bila ada dokumen T7 spesifik yang belum saya temukan, mohon berikan path-nya.

---

## 6. Verifikasi Terakhir

| Pemeriksaan | Hasil |
|-------------|-------|
| `npm run typecheck` | ✅ bersih (exit 0) |
| `npm test` | ✅ **218/218 lulus** |
| `npm run build` | ✅ Compiled successfully |
| Smoke test runtime | ✅ 5 rute BA/admin HTTP 200 dengan sesi nyata |
| Role rejection | ✅ BA ditolak di `/auth/login`, diterima di `/auth/login/ba` |
| Middleware redirect | ✅ tiap portal → login yang tepat |
| Design system | ✅ 0 hex hardcoded, `font-editorial`+`font-manrope`, token `hk-*` |

---

## 7. Cara Menjalankan

```powershell
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm test             # 218 test
npm run build        # JANGAN saat dev server hidup (menimpa .next)
```

---

## 8. Riwayat Commit Relevan (terbaru → lama)

```
ec5907e test(ba): seed rich brand ambassador demo data
f0162c9 feat(auth): split login into dedicated client/vendor, BA and admin portals
476e10b feat(ba): add Brand Ambassador login role and demo account
dfda5b1 fix(ba): register AMBASSADOR_COMMISSION journal type and BA role labels
93147e4 docs(ba): mark brand ambassador implementation plan tasks complete
aa46e58 feat(ba): admin panel to manage brand ambassadors
770d088 feat(ba): brand ambassador dashboard pages
fc2dd8d feat(ba): server actions for withdrawal and admin BA management
1b79e46 feat(ba): ambassador dashboard and admin query layer
f13fef9 feat(ba): BA dashboard route, session redirect and middleware guard
18c1ded feat(ba): accept referral code on vendor registration
```

---

## 9. Perubahan Tak Terkait di Working Tree

`git status` menunjukkan dua file termodifikasi yang **bukan** bagian pekerjaan ini
(fitur PWA "Download Apps", pekerjaan lain yang sedang berjalan):

- `src/components/layout/Footer.tsx`
- `src/components/pwa/InstallPrompt.tsx`

Sengaja **tidak** di-commit agar tidak mengganggu pekerjaan tersebut.

---

## 10. Dokumen Terkait

- Spec: `docs/superpowers/specs/2026-09-19-brand-ambassador-referral-design.md`
- Plan: `docs/superpowers/plans/2026-09-19-brand-ambassador-referral.md`
- Brand guidelines: `docs/brand/harikita-brand-guidelines.md`
- Design system: `/design-system-showcase?hub=brand`
