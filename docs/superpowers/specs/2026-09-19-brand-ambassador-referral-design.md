# Brand Ambassador (BA) Referral & Komisi — Design Spec

> Status: Menunggu review. Setelah disetujui → lanjut ke implementation plan
> (`writing-plans`).
> Tanggal: 2026-09-19
> Branch: `feat/brand-ambassador-referral`

## 1. Latar Belakang & Tujuan

HariKita ingin menambah **role baru: Brand Ambassador (BA)** — mitra yang membantu
promosi platform dengan cara **merekrut vendor** untuk bergabung. Sebagai imbalan,
BA mendapat **persentase komisi** dari setiap pesanan yang berhasil tuntas dari
vendor yang ia rekrut.

**Tujuan fitur:**
1. Role `BA` pada sistem autentikasi.
2. Setiap BA punya **kode referral unik**.
3. Vendor baru yang mendaftar memakai kode BA → tercatat sebagai rekrutan BA tersebut.
4. Komisi BA dihitung otomatis dari porsi vendor rekrutan, dicatat ke **dompet BA**
   saat pelunasan 70% cair ke vendor.
5. BA punya **dashboard** (daftar vendor rekrutan, daftar komisi, saldo) + **withdraw**.
6. Admin dapat mengelola BA dan besaran persen komisi per-BA.

## 2. Ruang Lingkup

### Termasuk (MVP lengkap)
- Role `BA` + profil BA + kode referral unik.
- Input kode referral saat **registrasi vendor** (sekali pakai, terkunci permanen).
- Pencatatan komisi otomatis ke dompet BA saat `SETTLEMENT_PAYOUT` order tuntas.
- Dashboard BA: ringkasan, daftar vendor rekrutan, riwayat komisi, saldo, withdraw.
- Panel Admin: daftar BA, atur persen komisi per-BA, aktivasi/nonaktivasi BA.

### Tidak termasuk (di luar lingkup sekarang)
- Program tier/berjenjang (hanya persen tunggal per-BA).
- Komisi dua sisi (klien) — sudah diputuskan hanya sisi **vendor**.
- Auto-transfer bank (BA mengajukan withdraw, pencairan diproses seperti pola vendor).

## 3. Keputusan Desain (hasil brainstorming)

| Pertanyaan | Keputusan |
|---|---|
| Objek referral | **BA merekrut VENDOR** (mitra) |
| Dasar komisi | **% dari porsi/subtotal OrderItem milik vendor rekrutan** (bukan total order) |
| Kapan eligible | Saat **pelunasan 70% (SETTLEMENT_PAYOUT) cair** ke vendor |
| Besaran | **Bisa diatur Admin per-BA** (default, mis. 5%), tidak hardcode |
| Penerimaan uang | **Dompet saldo BA + ajukan withdraw** (pola mirip dompet vendor) |
| Proteksi | **1 BA per vendor** + **blokir self-referral**; kode sekali pakai saat registrasi |

## 4. Model Data (Prisma)

Dua provider (PostgreSQL produksi + SQLite dev/test) harus diperbarui: `prisma/schema.prisma`
dan `prisma/schema.sqlite.prisma`.

### 4.1 Enum/ Konstanta
- `User.role`: tambah nilai `"BA"` (sekarang `"CLIENT" | "VENDOR" | "ADMIN"`; String bebas).

### 4.2 Model baru

```prisma
model BrandAmbassador {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  referralCode  String   @unique          // mis. "BA-KEBUMEN-7X3A"
  displayName   String                     // nama publik BA
  phone         String?
  city          String   @default("Kebumen")
  district      String?

  commissionPct Float    @default(5.0)     // persen komisi (diatur Admin)
  isActive      Boolean  @default(true)

  // Dompet
  walletBalance Int      @default(0)       // saldo siap tarik (Rupiah)
  bankName      String?
  bankAccount   String?
  bankHolder    String?

  recruitedVendors VendorProfile[]  @relation("VendorRecruiter")
  commissions      AmbassadorCommission[]
  withdrawals      AmbassadorWithdrawal[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model AmbassadorCommission {
  id              String           @id @default(cuid())
  ambassadorId    String
  ambassador      BrandAmbassador  @relation(fields: [ambassadorId], references: [id], onDelete: Cascade)

  orderId         String
  order           Order            @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderItemId     String
  orderItem       OrderItem        @relation(fields: [orderItemId], references: [id], onDelete: Cascade)

  vendorId        String
  vendor          VendorProfile    @relation("VendorCommissionSource", fields: [vendorId], references: [id], onDelete: Cascade)

  // Snapshot perhitungan (agar historis stabil bila persen berubah)
  baseAmount      Int              // subtotal OrderItem (porsi vendor)
  commissionPct   Float            // persen saat komisi dihitung
  commissionAmount Int             // nominal komisi (Rupiah, integer)

  status          String           @default("CREDITED") // "CREDITED", "REVERSED"
  ledgerJournalId String?                                 // tautan ke jurnal ledger (opsional)

  createdAt       DateTime         @default(now())

  @@unique([orderItemId])          // exact-once: satu item = maksimal satu komisi
  @@index([ambassadorId, createdAt])
  @@index([vendorId])
}

model AmbassadorWithdrawal {
  id             String   @id @default(cuid())
  ambassadorId   String
  ambassador     BrandAmbassador @relation(fields: [ambassadorId], references: [id], onDelete: Cascade)
  amount         Int
  status         String   @default("PENDING") // "PENDING", "PROCESSING", "PAID", "REJECTED"
  bankName       String?
  bankAccount    String?
  bankHolder     String?
  processedAt    DateTime?
  note           String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([ambassadorId, status])
}
```

### 4.3 Relasi tambahan pada model yang sudah ada

- `User`: tambah `brandAmbassador BrandAmbassador?`.
- `VendorProfile`: tambah
  ```prisma
  recruitedById String?
  recruitedBy   BrandAmbassador? @relation("VendorRecruiter", fields: [recruitedById], references: [id], onDelete: SetNull)
  ```
  (dikunci permanen setelah registrasi — tidak boleh diubah klien).
- `Order`: tambah `ambassadorCommissions AmbassadorCommission[]`.
- `OrderItem`: tambah `ambassadorCommissions AmbassadorCommission[]` dan relasi
  `vendorCommissions` pada `VendorProfile` (`@relation("VendorCommissionSource")`).

## 5. Alur Sistem

### 5.1 Alur Referral (registrasi vendor)
1. Admin membuat BA (atau BA mendaftar, tergantung keputusan admin flow) → sistem
   generate `referralCode` unik (mis. `BA-<KOTA>-<4 char>`).
2. Halaman registrasi vendor menambah **field opsional "Kode Referral (BA)"**.
3. Saat submit registrasi vendor:
   - Validasi kode: ada + BA aktif + **bukan milik vendor sendiri** (self-referral guard
     via nomor HP/akun).
   - Simpan `VendorProfile.recruitedById` = BA tersebut (permanen).
   - Kode bersifat **sekali pakai per vendor** (satu vendor hanya bisa direkrut satu BA).
4. Jika kode invalid/kosong → vendor tetap bisa daftar tanpa rekruter.

### 5.2 Alur Perhitungan Komisi (saat order tuntas)
Titik integrasi: tepat setelah `SETTLEMENT_PAYOUT` sukses di `runPayoutSweep`
(`src/server/services/payment-service.ts`), di dalam transaksi yang sama.

Untuk setiap `OrderItem` pada order tersebut yang:
- statusnya `ACCEPTED` (tidak dibatalkan), dan
- vendornya punya `recruitedById != null` dan BA-nya `isActive`,

maka:
1. Hitung `baseAmount = OrderItem.subtotal`.
2. `commissionAmount = floor(baseAmount * commissionPct / 100)`.
3. Buat `AmbassadorCommission` (exact-once via `@@unique([orderItemId])`).
4. Tambah `BrandAmbassador.walletBalance += commissionAmount`.
5. Catat jurnal ledger (lihat §5.4) sebagai evidence akuntansi.

**Idempotency:** satu `OrderItem` hanya menghasilkan satu komisi (unique constraint).
Bila `runPayoutSweep` dijalankan ulang, tidak ada komisi dobel.

### 5.3 Alur Withdraw BA
1. BA isi formulir withdraw (nominal ≤ `walletBalance`, data rekening).
2. Buat `AmbassadorWithdrawal` status `PENDING`; `walletBalance -= amount` (dana ditahan).
3. Admin memproses (PAID/REJECTED):
   - `PAID` → selesai (dana sudah dipotong saat pengajuan).
   - `REJECTED` → `walletBalance += amount` (dikembalikan).

### 5.4 Jurnal Ledger (mengikuti pola COA yang ada)
Tambahan akun COA di `LEDGER_ACCOUNTS`:
- `AMBASSADOR_PAYABLE: "2030_AMBASSADOR_PAYABLE"` (atau dokumen akun baru).

Saat komisi dibuat:
- `DR 4010_PLATFORM_FEE` (komisi adalah pengurang pendapatan platform)
- `CR 2030_AMBASSADOR_PAYABLE` (kewajiban ke BA)

`type: "AMBASSADOR_COMMISSION"`, `journalNumber = "ADVCOM-{orderItemId}"` (deterministik,
idempotent seperti pola payout).

> Catatan: metode pasti (apakah dari `PLATFORM_FEE` atau akun beban baru) akan
> difinalkan saat implementasi agar ledger tetap `balance` (debit = credit) dan lolos
> `ledger-validator`.

## 6. Halaman & Rute

Mengikuti taxonomi `src/lib/routes.ts`.

| Rute | Peran | Isi |
|---|---|---|
| `/ba` (atau `/dashboard/ba`) | BA | Ringkasan: saldo, total komisi, jumlah vendor rekrutan |
| `/dashboard/ba/vendor` | BA | Daftar vendor rekrutan + statusnya |
| `/dashboard/ba/komisi` | BA | Riwayat komisi (per order) |
| `/dashboard/ba/dompet` | BA | Saldo + form withdraw + riwayat withdraw |
| `/admin/ba` | Admin | Kelola BA: daftar, atur persen, aktif/nonaktif, proses withdraw |
| `/auth/register-vendor` | publik | **Tambah field kode referral (opsional)** |

**Middleware:** perbarui `src/middleware.ts` untuk melindungi `/dashboard/ba/*` (role `BA`),
dan redirect login sesuai role BA.

## 7. Integrasi Titik Kode (file yang akan disentuh)

- `prisma/schema.prisma` + `prisma/schema.sqlite.prisma` — model baru & relasi.
- `src/server/services/payment-service.ts` — panggil hook komisi setelah `SETTLEMENT_PAYOUT`.
- `src/server/services/ledger-service.ts` — akun COA + helper jurnal komisi.
- **Baru** `src/server/services/ambassador-service.ts` — logika komisi, dompet BA, withdraw.
- **Baru** `src/server/queries/ambassador.ts` — query dashboard BA & admin.
- **Baru** `src/server/actions/ambassador.ts` — server action (withdraw, admin kelola).
- `src/server/actions/auth.ts` + halaman `register-vendor` — input & validasi kode referral.
- `src/lib/routes.ts` — rute BA/admin.
- `src/middleware.ts` — proteksi rute BA.
- Halaman dashboard BA & admin BA (baru).
- **Test** `tests/ambassador-commission.test.ts` (baru).

## 8. Testing Strategy

- **Unit/logic test** (`tests/ambassador-commission.test.ts`):
  - Perhitungan komisi = `floor(subtotal * pct / 100)`.
  - Exact-once: menjalankan komisi dua kali untuk `OrderItem` yang sama → tetap 1 komisi.
  - Order dengan banyak vendor → komisi hanya untuk vendor milik BA.
  - Order item yang dibatalkan (`REJECTED`/`CANCELLED`) → tidak ada komisi.
  - BA nonaktif → tidak ada komisi.
  - Withdraw: saldo berkurang saat pengajuan; pengembalian saat `REJECTED`.
- **Referral test**: kode valid → `recruitedById` terset; kode invalid → null; self-referral diblokir.
- Verifikasi akhir: `npm run typecheck`, `npm test`, `npm run build` (tanpa mengganggu dev server).

## 9. Risiko & Catatan

- **Idempotency uang**: wajib exact-once (unique constraint + journalNumber deterministik).
- **Perubahan persen**: disimpan snapshot (`commissionPct`, `commissionAmount`) agar historis stabil.
- **Dua skema Prisma** (postgres + sqlite) harus disinkronkan.
- **Ledger balance**: penambahan akun harus menjaga debit = credit & lolos validator.
- **Self-referral**: guard via nomor HP/akun; perlu definisi jelas di implementasi.

## 10. Pertanyaan Terbuka (akan dikonfirmasi saat plan)

1. Pembuatan akun BA: oleh Admin saja, atau ada pendaftaran BA mandiri? (default: Admin).
2. Persen default awal (default: 5%).
3. Komisi dihitung per `OrderItem` (default disetujui) — konfirmasi apakah item yang
   `REJECTED` memang tidak dapat komisi (default: ya, hanya item ter-accept & terbayar).
