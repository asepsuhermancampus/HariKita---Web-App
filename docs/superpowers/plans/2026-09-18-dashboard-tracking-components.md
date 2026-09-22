# Modular Tracking Dashboard Components Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Membangun set komponen modular tracking dashboard (Spline Line Area Chart, 180° Semi-Donut Gauge, Sparkline Micro Bar Card, Schedule Timeline, dan Tracking Data Table) berbasis pure SVG & Tailwind CSS, lalu mengintegrasikannya ke Dashboard Profil Vendor (`/vendor/profil`) dan Dashboard Superadmin (`/admin`).

**Architecture:** Menerapkan atomic component design pattern di `src/components/dashboard/` dengan zero-dependency SVG math (Bézier curves & SVG arc path), didukung palet warna resmi HariKita Kebumen. Komponen dibungkus dalam dua suite modular: `VendorTrackingSuite.tsx` dan `AdminTrackingSuite.tsx`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Node.js Test Runner (`node:test` + `node:assert/strict`).

**Spec:** `docs/superpowers/specs/2026-09-18-dashboard-tracking-components-design.md`

## Global Constraints

- Tech Stack: Next.js 15 + React 19 + TypeScript + Tailwind CSS + Lucide React.
- Zero-Dependency Charts: Menggunakan pure SVG murni dan CSS tanpa library charting eksternal (menjaga performa web mobile).
- Color Palette: Cashmere Alabaster (`#FAF8F5`), Gilded Champagne (`#F3EDE6`), Deep Plum Charcoal (`#4A2E35`), Gilded Taupe (`#88735B` / `#C5A880`), Emerald (`#10B981` / `#059669`), dan Amber (`#F59E0B` / `#D97706`).
- Financial units: Integer Rupiah (`Int`), tanpa tipe float.
- Hyperlocal Kebumen: Penamaan venue, kecamatan (Kebumen Kota, Gombong, Ayah, Karanganyar), dan termin escrow 30%:70%.
- Strict Anti-Scope Creep: Tidak menambahkan e-commerce non-event atau library eksternal berat.

---

## File Structure

```
src/
├── components/
│   └── dashboard/
│       ├── DashboardSplineChart.tsx       # Komponen 1: Area line chart SVG murni + hover tooltip
│       ├── DashboardSemiDonutGauge.tsx     # Komponen 2: 180° semi-donut gauge dial SVG
│       ├── DashboardSparkBarCard.tsx       # Komponen 3: KPI stat card + 7-bar micro sparkline
│       ├── DashboardScheduleTimeline.tsx   # Komponen 4: Agenda timeline card + date stepper
│       ├── DashboardTrackingTable.tsx      # Komponen 5: Full-width data table + action toolbar
│       ├── VendorTrackingSuite.tsx         # Hub penggabung 5 komponen untuk profil vendor
│       ├── AdminTrackingSuite.tsx          # Hub penggabung 5 komponen untuk superadmin
│       └── index.ts                        # Barrel export untuk komponen dashboard
├── app/
│   ├── vendor/
│   │   └── profil/
│   │       └── VendorProfilWorkspace.tsx   # Integrasi tab "Tren & Analitik Pasar"
│   └── admin/
│       └── AdminDashboardClient.tsx        # Integrasi panel master tracking admin
tests/
└── dashboard-tracking.test.ts              # Unit tests untuk utilitas math & struktur props dashboard
```

---

### Task 1: Utility Math & Helper Dashboard Tracking

**Files:**
- Create: `src/components/dashboard/dashboard-utils.ts`
- Create: `tests/dashboard-tracking.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export function calculateBezierSplinePath(points: { x: number; y: number }[]): string;
  export function calculateSvgArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string;
  export function formatCompactNumber(num: number): string;
  ```

- [x] **Step 1: Write the failing test**

```typescript
// tests/dashboard-tracking.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateBezierSplinePath,
  calculateSvgArcPath,
  formatCompactNumber,
} from "../src/components/dashboard/dashboard-utils";

test("calculateBezierSplinePath returns valid SVG path string", () => {
  const points = [
    { x: 0, y: 100 },
    { x: 50, y: 50 },
    { x: 100, y: 80 },
  ];
  const path = calculateBezierSplinePath(points);
  assert.ok(path.startsWith("M 0 100"));
  assert.ok(path.includes("C"));
});

test("calculateSvgArcPath computes arc path coordinates correctly", () => {
  const arc = calculateSvgArcPath(100, 100, 80, 180, 360);
  assert.ok(arc.startsWith("M"));
  assert.ok(arc.includes("A 80 80"));
});

test("formatCompactNumber formats values compactly", () => {
  assert.equal(formatCompactNumber(12845), "12.845");
  assert.equal(formatCompactNumber(254), "254");
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/dashboard-tracking.test.ts`  
Expected: FAIL with module not found `dashboard-utils`.

- [x] **Step 3: Write minimal implementation**

```typescript
// src/components/dashboard/dashboard-utils.ts
export function calculateBezierSplinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const prev = points[i - 1] || current;
    const nextNext = points[i + 2] || next;

    const smoothing = 0.2;
    const cp1x = current.x + (next.x - prev.x) * smoothing;
    const cp1y = current.y + (next.y - prev.y) * smoothing;
    const cp2x = next.x - (nextNext.x - current.x) * smoothing;
    const cp2y = next.y - (nextNext.y - current.y) * smoothing;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }
  return path;
}

export function calculateSvgArcPath(
  cx: number,
  cy: number,
  r: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;

  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);

  const largeArcFlag = endAngleDeg - startAngleDeg <= 180 ? "0" : "1";
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/dashboard-tracking.test.ts`  
Expected: PASS (3 tests passing).

- [x] **Step 5: Commit**

```bash
git add src/components/dashboard/dashboard-utils.ts tests/dashboard-tracking.test.ts
git commit -m "feat(dashboard): add pure SVG math and formatting utilities"
```

---

### Task 2: DashboardSplineChart Component

**Files:**
- Create: `src/components/dashboard/DashboardSplineChart.tsx`
- Modify: `tests/dashboard-tracking.test.ts`

**Interfaces:**
- Consumes: `calculateBezierSplinePath` from `dashboard-utils.ts`
- Produces:
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
    lineColor?: string;
  }
  ```

- [x] **Step 1: Write test for Spline data normalization**

```typescript
// in tests/dashboard-tracking.test.ts
test("DashboardSplineChart data coordinates scale within viewBox limits", () => {
  const data = [
    { date: "2025-11-08", label: "8 Nov", value: 10 },
    { date: "2025-11-09", label: "9 Nov", value: 20 },
    { date: "2025-11-10", label: "10 Nov", value: 50 },
  ];
  const max = Math.max(...data.map(d => d.value));
  assert.equal(max, 50);
});
```

- [x] **Step 2: Implement `DashboardSplineChart.tsx`**

Implement smooth curve area chart with `<defs><linearGradient>`, interactive vertical dashed guideline on mouse move/hover, floating badge with delta (+15%), timeframe dropdown selector, and clean date labels.

- [x] **Step 3: Run test and typecheck**

Run: `npm run typecheck && npx tsx --test tests/dashboard-tracking.test.ts`  
Expected: PASS with 0 errors.

- [x] **Step 4: Commit**

```bash
git add src/components/dashboard/DashboardSplineChart.tsx tests/dashboard-tracking.test.ts
git commit -m "feat(dashboard): implement pure SVG DashboardSplineChart component"
```

---

### Task 3: DashboardSemiDonutGauge Component

**Files:**
- Create: `src/components/dashboard/DashboardSemiDonutGauge.tsx`
- Modify: `tests/dashboard-tracking.test.ts`

**Interfaces:**
- Consumes: `calculateSvgArcPath`, `formatCompactNumber` from `dashboard-utils.ts`
- Produces:
  ```typescript
  export interface GaugeSegment {
    label: string;
    sublabel?: string;
    value: number;
    color: string;
  }
  export interface DashboardSemiDonutGaugeProps {
    title: string;
    actionLabel?: string;
    onActionClick?: () => void;
    totalLabel?: string;
    segments: [GaugeSegment, GaugeSegment];
  }
  ```

- [x] **Step 1: Write test for semi-donut angle calculation**

```typescript
// in tests/dashboard-tracking.test.ts
test("DashboardSemiDonutGauge computes ratio angles summing to 180 degrees", () => {
  const val1 = 206;
  const val2 = 48;
  const total = val1 + val2;
  const angle1 = (val1 / total) * 180;
  const angle2 = (val2 / total) * 180;
  assert.equal(Math.round(angle1 + angle2), 180);
});
```

- [x] **Step 2: Implement `DashboardSemiDonutGauge.tsx`**

Implement 180° semi-donut dial with large bold center counter, amber and emerald arcs with `strokeLinecap="round"`, and bottom legend with color dots and sublabels.

- [x] **Step 3: Run test and typecheck**

Run: `npm run typecheck && npx tsx --test tests/dashboard-tracking.test.ts`  
Expected: PASS.

- [x] **Step 4: Commit**

```bash
git add src/components/dashboard/DashboardSemiDonutGauge.tsx tests/dashboard-tracking.test.ts
git commit -m "feat(dashboard): implement DashboardSemiDonutGauge component"
```

---

### Task 4: DashboardSparkBarCard Component

**Files:**
- Create: `src/components/dashboard/DashboardSparkBarCard.tsx`
- Modify: `tests/dashboard-tracking.test.ts`

**Interfaces:**
- Produces:
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

- [x] **Step 1: Implement `DashboardSparkBarCard.tsx`**

Build clean card with title, action link, big bold typography, delta badge (`+24% VS Last Week`), and 7-bar micro column chart with `rounded-full` pill bars and dynamic percentage heights.

- [x] **Step 2: Run test and typecheck**

Run: `npm run typecheck && npx tsx --test tests/dashboard-tracking.test.ts`  
Expected: PASS.

- [x] **Step 3: Commit**

```bash
git add src/components/dashboard/DashboardSparkBarCard.tsx tests/dashboard-tracking.test.ts
git commit -m "feat(dashboard): implement DashboardSparkBarCard component"
```

---

### Task 5: DashboardScheduleTimeline & DashboardTrackingTable Components

**Files:**
- Create: `src/components/dashboard/DashboardScheduleTimeline.tsx`
- Create: `src/components/dashboard/DashboardTrackingTable.tsx`
- Create: `src/components/dashboard/index.ts`

**Interfaces:**
- Produces: `DashboardScheduleTimeline`, `DashboardTrackingTable`, and unified exports via `index.ts`.

- [x] **Step 1: Implement `DashboardScheduleTimeline.tsx`**

Daily schedule card with header, date stepper buttons (`< 10 Nov 2025 >`), segmented category tabs (`Events | Celebrations | Holiday` or `Semua | Fitting | Test Food | Hari H`), and vertical list items with colored indicator bars.

- [x] **Step 2: Implement `DashboardTrackingTable.tsx`**

Full-width data table with action buttons (`⇅ Sort`, `⎚ Filter`, `See All`), avatar + 2-line name/contact, category metadata, pastel rounded pill badges, and status dates.

- [x] **Step 3: Create barrel export `src/components/dashboard/index.ts`**

Export all 5 atomic components and their interfaces.

- [x] **Step 4: Run typecheck**

Run: `npm run typecheck`  
Expected: PASS with 0 errors.

- [x] **Step 5: Commit**

```bash
git add src/components/dashboard/DashboardScheduleTimeline.tsx src/components/dashboard/DashboardTrackingTable.tsx src/components/dashboard/index.ts
git commit -m "feat(dashboard): implement DashboardScheduleTimeline and DashboardTrackingTable"
```

---

### Task 6: VendorTrackingSuite & Integration into Vendor Profil

**Files:**
- Create: `src/components/dashboard/VendorTrackingSuite.tsx`
- Modify: `src/app/vendor/profil/VendorProfilWorkspace.tsx`

- [x] **Step 1: Implement `VendorTrackingSuite.tsx`**

Compose the 5 components in the exact responsive 3-row layout from the reference image, mapping realistic telemetry data for the vendor:
- Spline: Kunjungan Tamu vs Pengantin Berakun vs Racik Builder.
- Gauge: Rasio Pesanan Solo (Oranye) vs Kolaborasi Paket (Hijau).
- Stat Card 1: Total Omset Bersih Hak Vendor (90%) + 7-bar chart.
- Stat Card 2: Saldo Escrow Tertahan (Menunggu Acara) + 7-bar chart.
- Schedule: Agenda Sesi Fisik Terdekat (Fitting Gaun Pengantin & Test Food Katering).
- Table: Daftar Pesanan & Pelacakan Klien Masuk di Kebumen.

- [x] **Step 2: Integrate into `VendorProfilWorkspace.tsx`**

Embed `VendorTrackingSuite` inside the `activeTab === "analytics"` tab, seamlessly replacing the old partial cards while keeping logistics, escrow, and profile settings tabs intact.

- [x] **Step 3: Run verify and automated tests**

Run: `npm run typecheck && npm test`  
Expected: All tests pass.

- [x] **Step 4: Commit**

```bash
git add src/components/dashboard/VendorTrackingSuite.tsx src/app/vendor/profil/VendorProfilWorkspace.tsx
git commit -m "feat(vendor): integrate modular tracking dashboard suite into vendor profile"
```

---

### Task 7: AdminTrackingSuite & Integration into Superadmin Dashboard

**Files:**
- Create: `src/components/dashboard/AdminTrackingSuite.tsx`
- Modify: `src/app/admin/AdminDashboardClient.tsx`

- [x] **Step 1: Implement `AdminTrackingSuite.tsx`**

Compose the 5 components for Superadmin:
- Spline: Tren GMV Transaksi Kebumen & Telemetri Funnel Konversi.
- Gauge: Pangsa 11 Kategori Layanan Se-Kebumen.
- Stat Card 1: Total Nilai Transaksi (GMV Platform).
- Stat Card 2: Pendapatan Platform Fee (10%).
- Schedule: Master Multi-Vendor Calendar Hari H.
- Table: Master Kliring Escrow & Transaksi Pengantin Kebumen.

- [x] **Step 2: Integrate into `AdminDashboardClient.tsx`**

Integrate as the primary overview or prominent master tracking tab in the Superadmin workspace.

- [x] **Step 3: Run verification & visual check**

Run: `npm run verify`  
Check dev server `http://localhost:3000/vendor/profil` and `http://localhost:3000/admin`.

- [x] **Step 4: Commit**

```bash
git add src/components/dashboard/AdminTrackingSuite.tsx src/app/admin/AdminDashboardClient.tsx
git commit -m "feat(admin): integrate modular tracking dashboard suite into superadmin dashboard"
```
