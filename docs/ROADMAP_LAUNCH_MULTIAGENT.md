# 🗺️ HariKita — Roadmap Menuju Launch & Pembagian Kerja Multi-Agent

> **Dokumen ini adalah single source of truth (SSOT) untuk koordinasi multi-agent.**
> Dibuat untuk memungkinkan dua agent (CodeBuddy & Agent lain) bekerja **paralel tanpa konflik file**, lalu melakukan **rekonsiliasi** alih-alih membangun dari nol.
>
> **Pemilik dokumen:** CodeBuddy
> **Repositori:** `HariKita - Web App`
> **Salinan master (untuk user/agent lain):** `C:\Users\asep.suherman\Downloads\HARIKITA_ROADMAP_LAUNCH_MULTIAGENT.md`
> **Salinan kerja di repo:** `docs/ROADMAP_LAUNCH_MULTIAGENT.md` (dokumen ini)

---

## 0. Cara Pakai Dokumen Ini

1. **Setiap agent membaca dokumen ini SEBELUM mulai bekerja.**
2. Patuhi **Zona File** (Bagian 4) secara mutlak.
3. Setiap phase yang dikerjakan WAJIB menghasilkan **dokumen hand-off** di `docs/phases/PHASE-XX-<nama>.md`.
4. Commit dengan prefix phase (`phase-07(ui): ...`) agar mudah direkonsiliasi via `git log`.
5. Jika butuh service/action/query baru di luar zona Anda → tulis **permintaan** di dokumen hand-off, JANGAN buat sendiri.

---

## 1. Legenda Pembagian Kerja

| Simbol | Arti |
|---|---|
| 🟦 | **CodeBuddy (agent saya)** — pekerjaan yang bergantung erat pada service layer/internal logic. |
| 🟩 | **Agent Anda yang lain** — pekerjaan mandiri (self-contained), aman dikerjakan paralel. |
| ⬜ | **Rekonsiliasi** — dikerjakan bersama; CodeBuddy melakukan *matching* terhadap hasil agent lain, bukan dari nol. |

---

## 2. Kondisi Saat Ini (Baseline — sudah selesai)

| Lapisan | Status |
|---|---|
| Schema database (24 model Prisma), migrasi uang Float→Int | ✅ Selesai |
| Types SSOT (`src/types/{domain,errors,dto}.ts`) | ✅ Selesai |
| Service layer transaksional (availability, order, payment, webhook, ledger, payout, lifecycle, catalog-bridge) | ✅ Selesai |
| `withTransactionRetry` + `date-utils` (WIB) | ✅ Selesai |
| Server Actions (order, payment, availability, vendor) | ✅ Selesai |
| Query layer server-side (orders, vendor) | ✅ Selesai |
| Integrasi UI→DB: checkout, pembayaran, invoice, client/pesanan, client/jadwal, admin/escrow, admin/kalender, vendor/kalender, vendor/paket | ✅ Selesai (DB-first + mock fallback) |
| Webhook route `/api/webhooks/payment` (Midtrans/Xendit/simulated) | ✅ Selesai |
| Cron route `/api/cron/sweep` | ✅ Selesai |
| Payment gateway adapter layer | ✅ Selesai (belum ada kredensial live) |
| Dokumentasi | `docs/HANDOVER_PHASE2_PRODUCTION.md` |

### Status Phase Lanjutan (Oleh CodeBuddy)
| Phase | Judul | Status |
|---|---|---|
| 10a | CI/CD, health, security headers, rate limiting | ✅ COMPLETE (`phase-10a(ci)`) |
| 3 | Vendor Self-Service (portofolio + inbox DB) | ✅ COMPLETE (`phase-03(vendor)`) |
| 4 | Notifikasi WhatsApp/email (outbox) | ✅ COMPLETE (`phase-04(notif)`) |
| 6 | Hub Koordinasi dari DB | ✅ COMPLETE (`phase-06(hub)`) |
| 5 | Builder + Availability Matrix | ⬜ Rekonsiliasi (agent bangun UI; action sudah ada) |
| 7 | Design System / UI Polish / A11y | ✅ COMPLETE (`phase-07(ui)` — agent lain) |
| 8 | SEO / Legal / Marketing | ✅ COMPLETE (`phase-08(seo)` — agent lain) |
| 9 | Admin Panel + Dispute | ✅ COMPLETE (`phase-09(admin)`) |
| 10b | Deploy live + kredensial | 🔷 PREP COMPLETE (`phase-10b(prep)`) — Supabase/Postgres, Midtrans Snap, runbook; menunggu kredensial |

### Masih mock murni (belum DB)
- `/vendor/[slug]`  → sengaja tetap katalog statis (lihat PHASE-03 doc)
- `/hub-koordinasi`  → daftar acara kini dari DB; diagram constellation masih demo

### Belum ada
- Kredensial Supabase + Midtrans (user menyusul) → eksekusi deploy sesuai runbook
- Phase 5 (builder/availability) — SELESAI (`phase-05(builder)`)

---

## 3. Peta Phase (Ringkas)

| Phase | Judul | Pemilik | Ketergantungan | Estimasi |
|---|---|---|---|---|
| 3 | Vendor Self-Service (portofolio, inbox, slug publik) | 🟦 Saya | Service layer (sudah ada) | Sedang |
| 4 | Notifikasi WhatsApp + Email + persistence | 🟦 Saya | Payment/Order service | Sedang |
| 5 | Builder + Multi-Vendor Availability Matrix realtime | ⬜ Rekonsiliasi | Action `claimHoldSlot` | Sedang |
| 6 | Hub Koordinasi + Rundown dari DB | 🟦 Saya | `getCoordinationData` | Kecil |
| 7 | Design System Finalization, UI Polish & Accessibilty | 🟩 Agent Anda | — (paralel) | Besar |
| 8 | SEO, Landing/Marketing, Legal Pages & Analytics | 🟩 Agent Anda | — (paralel) | Sedang |
| 9 | Admin Panel Lengkap (verifikasi/audit/dispute) | ⬜ Rekonsiliasi | Dispute service | Besar |
| 10 | Production Deployment, CI/CD, Monitoring & Hardening | 🟦 Saya | Semua phase | Besar |

**Total estimasi: 8 phase lanjutan (Phase 3 s/d Phase 10).**

### Urutan eksekusi paralel yang disarankan
```
SEGERA (paralel, tanpa overlap file):
  🟦 CodeBuddy  : Phase 3 → 4 → 6 → 10
  🟩 Agent Anda : Phase 7 → 8

REKONSILIASI (setelah keduanya sampai):
  ⬜ Phase 5 (agent bangun UI builder/availability, CodeBuddy finalisasi integrasi)
  ⬜ Phase 9 (CodeBuddy service dispute/verifikasi, agent bangun UI admin)
```

---

## 4. 🔒 ZONA FILE (ANTI-KONFLIK — WAJIB)

> **Aturan mutlak:** agent yang BUKAN pemilik zona DILARANG mengubah file di zona tersebut.

| Zona | Pemilik | Path |
|---|---|---|
| **Service / Actions / Queries / Types / Prisma** | 🟦 HANYA CodeBuddy | `src/server/**`, `src/lib/{transaction-retry,date-utils,session,prisma}.ts`, `src/types/**`, `prisma/**` |
| **UI / Styling / CSS** | 🟩 HANYA Agent Anda | `*.tsx` presentasi (client components), `src/app/globals.css`, `tailwind.config.ts`, `public/**` |
| **Halaman statis baru** | 🟩 HANYA Agent Anda | halaman legal/help/marketing di `src/app/**` |
| **Server wrapper halaman** (`page.tsx` yang fetch data) | ⬜ Koordinasi | `src/app/**/page.tsx` — hanya disentuh saat rekonsiliasi |
| **Dokumen hand-off** | ⬜ Bebas (masing-masing menulis) | `docs/phases/**` |

### Aturan tambahan
1. Agent 🟩 **tidak boleh** menyentuh: `src/server/**`, `src/lib/{transaction-retry,date-utils,prisma,session}.ts`, `src/types/**`, `prisma/**`.
2. Jika agent 🟩 butuh service/action/query baru → tulis **permintaan** di dokumen hand-off; CodeBuddy mengimplementasikan.
3. Jangan mengubah `page.tsx` server component milik halaman yang sudah terintegrasi DB tanpa koordinasi.
4. Commit prefix: `phase-03(vendor):`, `phase-07(ui):`, `phase-08(seo):`, `phase-XX(reconcile):`.

---

## 5. Detail Per-Phase

---

### 🟦 PHASE 3 — Vendor Self-Service Lengkap

**Pemilik:** CodeBuddy
**Tujuan:** Menghubungkan seluruh surface vendor ke database.

**Scope:**
- `/vendor/portofolio` → tabel `VendorPortfolio` + Server Actions (tambah/edit/hapus foto & portofolio).
- `/vendor/inbox` → gunakan `getVendorInboxItems()` (sudah ada) + aksi accept/reject via `vendorDecisionAction` (sudah ada) — wiring UI + status state.
- `/vendor/[slug]` (profil publik toko) → DB-first (profil + paket + portofolio).
- Halaman performa/analitik vendor (jika ada) → dari `VendorProfile` analytics counters.

**Deliverable:**
- 3 halaman DB-backed + server actions + test.

**Ketergantungan:** Service layer & query yang sudah ada.

---

### 🟦 PHASE 4 — Notifikasi (WhatsApp Gateway + Email) & Persistence

**Pemilik:** CodeBuddy
**Tujuan:** Notifikasi otomatis multi-kanal dengan pola outbox.

**Scope:**
- Model `Notification` (outbox) + `notification-service.ts`.
- Adapter WhatsApp (Fonnte/Wablas/Meta Cloud API) + email (Resend/SMTP) — pola identik dengan payment adapter.
- Trigger lifecycle:
  - Order dibuat → notifikasi ke vendor terpilih.
  - Vendor accept/reject → notifikasi ke klien.
  - DP terbayar → notifikasi ke vendor + klien.
  - Payout H-3 & H+2 → notifikasi ke vendor.
  - Jadwal fitting/test food dibuat → notifikasi ke klien.
- Scheduler mengirim ulang notifikasi gagal (integrasi ke `/api/cron/sweep`).

**Deliverable:** model + service + adapter + trigger + scheduler + test.

**Ketergantungan:** `payment-service`, `order-service`.

---

### ⬜ PHASE 5 — Builder & Multi-Vendor Availability Matrix (Realtime)

**Pemilik:** Rekonsiliasi — 🟩 Agent Anda membangun UI, 🟦 CodeBuddy finalisasi.

**Tujuan:** Mengganti `cart-store`/`availability-store` mock → data DB nyata.

**Untuk Agent Anda (🟩):**
- Bangun/ubah UI `/builder` memanggil action yang SUDAH ADA:
  - `checkSlotStatusAction({ catalogVendorId, catalogPackageId, eventDate })` → cek ketersediaan.
  - `claimHoldSlotAction({ catalogVendorId, catalogPackageId, eventDate })` → klaim hold 15 menit.
  - `createOrderWithAutoHoldAction(...)` → buat order.
- Tampilkan matriks ketersediaan multi-vendor (bentrok jadwal realtime).
- Tampilkan countdown hold 15 menit.

**Untuk CodeBuddy (🟦) — saat rekonsiliasi:**
- Cocokkan UI agent dengan action yang ada.
- Perbaiki integrasi, tangani edge case (hold kedaluwarsa, slot bentrok).
- Tambah test.

---

### 🟦 PHASE 6 — Hub Koordinasi, Rundown Viewer & E-Ticket dari DB

**Pemilik:** CodeBuddy
**Tujuan:** `/hub-koordinasi` dan rundown berasal dari DB.

**Scope:**
- `/hub-koordinasi` → gunakan `getCoordinationData(bookingId)` (sudah disiapkan) + `EventRundown`.
- Sinkronisasi call-time vendor & status kesiapan dari item order.
- E-Ticket boarding pass dari sesi & rundown nyata.

**Deliverable:** halaman DB-backed + test.

---

### 🟩 PHASE 7 — Design System Finalization, UI Polish & Accessibility

**Pemilik:** Agent Anda
**Tujuan:** Semua halaman konsisten, responsif, accessible, siap produksi.

**Scope:**
- Finalisasi design tokens: color, typography, spacing, radius, border, shadow, icon system.
- Semua state: loading, empty, error, success, disabled, focus.
- Responsive di 320 / 375 / 414 / 768 / 1024 / 1280 / 1440 px.
- Accessibility: keyboard navigation, focus visible, contrast, semantic HTML, ARIA label, modal focus trap, Escape, reduced-motion, touch target ≥ 44px.
- Visual polish: tidak ada overflow, tidak ada halaman kosong, tidak ada placeholder menipu, semua async action ada feedback.

**Batas:** JANGAN mengubah `page.tsx` server component (struktur data). Hanya child client components + styling.

**Deliverable:** UI konsisten + dokumen `docs/phases/PHASE-07-ui-polish.md`.

---

### 🟩 PHASE 8 — SEO, Landing/Marketing, Legal Pages & Analytics

**Pemilik:** Agent Anda
**Tujuan:** Aset launch & kepatuhan legal.

**Scope:**
- SEO: `robots.txt`, `sitemap.xml`, canonical, metadata, Open Graph, social card, structured data, 404 & redirect.
- Halaman: Help/FAQ, Support/Contact, Privacy Policy, Terms of Service, Data Processing Notice, Cookie Notice, halaman Unauthorized/Not-found/Error/Maintenance.
- Landing page marketing.
- Analytics (GA4/Umami) + OG image.

**Ketergantungan:** NOL pada service layer — aman penuh paralel.

**Deliverable:** halaman statis + konfigurasi SEO + dokumen `docs/phases/PHASE-08-seo-legal.md`.

---

### ⬜ PHASE 9 — Admin Panel Lengkap (Verifikasi, Audit, Dispute/Resolution Center)

**Pemilik:** Rekonsiliasi — 🟦 CodeBuddy service, 🟩 Agent Anda UI.

**Untuk CodeBuddy (🟦):**
- Service + actions untuk:
  - **Verifikasi vendor** (`VendorProfile.isVerified`).
  - **Audit konten** — pakai `content-guard.ts` (sudah ada) → simpan hasil audit.
  - **Dispute/Resolution Center** — model `Dispute` (sudah ada) + service: open dispute, review, resolve, kaitkan ke ledger reversal / refund manual.
  - **Funnel analytics** dari `AnalyticsTelemetry`.
- Endpoint/action admin (admin-only, anti-IDOR).

**Untuk Agent Anda (🟩):**
- UI admin: `/admin/verifikasi`, `/admin/audit-konten`, `/admin` (dashboard funnel), Resolution Center.
- Tabel + filter + aksi memanggil action admin.

---

### 🟦 PHASE 10 — Production Deployment, CI/CD, Monitoring & Hardening

**Pemilik:** CodeBuddy
**Tujuan:** Go-live aman & terpantau.

**Scope:**
- `vercel.json` (cron jadwal `/api/cron/sweep`).
- CI/CD GitHub Actions: install → lint → typecheck → test → build → deploy staging → smoke → production approval → deploy.
- Provision database cloud (PostgreSQL / Turso) + `prisma migrate deploy`.
- Error tracking (Sentry), structured logging, request ID, health/readiness/liveness endpoints.
- Rate limiting, security headers (CSP, HSTS), secret management.
- Ganti provider pembayaran ke live (Midtrans/Xendit) + smoke test produksi.
- Backup/recovery procedure + rollback plan.

**Deliverable:** deployment aktif + monitoring + dokumen `docs/phases/PHASE-10-deploy.md`.

---

## 6. Konvensi Hand-Off (WAJIB untuk setiap phase)

Setiap agent yang menyelesaikan sebuah phase WAJIB membuat file:
`docs/phases/PHASE-XX-<nama>.md` dengan format:

```text
PHASE:
STATUS: (COMPLETE | PARTIAL | BLOCKED)
PEMILIK:
OBJECTIVE:
FILE DIBUAT:
FILE DIUBAH:
ACTION/QUERY YANG DIPANGGIL:
DATABASE CHANGES:
TEST DITAMBAHKAN:
COMMAND DIJALANKAN:
HASIL TEST/BUILD:
PERMINTAAN KE CODEBUDDY: (action/service baru yang dibutuhkan, jika ada)
CATATAN REKONSILIASI:
NEXT STEP:
```

---

## 7. Prosedur Rekonsiliasi

CodeBuddy **TIDAK** membangun dari awal saat mencapai phase ⬜. Langkah baku:

1. `git log --oneline --all` + `git log --grep="phase-XX"`.
2. Baca `docs/phases/PHASE-XX-*.md` yang relevan.
3. `git diff` pada zona terkait.
4. Jalankan verifikasi: `npx tsc --noEmit`, `npx prisma validate`, `npx tsx --test tests/*.test.ts`, `npm run build`.
5. **Cocokkan**: apakah UI/komponen agent memanggil action/query yang benar? Ada yang bypass service layer?
6. **Perbaiki HANYA gap** (bukan rewrite).
7. Perbarui dokumen phase + commit `phase-XX(reconcile): ...`.

---

## 8. Ringkasan Instruksi untuk Agent Anda

> **Salin-tempel instruksi ini ke agent Anda:**
>
> 1. Baca roadmap ini (`docs/ROADMAP_LAUNCH_MULTIAGENT.md`) sebelum mulai.
> 2. Kerjakan **Phase 7 (Design System/UI/A11y)** dan **Phase 8 (SEO/Legal/Marketing)**.
> 3. **DILARANG** menyentuh: `src/server/**`, `src/lib/{transaction-retry,date-utils,prisma,session}.ts`, `src/types/**`, `prisma/**`.
> 4. Jika butuh service/action/query baru → tulis permintaan di `docs/phases/PHASE-XX-*.md`, jangan buat sendiri.
> 5. Setiap phase: commit dengan prefix `phase-07(ui):` / `phase-08(seo):` + tulis dokumen hand-off.
> 6. Untuk Phase 5 (builder/availability) & 9 (admin/dispute): bangun **UI dulu**, panggil **action yang sudah ada**, lalu serahkan ke CodeBuddy untuk finalisasi.
> 7. Pendekatan: **INSPECT → IMPLEMENT → TEST → DEBUG → RE-TEST → DOCUMENT**.

---

## 9. Checklist Go-Live (Definition of Done Global)

- [ ] Semua Phase 3–10 COMPLETE atau terdokumentasi statusnya.
- [ ] Tidak ada critical bug / critical security issue.
- [ ] `tsc --noEmit` PASS, `prisma validate` PASS, test PASS, build PASS.
- [ ] Production smoke test PASS.
- [ ] Ownership isolation PASS, authorization PASS.
- [ ] Secret hygiene PASS (`.env` tidak ter-track).
- [ ] Backup & rollback tersedia.
- [ ] Monitoring & error tracking aktif.
- [ ] Semua route utama tersedia; mobile + desktop responsive.
- [ ] Legal pages (privacy/terms) tersedia.
- [ ] Payment gateway live berfungsi.
- [ ] Cron scheduler berjalan.

---

*Dokumen ini dibuat sebagai peta koordinasi multi-agent. Perbarui status per-phase saat pekerjaan berjalan agar rekonsiliasi tetap akurat.*
