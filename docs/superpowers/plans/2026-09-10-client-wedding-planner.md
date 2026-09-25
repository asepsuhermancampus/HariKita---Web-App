# Wedding Planner Suite (Role Client) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan fitur Wedding Planner DB-backed (Timeline, Berkas KUA, Anggaran, Katering, Emergency Kit) ke portal klien HariKita, ter-re-skin penuh ke design system Brand Hub.

**Architecture:** 5 model Prisma baru (owner-scoped per `userId`, anti-IDOR via session) + lapisan server actions/queries + 1 endpoint upload ber-prefix `ex-` + 5 halaman client baru dan rombakan `/client`. Planner hanya MEMBACA `ClientProfile`/`Order`/`OrderItem`/`PhysicalSession`; tidak menulis ke sana.

**Tech Stack:** Next.js 15 App Router, React 19, Prisma 6, Tailwind v4, TypeScript, `node:test` (tsx), Lucide icons.

**Spec:** `docs/superpowers/specs/2026-09-10-client-wedding-planner-design.md`

## Global Constraints

- **Dua schema wajib disinkronkan.** `prisma/schema.prisma` (PostgreSQL — sumber kebenaran produksi) DAN `prisma/schema.sqlite.prisma` (dev/test SQLite). Setiap model baru ditulis di KEDUANYA, blok identik.
- **Prisma client SQLite terpisah**: `generated/sqlite-client`. Client utama via `@/lib/prisma`. Generate: `npm run generate:sqlite`.
- **Uang = Int rupiah** (AGENTS.md Rule 3). Dilarang `Float`.
- **Anti-IDOR:** `userId` HANYA dari `getSession()` di server. Tidak pernah dari argumen client.
- **AGENTS.md Rule 12-13:** backup `prisma/dev.db`, `prisma validate`, `db push`, `tsc --noEmit`, test relasi & seed.
- **AGENTS.md Rule 10:** dilarang state planner di localStorage. Semua DB.
- **Design tokens (Brand Hub):** `hk-charcoal #2B2B2B`, `hk-taupe #88735B`, `hk-champagne #C9A88A`, `hk-soft-beige #E8DED1`, `hk-ivory #F8F6F1`. Selalu pakai NAMA class token.
- **Tipografi:** heading `font-editorial`; UI/body `font-manrope`. Dilarang Plus Jakarta Sans.
- **Emoji ikon dilarang** di UI — pakai Lucide.
- **Prefix `ex-`** = di luar layanan HariKita: API `/api/ex-budget-proof`, storage `public/uploads/ex-budget/`, `WeddingBudgetItem.isExternal`.
- **Mobile-first**, tanpa horizontal overflow di 375/768/1024; tombol ≥ 44px.
- **Bahasa UI:** Indonesia.

---

## File Structure

**Schema (modify, 2 file):** `prisma/schema.prisma`, `prisma/schema.sqlite.prisma`.

**Validasi (create):** `src/lib/validations/wedding-planner.ts`.

**Server (create):** `src/server/actions/wedding-planner.ts`, `src/server/queries/wedding-planner.ts`, `src/server/services/wedding-planner-seed.ts`.

**API (create):** `src/app/api/ex-budget-proof/route.ts`.

**Navigasi (modify):** `src/components/dashboard/nav-config.ts`.

**Halaman (create/modify):**
- `src/app/client/page.tsx` (modify — rombak)
- `src/app/client/perencanaan/{page,ClientTimeline}.tsx`
- `src/app/client/berkas-kua/{page,ClientKua}.tsx`
- `src/app/client/anggaran/{page,ClientBudget,ExBudgetPanel}.tsx`
- `src/app/client/katering/page.tsx`
- `src/app/client/emergency/{page,ClientEmergency}.tsx`

**Tests (create):** `tests/wedding-planner.test.ts`.

---

## Task 1: Model Prisma (2 schema) + relasi balik

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/schema.sqlite.prisma`

**Interfaces:**
- Produces: model `WeddingTask`, `KuaRequirement`, `WeddingBudgetItem`, `BudgetPaymentProof`, `WeddingEmergencyItem`; relasi balik di `User` & `OrderItem`.

- [ ] **Step 1: Tambahkan 5 model di `prisma/schema.prisma`**

Tempel di akhir file `prisma/schema.prisma`:

```prisma
model WeddingTask {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  stage     Int       @default(0)
  taskText  String
  pic       String?
  priority  String    @default("Sedang")
  note      String?
  isDone    Boolean   @default(false)
  doneAt    DateTime?
  sortOrder Int       @default(0)
  isCustom  Boolean   @default(false)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([userId, stage, sortOrder])
}

model KuaRequirement {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category    String
  docName     String
  party       String?
  docFormat   String?
  institution String?
  note        String?
  isRequired  Boolean   @default(true)
  isActive    Boolean   @default(false)
  isDone      Boolean   @default(false)
  doneAt      DateTime?
  sortOrder   Int       @default(0)
  isCustom    Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId, category, sortOrder])
}

model WeddingBudgetItem {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category          String
  itemName          String
  pic               String?
  estimatedAmount   Int       @default(0)
  paidAmount        Int       @default(0)
  status            String    @default("BELUM")
  note              String?
  isExternal        Boolean   @default(true)
  linkMode          String    @default("MANUAL")
  linkedOrderItemId String?
  linkedOrderItem   OrderItem? @relation(fields: [linkedOrderItemId], references: [id], onDelete: SetNull)
  sortOrder         Int       @default(0)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  proofs            BudgetPaymentProof[]

  @@index([userId, sortOrder])
  @@index([linkedOrderItemId])
}

model BudgetPaymentProof {
  id           String            @id @default(cuid())
  userId       String
  user         User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  budgetItemId String
  budgetItem   WeddingBudgetItem @relation(fields: [budgetItemId], references: [id], onDelete: Cascade)
  fileUrl      String
  fileName     String?
  amount       Int?
  paidAt       DateTime?
  note         String?
  createdAt    DateTime          @default(now())

  @@index([budgetItemId, createdAt])
}

model WeddingEmergencyItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemText  String
  isPacked  Boolean  @default(false)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, sortOrder])
}
```

- [ ] **Step 2: Tambahkan relasi balik di `User` (`prisma/schema.prisma`)**

Sisipkan setelah baris `heldSlots         VendorAvailability[] @relation("UserAvailabilityHolds")`:

```prisma
  weddingTasks     WeddingTask[]
  kuaRequirements  KuaRequirement[]
  budgetItems      WeddingBudgetItem[]
  budgetProofs     BudgetPaymentProof[]
  emergencyItems   WeddingEmergencyItem[]
```

- [ ] **Step 3: Tambahkan relasi balik di `OrderItem` (`prisma/schema.prisma`)**

Sisipkan setelah baris `statusHistories     OrderItemStatusHistory[]`:

```prisma
  budgetLinks         WeddingBudgetItem[]
```

- [ ] **Step 4: Salin identik ke `prisma/schema.sqlite.prisma`**

Terapkan Step 1-3 yang sama persis. Tidak ada perbedaan tipe (semua `String`/`Int`/`Boolean`/`DateTime` didukung SQLite).

- [ ] **Step 5: Backup DB & validasi 2 schema**

```powershell
Copy-Item prisma/dev.db "prisma/dev.db.backup_planner_pre"
npx prisma validate
npx prisma validate --schema prisma/schema.sqlite.prisma
```
Expected: kedua `validate` sukses.

- [ ] **Step 6: Push & generate**

```powershell
npx prisma db push
npx prisma db push --schema prisma/schema.sqlite.prisma
npx prisma generate
npm run generate:sqlite
```
Expected: semua sukses tanpa error.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/schema.sqlite.prisma
git commit -m "feat(planner): add 5 wedding planner models to prisma schemas"
```

---

## Task 2: Validasi + konstanta planner

**Files:**
- Create: `src/lib/validations/wedding-planner.ts`
- Test: `tests/wedding-planner.test.ts`

**Interfaces:**
- Produces: `validateBudgetItemInput(raw)`, `validateTaskInput(raw)`, `validateKuaInput(raw)`, `validateProofInput(raw)` → `ValidationResult<T>`; konstanta `PLANNER_STAGES`, `BUDGET_CATEGORIES`, `KUA_CATEGORIES`.

- [ ] **Step 1: Write the failing test**

Create `tests/wedding-planner.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateBudgetItemInput,
  validateTaskInput,
  validateProofInput,
  PLANNER_STAGES,
  BUDGET_CATEGORIES,
} from "../src/lib/validations/wedding-planner";

test("validateBudgetItemInput accepts a valid item and coerces amounts to Int", () => {
  const res = validateBudgetItemInput({
    category: "Mahar",
    itemName: "Logam Mulia 10g",
    estimatedAmount: "12000000",
    paidAmount: "5000000",
    isExternal: true,
  });
  assert.equal(res.success, true);
  assert.equal(res.data?.estimatedAmount, 12000000);
  assert.equal(res.data?.paidAmount, 5000000);
  assert.equal(res.data?.isExternal, true);
  assert.equal(res.data?.linkMode, "MANUAL");
});

test("validateBudgetItemInput rejects empty itemName and negative amounts", () => {
  const res = validateBudgetItemInput({
    category: "Mahar",
    itemName: "  ",
    estimatedAmount: "-5",
    paidAmount: "0",
  });
  assert.equal(res.success, false);
  assert.ok(res.errors?.itemName);
  assert.ok(res.errors?.estimatedAmount);
});

test("validateTaskInput requires taskText and clamps stage 0..7", () => {
  assert.equal(validateTaskInput({ taskText: "Cek cincin", stage: "3" }).success, true);
  const bad = validateTaskInput({ taskText: "", stage: "99" });
  assert.equal(bad.success, false);
  assert.ok(bad.errors?.taskText);
  assert.ok(bad.errors?.stage);
});

test("validateProofInput requires a fileUrl", () => {
  assert.equal(validateProofInput({ fileUrl: "/uploads/ex-budget/u/x.pdf" }).success, true);
  assert.equal(validateProofInput({ fileUrl: "" }).success, false);
});

test("PLANNER_STAGES has 7 stages and BUDGET_CATEGORIES is non-empty", () => {
  assert.equal(PLANNER_STAGES.length, 7);
  assert.ok(BUDGET_CATEGORIES.length > 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/wedding-planner.test.ts`
Expected: FAIL — cannot find module `../src/lib/validations/wedding-planner`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/validations/wedding-planner.ts`:

```ts
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

export const PLANNER_STAGES = [1, 2, 3, 4, 5, 6, 7] as const;

export const BUDGET_CATEGORIES = [
  "KUA & Hukum",
  "Venue",
  "Katering",
  "Dekorasi",
  "Busana & Rias",
  "Dokumentasi",
  "Undangan",
  "Souvenir",
  "Cincin",
  "Mahar",
  "Seserahan",
  "Musik & MC",
  "Organizer",
  "Operasional",
] as const;

export const KUA_CATEGORIES = [
  "1. Pengantar RT/RW",
  "2. Kelurahan (Model N)",
  "3. Identitas Kependudukan",
  "4. Pas Foto Resmi",
  "5. Kesehatan & Elsimil",
  "6. Numpang Nikah",
  "7. Wali & Saksi",
  "8. KUA & Hari-H",
] as const;

function toInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }
  return null;
}

export interface BudgetItemInput {
  category: string;
  itemName: string;
  pic?: string;
  estimatedAmount: number;
  paidAmount: number;
  status: string;
  note?: string;
  isExternal: boolean;
  linkMode: string;
}

const BUDGET_STATUS = ["LUNAS", "DP", "BELUM", "SIAPKAN"] as const;
const LINK_MODES = ["MANUAL", "AUTO"] as const;

export function validateBudgetItemInput(
  raw: Record<string, unknown>
): ValidationResult<BudgetItemInput> {
  const errors: Record<string, string[]> = {};

  const category = typeof raw.category === "string" ? raw.category.trim() : "";
  if (!category) errors.category = ["Kategori wajib dipilih."];

  const itemName = typeof raw.itemName === "string" ? raw.itemName.trim() : "";
  if (!itemName || itemName.length < 2) errors.itemName = ["Nama item minimal 2 karakter."];
  else if (itemName.length > 150) errors.itemName = ["Nama item maksimal 150 karakter."];

  const est = toInt(raw.estimatedAmount);
  if (est === null || est < 0) errors.estimatedAmount = ["Estimasi harus angka >= 0."];

  const paid = toInt(raw.paidAmount);
  if (paid === null || paid < 0) errors.paidAmount = ["Terbayar harus angka >= 0."];

  const status =
    typeof raw.status === "string" && (BUDGET_STATUS as readonly string[]).includes(raw.status)
      ? raw.status
      : "BELUM";

  const linkMode =
    typeof raw.linkMode === "string" && (LINK_MODES as readonly string[]).includes(raw.linkMode)
      ? raw.linkMode
      : "MANUAL";

  if (Object.keys(errors).length > 0) return { success: false, errors };

  return {
    success: true,
    data: {
      category,
      itemName,
      pic: typeof raw.pic === "string" ? raw.pic.trim() || undefined : undefined,
      estimatedAmount: est as number,
      paidAmount: paid as number,
      status,
      note: typeof raw.note === "string" ? raw.note.trim() || undefined : undefined,
      isExternal: raw.isExternal !== false,
      linkMode,
    },
  };
}

export interface TaskInput {
  stage: number;
  taskText: string;
  pic?: string;
  priority: string;
  note?: string;
}

export function validateTaskInput(raw: Record<string, unknown>): ValidationResult<TaskInput> {
  const errors: Record<string, string[]> = {};

  const taskText = typeof raw.taskText === "string" ? raw.taskText.trim() : "";
  if (!taskText || taskText.length < 2) errors.taskText = ["Tugas minimal 2 karakter."];
  else if (taskText.length > 200) errors.taskText = ["Tugas maksimal 200 karakter."];

  const stage = toInt(raw.stage);
  if (stage === null || stage < 0 || stage > 7) errors.stage = ["Tahap harus 0..7."];

  const priority = raw.priority === "Tinggi" ? "Tinggi" : "Sedang";

  if (Object.keys(errors).length > 0) return { success: false, errors };

  return {
    success: true,
    data: {
      stage: stage as number,
      taskText,
      pic: typeof raw.pic === "string" ? raw.pic.trim() || undefined : undefined,
      priority,
      note: typeof raw.note === "string" ? raw.note.trim() || undefined : undefined,
    },
  };
}

export interface KuaInput {
  category: string;
  docName: string;
  institution?: string;
  note?: string;
}

export function validateKuaInput(raw: Record<string, unknown>): ValidationResult<KuaInput> {
  const errors: Record<string, string[]> = {};

  const category = typeof raw.category === "string" ? raw.category.trim() : "";
  if (!category) errors.category = ["Kategori wajib dipilih."];

  const docName = typeof raw.docName === "string" ? raw.docName.trim() : "";
  if (!docName || docName.length < 2) errors.docName = ["Nama berkas minimal 2 karakter."];

  if (Object.keys(errors).length > 0) return { success: false, errors };

  return {
    success: true,
    data: {
      category,
      docName,
      institution:
        typeof raw.institution === "string" ? raw.institution.trim() || undefined : undefined,
      note: typeof raw.note === "string" ? raw.note.trim() || undefined : undefined,
    },
  };
}

export interface ProofInput {
  fileUrl: string;
  fileName?: string;
  amount?: number;
  note?: string;
}

export function validateProofInput(raw: Record<string, unknown>): ValidationResult<ProofInput> {
  const errors: Record<string, string[]> = {};
  const fileUrl = typeof raw.fileUrl === "string" ? raw.fileUrl.trim() : "";
  if (!fileUrl) errors.fileUrl = ["File bukti wajib diunggah."];

  const amount = raw.amount === undefined || raw.amount === "" ? undefined : toInt(raw.amount);
  if (amount !== undefined && (amount === null || amount < 0))
    errors.amount = ["Nominal harus angka >= 0."];

  if (Object.keys(errors).length > 0) return { success: false, errors };

  return {
    success: true,
    data: {
      fileUrl,
      fileName: typeof raw.fileName === "string" ? raw.fileName.trim() || undefined : undefined,
      amount: amount ?? undefined,
      note: typeof raw.note === "string" ? raw.note.trim() || undefined : undefined,
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/wedding-planner.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/validations/wedding-planner.ts tests/wedding-planner.test.ts
git commit -m "feat(planner): add planner input validators with tests"
```

---

## Task 3: Seed idempotent service

**Files:**
- Create: `src/server/services/wedding-planner-seed.ts`
- Test: `tests/wedding-planner.test.ts` (append)

**Interfaces:**
- Consumes: `prisma` dari `@/lib/prisma`.
- Produces: `DEFAULT_TASKS` (22), `DEFAULT_KUA` (32; 26 wajib + 6 opsional), `DEFAULT_EMERGENCY` (13); `ensureWeddingPlannerSeeded(userId: string): Promise<void>` — idempotent per-kategori.

- [ ] **Step 1: Write the failing test**

Append ke `tests/wedding-planner.test.ts`:

```ts
import { DEFAULT_TASKS, DEFAULT_KUA, DEFAULT_EMERGENCY } from "../src/server/services/wedding-planner-seed";

test("default seed arrays have expected sizes and shapes", () => {
  assert.equal(DEFAULT_TASKS.length, 22);
  assert.equal(DEFAULT_KUA.length, 32); // 26 wajib + 6 opsional
  assert.equal(DEFAULT_EMERGENCY.length, 13);
  assert.ok(DEFAULT_TASKS.every((t) => t.stage >= 1 && t.stage <= 7));
  assert.equal(DEFAULT_KUA.filter((k) => k.isRequired).length, 26);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/wedding-planner.test.ts`
Expected: FAIL — cannot find module `wedding-planner-seed`.

- [ ] **Step 3: Write minimal implementation**

Create `src/server/services/wedding-planner-seed.ts`:

```ts
import { prisma } from "@/lib/prisma";

export interface SeedTask {
  stage: number;
  taskText: string;
  pic: string;
  priority: string;
  note: string;
}
export interface SeedKua {
  category: string;
  docName: string;
  party: string;
  docFormat: string;
  institution: string;
  note: string;
  isRequired: boolean;
}
export interface SeedEmergency {
  itemText: string;
}

export const DEFAULT_TASKS: SeedTask[] = [
  { stage: 1, taskText: "Pertemuan keluarga besar & penetapan tanggal akad/resepsi", pic: "Keluarga Inti", priority: "Tinggi", note: "Sepakati konsep utama (Intimate vs Tradisional)" },
  { stage: 1, taskText: "Menentukan batas plafon anggaran (budget) & tabungan bersama", pic: "Mempelai", priority: "Tinggi", note: "Buat rekening bersama persiapan pernikahan" },
  { stage: 1, taskText: "Survei dan booking lokasi / venue (Gedung/Masjid/Hotel)", pic: "Mempelai", priority: "Tinggi", note: "Gedung favorit wajib diamankan jauh hari" },
  { stage: 2, taskText: "Test food & booking vendor katering", pic: "Mempelai & Ortu", priority: "Tinggi", note: "Gunakan rumus porsi: Undangan x 2 x 2.2" },
  { stage: 2, taskText: "Booking MUA, Dekorasi Pelaminan, & Fotografer", pic: "Mempelai", priority: "Tinggi", note: "Vendor visual cepat penuh di tanggal cantik" },
  { stage: 2, taskText: "Booking Wedding Organizer (WO) atau bentuk Panitia Keluarga", pic: "Mempelai", priority: "Sedang", note: "Menentukan koordinator teknis hari H" },
  { stage: 3, taskText: "Fitting baju pengantin serta seragam keluarga", pic: "Mempelai", priority: "Sedang", note: "Bagi kain seragam ke bridesmaid & keluarga" },
  { stage: 3, taskText: "Beli cincin kawin", pic: "Mempelai", priority: "Sedang", note: "Ukur lingkar jari & grafir nama" },
  { stage: 3, taskText: "Sesi foto Pre-wedding & cetak galeri resepsi", pic: "Vendor Foto", priority: "Sedang", note: "Siapkan file foto untuk undangan website" },
  { stage: 3, taskText: "Beli isi seserahan & booking boks hantaran akrilik", pic: "Kedua Pihak", priority: "Sedang", note: "Sepakati jumlah boks (misal 7 atau 9 boks)" },
  { stage: 4, taskText: "Cek kesehatan Puskesmas & sertifikat Elsimil", pic: "Mempelai", priority: "Tinggi", note: "Tes darah Catin & vaksin TT calon istri" },
  { stage: 4, taskText: "Urus surat RT/RW, formulir N1 kelurahan & numpang nikah", pic: "Mempelai", priority: "Tinggi", note: "Kelurahan domisili & KUA asal" },
  { stage: 4, taskText: "Daftar portal Simkah Kemenag & bayar billing PNBP", pic: "Mempelai", priority: "Tinggi", note: "Minimal H-10 hari kerja sebelum hari H" },
  { stage: 4, taskText: "Finalisasi daftar tamu & sebar undangan fisik/digital", pic: "Mempelai & Ortu", priority: "Tinggi", note: "Kirim pesan personal WhatsApp H-14" },
  { stage: 5, taskText: "Technical Meeting (TM) seluruh vendor & panitia", pic: "WO & Vendor", priority: "Tinggi", note: "Matangkan rundown acara menit demi menit" },
  { stage: 5, taskText: "Briefing peran rahasia keluarga (Angpao, Mahar, Katering)", pic: "Keluarga Inti", priority: "Tinggi", note: "Serahkan kunci gembok kotak uang kepada PIC" },
  { stage: 5, taskText: "Mengikuti kursus pranikah Bimwin KUA", pic: "Mempelai", priority: "Tinggi", note: "Bimbingan perkawinan KUA kecamatan" },
  { stage: 6, taskText: "Packing Wedding Emergency Kit & baju ganti santai", pic: "Bridesmaid", priority: "Tinggi", note: "Peniti, obat, flat shoes cadangan, sedotan" },
  { stage: 6, taskText: "Siapkan amplop uang tips tunai pecahan kecil", pic: "Panitia Keluarga", priority: "Tinggi", note: "Pecahan 20rb & 50rb untuk parkir, kebersihan, genset" },
  { stage: 6, taskText: "Istirahat total, gladi resik singkat, cek fisik mahar", pic: "Mempelai", priority: "Tinggi", note: "Tidur cukup sebelum mulai dirias subuh" },
  { stage: 7, taskText: "Akad Nikah Khidmat & Ijab Kabul", pic: "Semua Pihak", priority: "Tinggi", note: "Serahkan mahar resmi di meja penghulu" },
  { stage: 7, taskText: "Resepsi Pernikahan & Ramah Tamah", pic: "Semua Pihak", priority: "Tinggi", note: "Nikmati momen indah bersama pasangan & keluarga" },
];

export const DEFAULT_KUA: SeedKua[] = [
  { category: "1. Pengantar RT/RW", docName: "Surat Pengantar Nikah dari RT & RW", party: "CPP", docFormat: "Asli 1 Lembar", institution: "Ketua RT & RW Domisili CPP", note: "Bawa fotokopi KTP & KK domisili asal", isRequired: true },
  { category: "1. Pengantar RT/RW", docName: "Surat Pengantar Nikah dari RT & RW", party: "CPW", docFormat: "Asli 1 Lembar", institution: "Ketua RT & RW Domisili CPW", note: "Bawa fotokopi KTP & KK domisili asal", isRequired: true },
  { category: "2. Kelurahan (Model N)", docName: "Formulir Model N1 (Pengantar Nikah)", party: "Bersama", docFormat: "Asli 2 Rangkap", institution: "Kelurahan / Kantor Desa", note: "Mencantumkan status pernikahan calon mempelai", isRequired: true },
  { category: "2. Kelurahan (Model N)", docName: "Formulir Model N2 (Permohonan Kehendak Nikah)", party: "Bersama", docFormat: "Asli 1 Lembar", institution: "Kelurahan / Kantor Desa", note: "Surat permohonan resmi mendaftar ke KUA", isRequired: true },
  { category: "2. Kelurahan (Model N)", docName: "Formulir Model N4 (Persetujuan Calon Mempelai)", party: "Bersama", docFormat: "Asli 1 Lembar", institution: "Kelurahan / Kantor Desa", note: "Tanda tangan bermaterai", isRequired: true },
  { category: "2. Kelurahan (Model N)", docName: "Surat Keterangan Belum Menikah", party: "Bersama", docFormat: "Asli Bermaterai", institution: "Kelurahan / Desa", note: "Surat pernyataan resmi belum pernah menikah", isRequired: true },
  { category: "3. Identitas Kependudukan", docName: "e-KTP Calon Pengantin Pria & Wanita", party: "Bersama", docFormat: "Asli & FC 4 Rangkap", institution: "Disdukcapil / Mandiri", note: "Pastikan NIK aktif di server nasional", isRequired: true },
  { category: "3. Identitas Kependudukan", docName: "Kartu Keluarga (KK) Calon Pengantin", party: "Bersama", docFormat: "Asli & FC 4 Rangkap", institution: "Disdukcapil / Mandiri", note: "KK terbaru ber-barcode TTE resmi", isRequired: true },
  { category: "3. Identitas Kependudukan", docName: "Akta Kelahiran Calon Pengantin", party: "Bersama", docFormat: "Asli & FC 3 Rangkap", institution: "Disdukcapil / Mandiri", note: "Verifikasi nama orang tua kandung", isRequired: true },
  { category: "3. Identitas Kependudukan", docName: "Ijazah Terakhir (SD/SMP/SMA/S1)", party: "Bersama", docFormat: "Asli & FC 2 Rangkap", institution: "Sekolah / Kampus", note: "Sinkronisasi ejaan nama pada buku nikah & paspor", isRequired: true },
  { category: "3. Identitas Kependudukan", docName: "e-KTP Kedua Pasang Orang Tua (Bapak & Ibu)", party: "Keluarga", docFormat: "FC 3 Rangkap", institution: "Disdukcapil / Mandiri", note: "KTP Ayah & Ibu kedua calon", isRequired: true },
  { category: "3. Identitas Kependudukan", docName: "Buku Nikah / Akta Nikah Orang Tua CPW", party: "Keluarga", docFormat: "Asli & FC 2 Rangkap", institution: "KUA Asal Orang Tua CPW", note: "Verifikasi keabsahan wali nikah anak perempuan", isRequired: true },
  { category: "4. Pas Foto Resmi", docName: "Pas Foto Latar Belakang Biru Ukuran 2x3", party: "Bersama", docFormat: "Fisik 4 Lembar Masing-masing", institution: "Studio Foto", note: "Kemeja berkerah rapi, hijab warna kontras", isRequired: true },
  { category: "4. Pas Foto Resmi", docName: "Pas Foto Latar Belakang Biru Ukuran 4x6", party: "Bersama", docFormat: "Fisik 2 Lembar Masing-masing", institution: "Studio Foto", note: "Untuk arsip buku nikah dan lembar akta nikah", isRequired: true },
  { category: "4. Pas Foto Resmi", docName: "Softcopy Foto Background Biru Resolusi Tinggi", party: "Bersama", docFormat: "File JPG (< 500 KB)", institution: "Studio Foto", note: "Diunggah saat pendaftaran online Simkah", isRequired: true },
  { category: "5. Kesehatan & Elsimil", docName: "Surat Keterangan Sehat Pranikah (Catin)", party: "Bersama", docFormat: "Asli 1 Lembar", institution: "Puskesmas Domisili", note: "Cek Lab: Hb, Gol Darah, HIV, Sifilis, Hepatitis B", isRequired: true },
  { category: "5. Kesehatan & Elsimil", docName: "Kartu / Bukti Suntik Imunisasi TT (Tetanus)", party: "CPW", docFormat: "Asli 1 Lembar", institution: "Puskesmas / Faskes", note: "Wajib bagi calon istri", isRequired: true },
  { category: "5. Kesehatan & Elsimil", docName: "Sertifikat Elektronik Siap Nikah (Elsimil)", party: "Bersama", docFormat: "Sertifikat Digital PDF", institution: "Aplikasi Elsimil BKKBN", note: "Diunduh & dicetak untuk pendaftaran KUA", isRequired: true },
  { category: "6. Numpang Nikah", docName: "Surat Rekomendasi Nikah dari KUA Asal", party: "CPP", docFormat: "Asli 1 Lembar", institution: "KUA Domisili Asal CPP", note: "Wajib jika menikah di domisili CPW / kecamatan lain", isRequired: true },
  { category: "7. Wali & Saksi", docName: "e-KTP Asli & FC Wali Nikah (Ayah Kandung CPW)", party: "Keluarga", docFormat: "Asli & FC 2 Lembar", institution: "Disdukcapil / Mandiri", note: "Wajib hadir saat akad ijab kabul", isRequired: true },
  { category: "7. Wali & Saksi", docName: "e-KTP 2 Orang Saksi Nikah Resmi", party: "Bersama", docFormat: "FC 2 Lembar", institution: "Disdukcapil / Mandiri", note: "1 saksi pihak CPP, 1 saksi pihak CPW", isRequired: true },
  { category: "8. KUA & Hari-H", docName: "Bukti Pendaftaran Akun Simkah Online", party: "Bersama", docFormat: "Cetak Bukti Daftar", institution: "simkah4.kemenag.go.id", note: "Daftar minimal 10 hari kerja sebelum hari H", isRequired: true },
  { category: "8. KUA & Hari-H", docName: "Bukti Setor Billing PNBP Nikah Rp 600.000", party: "Bersama", docFormat: "Struk Setor Bank / Pos", institution: "Bank Persepsi / SIMPONI", note: "Khusus nikah luar kantor KUA", isRequired: true },
  { category: "8. KUA & Hari-H", docName: "Sertifikat Bimbingan Perkawinan (Bimwin)", party: "Bersama", docFormat: "Sertifikat Kemenag", institution: "KUA Kecamatan", note: "Kursus pranikah tatap muka / mandiri", isRequired: true },
  { category: "8. KUA & Hari-H", docName: "Materai Rp 10.000 (Minimal 4 Lembar)", party: "Bersama", docFormat: "Materai Fisik Tempel", institution: "Kantor Pos", note: "Untuk berkas pernyataan darurat di meja KUA", isRequired: true },
  { category: "8. KUA & Hari-H", docName: "Pemeriksaan Fisik Buku Nikah di Meja Akad", party: "Bersama", docFormat: "Buku Cokelat & Hijau", institution: "Meja Akad / Penghulu", note: "Periksa nama, TTL, & mahar sebelum menandatangani", isRequired: true },
  { category: "9. Berkas Khusus (Opsional)", docName: "Surat Izin Nikah dari Atasan / Komandan / Instansi", party: "Bersama", docFormat: "Asli 1 Lembar", institution: "Instansi / Kedinasan / Kesatuan", note: "Jika profesi mewajibkan (TNI, POLRI, Kedinasan, BUMN)", isRequired: false },
  { category: "9. Berkas Khusus (Opsional)", docName: "Akta Cerai Asli Pengadilan Agama", party: "Bersama", docFormat: "Asli", institution: "Pengadilan Agama", note: "Jika salah satu pernah menikah (duda/janda cerai hidup)", isRequired: false },
  { category: "9. Berkas Khusus (Opsional)", docName: "Akta Kematian Pasangan Terdahulu", party: "Bersama", docFormat: "Asli", institution: "Disdukcapil", note: "Jika pasangan terdahulu meninggal dunia", isRequired: false },
  { category: "9. Berkas Khusus (Opsional)", docName: "Surat Kematian Ayah / Surat Kuasa Taukil Wali", party: "Keluarga", docFormat: "Asli", institution: "Kelurahan / KUA", note: "Jika ayah kandung telah wafat atau berhalangan hadir", isRequired: false },
  { category: "9. Berkas Khusus (Opsional)", docName: "Akta Notaris Perjanjian Pranikah (Pisah Harta)", party: "Bersama", docFormat: "Asli", institution: "Kantor Notaris", note: "Jika memilih perjanjian pisah harta sebelum akad", isRequired: false },
  { category: "9. Berkas Khusus (Opsional)", docName: "Surat Dispensasi Nikah dari Kantor Camat", party: "Bersama", docFormat: "Asli", institution: "Kantor Camat Setempat", note: "Jika mendaftar ke KUA kurang dari 10 hari kerja", isRequired: false },
];

export const DEFAULT_EMERGENCY: SeedEmergency[] = [
  { itemText: "Peniti Bohlam & Peniti Biasa" },
  { itemText: "Jarum Pentul & Benang Jahit Mini" },
  { itemText: "Gunting Lipat Kecil & Lakban Bening" },
  { itemText: "Sedotan Minum (Lipstik awet)" },
  { itemText: "Obat Maag & Tolak Angin" },
  { itemText: "Paracetamol & Minyak Kayu Putih" },
  { itemText: "Plester Luka (Hansaplast)" },
  { itemText: "Permen Pelega Napas" },
  { itemText: "Tisu Kering & Tisu Basah" },
  { itemText: "Sandal Jepit / Flat Shoes Cadangan" },
  { itemText: "Amplop Cash Tips (Parkir, Satpam, Genset)" },
  { itemText: "Materai Rp 10.000 (4 lembar)" },
  { itemText: "Koper Baju Ganti Santai" },
];

/** Seed default sekali jalan (idempotent per-kategori) untuk planner user. */
export async function ensureWeddingPlannerSeeded(userId: string): Promise<void> {
  const [taskCount, kuaCount, emergencyCount] = await Promise.all([
    prisma.weddingTask.count({ where: { userId } }),
    prisma.kuaRequirement.count({ where: { userId } }),
    prisma.weddingEmergencyItem.count({ where: { userId } }),
  ]);

  const ops: Promise<unknown>[] = [];

  if (taskCount === 0) {
    ops.push(
      prisma.weddingTask.createMany({
        data: DEFAULT_TASKS.map((t, i) => ({
          userId,
          stage: t.stage,
          taskText: t.taskText,
          pic: t.pic,
          priority: t.priority,
          note: t.note,
          sortOrder: i,
        })),
      })
    );
  }

  if (kuaCount === 0) {
    ops.push(
      prisma.kuaRequirement.createMany({
        data: DEFAULT_KUA.map((k, i) => ({
          userId,
          category: k.category,
          docName: k.docName,
          party: k.party,
          docFormat: k.docFormat,
          institution: k.institution,
          note: k.note,
          isRequired: k.isRequired,
          isActive: k.isRequired,
          sortOrder: i,
        })),
      })
    );
  }

  if (emergencyCount === 0) {
    ops.push(
      prisma.weddingEmergencyItem.createMany({
        data: DEFAULT_EMERGENCY.map((e, i) => ({
          userId,
          itemText: e.itemText,
          sortOrder: i,
        })),
      })
    );
  }

  if (ops.length > 0) await Promise.all(ops);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/wedding-planner.test.ts`
Expected: PASS (6 tests total).

- [ ] **Step 5: Commit**

```bash
git add src/server/services/wedding-planner-seed.ts tests/wedding-planner.test.ts
git commit -m "feat(planner): add idempotent seed service with default data"
```

---

## Task 4: Server Actions (CRUD)

**Files:**
- Create: `src/server/actions/wedding-planner.ts`

**Interfaces:**
- Consumes: `getSession()`, `prisma`, validator dari Task 2, `DEFAULT_TASKS` dari Task 3.
- Produces (semua `=> Promise<{ success: boolean; message?: string; error?: string; fieldErrors?: Record<string,string[]> }>`):
  - Task: `addPlannerTask(formData)`, `togglePlannerTask(id, isDone)`, `updatePlannerTask(formData)`, `deletePlannerTask(id)`, `resetTimelineToDefault()`
  - KUA: `toggleKuaDone(id, isDone)`, `toggleKuaActive(id, isActive)`, `addCustomKua(formData)`, `updateKua(formData)`, `deleteKua(id)`
  - Budget: `addBudgetItem(formData)`, `updateBudgetItem(formData)`, `deleteBudgetItem(id)`, `linkBudgetToOrderItem(id, orderItemId, linkMode)`, `unlinkBudgetItem(id)`
  - Proof: `addBudgetProof(formData)`, `deleteBudgetProof(id)`
  - Emergency: `toggleEmergencyItem(id, isPacked)`, `addEmergencyItem(formData)`, `deleteEmergencyItem(id)`

**Anti-IDOR:** setiap update/delete memakai `updateMany`/`deleteMany` dengan `where: { id, userId }`, lalu cek `count`.

- [ ] **Step 1: Implementasi file action lengkap**

Create `src/server/actions/wedding-planner.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  validateBudgetItemInput,
  validateTaskInput,
  validateKuaInput,
  validateProofInput,
} from "@/lib/validations/wedding-planner";

export interface PlannerActionResult {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function revalidatePlanner() {
  revalidatePath("/client");
  revalidatePath("/client/perencanaan");
  revalidatePath("/client/berkas-kua");
  revalidatePath("/client/anggaran");
  revalidatePath("/client/emergency");
}

async function requireUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ?? null;
}

const s = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v : "";
};

// TASKS
export async function addPlannerTask(formData: FormData): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir. Silakan masuk kembali." };

  const validation = validateTaskInput({
    taskText: s(formData, "taskText"),
    stage: s(formData, "stage"),
    pic: s(formData, "pic"),
    priority: s(formData, "priority"),
    note: s(formData, "note"),
  });
  if (!validation.success || !validation.data)
    return { success: false, error: "Data belum valid.", fieldErrors: validation.errors };

  const max = await prisma.weddingTask.aggregate({ where: { userId }, _max: { sortOrder: true } });
  await prisma.weddingTask.create({
    data: { userId, ...validation.data, isCustom: true, sortOrder: (max._max.sortOrder ?? 0) + 1 },
  });
  revalidatePlanner();
  return { success: true, message: "Tugas baru ditambahkan." };
}

export async function togglePlannerTask(id: string, isDone: boolean): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.weddingTask.updateMany({
    where: { id, userId },
    data: { isDone, doneAt: isDone ? new Date() : null },
  });
  if (res.count === 0) return { success: false, error: "Tugas tidak ditemukan." };
  revalidatePlanner();
  return { success: true };
}

export async function updatePlannerTask(formData: FormData): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const id = s(formData, "id");
  const validation = validateTaskInput({
    taskText: s(formData, "taskText"),
    stage: s(formData, "stage"),
    pic: s(formData, "pic"),
    priority: s(formData, "priority"),
    note: s(formData, "note"),
  });
  if (!validation.success || !validation.data)
    return { success: false, error: "Data belum valid.", fieldErrors: validation.errors };
  const res = await prisma.weddingTask.updateMany({ where: { id, userId }, data: validation.data });
  if (res.count === 0) return { success: false, error: "Tugas tidak ditemukan." };
  revalidatePlanner();
  return { success: true, message: "Tugas diperbarui." };
}

export async function deletePlannerTask(id: string): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.weddingTask.deleteMany({ where: { id, userId } });
  if (res.count === 0) return { success: false, error: "Tugas tidak ditemukan." };
  revalidatePlanner();
  return { success: true };
}

export async function resetTimelineToDefault(): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const { DEFAULT_TASKS } = await import("@/server/services/wedding-planner-seed");
  await prisma.$transaction([
    prisma.weddingTask.deleteMany({ where: { userId } }),
    prisma.weddingTask.createMany({
      data: DEFAULT_TASKS.map((t, i) => ({
        userId,
        stage: t.stage,
        taskText: t.taskText,
        pic: t.pic,
        priority: t.priority,
        note: t.note,
        sortOrder: i,
      })),
    }),
  ]);
  revalidatePlanner();
  return { success: true, message: "Timeline direset ke pengaturan awal." };
}

// KUA
export async function toggleKuaDone(id: string, isDone: boolean): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.kuaRequirement.updateMany({
    where: { id, userId },
    data: { isDone, doneAt: isDone ? new Date() : null },
  });
  if (res.count === 0) return { success: false, error: "Berkas tidak ditemukan." };
  revalidatePlanner();
  return { success: true };
}

export async function toggleKuaActive(id: string, isActive: boolean): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.kuaRequirement.updateMany({
    where: { id, userId, isRequired: false },
    data: { isActive, isDone: isActive ? undefined : false },
  });
  if (res.count === 0) return { success: false, error: "Berkas opsional tidak ditemukan." };
  revalidatePlanner();
  return { success: true };
}

export async function addCustomKua(formData: FormData): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const validation = validateKuaInput({
    category: s(formData, "category") || "9. Berkas Khusus (Opsional)",
    docName: s(formData, "docName"),
    institution: s(formData, "institution"),
    note: s(formData, "note"),
  });
  if (!validation.success || !validation.data)
    return { success: false, error: "Data belum valid.", fieldErrors: validation.errors };
  const max = await prisma.kuaRequirement.aggregate({ where: { userId }, _max: { sortOrder: true } });
  await prisma.kuaRequirement.create({
    data: {
      userId,
      ...validation.data,
      isRequired: false,
      isActive: true,
      isCustom: true,
      sortOrder: (max._max.sortOrder ?? 0) + 1,
    },
  });
  revalidatePlanner();
  return { success: true, message: "Berkas khusus ditambahkan." };
}

export async function updateKua(formData: FormData): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const id = s(formData, "id");
  const validation = validateKuaInput({
    category: s(formData, "category"),
    docName: s(formData, "docName"),
    institution: s(formData, "institution"),
    note: s(formData, "note"),
  });
  if (!validation.success || !validation.data)
    return { success: false, error: "Data belum valid.", fieldErrors: validation.errors };
  const res = await prisma.kuaRequirement.updateMany({ where: { id, userId }, data: validation.data });
  if (res.count === 0) return { success: false, error: "Berkas tidak ditemukan." };
  revalidatePlanner();
  return { success: true, message: "Berkas diperbarui." };
}

export async function deleteKua(id: string): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.kuaRequirement.deleteMany({ where: { id, userId, isCustom: true } });
  if (res.count === 0) return { success: false, error: "Hanya berkas tambahan sendiri yang dapat dihapus." };
  revalidatePlanner();
  return { success: true };
}

// BUDGET
export async function addBudgetItem(formData: FormData): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const validation = validateBudgetItemInput({
    category: s(formData, "category"),
    itemName: s(formData, "itemName"),
    pic: s(formData, "pic"),
    estimatedAmount: s(formData, "estimatedAmount"),
    paidAmount: s(formData, "paidAmount"),
    status: s(formData, "status"),
    note: s(formData, "note"),
    isExternal: s(formData, "isExternal") !== "false",
    linkMode: s(formData, "linkMode"),
  });
  if (!validation.success || !validation.data)
    return { success: false, error: "Data belum valid.", fieldErrors: validation.errors };
  const max = await prisma.weddingBudgetItem.aggregate({
    where: { userId },
    _max: { sortOrder: true },
  });
  await prisma.weddingBudgetItem.create({
    data: { userId, ...validation.data, sortOrder: (max._max.sortOrder ?? 0) + 1 },
  });
  revalidatePlanner();
  return { success: true, message: "Pos anggaran ditambahkan." };
}

export async function updateBudgetItem(formData: FormData): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const id = s(formData, "id");
  const validation = validateBudgetItemInput({
    category: s(formData, "category"),
    itemName: s(formData, "itemName"),
    pic: s(formData, "pic"),
    estimatedAmount: s(formData, "estimatedAmount"),
    paidAmount: s(formData, "paidAmount"),
    status: s(formData, "status"),
    note: s(formData, "note"),
    isExternal: s(formData, "isExternal") !== "false",
    linkMode: s(formData, "linkMode"),
  });
  if (!validation.success || !validation.data)
    return { success: false, error: "Data belum valid.", fieldErrors: validation.errors };
  // AUTO tidak menyimpan nominal ganda; dibaca dari Order saat render.
  const data =
    validation.data.linkMode === "AUTO"
      ? { ...validation.data, estimatedAmount: 0, paidAmount: 0 }
      : validation.data;
  const res = await prisma.weddingBudgetItem.updateMany({ where: { id, userId }, data });
  if (res.count === 0) return { success: false, error: "Pos anggaran tidak ditemukan." };
  revalidatePlanner();
  return { success: true, message: "Pos anggaran diperbarui." };
}

export async function deleteBudgetItem(id: string): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.weddingBudgetItem.deleteMany({ where: { id, userId } });
  if (res.count === 0) return { success: false, error: "Pos anggaran tidak ditemukan." };
  revalidatePlanner();
  return { success: true };
}

export async function linkBudgetToOrderItem(
  id: string,
  orderItemId: string,
  linkMode: "MANUAL" | "AUTO"
): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };

  // Pastikan OrderItem benar-benar milik order klien ini (anti-IDOR).
  const owns = await prisma.orderItem.findFirst({
    where: { id: orderItemId, order: { userId } },
  });
  if (!owns) return { success: false, error: "Pesanan tidak ditemukan untuk akun ini." };

  const res = await prisma.weddingBudgetItem.updateMany({
    where: { id, userId },
    data: { linkedOrderItemId: orderItemId, linkMode, isExternal: false },
  });
  if (res.count === 0) return { success: false, error: "Pos anggaran tidak ditemukan." };
  revalidatePlanner();
  return { success: true, message: "Pos ditautkan ke pesanan HariKita." };
}

export async function unlinkBudgetItem(id: string): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.weddingBudgetItem.updateMany({
    where: { id, userId },
    data: { linkedOrderItemId: null, linkMode: "MANUAL", isExternal: true },
  });
  if (res.count === 0) return { success: false, error: "Pos anggaran tidak ditemukan." };
  revalidatePlanner();
  return { success: true, message: "Tautan pesanan dilepas." };
}

// PROOF
export async function addBudgetProof(formData: FormData): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const budgetItemId = s(formData, "budgetItemId");
  const validation = validateProofInput({
    fileUrl: s(formData, "fileUrl"),
    fileName: s(formData, "fileName"),
    amount: s(formData, "amount"),
    note: s(formData, "note"),
  });
  if (!validation.success || !validation.data)
    return { success: false, error: "Data bukti belum valid.", fieldErrors: validation.errors };

  const owns = await prisma.weddingBudgetItem.findFirst({ where: { id: budgetItemId, userId } });
  if (!owns) return { success: false, error: "Pos anggaran tidak ditemukan." };

  await prisma.budgetPaymentProof.create({
    data: { userId, budgetItemId, ...validation.data, paidAt: new Date() },
  });
  revalidatePlanner();
  return { success: true, message: "Bukti pembayaran tersimpan." };
}

export async function deleteBudgetProof(id: string): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.budgetPaymentProof.deleteMany({ where: { id, userId } });
  if (res.count === 0) return { success: false, error: "Bukti tidak ditemukan." };
  revalidatePlanner();
  return { success: true };
}

// EMERGENCY
export async function toggleEmergencyItem(
  id: string,
  isPacked: boolean
): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.weddingEmergencyItem.updateMany({
    where: { id, userId },
    data: { isPacked },
  });
  if (res.count === 0) return { success: false, error: "Item tidak ditemukan." };
  revalidatePlanner();
  return { success: true };
}

export async function addEmergencyItem(formData: FormData): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const itemText = s(formData, "itemText").trim();
  if (!itemText) return { success: false, error: "Nama item wajib diisi." };
  const max = await prisma.weddingEmergencyItem.aggregate({
    where: { userId },
    _max: { sortOrder: true },
  });
  await prisma.weddingEmergencyItem.create({
    data: { userId, itemText, sortOrder: (max._max.sortOrder ?? 0) + 1 },
  });
  revalidatePlanner();
  return { success: true, message: "Item ditambahkan." };
}

export async function deleteEmergencyItem(id: string): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.weddingEmergencyItem.deleteMany({ where: { id, userId } });
  if (res.count === 0) return { success: false, error: "Item tidak ditemukan." };
  revalidatePlanner();
  return { success: true };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: tidak ada error pada file action ini.

- [ ] **Step 3: Commit**

```bash
git add src/server/actions/wedding-planner.ts
git commit -m "feat(planner): add wedding planner server actions"
```

---

## Task 5: Query layer + agregasi readiness

**Files:**
- Create: `src/server/queries/wedding-planner.ts`
- Test: `tests/wedding-planner.test.ts` (append — test fungsi agregasi murni)

**Interfaces:**
- Consumes: `prisma`, `getSession()`, `toWibDateString`, `diffCalendarDaysWIB` dari `@/lib/date-utils`.
- Produces:
  - `computeReadiness(input): ReadinessDTO` (fungsi murni)
  - `getWeddingReadiness(): Promise<ReadinessDTO>`
  - `getWeddingTasks()`, `getKuaRequirements()`, `getBudgetItems()`, `getEmergencyItems()`
  - `getClientPlannerOverview(): Promise<PlannerOverview>`

- [ ] **Step 1: Write the failing test (agregasi murni)**

Append ke `tests/wedding-planner.test.ts`:

```ts
import { computeReadiness } from "../src/server/queries/wedding-planner";

test("computeReadiness returns 0 overall when nothing done", () => {
  const r = computeReadiness({
    timelineDone: 0, timelineTotal: 22,
    kuaDone: 0, kuaTotal: 26,
    budgetEstimated: 0, budgetPaid: 0,
  });
  assert.equal(r.overallPct, 0);
  assert.equal(r.timeline.pct, 0);
});

test("computeReadiness averages the three module percentages", () => {
  const r = computeReadiness({
    timelineDone: 11, timelineTotal: 22,   // 50
    kuaDone: 13, kuaTotal: 26,             // 50
    budgetEstimated: 1000000, budgetPaid: 500000, // 50
  });
  assert.equal(r.timeline.pct, 50);
  assert.equal(r.kua.pct, 50);
  assert.equal(r.budget.pctRealized, 50);
  assert.equal(r.overallPct, 50);
});

test("computeReadiness handles divide-by-zero safely", () => {
  const r = computeReadiness({
    timelineDone: 0, timelineTotal: 0,
    kuaDone: 0, kuaTotal: 0,
    budgetEstimated: 0, budgetPaid: 0,
  });
  assert.equal(r.overallPct, 0);
  assert.equal(r.budget.pctRealized, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/wedding-planner.test.ts`
Expected: FAIL — cannot find module `../src/server/queries/wedding-planner`.

- [ ] **Step 3: Write minimal implementation**

Create `src/server/queries/wedding-planner.ts`:

```ts
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { toWibDateString, diffCalendarDaysWIB } from "@/lib/date-utils";

export interface ReadinessDTO {
  timeline: { done: number; total: number; pct: number };
  kua: { done: number; total: number; pct: number };
  budget: { estimated: number; paid: number; remaining: number; pctRealized: number };
  overallPct: number;
}

function pct(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

/** Fungsi murni (mudah diuji tanpa DB). */
export function computeReadiness(input: {
  timelineDone: number;
  timelineTotal: number;
  kuaDone: number;
  kuaTotal: number;
  budgetEstimated: number;
  budgetPaid: number;
}): ReadinessDTO {
  const timelinePct = pct(input.timelineDone, input.timelineTotal);
  const kuaPct = pct(input.kuaDone, input.kuaTotal);
  const budgetPct =
    input.budgetEstimated > 0
      ? Math.min(100, Math.round((input.budgetPaid / input.budgetEstimated) * 100))
      : 0;
  const overallPct = Math.round((timelinePct + kuaPct + budgetPct) / 3);
  return {
    timeline: { done: input.timelineDone, total: input.timelineTotal, pct: timelinePct },
    kua: { done: input.kuaDone, total: input.kuaTotal, pct: kuaPct },
    budget: {
      estimated: input.budgetEstimated,
      paid: input.budgetPaid,
      remaining: Math.max(0, input.budgetEstimated - input.budgetPaid),
      pctRealized: budgetPct,
    },
    overallPct,
  };
}

async function currentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ?? null;
}

export interface WeddingTaskDTO {
  id: string; stage: number; taskText: string; pic: string | null;
  priority: string; note: string | null; isDone: boolean; isCustom: boolean;
}

export async function getWeddingTasks(): Promise<WeddingTaskDTO[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const rows = await prisma.weddingTask.findMany({
    where: { userId },
    orderBy: [{ stage: "asc" }, { sortOrder: "asc" }],
  });
  return rows.map((t) => ({
    id: t.id, stage: t.stage, taskText: t.taskText, pic: t.pic,
    priority: t.priority, note: t.note, isDone: t.isDone, isCustom: t.isCustom,
  }));
}

export interface KuaDTO {
  id: string; category: string; docName: string; party: string | null;
  docFormat: string | null; institution: string | null; note: string | null;
  isRequired: boolean; isActive: boolean; isDone: boolean; isCustom: boolean;
}

export async function getKuaRequirements(): Promise<KuaDTO[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const rows = await prisma.kuaRequirement.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }],
  });
  return rows.map((k) => ({
    id: k.id, category: k.category, docName: k.docName, party: k.party,
    docFormat: k.docFormat, institution: k.institution, note: k.note,
    isRequired: k.isRequired, isActive: k.isActive, isDone: k.isDone, isCustom: k.isCustom,
  }));
}

export interface BudgetItemDTO {
  id: string; category: string; itemName: string; pic: string | null;
  estimatedAmount: number; paidAmount: number; status: string; note: string | null;
  isExternal: boolean; linkMode: string;
  linkedOrderItemId: string | null;
  linkedOrderLabel: string | null;
  proofs: { id: string; fileUrl: string; fileName: string | null; amount: number | null }[];
}

export async function getBudgetItems(): Promise<BudgetItemDTO[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const rows = await prisma.weddingBudgetItem.findMany({
    where: { userId },
    include: { linkedOrderItem: true, proofs: { orderBy: { createdAt: "desc" } } },
    orderBy: [{ sortOrder: "asc" }],
  });
  return rows.map((b) => ({
    id: b.id, category: b.category, itemName: b.itemName, pic: b.pic,
    estimatedAmount: b.estimatedAmount, paidAmount: b.paidAmount, status: b.status,
    note: b.note, isExternal: b.isExternal, linkMode: b.linkMode,
    linkedOrderItemId: b.linkedOrderItemId,
    linkedOrderLabel:
      b.linkedOrderItem?.packageName ?? b.linkedOrderItem?.serviceName ?? null,
    proofs: b.proofs.map((p) => ({
      id: p.id, fileUrl: p.fileUrl, fileName: p.fileName, amount: p.amount,
    })),
  }));
}

export interface EmergencyDTO {
  id: string; itemText: string; isPacked: boolean;
}

export async function getEmergencyItems(): Promise<EmergencyDTO[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const rows = await prisma.weddingEmergencyItem.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }],
  });
  return rows.map((e) => ({ id: e.id, itemText: e.itemText, isPacked: e.isPacked }));
}

export async function getWeddingReadiness(): Promise<ReadinessDTO> {
  const userId = await currentUserId();
  if (!userId) {
    return computeReadiness({
      timelineDone: 0, timelineTotal: 0, kuaDone: 0, kuaTotal: 0,
      budgetEstimated: 0, budgetPaid: 0,
    });
  }
  const [timelineTotal, timelineDone, kuaTotal, kuaDone, budgetAgg] = await Promise.all([
    prisma.weddingTask.count({ where: { userId } }),
    prisma.weddingTask.count({ where: { userId, isDone: true } }),
    prisma.kuaRequirement.count({
      where: { userId, OR: [{ isRequired: true }, { isActive: true }] },
    }),
    prisma.kuaRequirement.count({ where: { userId, isDone: true } }),
    prisma.weddingBudgetItem.aggregate({
      where: { userId },
      _sum: { estimatedAmount: true, paidAmount: true },
    }),
  ]);
  return computeReadiness({
    timelineDone, timelineTotal, kuaDone, kuaTotal,
    budgetEstimated: budgetAgg._sum.estimatedAmount ?? 0,
    budgetPaid: budgetAgg._sum.paidAmount ?? 0,
  });
}

export interface PlannerOverview {
  readiness: ReadinessDTO;
  daysUntilEvent: number | null;
  eventDate: string | null;
  coupleName: string;
  partnerName: string | null;
  nextSession: { title: string; scheduledDate: string; location: string } | null;
}

export async function getClientPlannerOverview(): Promise<PlannerOverview> {
  const userId = await currentUserId();
  const readiness = await getWeddingReadiness();
  const empty: PlannerOverview = {
    readiness,
    daysUntilEvent: null, eventDate: null, coupleName: "Calon Pengantin",
    partnerName: null, nextSession: null,
  };
  if (!userId) return empty;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { clientProfile: true },
  });
  const eventDate = user?.clientProfile?.eventDate
    ? toWibDateString(user.clientProfile.eventDate)
    : null;
  const today = toWibDateString(new Date());
  const daysUntilEvent = eventDate ? diffCalendarDaysWIB(eventDate, today) : null;

  const next = await prisma.physicalSession.findFirst({
    where: { order: { userId } },
    orderBy: { scheduledDate: "asc" },
  });

  return {
    readiness,
    daysUntilEvent,
    eventDate,
    coupleName: user?.name ?? "Calon Pengantin",
    partnerName: user?.clientProfile?.partnerName ?? null,
    nextSession: next
      ? {
          title: next.notes || next.type,
          scheduledDate: toWibDateString(next.scheduledDate),
          location: next.location,
        }
      : null,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/wedding-planner.test.ts`
Expected: PASS (9 tests total).

- [ ] **Step 5: Commit**

```bash
git add src/server/queries/wedding-planner.ts tests/wedding-planner.test.ts
git commit -m "feat(planner): add planner queries and readiness aggregation"
```

---

## Task 6: Upload API `ex-budget-proof`

**Files:**
- Create: `src/app/api/ex-budget-proof/route.ts`

**Interfaces:**
- Produces: `POST /api/ex-budget-proof` → `{ url, fileName }` atau `{ error }`.

- [ ] **Step 1: Implementasi route**

Create `src/app/api/ex-budget-proof/route.ts`:

```ts
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { getSession } from "@/lib/session";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX = 5 * 1024 * 1024;

/**
 * HariKita - Upload Bukti Pembayaran Pos Anggaran (di LUAR layanan HariKita / "ex-").
 *
 * POST /api/ex-budget-proof (FormData: file)
 * Simpan ke public/uploads/ex-budget/{userId}/ lalu kembalikan { url, fileName }.
 * Terpisah total dari /api/upload/vendor-doc agar tidak bentrok dengan layanan.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File wajib diunggah." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Tipe file harus JPG/PNG/WEBP/PDF." }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ error: "Ukuran maksimum 5MB." }, { status: 400 });
  }

  const ext =
    file.type === "image/png" ? "png"
    : file.type === "image/webp" ? "webp"
    : file.type === "application/pdf" ? "pdf"
    : "jpg";
  const name = `proof-${randomBytes(8).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "ex-budget", session.userId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({
    url: `/uploads/ex-budget/${session.userId}/${name}`,
    fileName: file.name,
  });
}
```

- [ ] **Step 2: Buat folder (tanpa commit gitkeep)**

```powershell
New-Item -ItemType Directory -Force -Path "public/uploads/ex-budget" | Out-Null
```

**Catatan (ruling Task 6):** `.gitignore` baris 63 sengaja mengabaikan `public/uploads/`
("jangan commit file user"). Jadi `.gitkeep` TIDAK di-commit dan `.gitignore` TIDAK diubah.
Route memakai `mkdir(recursive:true)` sehingga folder dibuat ulang saat runtime. Step commit
hanya menyertakan file route.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: tidak ada error pada route ini.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/ex-budget-proof/route.ts
git commit -m "feat(planner): add ex-budget-proof upload endpoint"
```

---

## Task 7: Navigasi Sidebar Client

**Files:**
- Modify: `src/components/dashboard/nav-config.ts`

**Interfaces:**
- Consumes: `NavIconName` (sudah punya `calendar`, `fileSearch`, `coins`, `package`, `shield`, `dashboard`, `receipt`, `calendarClock`, `mail`, `user`).
- Produces: `CLIENT_NAV` dengan group "Persiapan Pernikahan".

- [ ] **Step 1: Ubah `CLIENT_NAV`**

Ganti seluruh blok `export const CLIENT_NAV` menjadi:

```ts
export const CLIENT_NAV: NavGroup[] = [
  {
    group: "Acara Saya",
    items: [
      { label: "Ringkasan", href: "/client", icon: "dashboard" },
      { label: "Pesanan & Escrow", href: "/client/pesanan", icon: "receipt" },
      { label: "Jadwal Fitting & Sesi", href: "/client/jadwal", icon: "calendarClock" },
      { label: "Undangan Digital & Tamu", href: "/client/undangan", icon: "mail" },
    ],
  },
  {
    group: "Persiapan Pernikahan",
    items: [
      { label: "Timeline & Progres", href: "/client/perencanaan", icon: "calendar" },
      { label: "Berkas & Administrasi", href: "/client/berkas-kua", icon: "fileSearch" },
      { label: "Anggaran & Realisasi", href: "/client/anggaran", icon: "coins" },
      { label: "Katering Resepsi", href: "/client/katering", icon: "package" },
      { label: "Emergency Kit Hari-H", href: "/client/emergency", icon: "shield" },
    ],
  },
  {
    group: "Akun",
    items: [{ label: "Data Diri & Profil", href: "/client/profil", icon: "user" }],
  },
];
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: tidak ada error.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/nav-config.ts
git commit -m "feat(planner): add wedding planner nav group for client"
```

---

## Task 8: Halaman Timeline `/client/perencanaan`

**Files:**
- Create: `src/app/client/perencanaan/page.tsx`
- Create: `src/app/client/perencanaan/ClientTimeline.tsx`

**Interfaces:**
- Consumes: `getWeddingTasks`, `getWeddingReadiness` (Task 5); `ensureWeddingPlannerSeeded` (Task 3); actions `togglePlannerTask`/`addPlannerTask`/`deletePlannerTask`/`resetTimelineToDefault` (Task 4); `DashCard`, `DashTable`, `DashBadge` (props: `tone` = `ok|warn|error|info|neutral`).

- [ ] **Step 1: Server page**

Create `src/app/client/perencanaan/page.tsx`:

```tsx
import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ensureWeddingPlannerSeeded } from "@/server/services/wedding-planner-seed";
import { getWeddingTasks, getWeddingReadiness } from "@/server/queries/wedding-planner";
import { DashPageHeader } from "@/components/dashboard";
import { ClientTimeline } from "./ClientTimeline";

export const dynamic = "force-dynamic";

export default async function PerencanaanPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login?callbackUrl=/client/perencanaan");

  await ensureWeddingPlannerSeeded(session.userId);
  const [tasks, readiness] = await Promise.all([getWeddingTasks(), getWeddingReadiness()]);

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Timeline 7 Tahap Persiapan"
        description="Roadmap terstruktur dari 1 tahun sebelum hingga Hari H. Centang tiap tugas; progres tersimpan otomatis."
      />
      <ClientTimeline tasks={tasks} timelinePct={readiness.timeline.pct} />
    </div>
  );
}
```

- [ ] **Step 2: Client component**

Create `src/app/client/perencanaan/ClientTimeline.tsx`:

```tsx
"use client";

import React, { useMemo, useState, useTransition } from "react";
import { CalendarClock, Check, Plus, RotateCcw, Trash2 } from "lucide-react";
import { DashCard, DashTable, DashBadge, type DashColumn } from "@/components/dashboard";
import {
  togglePlannerTask,
  deletePlannerTask,
  addPlannerTask,
  resetTimelineToDefault,
} from "@/server/actions/wedding-planner";

interface Task {
  id: string; stage: number; taskText: string; pic: string | null;
  priority: string; note: string | null; isDone: boolean; isCustom: boolean;
}

export const STAGE_LABEL: Record<number, string> = {
  1: "1 Thn Sebelum", 2: "6 Bln Sebelum", 3: "3 Bln Sebelum", 4: "1 Bln Sebelum",
  5: "2 Mgg Sebelum", 6: "H-3 Hari", 7: "Hari H",
};

export function ClientTimeline({ tasks, timelinePct }: { tasks: Task[]; timelinePct: number }) {
  const [filterStage, setFilterStage] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () => (filterStage === 0 ? tasks : tasks.filter((t) => t.stage === filterStage)),
    [tasks, filterStage]
  );
  const doneCount = tasks.filter((t) => t.isDone).length;

  const columns: DashColumn[] = [
    { key: "done", header: "Status", className: "w-14 text-center" },
    { key: "stage", header: "Tahapan" },
    { key: "task", header: "Tugas & Milestone" },
    { key: "pic", header: "PIC", className: "hidden sm:table-cell" },
    { key: "prio", header: "Prioritas", className: "hidden md:table-cell" },
    { key: "act", header: "", className: "w-12" },
  ];

  const onToggle = (id: string, isDone: boolean) =>
    startTransition(() => {
      void togglePlannerTask(id, isDone);
    });

  const onDelete = (id: string) => startTransition(() => void deletePlannerTask(id));
  const onReset = () => {
    if (confirm("Kembalikan timeline ke pengaturan awal?"))
      startTransition(() => void resetTimelineToDefault());
  };

  return (
    <div className="flex flex-col gap-5">
      <DashCard>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterStage(0)}
            className={`min-h-11 rounded-full px-4 py-2 font-manrope text-xs font-semibold transition-colors ${
              filterStage === 0 ? "bg-hk-charcoal text-white" : "border border-hk-champagne/60 text-hk-charcoal"
            }`}
          >
            Semua Tahap
          </button>
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStage(s)}
              className={`min-h-11 rounded-full px-4 py-2 font-manrope text-xs font-semibold transition-colors ${
                filterStage === s ? "bg-hk-charcoal text-white" : "border border-hk-champagne/60 text-hk-charcoal"
              }`}
            >
              Tahap {s}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-2 font-manrope text-xs text-hk-charcoal/70">
            <CalendarClock className="h-4 w-4 text-hk-taupe" />
            {doneCount}/{tasks.length} selesai • {timelinePct}%
          </span>
          <button
            onClick={onReset}
            className="min-h-11 rounded-full border border-hk-champagne/60 px-4 py-2 font-manrope text-xs text-hk-charcoal"
          >
            <RotateCcw className="mr-1 inline h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </DashCard>

      <DashCard>
        <DashTable
          columns={columns}
          rows={filtered}
          empty={<div className="py-8 text-center font-manrope text-sm text-hk-taupe">Belum ada tugas.</div>}
          renderRow={(t) => [
            <input
              key="d"
              type="checkbox"
              checked={t.isDone}
              disabled={isPending}
              onChange={(e) => onToggle(t.id, e.target.checked)}
              className="h-5 w-5 cursor-pointer rounded border-hk-champagne text-hk-taupe"
              aria-label={`Tandai ${t.taskText}`}
            />,
            <span key="s" className="font-manrope text-xs font-semibold text-hk-taupe">
              {t.stage === 0 ? "Custom" : `Tahap ${t.stage}: ${STAGE_LABEL[t.stage] ?? ""}`}
            </span>,
            <span key="t" className={t.isDone ? "text-sm text-hk-charcoal/50 line-through" : "text-sm font-medium text-hk-charcoal"}>
              {t.taskText}
              {t.note && <span className="block text-[11px] text-hk-taupe">{t.note}</span>}
            </span>,
            <span key="p" className="font-manrope text-xs text-hk-charcoal/70">{t.pic ?? "-"}</span>,
            <DashBadge key="pr" tone={t.priority === "Tinggi" ? "error" : "neutral"}>{t.priority}</DashBadge>,
            <button
              key="a"
              onClick={() => onDelete(t.id)}
              disabled={isPending}
              aria-label="Hapus tugas"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>,
          ]}
        />
      </DashCard>

      <AddTaskForm onAdd={(fd) => startTransition(() => void addPlannerTask(fd))} pending={isPending} />
    </div>
  );
}

function AddTaskForm({ onAdd, pending }: { onAdd: (fd: FormData) => void; pending: boolean }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-hk-taupe px-5 text-xs font-semibold text-white hover:bg-hk-charcoal"
      >
        <Plus className="h-3.5 w-3.5 text-hk-champagne" /> Tambah Tugas Sendiri
      </button>
    );

  return (
    <DashCard
      title="Tambah Tugas Sendiri"
      action={
        <button onClick={() => setOpen(false)} className="font-manrope text-xs text-hk-taupe">
          Tutup
        </button>
      }
    >
      <form action={onAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="taskText" required placeholder="Nama tugas" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" />
        <select name="stage" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" defaultValue={1}>
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <option key={s} value={s}>Tahap {s}: {STAGE_LABEL[s]}</option>
          ))}
        </select>
        <input name="pic" placeholder="PIC (opsional)" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" />
        <select name="priority" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" defaultValue="Sedang">
          <option value="Sedang">Sedang</option>
          <option value="Tinggi">Tinggi</option>
        </select>
        <input name="note" placeholder="Catatan (opsional)" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm sm:col-span-2" />
        <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-hk-charcoal px-5 text-xs font-semibold text-white sm:col-span-2">
          <Check className="h-3.5 w-3.5 text-hk-champagne" /> Simpan Tugas
        </button>
      </form>
    </DashCard>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: tidak ada error.

- [ ] **Step 4: Commit**

```bash
git add src/app/client/perencanaan
git commit -m "feat(planner): add timeline page"
```

---

## Task 9: Halaman Berkas KUA `/client/berkas-kua`

**Files:**
- Create: `src/app/client/berkas-kua/page.tsx`
- Create: `src/app/client/berkas-kua/ClientKua.tsx`

**Interfaces:**
- Consumes: `getKuaRequirements` (Task 5); `ensureWeddingPlannerSeeded` (Task 3); actions `toggleKuaDone`/`toggleKuaActive`/`addCustomKua`/`deleteKua` (Task 4); `DashCard`, `DashTable`, `DashStatCard` (props: `label`, `value`, opsional `delta`/`deltaTone`).

- [ ] **Step 1: Server page**

Create `src/app/client/berkas-kua/page.tsx`:

```tsx
import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ensureWeddingPlannerSeeded } from "@/server/services/wedding-planner-seed";
import { getKuaRequirements } from "@/server/queries/wedding-planner";
import { DashPageHeader } from "@/components/dashboard";
import { ClientKua } from "./ClientKua";

export const dynamic = "force-dynamic";

const FLOW = [
  { n: "1. RT/RW", d: "Surat Pengantar" },
  { n: "2. Kelurahan", d: "Form Model N1-N4" },
  { n: "3. Puskesmas", d: "Lab, TT & Elsimil" },
  { n: "4. KUA Asal", d: "Rekomendasi Nikah" },
  { n: "5. Simkah", d: "Daftar Min H-10" },
  { n: "6. Bayar PNBP", d: "Rp 600rb (Luar KUA)" },
  { n: "7. Bimwin", d: "Kursus & Setor Saksi" },
  { n: "8. Meja Akad", d: "TTD Buku Nikah" },
];

export default async function BerkasKuaPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login?callbackUrl=/client/berkas-kua");

  await ensureWeddingPlannerSeeded(session.userId);
  const requirements = await getKuaRequirements();

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Berkas & Administrasi KUA"
        description="Persyaratan resmi PMA 20/2019 & Simkah Kemenag Gen 4, plus berkas khusus opsional sesuai profesi/kondisi Anda."
      />
      <ClientKua requirements={requirements} flow={FLOW} />
    </div>
  );
}
```

- [ ] **Step 2: Client component**

Create `src/app/client/berkas-kua/ClientKua.tsx`:

```tsx
"use client";

import React, { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DashCard, DashTable, DashStatCard, type DashColumn } from "@/components/dashboard";
import { toggleKuaDone, toggleKuaActive, addCustomKua, deleteKua } from "@/server/actions/wedding-planner";

interface Kua {
  id: string; category: string; docName: string; party: string | null;
  docFormat: string | null; institution: string | null; note: string | null;
  isRequired: boolean; isActive: boolean; isDone: boolean; isCustom: boolean;
}

export function ClientKua({ requirements, flow }: { requirements: Kua[]; flow: { n: string; d: string }[] }) {
  const [isPending, startTransition] = useTransition();

  const required = useMemo(() => requirements.filter((r) => r.isRequired), [requirements]);
  const optional = useMemo(() => requirements.filter((r) => !r.isRequired), [requirements]);
  const doneRequired = required.filter((r) => r.isDone).length;

  const reqColumns: DashColumn[] = [
    { key: "done", header: "Check", className: "w-14 text-center" },
    { key: "cat", header: "Kategori", className: "hidden sm:table-cell" },
    { key: "doc", header: "Nama Berkas" },
    { key: "inst", header: "Instansi", className: "hidden md:table-cell" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashCard title="Alur 8 Langkah Pendaftaran KUA">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {flow.map((f, i) => (
            <div
              key={f.n}
              className={`rounded-xl border p-3 text-center ${i === 7 ? "border-hk-taupe bg-hk-soft-beige/40" : "border-hk-champagne/40"}`}
            >
              <div className="font-manrope text-xs font-bold text-hk-taupe">{f.n}</div>
              <div className="mt-0.5 font-manrope text-[10px] text-hk-charcoal/70">{f.d}</div>
            </div>
          ))}
        </div>
      </DashCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DashStatCard label="Berkas Wajib Selesai" value={`${doneRequired} / ${required.length}`} />
        <DashStatCard label="Berkas Opsional Aktif" value={String(optional.filter((o) => o.isActive).length)} />
      </div>

      <DashCard title="Berkas Utama Calon Mempelai">
        <DashTable
          columns={reqColumns}
          rows={required}
          renderRow={(k) => [
            <input
              key="d"
              type="checkbox"
              checked={k.isDone}
              disabled={isPending}
              onChange={(e) => startTransition(() => void toggleKuaDone(k.id, e.target.checked))}
              className="h-5 w-5 cursor-pointer rounded border-hk-champagne text-hk-taupe"
              aria-label={`Tandai ${k.docName}`}
            />,
            <span key="c" className="font-manrope text-xs text-hk-taupe">{k.category}</span>,
            <span key="n" className={k.isDone ? "text-sm text-hk-charcoal/50 line-through" : "text-sm font-medium text-hk-charcoal"}>
              {k.docName}
              {k.note && <span className="block text-[11px] text-hk-taupe">{k.note}</span>}
            </span>,
            <span key="i" className="font-manrope text-xs text-hk-charcoal/70">{k.institution ?? "-"}</span>,
          ]}
        />
      </DashCard>

      <DashCard
        title="Berkas Tambahan / Khusus (Opsional)"
        action={<AddKuaButton onAdd={(fd) => startTransition(() => void addCustomKua(fd))} />}
      >
        <DashTable
          columns={[
            { key: "active", header: "Gunakan", className: "w-16 text-center" },
            { key: "doc", header: "Nama Berkas" },
            { key: "inst", header: "Instansi", className: "hidden sm:table-cell" },
            { key: "act", header: "", className: "w-12" },
          ]}
          rows={optional}
          empty={<div className="py-6 text-center font-manrope text-sm text-hk-taupe">Belum ada berkas opsional.</div>}
          renderRow={(k) => [
            <input
              key="a"
              type="checkbox"
              checked={k.isActive}
              disabled={isPending}
              onChange={(e) => startTransition(() => void toggleKuaActive(k.id, e.target.checked))}
              className="h-5 w-5 cursor-pointer rounded border-hk-champagne text-hk-taupe"
              aria-label={`Aktifkan ${k.docName}`}
            />,
            <span key="n" className="text-sm font-medium text-hk-charcoal">
              {k.docName}
              {k.note && <span className="block text-[11px] text-hk-taupe">{k.note}</span>}
            </span>,
            <span key="i" className="font-manrope text-xs text-hk-charcoal/70">{k.institution ?? "-"}</span>,
            k.isCustom ? (
              <button
                key="x"
                onClick={() => startTransition(() => void deleteKua(k.id))}
                disabled={isPending}
                className="text-red-600 hover:text-red-700"
                aria-label="Hapus berkas"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : (
              <span key="x" />
            ),
          ]}
        />
      </DashCard>
    </div>
  );
}

function AddKuaButton({ onAdd }: { onAdd: (fd: FormData) => void }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-hk-taupe px-4 text-xs font-semibold text-white hover:bg-hk-charcoal"
      >
        <Plus className="h-3.5 w-3.5 text-hk-champagne" /> Tambah Berkas
      </button>
    );
  return (
    <form
      action={(fd) => {
        onAdd(fd);
        setOpen(false);
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input name="docName" required placeholder="Nama berkas" className="rounded-xl border border-hk-champagne/60 px-3 py-2 text-xs" />
      <input name="institution" placeholder="Instansi" className="rounded-xl border border-hk-champagne/60 px-3 py-2 text-xs" />
      <input name="note" placeholder="Catatan" className="rounded-xl border border-hk-champagne/60 px-3 py-2 text-xs" />
      <button type="submit" className="min-h-11 rounded-full bg-hk-charcoal px-4 text-xs font-semibold text-white">Simpan</button>
      <button type="button" onClick={() => setOpen(false)} className="min-h-11 font-manrope text-xs text-hk-taupe">Batal</button>
    </form>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: tidak ada error.

- [ ] **Step 4: Commit**

```bash
git add src/app/client/berkas-kua
git commit -m "feat(planner): add kua requirements page"
```

---

## Task 10: Halaman Anggaran `/client/anggaran` (+ panel ex-)

**Files:**
- Create: `src/app/client/anggaran/page.tsx`
- Create: `src/app/client/anggaran/ClientBudget.tsx`
- Create: `src/app/client/anggaran/ExBudgetPanel.tsx`

**Interfaces:**
- Consumes: `getBudgetItems` (Task 5); `getClientOrderViewModels` dari `@/server/queries/orders`; actions `addBudgetItem`/`deleteBudgetItem`/`linkBudgetToOrderItem`/`unlinkBudgetItem`/`addBudgetProof`/`deleteBudgetProof` (Task 4); API `/api/ex-budget-proof` (Task 6); `DashCard`, `DashTable`, `DashStatCard`, `DashBadge`.

- [ ] **Step 1: Server page**

Create `src/app/client/anggaran/page.tsx`:

```tsx
import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBudgetItems } from "@/server/queries/wedding-planner";
import { DashPageHeader } from "@/components/dashboard";
import { ClientBudget } from "./ClientBudget";

export const dynamic = "force-dynamic";

export default async function AnggaranPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login?callbackUrl=/client/anggaran");

  const items = await getBudgetItems();

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Anggaran & Realisasi"
        description="Susun rencana pengeluaran pernikahan, catat realisasi pembayaran, dan lampirkan bukti. Pos di luar layanan HariKita ditandai (ex-)."
      />
      <ClientBudget items={items} />
    </div>
  );
}
```

- [ ] **Step 2: Client component utama**

Create `src/app/client/anggaran/ClientBudget.tsx`:

```tsx
"use client";

import React, { useMemo, useState, useTransition } from "react";
import { Plus, Trash2, Link2, Link2Off } from "lucide-react";
import { DashCard, DashStatCard, DashTable, DashBadge, type DashColumn } from "@/components/dashboard";
import { ExBudgetPanel } from "./ExBudgetPanel";
import {
  addBudgetItem,
  deleteBudgetItem,
  unlinkBudgetItem,
} from "@/server/actions/wedding-planner";

interface BudgetItem {
  id: string; category: string; itemName: string; pic: string | null;
  estimatedAmount: number; paidAmount: number; status: string; note: string | null;
  isExternal: boolean; linkMode: string;
  linkedOrderItemId: string | null; linkedOrderLabel: string | null;
  proofs: { id: string; fileUrl: string; fileName: string | null; amount: number | null }[];
}

const rp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
const statusTone = (s: string): "ok" | "warn" | "neutral" =>
  s === "LUNAS" ? "ok" : s === "BELUM" ? "warn" : "neutral";

export function ClientBudget({
  items,
}: {
  items: BudgetItem[];
}) {
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const estimated = items.reduce((a, b) => a + b.estimatedAmount, 0);
    const paid = items.reduce((a, b) => a + b.paidAmount, 0);
    return { estimated, paid, remaining: Math.max(0, estimated - paid) };
  }, [items]);

  const columns: DashColumn[] = [
    { key: "cat", header: "Kategori" },
    { key: "item", header: "Item / Layanan" },
    { key: "est", header: "Estimasi", className: "text-right" },
    { key: "paid", header: "Terbayar", className: "text-right" },
    { key: "sisa", header: "Sisa", className: "hidden text-right sm:table-cell" },
    { key: "stat", header: "Status", className: "text-center" },
    { key: "act", header: "", className: "w-12" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DashStatCard label="Total Estimasi" value={rp(totals.estimated)} />
        <DashStatCard label="Sudah Terbayar" value={rp(totals.paid)} />
        <DashStatCard label="Sisa Kewajiban" value={rp(totals.remaining)} />
      </div>

      <DashCard title="Rincian Pos Anggaran">
        <DashTable
          columns={columns}
          rows={items}
          empty={<div className="py-8 text-center font-manrope text-sm text-hk-taupe">Belum ada pos anggaran. Tambahkan di bawah.</div>}
          renderRow={(b) => [
            <span key="c" className="font-manrope text-xs font-semibold text-hk-taupe">
              {b.category}
              {b.isExternal && <span className="ml-1 rounded bg-hk-soft-beige px-1.5 py-0.5 text-[10px]">ex-</span>}
            </span>,
            <span key="i" className="text-sm font-medium text-hk-charcoal">
              {b.itemName}
              {b.linkedOrderItemId && (
                <span className="block text-[11px] text-hk-taupe">
                  Terkait: {b.linkedOrderLabel ?? "Pesanan"} ({b.linkMode})
                </span>
              )}
            </span>,
            <span key="e" className="text-right font-manrope text-sm tabular-nums">{rp(b.estimatedAmount)}</span>,
            <span key="p" className="text-right font-manrope text-sm tabular-nums text-emerald-700">{rp(b.paidAmount)}</span>,
            <span key="s" className="hidden text-right font-manrope text-sm tabular-nums text-amber-700 sm:table-cell">
              {rp(Math.max(0, b.estimatedAmount - b.paidAmount))}
            </span>,
            <DashBadge key="st" tone={statusTone(b.status)}>{b.status}</DashBadge>,
            b.linkedOrderItemId ? (
              <button
                key="a"
                onClick={() => startTransition(() => void unlinkBudgetItem(b.id))}
                disabled={isPending}
                className="text-hk-taupe hover:text-hk-charcoal"
                aria-label="Lepas tautan pesanan"
              >
                <Link2Off className="h-4 w-4" />
              </button>
            ) : (
              <button
                key="a"
                onClick={() => startTransition(() => void deleteBudgetItem(b.id))}
                disabled={isPending}
                className="text-red-600 hover:text-red-700"
                aria-label="Hapus pos"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ),
          ]}
        />
      </DashCard>

      <ExBudgetPanel items={items} startTransition={startTransition} isPending={isPending} />

      <AddBudgetForm
        onAdd={(fd) => startTransition(() => void addBudgetItem(fd))}
        pending={isPending}
      />
    </div>
  );
}

function AddBudgetForm({
  onAdd,
  pending,
}: {
  onAdd: (fd: FormData) => void;
  pending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [external, setExternal] = useState(true);
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-hk-taupe px-5 text-xs font-semibold text-white hover:bg-hk-charcoal"
      >
        <Plus className="h-3.5 w-3.5 text-hk-champagne" /> Tambah Pos Anggaran
      </button>
    );

  return (
    <DashCard
      title="Tambah Pos Anggaran"
      action={
        <button onClick={() => setOpen(false)} className="font-manrope text-xs text-hk-taupe">
          Tutup
        </button>
      }
    >
      <form action={onAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="category" required placeholder="Kategori (mis. Mahar)" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" />
        <input name="itemName" required placeholder="Nama item / layanan" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" />
        <input name="estimatedAmount" type="number" min={0} required placeholder="Estimasi (Rp)" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" />
        <input name="paidAmount" type="number" min={0} defaultValue={0} placeholder="Terbayar (Rp)" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" />
        <input name="pic" placeholder="PIC / Vendor (opsional)" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" />
        <select name="status" className="rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm" defaultValue="BELUM">
          <option value="BELUM">Belum Bayar</option>
          <option value="DP">DP (Sebagian)</option>
          <option value="LUNAS">Lunas</option>
          <option value="SIAPKAN">Siapkan Tunai</option>
        </select>
        <label className="flex items-center gap-2 font-manrope text-xs text-hk-charcoal sm:col-span-2">
          <input type="checkbox" checked={external} onChange={(e) => setExternal(e.target.checked)} className="h-4 w-4" />
          Pos ini DI LUAR layanan HariKita (ex-) - dapat diunggah bukti pembayaran
        </label>
        <input type="hidden" name="isExternal" value={String(external)} />
        <input type="hidden" name="linkMode" value="MANUAL" />
        <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-hk-charcoal px-5 text-xs font-semibold text-white sm:col-span-2">
          Simpan Pos Anggaran
        </button>
      </form>
    </DashCard>
  );
}
```

- [ ] **Step 3: Panel ex- + upload bukti**

Create `src/app/client/anggaran/ExBudgetPanel.tsx`:

```tsx
"use client";

import React, { useState } from "react";
import { Upload, Trash2, FileText } from "lucide-react";
import { DashCard } from "@/components/dashboard";
import { addBudgetProof, deleteBudgetProof } from "@/server/actions/wedding-planner";

interface BudgetItem {
  id: string; itemName: string; isExternal: boolean;
  proofs: { id: string; fileUrl: string; fileName: string | null; amount: number | null }[];
}

export function ExBudgetPanel({
  items, startTransition, isPending,
}: {
  items: BudgetItem[];
  startTransition: (cb: () => void) => void;
  isPending: boolean;
}) {
  const externalItems = items.filter((i) => i.isExternal);
  const [selectedId, setSelectedId] = useState<string>(externalItems[0]?.id ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedId) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/ex-budget-proof", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal mengunggah.");
      const proofFd = new FormData();
      proofFd.append("budgetItemId", selectedId);
      proofFd.append("fileUrl", json.url);
      proofFd.append("fileName", json.fileName ?? file.name);
      startTransition(() => void addBudgetProof(proofFd));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (externalItems.length === 0)
    return (
      <DashCard title="Anggaran di Luar Layanan HariKita (ex-)">
        <p className="font-manrope text-sm text-hk-taupe">
          Belum ada pos ex-. Tambahkan pos anggaran dengan centang "DI LUAR layanan HariKita".
        </p>
      </DashCard>
    );

  const selected = externalItems.find((i) => i.id === selectedId) ?? externalItems[0];

  return (
    <DashCard title="Anggaran di Luar Layanan HariKita (ex-)">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="font-manrope text-xs text-hk-charcoal" htmlFor="ex-select">Pilih pos:</label>
          <select
            id="ex-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-xl border border-hk-champagne/60 px-3 py-2 text-sm"
          >
            {externalItems.map((i) => (
              <option key={i.id} value={i.id}>{i.itemName}</option>
            ))}
          </select>
          <label className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-hk-taupe px-4 text-xs font-semibold text-white hover:bg-hk-charcoal ${isPending || uploading ? "opacity-60" : ""}`}>
            <Upload className="h-3.5 w-3.5 text-hk-champagne" />
            {uploading ? "Mengunggah..." : "Unggah Bukti (JPG/PNG/PDF)"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading || isPending}
            />
          </label>
        </div>
        {error && <p className="font-manrope text-xs text-red-600">{error}</p>}

        <ul className="divide-y divide-hk-soft-beige">
          {selected.proofs.length === 0 && (
            <li className="py-3 font-manrope text-xs text-hk-taupe">Belum ada bukti untuk pos ini.</li>
          )}
          {selected.proofs.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-3">
              <a
                href={p.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 font-manrope text-xs text-hk-charcoal hover:text-hk-taupe"
              >
                <FileText className="h-4 w-4 text-hk-taupe" />
                {p.fileName ?? "Lihat bukti"}
                {p.amount ? ` • Rp ${p.amount.toLocaleString("id-ID")}` : ""}
              </a>
              <button
                onClick={() => startTransition(() => void deleteBudgetProof(p.id))}
                disabled={isPending}
                className="text-red-600 hover:text-red-700"
                aria-label="Hapus bukti"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </DashCard>
  );
}
```

> **Catatan:** tombol `linkBudgetToOrderItem` (mode MENAUTKAN ke OrderItem) sudah tersedia sebagai action; UI picker opsional untuk gelombang ini. Bila tidak diimplementasikan, action tetap ada (dipakai AUTO nanti) — hindari param/dead-code yang tidak dipakai di komponen.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: tidak ada error.

- [ ] **Step 5: Commit**

```bash
git add src/app/client/anggaran
git commit -m "feat(planner): add budget page with ex- panel and proof upload"
```

---

## Task 11: Halaman Katering `/client/katering`

**Files:**
- Create: `src/app/client/katering/page.tsx`

**Interfaces:**
- Murni client-side, tanpa DB.

- [ ] **Step 1: Implementasi halaman**

Create `src/app/client/katering/page.tsx`:

```tsx
"use client";

import React, { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { DashCard, DashPageHeader } from "@/components/dashboard";

export default function KateringPage() {
  const [undangan, setUndangan] = useState(300);
  const tamuPerUndangan = 2;
  const buffer = 2.2;

  const result = useMemo(() => {
    const tamu = undangan * tamuPerUndangan;
    const totalPorsi = Math.round(tamu * buffer);
    return {
      tamu,
      totalPorsi,
      buffet: Math.round(totalPorsi * 0.5),
      stall: Math.round(totalPorsi * 0.5),
    };
  }, [undangan]);

  const nf = (n: number) => n.toLocaleString("id-ID");

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Kalkulator Katering Resepsi"
        description="Simulator porsi makanan berdasarkan jumlah undangan. Rumus standar: Undangan x 2 x 2.2."
      />

      <DashCard title="Simulator Porsi">
        <div className="flex flex-col gap-4">
          <label className="font-manrope text-sm font-semibold text-hk-charcoal" htmlFor="undangan">
            Jumlah Undangan (pcs)
          </label>
          <input
            id="undangan"
            type="number"
            min={0}
            value={undangan}
            onChange={(e) => setUndangan(Math.max(0, parseInt(e.target.value || "0", 10)))}
            className="w-full max-w-xs rounded-xl border border-hk-champagne/60 px-4 py-3 text-lg font-bold tabular-nums"
          />
          <p className="flex items-center gap-2 font-manrope text-xs text-hk-taupe">
            <Calculator className="h-4 w-4" /> Rasio 2.0 orang/undangan x buffer 2.2 porsi.
          </p>
        </div>
      </DashCard>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox label="Estimasi Tamu Fisik" value={`${nf(result.tamu)} Orang`} />
        <StatBox label="Total Porsi Wajib" value={`${nf(result.totalPorsi)} Porsi`} accent />
        <StatBox label="Buffet (Prasmanan 50%)" value={`${nf(result.buffet)} Porsi`} />
        <StatBox label="Gubukan (Stall 50%)" value={`${nf(result.stall)} Porsi`} />
      </div>
    </div>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 text-center ${accent ? "border-hk-taupe bg-hk-soft-beige/40" : "border-hk-champagne/40 bg-white"}`}>
      <div className="font-manrope text-[11px] font-semibold uppercase tracking-wider text-hk-taupe">{label}</div>
      <div className="mt-1 font-editorial text-2xl font-bold tabular-nums text-hk-charcoal">{value}</div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: tidak ada error.

- [ ] **Step 3: Commit**

```bash
git add src/app/client/katering
git commit -m "feat(planner): add catering calculator page"
```

---

## Task 12: Halaman Emergency Kit `/client/emergency`

**Files:**
- Create: `src/app/client/emergency/page.tsx`
- Create: `src/app/client/emergency/ClientEmergency.tsx`

**Interfaces:**
- Consumes: `getEmergencyItems` (Task 5); `ensureWeddingPlannerSeeded` (Task 3); actions `toggleEmergencyItem`/`addEmergencyItem`/`deleteEmergencyItem` (Task 4); `DashCard`.

- [ ] **Step 1: Server page**

Create `src/app/client/emergency/page.tsx`:

```tsx
import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ensureWeddingPlannerSeeded } from "@/server/services/wedding-planner-seed";
import { getEmergencyItems } from "@/server/queries/wedding-planner";
import { DashPageHeader } from "@/components/dashboard";
import { ClientEmergency } from "./ClientEmergency";

export const dynamic = "force-dynamic";

export default async function EmergencyPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login?callbackUrl=/client/emergency");

  await ensureWeddingPlannerSeeded(session.userId);
  const items = await getEmergencyItems();

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Emergency Kit & Tim Hari-H"
        description="Checklist tas darurat mempelai dan pembagian 3 peran rahasia keluarga inti."
      />
      <ClientEmergency items={items} />
    </div>
  );
}
```

- [ ] **Step 2: Client component**

Create `src/app/client/emergency/ClientEmergency.tsx`:

```tsx
"use client";

import React, { useTransition, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DashCard } from "@/components/dashboard";
import { toggleEmergencyItem, addEmergencyItem, deleteEmergencyItem } from "@/server/actions/wedding-planner";

export function ClientEmergency({
  items,
}: {
  items: { id: string; itemText: string; isPacked: boolean }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [newItem, setNewItem] = useState("");

  const packed = items.filter((i) => i.isPacked).length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <DashCard title={`Checklist Tas Darurat (${packed}/${items.length})`}>
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-hk-ivory">
              <input
                type="checkbox"
                checked={it.isPacked}
                disabled={isPending}
                onChange={(e) => startTransition(() => void toggleEmergencyItem(it.id, e.target.checked))}
                className="h-5 w-5 cursor-pointer rounded border-hk-champagne text-hk-taupe"
                aria-label={`Tandai ${it.itemText}`}
              />
              <span className={it.isPacked ? "text-sm text-hk-charcoal/50 line-through" : "font-manrope text-sm text-hk-charcoal"}>
                {it.itemText}
              </span>
              <button
                onClick={() => startTransition(() => void deleteEmergencyItem(it.id))}
                disabled={isPending}
                className="ml-auto text-red-600 hover:text-red-700"
                aria-label="Hapus item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        <form
          action={(fd) => {
            startTransition(() => void addEmergencyItem(fd));
            setNewItem("");
          }}
          className="mt-4 flex items-center gap-2"
        >
          <input
            name="itemText"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Tambah item..."
            className="flex-1 rounded-xl border border-hk-champagne/60 px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={isPending || !newItem.trim()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-hk-taupe px-4 text-xs font-semibold text-white hover:bg-hk-charcoal"
          >
            <Plus className="h-3.5 w-3.5 text-hk-champagne" /> Tambah
          </button>
        </form>
      </DashCard>

      <div className="flex flex-col gap-4">
        <RoleCard color="taupe" title="1. PIC Kotak Angpao & Kunci Gembok" desc="Pegang kunci gembok dan amankan kotak ke bagasi mobil terkunci setelah acara usai." />
        <RoleCard color="champagne" title="2. PIC Mahar & Cincin Kawin" desc="Menjaga fisik logam mulia dan cincin sampai diletakkan di meja akad di depan penghulu." />
        <RoleCard color="beige" title="3. PIC Katering & Makanan Sisa" desc="Mengontrol refill piring dan mengawal pembungkusan sisa makanan katering keluarga." />
      </div>
    </div>
  );
}

function RoleCard({ title, desc, color }: { title: string; desc: string; color: "taupe" | "champagne" | "beige" }) {
  const border = color === "taupe" ? "border-hk-taupe/40" : color === "champagne" ? "border-hk-champagne/60" : "border-hk-soft-beige";
  return (
    <div className={`rounded-2xl border bg-white p-5 ${border}`}>
      <div className="font-editorial text-lg font-medium text-hk-charcoal">{title}</div>
      <p className="mt-1 font-manrope text-xs leading-relaxed text-hk-charcoal/80">{desc}</p>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: tidak ada error.

- [ ] **Step 4: Commit**

```bash
git add src/app/client/emergency
git commit -m "feat(planner): add emergency kit page"
```

---

## Task 13: Rombak Ringkasan `/client` (dashboard + countdown)

**Files:**
- Modify: `src/app/client/page.tsx` (ganti total)

**Interfaces:**
- Consumes: `getClientPlannerOverview` (Task 5); `getClientOrderViewModels` dari `@/server/queries/orders`; `DashboardSemiDonutGauge` (2 segmen), `DashPageHeader`, `DashCard`, `DashStatCard`; `formatRupiah` dari `@/lib/utils`.

- [ ] **Step 1: Ganti isi `src/app/client/page.tsx`**

```tsx
import React from "react";
import Link from "next/link";
import { CalendarHeart, Sparkles, Clock } from "lucide-react";
import { getClientPlannerOverview } from "@/server/queries/wedding-planner";
import { getClientOrderViewModels } from "@/server/queries/orders";
import {
  DashPageHeader,
  DashCard,
  DashStatCard,
  DashboardSemiDonutGauge,
} from "@/components/dashboard";
import { formatRupiah } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientPortalPage() {
  const [overview, orders] = await Promise.all([
    getClientPlannerOverview(),
    getClientOrderViewModels(),
  ]);

  const couple = overview.partnerName
    ? `${overview.coupleName} & ${overview.partnerName}`
    : overview.coupleName;
  const r = overview.readiness;

  return (
    <div className="flex flex-col gap-8">
      <DashPageHeader
        title={`Selamat Datang, ${couple}`}
        description="Pusat kendali persiapan pernikahan Anda: progres, anggaran, jadwal, dan undangan."
        action={
          <Link
            href="/client/perencanaan"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hk-champagne/60 bg-white px-4 text-xs font-semibold text-hk-charcoal hover:bg-hk-soft-beige/40"
          >
            <Sparkles className="h-3.5 w-3.5 text-hk-taupe" /> Mulai Persiapan
          </Link>
        }
      />

      {/* Countdown */}
      <div className="relative overflow-hidden rounded-3xl border border-hk-champagne/40 bg-white p-6 sm:p-8">
        <div className="absolute -bottom-10 -right-10 h-44 w-44 rounded-full border border-hk-champagne/20" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-hk-champagne/40 bg-hk-soft-beige/60">
              <CalendarHeart className="h-6 w-6 text-hk-taupe" />
            </div>
            <div>
              <div className="font-manrope text-[11px] font-bold uppercase tracking-wider text-hk-taupe">
                Menuju Hari H
              </div>
              <div className="font-editorial text-xl text-hk-charcoal">
                {overview.eventDate ?? "Tanggal acara belum diset"}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-editorial text-5xl font-bold tabular-nums text-hk-charcoal">
              {overview.daysUntilEvent !== null && overview.daysUntilEvent > 0
                ? overview.daysUntilEvent
                : overview.daysUntilEvent === 0
                ? "0"
                : "—"}
            </div>
            <div className="font-manrope text-[11px] font-semibold text-hk-taupe">
              {overview.daysUntilEvent === null
                ? "Lengkapi tanggal di Profil"
                : overview.daysUntilEvent > 0
                ? "Hari lagi"
                : overview.daysUntilEvent === 0
                ? "Hari ini hari bahagia!"
                : "Acara telah berlangsung"}
            </div>
          </div>
        </div>
      </div>

      {/* Readiness + stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardSemiDonutGauge
          title="Kesiapan Pernikahan"
          totalLabel="Progres"
          segments={[
            { label: "% Selesai", value: r.overallPct, color: "#88735B" },
            { label: "% Sisa", value: Math.max(0, 100 - r.overallPct), color: "#E8DED1" },
          ]}
        />
        <div className="flex flex-col gap-4">
          <DashStatCard label="Timeline Selesai" value={`${r.timeline.pct}%`} delta={`${r.timeline.done}/${r.timeline.total} tugas`} deltaTone="ok" />
          <DashStatCard label="Berkas KUA" value={`${r.kua.pct}%`} delta={`${r.kua.done}/${r.kua.total} berkas`} deltaTone="ok" />
        </div>
        <div className="flex flex-col gap-4">
          <DashStatCard label="Estimasi Anggaran" value={formatRupiah(r.budget.estimated)} />
          <DashStatCard label="Sudah Terbayar" value={formatRupiah(r.budget.paid)} delta={`Sisa ${formatRupiah(r.budget.remaining)}`} deltaTone="warn" />
        </div>
      </div>

      {/* Sesi terdekat + pesanan */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashCard title="Sesi Fisik Terdekat">
          {overview.nextSession ? (
            <div className="space-y-1.5 font-manrope text-sm">
              <div className="font-semibold text-hk-charcoal">{overview.nextSession.title}</div>
              <div className="flex items-center gap-1.5 text-xs text-hk-charcoal/70">
                <Clock className="h-3.5 w-3.5 text-hk-taupe" /> {overview.nextSession.scheduledDate}
              </div>
              <p className="text-xs text-hk-taupe">{overview.nextSession.location}</p>
            </div>
          ) : (
            <p className="font-manrope text-sm text-hk-taupe">Belum ada sesi terjadwal.</p>
          )}
          <Link href="/client/jadwal" className="mt-4 inline-flex items-center gap-1.5 font-manrope text-xs font-semibold text-hk-taupe hover:text-hk-charcoal">
            Lihat semua jadwal
          </Link>
        </DashCard>

        <DashCard title={`Pesanan Aktif (${orders.length})`}>
          {orders.length === 0 ? (
            <p className="font-manrope text-sm text-hk-taupe">Belum ada pesanan. Racik paket di Builder.</p>
          ) : (
            <ul className="space-y-3">
              {orders.slice(0, 3).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 border-b border-hk-soft-beige/60 pb-3 last:border-0">
                  <div className="min-w-0">
                    <div className="truncate font-manrope text-sm font-semibold text-hk-charcoal">{o.bookingId}</div>
                    <div className="font-manrope text-[11px] text-hk-taupe">{o.eventDate} • {o.items.length} layanan</div>
                  </div>
                  <span className="font-manrope text-xs font-bold tabular-nums text-hk-charcoal">{formatRupiah(o.financials.totalAmount)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/client/pesanan" className="mt-4 inline-flex items-center gap-1.5 font-manrope text-xs font-semibold text-hk-taupe hover:text-hk-charcoal">
            Lihat semua pesanan
          </Link>
        </DashCard>
      </div>

      {/* Quick links ke modul planner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickLink href="/client/perencanaan" label="Timeline" />
        <QuickLink href="/client/berkas-kua" label="Berkas KUA" />
        <QuickLink href="/client/anggaran" label="Anggaran" />
        <QuickLink href="/client/katering" label="Katering" />
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-11 items-center justify-center rounded-2xl border border-hk-champagne/40 bg-white px-4 py-3 font-manrope text-xs font-semibold text-hk-charcoal hover:bg-hk-soft-beige/40"
    >
      {label}
    </Link>
  );
}
```

- [ ] **Step 2: Verifikasi visual tipe**

Run: `npx tsc --noEmit`
Expected: tidak ada error. Jika `o.items[i].unitPrice`/`quantity` berbeda dari `OrderViewModel`, sesuaikan akses field (lihat `src/server/queries/orders.ts`).

- [ ] **Step 3: Commit**

```bash
git add src/app/client/page.tsx
git commit -m "feat(planner): rebuild client summary as real dashboard with countdown"
```

---

## Task 14: Verifikasi menyeluruh & test akhir

**Files:**
- Test: `tests/wedding-planner.test.ts` (sudah ada dari Task 2, 3, 5)

- [ ] **Step 1: Jalankan seluruh test**

Run: `npm test`
Expected: semua test hijau (termasuk 9 test planner + seluruh test lama).

- [ ] **Step 2: Typecheck penuh**

Run: `npx tsc --noEmit`
Expected: 0 error.

- [ ] **Step 3: Validasi & generate schema**

Run: `npx prisma validate; npx prisma validate --schema prisma/schema.sqlite.prisma; npx prisma generate; npm run generate:sqlite`
Expected: semua sukses.

- [ ] **Step 4: Verifikasi manual dengan akun uji**

1. Reset sesi bila perlu: `npm run reset-session`
2. Jalankan dev: `npm run dev`
3. Login `081900000099` (PIN `123456`) di `http://localhost:3000/auth/login`
4. Buka tiap halaman baru: `/client`, `/client/perencanaan`, `/client/berkas-kua`, `/client/anggaran`, `/client/katering`, `/client/emergency`
5. Uji: toggle task; toggle berkas KUA; tambah pos anggaran ex- + unggah bukti; kalkulator katering; toggle emergency item.
6. Cek responsif 375px (tanpa horizontal overflow) dan hitung mundur muncul di `/client`.

Expected: semua alur berfungsi; data tersimpan (refresh tetap ada).

- [ ] **Step 5: Commit (bila ada perbaikan dari Step 1-4)**

```bash
git add -A
git commit -m "test(planner): verify wedding planner suite end-to-end"
```

---

## Self-Review (penulis plan)

**1. Spec coverage:**
- Model 5 tabel → Task 1 ✓
- Validasi + anti-IDOR → Task 2, 4 ✓
- Seed idempotent → Task 3 ✓
- Server actions CRUD → Task 4 ✓
- Query + agregasi readiness → Task 5 ✓
- API `ex-` upload → Task 6 ✓
- Nav 5 menu planner → Task 7 ✓
- 5 halaman + rombak `/client` → Task 8-13 ✓
- Re-skin Brand Hub (token hk-*, font-editorial/manrope, komponen Dashboard) → semua UI task ✓
- Testing + verifikasi AGENTS.md Rule 12-13 → Task 14 ✓

**2. Placeholder scan:** tidak ada TBD/TODO; semua step berisi kode nyata.

**3. Type consistency:** 
- `DashBadge` tone = `ok|warn|error|info|neutral` (dikoreksi dari rencana awal).
- `DashStatCard` pakai `delta`/`deltaTone` (dikoreksi dari `hint`).
- `DashboardSemiDonutGauge` menerima TEPAT 2 segmen (disesuaikan).
- `computeReadiness` signature konsisten antara test (Task 5) & implementasi.
- Nama action konsisten antara Task 4 (definisi) & Task 8-13 (pemakaian).

