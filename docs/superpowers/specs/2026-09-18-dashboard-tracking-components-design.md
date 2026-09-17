# Master Design Spec: Modular Tracking Dashboard Components Suite
**Proyek:** HariKita (Platform Event Lamaran & Pernikahan Hyperlocal Kebumen)  
**Tanggal:** 2026-09-18  
**Status:** Approved for Implementation Planning  
**Target Lokasi Komponen:** `src/components/dashboard/`  
**Target Integrasi:**
1. Dashboard Profil Vendor (`src/app/vendor/profil/VendorProfilWorkspace.tsx`)
2. Dashboard Superadmin (`src/app/admin/AdminDashboardClient.tsx`)

---

## 1. Latar Belakang & Tujuan Desain
Pengguna membutuhkan standarisasi antarmuka pelacakan (*tracking dashboard*) yang terinspirasi dari layout modern SaaS atelier studio:
- Memiliki hierarki visual yang jelas dan estetis.
- Mengadopsi palet warna resmi HariKita Kebumen: *Cashmere Alabaster* (`#FAF8F5`), *Gilded Champagne* (`#F3EDE6`), *Deep Plum Charcoal* (`#4A2E35`), *Gilded Taupe* (`#88735B` / `#C5A880`), serta aksen Emerald (`#10B981`) dan Amber (`#F59E0B`).
- Menerapkan arsitektur *Pure Modular SVG & Tailwind UI Suite* tanpa library charting eksternal, sehingga menjamin kecepatan muat maksimal di perangkat mobile calon pengantin dan mitra vendor.

---

## 2. Struktur Grid & Tata Letak Dashboard

Tata letak mengadopsi formasi 3-baris yang adaptif (1 kolom di ponsel, 3 kolom di desktop `lg:grid-cols-3`):

```
┌─────────────────────────────────────────────────────────────┬──────────────────────────┐
│ Baris 1 (2/3 Lebar):                                        │ Baris 1 (1/3 Lebar):     │
│ [DashboardSplineChart]                                      │ [DashboardSemiDonutGauge]│
│ - Date range badge & dropdown 7d/30d                        │ - Center total besar     │
│ - Kurva Bézier halus + gradient fill                        │ - Busur 180° dual segmen │
│ - Guideline & floating hover tooltip                        │ - Legenda warna bawah    │
├──────────────────────────────┬──────────────────────────────┼──────────────────────────┤
│ Baris 2 (1/3 Lebar):         │ Baris 2 (1/3 Lebar):         │ Baris 2 (1/3 Lebar):     │
│ [DashboardSparkBarCard]      │ [DashboardSparkBarCard]      │ [DashboardScheduleTimeline│
│ - Omset / GMV                │ - Escrow / Fee               │ - Date stepper (< Tgl >) │
│ - Micro 7-bar sparkline      │ - Micro 7-bar sparkline      │ - Tab kategori           │
│   (Emerald Green)            │   (Vibrant Amber)            │ - Garis status vertikal  │
├──────────────────────────────┴──────────────────────────────┴──────────────────────────┤
│ Baris 3 (Lebar Penuh 3/3):                                                             │
│ [DashboardTrackingTable]                                                               │
│ - Action Toolbar: Tombol ⇅ Urutkan, ⎚ Filter, Lihat Semua                              │
│ - Kolom: Avatar + Nama/Kontak, Jenis Paket/Layanan, Badge Kecamatan, Status & Tanggal  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Spesifikasi 5 Komponen Modular

### Komponen 1: `DashboardSplineChart.tsx`
* **Fungsi:** Menampilkan tren data harian/mingguan dengan kurva kubik Bézier SVG murni.
* **Fitur Utama:**
  * Header judul + pill tanggal (contoh: `8 Nov - 14 Nov`) + dropdown rentang waktu (`7 Hari`, `30 Hari`, `90 Hari`).
  * Garis grid Y-axis putus-putus (*dashed grid lines*) dengan label nilai.
  * Kurva spline halus dengan `<linearGradient>` pudar ke transparan di bawah area kurva.
  * Interaksi hover kursor: garis panduan vertikal putus-putus (*guideline*) dan kartu tooltip melayang dengan indikator pertumbuhan (+15%).
* **Props Interface:**
  ```typescript
  export interface SplinePoint {
    date: string;
    label: string;
    value: number;
    deltaPct?: string;
  }

  export interface DashboardSplineChartProps {
    title: string;
    dateRangeLabel: string;
    timeframe: "7d" | "30d" | "90d";
    onTimeframeChange?: (tf: "7d" | "30d" | "90d") => void;
    data: SplinePoint[];
    unitPrefix?: string;
    unitSuffix?: string;
    lineColor?: string; // default "#10B981" atau "#88735B"
    gradientFrom?: string;
    gradientTo?: string;
  }
  ```

---

### Komponen 2: `DashboardSemiDonutGauge.tsx`
* **Fungsi:** Visualisasi rasio proporsi 2 metrik dalam bentuk setengah lingkaran busur 180°.
* **Fitur Utama:**
  * Busur SVG 180° dengan ujung melingkar (*strokeLinecap="round"*).
  * Pusat busur menampilkan angka total utama (contoh: *254 Pesanan*).
  * 2 segmen warna kontras (Amber & Emerald).
  * Legenda bawah dengan titik warna, label tebal, dan sublabel ringkas (contoh: *206 Mandiri / +2 Baru*, *48 Kolaborasi / +3 Proses*).
* **Props Interface:**
  ```typescript
  export interface GaugeSegment {
    label: string;
    sublabel?: string;
    value: number;
    color: string; // hex code atau Tailwind class
  }

  export interface DashboardSemiDonutGaugeProps {
    title: string;
    actionLabel?: string;
    onActionClick?: () => void;
    totalLabel?: string;
    segments: [GaugeSegment, GaugeSegment];
  }
  ```

---

### Komponen 3: `DashboardSparkBarCard.tsx`
* **Fungsi:** Kartu KPI statistik ringkas dengan visual batang mikro 7 kolom harian.
* **Fitur Utama:**
  * Judul metrik + tombol aksi "Lihat Semua".
  * Nilai nominal angka besar berjarak nyaman (contoh: `Rp 34.428.500` atau `12.845`).
  * Indikator delta pertumbuhan dengan panah panjat/turun dan label perbandingan (`+24% vs minggu lalu`).
  * Micro sparkline bar (7 batang vertikal `rounded-full` dengan tinggi persentase proporsional).
* **Props Interface:**
  ```typescript
  export interface SparkBarItem {
    label: string;
    value: number;
    tooltip?: string;
  }

  export interface DashboardSparkBarCardProps {
    title: string;
    value: string;
    actionLabel?: string;
    onActionClick?: () => void;
    delta: {
      direction: "up" | "down";
      percentage: string;
      comparison: string;
    };
    bars: SparkBarItem[];
    barTone?: "emerald" | "amber" | "taupe";
  }
  ```

---

### Komponen 4: `DashboardScheduleTimeline.tsx`
* **Fungsi:** Memantau jadwal agenda sesi fisik harian (Fitting Gaun, Test Food, Hari H).
* **Fitur Utama:**
  * Header judul + tombol "Lihat Semua".
  * Navigasi tanggal stepper interaktif (`< 10 Nov 2025 >`).
  * Segmented tabs kategori acara (`Semua`, `Fitting Gaun`, `Test Food`, `Hari H`).
  * Daftar agenda vertikal:
    - Kolom waktu (contoh: `10:45 - 11:30 WIB`).
    - Garis aksen status vertikal (Emerald = Terkonfirmasi, Amber = Menunggu, Taupe = Selesai).
    - Judul acara, nama calon pengantin, dan lokasi studio/venue di Kebumen.
* **Props Interface:**
  ```typescript
  export interface ScheduleItem {
    id: string;
    startTime: string;
    endTime: string;
    category: string;
    title: string;
    personName: string;
    venue?: string;
    accentColor: "emerald" | "amber" | "taupe" | "rose";
  }

  export interface DashboardScheduleTimelineProps {
    title?: string;
    actionLabel?: string;
    onActionClick?: () => void;
    currentDate: string;
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    onPrevDate?: () => void;
    onNextDate?: () => void;
    events: ScheduleItem[];
  }
  ```

---

### Komponen 5: `DashboardTrackingTable.tsx`
* **Fungsi:** Tabel data pelacakan pesanan dan status escrow secara komprehensif.
* **Fitur Utama:**
  * Toolbar aksi di header: Tombol `⇅ Urutkan`, `⎚ Filter`, dan `Lihat Semua`.
  * Baris tabel dengan hover effect lembut (`hover:bg-hk-ivory/40`).
  * Kolom 1: Avatar inisial / foto + 2-baris teks (Nama Calon Pengantin & Nomor WhatsApp / Email).
  * Kolom 2: Paket Layanan Terpilih (Nama paket, jumlah pax katering atau baki seserahan).
  * Kolom 3: Badge Pill Pastel untuk Kecamatan / Venue di Kebumen (cth: *Kebumen Kota*, *Gombong*, *Ayah*).
  * Kolom 4: Status Pesanan & Tanggal (cth: `DP 30% Terkunci - 12 Okt 2025`, `Lunas H+2 - 6 Nov 2025`).
* **Props Interface:**
  ```typescript
  export interface TrackingTableRow {
    id: string;
    avatarUrl?: string;
    primaryName: string;
    secondaryText: string;
    type: string;
    subType?: string;
    badgeText: string;
    badgeTone: "emerald" | "amber" | "taupe" | "rose" | "indigo";
    statusText: string;
    statusDate: string;
  }

  export interface DashboardTrackingTableProps {
    title: string;
    actionLabel?: string;
    onActionClick?: () => void;
    onSort?: () => void;
    onFilter?: () => void;
    columns: {
      col1: string;
      col2: string;
      col3: string;
      col4: string;
    };
    rows: TrackingTableRow[];
  }
  ```

---

## 4. Integrasi Dashboard

### 1. Di Dashboard Profil Vendor (`src/app/vendor/profil/VendorProfilWorkspace.tsx`)
* Diintegrasikan langsung pada tab utama `"Tren & Analitik Pasar"` menggantikan/meng-upgrade kartu parsial yang lama menjadi tata letak 3-baris terpadu ini.
* Menampilkan data nyata dari session/props vendor:
  - `DashboardSplineChart`: Tren Kunjungan Tamu vs Pengantin Berakun vs Racik Builder.
  - `DashboardSemiDonutGauge`: Rasio Pesanan Solo vs Kolaborasi Paket.
  - `DashboardSparkBarCard A`: Omset Bersih Hak Vendor (90%).
  - `DashboardSparkBarCard B`: Saldo Escrow Tertahan (Menunggu Acara H-3 / H+2).
  - `DashboardScheduleTimeline`: Jadwal Sesi 1st/Final Fitting Gaun & Test Food.
  - `DashboardTrackingTable`: Pelacakan Pesanan Masuk Calon Pengantin di Kebumen.

### 2. Di Dashboard Superadmin (`src/app/admin/AdminDashboardClient.tsx`)
* Menambahkan tab ringkasan eksekutif atau panel tracking agregat se-Kabupaten Kebumen:
  - `DashboardSplineChart`: Tren GMV Transaksi Kebumen & Telemetri Funnel Konversi.
  - `DashboardSemiDonutGauge`: Proporsi Pesanan 11 Kategori Layanan Se-Kebumen.
  - `DashboardSparkBarCard A`: Total GMV Platform.
  - `DashboardSparkBarCard B`: Pendapatan Platform Fee 10%.
  - `DashboardScheduleTimeline`: Master Multi-Vendor Calendar Hari H.
  - `DashboardTrackingTable`: Master Transaksi & Kliring Rekening Bersama Escrow.

---

## 5. Rencana Pengujian & Verifikasi
1. **TypeScript Type Safety:** Menjalankan `npx tsc --noEmit` untuk memastikan semua interface, props, dan import bebas dari error ketik.
2. **Automated Unit Tests:** Menjalankan `npm test` untuk memastikan 171 existing test tetap 100% lulus.
3. **Responsiveness Test:** Verifikasi layout grid di mobile (`375px`), tablet (`768px`), dan laptop (`>1024px`).
4. **Browser Runtime Test:** Membuka browser pada route `/vendor/profil` dan `/admin` untuk memastikan tidak ada kesalahan rendering, chart SVG tampil presisi, dan interaksi tombol/tabs berjalan mulus.
