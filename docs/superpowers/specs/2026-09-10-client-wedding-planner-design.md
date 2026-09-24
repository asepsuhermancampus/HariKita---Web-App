# Desain: Wedding Planner Suite untuk Portal Klien (Role CLIENT)

> **Status:** Disetujui (menunggu review spec)
> **Tanggal:** 10 September 2026
> **Branch:** `feat/client-wedding-planner`
> **Penulis:** Brainstorming session (CodeBuddy) bersama Asep Suherman
> **Sumber inspirasi:** `Master_Checklist_Pernikahan.html` (prototipe single-file, localStorage)

---

## 1. Tujuan & Latar Belakang

Pengguna ingin memperkaya **portal klien** (`/client`) dengan fitur *wedding planner*
mirip prototipe `Master_Checklist_Pernikahan.html`: Budget & Realisasi, Berkas KUA,
Timeline 7 Tahap, Kalkulator Katering, dan Emergency Kit Hari-H.

Prototipe HTML menyimpan data di `localStorage` dan ter-hardcode ke satu pasangan
(Dimas & Sarah). Ini tidak dapat diterima untuk HariKita karena:

1. Melanggar **AGENTS.md Rule 10** (dilarang mengubah alur localStorage ke DB secara parsial).
2. Menciptakan **dua sumber kebenaran** (tanggal acara & budget) yang bertabrakan dengan
   `ClientProfile` dan `Order`/`OrderItem` yang sudah ada.
3. Tidak tersinkron antar perangkat dan tidak dapat diakses pasangan.

**Keputusan:** Implementasi ulang sebagai fitur native HariKita — **DB-backed via Prisma +
Server Actions**, di-scope per `userId` (anti-IDOR), dengan **re-skin 100% ke design system
HariKita** (Brand Hub).

### Prinsip yang Disepakati

1. **Satu sumber kebenaran.** Semua data planner di DB, di-scope per `userId` dari session.
2. **Nol konflik dengan HariKita.** Budget planner manual terpisah dari `Order`/escrow.
   Order/OrderItem ditampilkan sebagai baris "terhubung" (read-only referensi), tidak digabung.
3. **Konvensi `ex-`** untuk semua hal di luar layanan HariKita (Excluded): halaman, API,
   storage, dan kategori budget.
4. **Re-skin total.** Warna/typografi/komponen mengikuti Brand Hub, bukan gaya HTML prototipe.

---

## 2. Non-Goals (Di Luar Cakupan)

- Tidak menghidupkan kembali localStorage. Tidak ada state planner yang disimpan di browser.
- Tidak mengubah model `Order`, `OrderItem`, `PaymentInstallment`, `EscrowTransaction`
  (hanya membaca referensi). Tidak ada penulisan finansial ke Order dari planner.
- Tidak menambah payment gateway live. Upload bukti pembayaran hanyalah arsip file client.
- Tidak menyentuh role VENDOR / ADMIN / BRAND_AMBASSADOR.
- Tidak menyentuh alur undangan (`/undangan/[slug]`) kecuali tautan navigasi.

---

## 3. Arsitektur & Model Data

### 3.1 Model Prisma Baru (5 tabel)

Semua model menyertakan `userId` (FK ke `User`) + index untuk scoping. Tidak ada relasi
Cascade yang menghapus data Order.

#### `WeddingTask` — Timeline 7 Tahap
```prisma
model WeddingTask {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  stage      Int      // 1..7 (0 = custom tanpa tahap)
  taskText   String
  pic        String?  // penanggung jawab (mis. "Mempelai & Ortu")
  priority   String   @default("Sedang") // "Tinggi" | "Sedang"
  note       String?
  isDone     Boolean  @default(false)
  doneAt     DateTime?
  sortOrder  Int      @default(0)
  isCustom   Boolean  @default(false) // true = ditambahkan client
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId, stage, sortOrder])
}
```

#### `KuaRequirement` — Berkas & Administrasi KUA
```prisma
model KuaRequirement {
  id           String    @id @default(cuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category     String    // mis. "1. Pengantar RT/RW", "2. Kelurahan (Model N)"
  docName      String
  party        String?   // "CPP" | "CPW" | "Bersama" | "Keluarga"
  docFormat    String?   // mis. "Asli 1 Lembar"
  institution  String?   // instansi penerbit
  note         String?
  isRequired   Boolean   @default(true)  // false = berkas opsional/kondisional
  isActive     Boolean   @default(false) // untuk berkas opsional: dipakai atau tidak
  isDone       Boolean   @default(false)
  doneAt       DateTime?
  sortOrder    Int       @default(0)
  isCustom     Boolean   @default(false)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([userId, category, sortOrder])
}
```

#### `WeddingBudgetItem` — Pos Anggaran
```prisma
model WeddingBudgetItem {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category          String
  itemName          String
  pic               String?  // vendor/PIC
  estimatedAmount   Int      @default(0) // Int Rupiah (AGENTS Rule 3)
  paidAmount        Int      @default(0) // Int Rupiah
  status            String   @default("BELUM") // "LUNAS" | "DP" | "BELUM" | "SIAPKAN"
  note              String?
  isExternal        Boolean  @default(true) // true = di luar layanan HariKita (ex-)
  linkMode          String   @default("MANUAL") // "MANUAL" | "AUTO" (hanya bila tertaut)
  linkedOrderItemId String?  // referensi ke OrderItem (tidak cascade delete item budget)
  linkedOrderItem   OrderItem? @relation(fields: [linkedOrderItemId], references: [id], onDelete: SetNull)
  sortOrder         Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  proofs    BudgetPaymentProof[]

  @@index([userId, sortOrder])
  @@index([linkedOrderItemId])
}
```

> **Perilaku `linkMode` (kombinasi dua opsi disetujui):**
> - `MANUAL`: client mengetik `estimatedAmount`/`paidAmount` sendiri. Tautan ke
>   `linkedOrderItemId` hanya penanda referensi (badge "Terhubung Pesanan HariKita").
> - `AUTO`: `estimatedAmount`/`paidAmount` **read-only** di UI dan diturunkan dari
>   `OrderItem.subtotal` + status escrow Order saat render (tidak disimpan ganda).

#### `BudgetPaymentProof` — Bukti Pembayaran (khusus pos `ex-`/manual)
```prisma
model BudgetPaymentProof {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  budgetItemId String
  budgetItem   WeddingBudgetItem @relation(fields: [budgetItemId], references: [id], onDelete: Cascade)
  fileUrl      String
  fileName     String?
  amount       Int?     // Int Rupiah (opsional)
  paidAt       DateTime?
  note         String?
  createdAt    DateTime @default(now())

  @@index([budgetItemId, createdAt])
}
```

#### `WeddingEmergencyItem` — Emergency Kit Hari-H
```prisma
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

**Perubahan pada model existing:**
- `User` mendapat relasi balik: `weddingTasks`, `kuaRequirements`, `budgetItems`,
  `budgetProofs`, `emergencyItems` (opsional, memudahkan include).
- `OrderItem` mendapat relasi balik `budgetLinks WeddingBudgetItem[]`.

> Semua perubahan schema wajib mengikuti **AGENTS.md Rule 12-13**: backup `dev.db`,
> `prisma validate`, `prisma db push`, `tsc --noEmit`, test relasi, test seed.

### 3.2 Diagram Relasi (ringkas)

```
User ─┬─< WeddingTask              (timeline)
      ├─< KuaRequirement           (berkas)
      ├─< WeddingBudgetItem ──?──> OrderItem   (linkMode MANUAL/AUTO)
      │        └─< BudgetPaymentProof
      └─< WeddingEmergencyItem
```

### 3.3 Seed Idempotent

Helper server: `ensureWeddingPlannerSeeded(userId)` — dipanggil saat halaman planner dibuka.
- Jika user belum punya `WeddingTask` → seed 22 task default (Tahap 1–7) dari prototipe HTML.
- Jika user belum punya `KuaRequirement` → seed 26 berkas wajib + 6 opsional.
- Jika user belum punya `WeddingEmergencyItem` → seed 13 item default kit.
- **Budget TIDAK di-seed** (bersifat personal); sebaliknya sediakan daftar kategori global
  sebagai saran di UI (mis. KUA & Hukum, Venue, Katering, Dekorasi, Mahar, Cincin, Operasional ex-).
- Idempotent: tidak menara data bila sudah ada.

---

## 4. Server Layer

### 4.1 Server Actions — `src/server/actions/wedding-planner.ts`
Semua action: (1) ambil `userId` dari `getSession()` (anti-IDOR), (2) validasi input,
(3) mutasi DB, (4) `revalidatePath`. Mengembalikan `{ success, message?, error?, fieldErrors? }`.

```
Task      : addTask, toggleTask, updateTask, deleteTask, resetTimelineToDefault
KUA       : toggleKuaDone, toggleKuaActive, addCustomKua, updateKua, deleteKua
Budget    : addBudgetItem, updateBudgetItem, deleteBudgetItem, setBudgetStatus,
            linkBudgetToOrderItem(itemId, orderItemId, linkMode), unlinkBudgetItem(itemId)
Proof     : addBudgetProof(budgetItemId, {fileUrl,fileName,amount,paidAt,note}), deleteBudgetProof
Emergency : toggleEmergencyItem, addEmergencyItem, deleteEmergencyItem
```

### 4.2 Query — `src/server/queries/wedding-planner.ts`
```
getWeddingReadiness(): {
  timeline: { done, total, pct },
  kua:      { done, total, pct },
  budget:   { estimated, paid, remaining, pctRealized },
  overallPct: number
}
getClientPlannerOverview(): ringkasan untuk /client (countdown, readiness, budget, sesi terdekat)
getClientBudgetItems(): daftar pos + info OrderItem tertaut (resolve linkMode AUTO dari Order)
```

### 4.3 Validasi — `src/lib/validations/wedding-planner.ts`
Mengikuti pola `src/lib/validations/client-profile.ts`. Fungsi: `validateBudgetItemInput`,
`validateTaskInput`, `validateKuaInput`, `validateProofInput`. Semua nominal → Int ≥ 0.

### 4.4 Upload API (prefix `ex-`) — `src/app/api/ex-budget-proof/route.ts`
```
POST /api/ex-budget-proof
  Auth   : session (role CLIENT); 401 bila tidak ada
  Body   : FormData { file, budgetItemId? }
  Allowed: image/jpeg, image/png, image/webp, application/pdf
  Max    : 5 MB
  Simpan : public/uploads/ex-budget/{userId}/{random}.{ext}
  Return : { url, fileName }
```
Terpisah total dari `public/uploads/vendor/` dan `/api/upload/vendor-doc` agar tidak bentrok
dengan layanan HariKita (permintaan eksplisit pengguna).

### 4.5 Konvensi `ex-` (Excluded)
Prefix `ex-` menandai "milik client sendiri, di luar ekosistem layanan HariKita":
- API: `/api/ex-budget-proof`
- Storage: `public/uploads/ex-budget/`
- Data: `WeddingBudgetItem.isExternal === true`
- UI: panel "Anggaran di Luar Layanan HariKita (ex-)"

---

## 5. Halaman & Navigasi (SaaS Sidebar)

### 5.1 Nav Group Baru — `CLIENT_NAV` (nav-config.ts)
```
group: "Persiapan Pernikahan"
├── Timeline & Progres    → /client/perencanaan   (icon: calendarClock)
├── Berkas & Administrasi → /client/berkas-kua    (icon: fileSearch)
├── Anggaran & Realisasi  → /client/anggaran      (icon: coins)
├── Katering Resepsi      → /client/katering      (icon: package)
└── Emergency Kit Hari-H  → /client/emergency     (icon: shield)
```
`NavIconName` perlu menambah `calendarClock` (sudah ada), `fileSearch` (ada), `coins` (ada),
`package` (ada), `shield` (ada). Tidak perlu ikon baru.

### 5.2 Struktur File
```
src/app/client/page.tsx                        (ROMBAK → dashboard nyata + countdown)
src/app/client/perencanaan/page.tsx            (server → WeddingTask)
src/app/client/perencanaan/ClientTimeline.tsx
src/app/client/berkas-kua/page.tsx
src/app/client/berkas-kua/ClientKua.tsx
src/app/client/anggaran/page.tsx
src/app/client/anggaran/ClientBudget.tsx
src/app/client/anggaran/ExBudgetPanel.tsx      (pos manual + upload bukti)
src/app/client/katering/page.tsx               (Kalkulator, client-side)
src/app/client/emergency/page.tsx              (+ ClientEmergency.tsx)
```

### 5.3 Halaman Ringkasan `/client` (rombakan)
- **Kartu hitung mundur** hari H dari `ClientProfile.eventDate` (editorial, accent champagne).
- **Widget "Kesiapan Pernikahan %"** — donut 3-segmen (Timeline / KUA / Budget)
  memakai `DashboardSemiDonutGauge` yang sudah ada.
- Ringkasan budget: estimasi vs terbayar vs sisa.
- Sesi terdekat (`PhysicalSession`) + tombol buka undangan.
- Menggantikan mock hardcoded "Bima & Citra" dengan data session nyata (data kosong → empty state).

### 5.4 Modul per Halaman
- **Timeline** (`/client/perencanaan`): 7 kartu tahap (filter) + tabel checklist. Pilih tahap
  memfilter tabel. Ada reset ke default, dan toggle task.
- **Berkas KUA** (`/client/berkas-kua`): alur 8 langkah visual + tabel 26 berkas wajib
  (checklist) + section berkas opsional (aktifkan/edit/tambah/hapus).
- **Anggaran** (`/client/anggaran`): KPI (estimasi/terbayar/sisa) + tabel pos budget,
  termasuk panel **(ex-)** untuk pos manual dengan upload bukti pembayaran + tombol tautkan
  ke OrderItem (mode MANUAL/AUTO).
- **Katering** (`/client/katering`): kalkulator murni (undangan × 2 × 2.2 → total porsi,
  buffet 50%, stall 50%). Tanpa DB.
- **Emergency** (`/client/emergency`): checklist 13 item kit + 3 peran rahasia keluarga inti.

---

## 6. Design System (Brand Hub — Sumber Kebenaran)

Mengacu `http://localhost:3000/design-system-showcase?hub=brand`.

### 6.1 Palet (token `hk-*`)
| Token | HEX | Pemakaian |
|---|---|---|
| `hk-charcoal` | `#2B2B2B` | Teks utama, seksi gelap |
| `hk-taupe` | `#88735B` | Brand utama, tombol primary |
| `hk-champagne` | `#C9A88A` | Border, outline, aksen foil |
| `hk-soft-beige` | `#E8DED1` | Divider, surface sekunder, pill |
| `hk-ivory` | `#F8F6F1` | Kanvas background, kartu |

> Catatan: nilai ini diambil dari komponen `PaletteSection` (Brand Hub) — sumber yang
> ditunjuk pengguna — dan mengungguli nilai di AGENTS.md. Selalu pakai **nama token**
> (`bg-hk-taupe`, dst) agar otomatis tunduk definisi Tailwind terkini.

### 6.2 Tipografi
- **Editorial/Heading:** Cormorant Garamond → `font-editorial` (BUKAN Plus Jakarta Sans).
- **UI/Body:** Manrope → `font-manrope`.
- **Angka & badge:** Manrope semibold, `tabular-nums`.

### 6.3 Komponen Resmi (`@/components/harikita/ui`)
Untuk header/kartu editorial & aksi:
`ButtonPrimary`, `ButtonSecondary`, `ButtonGhost`, `ButtonDark`, `IconButtonCircle`,
`ToggleSwitch`, `BadgePremium`, `BadgeNew`, `DecorativeDivider`, `SerifQuoteCard`,
`FloralCornerCard`, `WaxSealBadge`.
Untuk area tabel fungsional (timeline/berkas/budget):
`DashCard`, `DashTable`, `DashBadge`, `DashStatCard`, `DashPageHeader` (dari `@/components/dashboard`).

### 6.4 Aturan Visual
- Emoji ikon pada prototipe HTML **diganti Lucide icon**.
- Mobile-first, tanpa horizontal overflow di 375px / 768px / >1024px.
- Tombol sentuh ≥ 44px.
- Radius kartu mengikuti Brand Hub (rounded-2xl/3xl), border `border-hk-champagne/40`.

---

## 7. Testing & Verifikasi

- **Test baru:** `tests/wedding-planner.test.ts`
  - Validasi input (nominal, panjang teks, dsb).
  - Agregasi `getWeddingReadiness` (pct benar untuk kombinasi data).
  - Seed idempotent (dijalankan 2x → jumlah baris tidak berubah).
  - Owner-scoping (user A tidak dapat membaca/mengubah data user B).
- **Verifikasi akhir (AGENTS.md):**
  1. `prisma validate`
  2. backup `prisma/dev.db` → `prisma db push`
  3. `npx tsc --noEmit`
  4. `npm test` (semua test lama tetap hijau)
- **Manual:** login `081900000099` (PIN 123456) → buka tiap halaman baru → cek
  countdown & readiness, tambah pos ex- + upload bukti, toggle task/KUA, kalkulator.

---

## 8. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Perubahan schema merusak data | Backup `dev.db` sebelum `db push`; perubahan hanya additive (model baru + relasi balik). |
| Dua sumber budget (planner vs Order) | `linkMode` eksplisit; AUTO membaca Order tanpa menyimpan ganda; MANUAL penuh kendali client. |
| Upload file menumpuk | Simpan per-`userId`; validasi tipe & ukuran; UI daftar bukti dengan tombol hapus. |
| Overlap dengan fitur existing | Planner hanya membaca `ClientProfile`/`Order`/`PhysicalSession`; tidak menulis ke sana. |
| Seed ganda | Flag idempotent berbasis keberadaan baris. |

---

## 9. Definition of Done

- [ ] 5 model Prisma + relasi balik ditambahkan; `prisma validate` & `db push` sukses.
- [ ] Server actions & queries lengkap dengan anti-IDOR + validasi.
- [ ] API `POST /api/ex-budget-proof` berfungsi (validasi tipe/ukuran, simpan per-user).
- [ ] 5 halaman baru + rombakan `/client` ter-render & responsif di 375/768/1024.
- [ ] Re-skin 100% Brand Hub (token, typografi, komponen); tidak ada gaya HTML prototipe.
- [ ] `ensureWeddingPlannerSeeded` idempotent & tervalidasi.
- [ ] `tests/wedding-planner.test.ts` hijau; `npm run verify` hijau.
- [ ] Uji manual dengan `081900000099` berhasil untuk semua alur.
