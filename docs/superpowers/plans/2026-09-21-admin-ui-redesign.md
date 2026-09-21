# Admin Panel Redesign + Platform Settings OTP Guard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesain seluruh panel Super Admin dengan layout SaaS + sidebar (font & warna dari design-system, ikon Lucide), pindahkan Pengaturan Platform menjadi item sidebar sederajat, tambahkan gembok edit berbasis OTP email (validasi di server), dan buat vendor membaca rincian komisi 10% dari `PlatformFeeComponent`.

**Architecture:** Tambah `src/app/admin/layout.tsx` (shell sidebar) + komponen bersama `src/components/admin/*`; refactor tiap halaman admin memakai komponen bersama tanpa mengubah logika data. Gembok OTP memakai `OtpCode` (purpose baru) + cookie httpOnly bertanda tangan (HMAC via `session-token`) dengan TTL; action tulis menolak save tanpa penanda valid. Vendor membaca komponen fee dari config admin.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Prisma (dual-provider SQLite dev + PostgreSQL prod), Tailwind + design-system HariKita, Lucide React, `node:test` via `tsx`.

**Spec:** `docs/superpowers/specs/2026-09-21-admin-ui-redesign-design.md`

## Global Constraints

- Font: `Manrope` (body, default di `globals.css`), `font-serif` = Playfair Display, `font-editorial` = Cormorant Garamond. **Dilarang** memakai `-apple-system`, `Segoe UI`, atau `Georgia` eksplisit di komponen baru.
- Warna: hanya token design-system — `hk-canvas`, `hk-ivory`, `hk-soft-beige`, `hk-charcoal`, `hk-taupe`, `hk-champagne`, `gold{light/DEFAULT/dark}`, `plum{light/DEFAULT/dark}`, `success/warning/error/info`. **Dilarang** hex ad-hoc.
- Ikon: **Lucide React** saja. **Dilarang** emoji di UI produksi.
- Tombol aksi `min-h-11` (44px). Fokus ring pakai kelas `focus-ring` yang sudah ada.
- **Jangan** mengubah cara ledger membagi uang (`executePayout` tak disentuh).
- **Jangan** mengubah logika data/aksi halaman admin saat redesign — hanya tampilan, kecuali Pengaturan Platform & fee vendor (disebut eksplisit).
- Dua schema Prisma (`prisma/schema.prisma` + `prisma/schema.sqlite.prisma`) wajib sinkron.
- Tulis platform settings tetap butuh `requireAdminCapability("MANAGE_PLATFORM_SETTINGS")` (SUPER_ADMIN).
- Verifikasi tiap akhir fase: `npm run typecheck` + `npm test` + `npm run build` hijau; tanpa horizontal overflow di 375px.
- Responsif: sidebar collapsible (drawer) di ≤860px.

## Fase & Urutan Task

- **Fase 0** — Fondasi komponen bersama + layout shell (Task 1–5).
- **Fase 1** — Redesign halaman (Task 6–9).
- **Fase 2** — Pengaturan Platform (layout + OTP guard + DB) (Task 10–13).
- **Fase 3** — Rincian fee vendor dari config (Task 14).

---

### Task 1: Komponen bersama — `AdminButton`, `AdminBadge`, `AdminCard`

**Files:**
- Create: `src/components/admin/AdminButton.tsx`
- Create: `src/components/admin/AdminBadge.tsx`
- Create: `src/components/admin/AdminCard.tsx`
- Create: `src/components/admin/index.ts`
- Test: `tests/admin-ui-components.test.ts`

**Interfaces:**
- Produces:
  - `AdminButton({ variant?: "primary"|"secondary"|"danger"|"ghost"; size?: "sm"|"md"; ...React.ButtonHTMLAttributes<HTMLButtonElement> })`
  - `AdminBadge({ tone: "ok"|"warn"|"error"|"info"|"neutral"; children })`
  - `AdminCard({ title?: string; description?: string; action?: React.ReactNode; children })`

- [ ] **Step 1: Write the failing test**

```ts
// tests/admin-ui-components.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const read = (p: string) => readFileSync(path.join(root, p), "utf-8");

test("AdminButton exposes variants and min-h-11", () => {
  const src = read("src/components/admin/AdminButton.tsx");
  assert.match(src, /variant/);
  assert.match(src, /min-h-11/);
  assert.match(src, /primary/);
  assert.match(src, /danger/);
});

test("AdminBadge maps tone to design-system tokens", () => {
  const src = read("src/components/admin/AdminBadge.tsx");
  assert.match(src, /success|ok/);
  assert.match(src, /warning|warn/);
  assert.match(src, /error/);
});

test("AdminCard renders title/description/action slots", () => {
  const src = read("src/components/admin/AdminCard.tsx");
  assert.match(src, /title/);
  assert.match(src, /description/);
  assert.match(src, /action/);
});
```

> Catatan: test ini memakai pola "source assertion" (memeriksa sumber) karena proyek belum punya React Testing Library. Bila test render React sudah tersedia, ganti dengan render test.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/admin-ui-components.test.ts`
Expected: FAIL — file belum ada (`ENOENT`).

- [ ] **Step 3: Create `AdminButton`**

```tsx
// src/components/admin/AdminButton.tsx
import React from "react";

export type AdminButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export interface AdminButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: "sm" | "md";
}

const VARIANT: Record<AdminButtonVariant, string> = {
  primary: "bg-gold text-plum-dark hover:bg-gold-dark border-transparent",
  secondary: "bg-white text-hk-charcoal border-hk-soft-beige hover:bg-hk-ivory",
  danger: "bg-white text-[color:#a2352f] border-[color:#f3c9c6] hover:bg-[#fdf2f1]",
  ghost: "bg-transparent text-hk-charcoal border-transparent hover:bg-hk-ivory",
};

export function AdminButton({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: AdminButtonProps) {
  const sizing = size === "sm" ? "px-3.5 min-h-9 text-xs" : "px-5 min-h-11 text-sm";
  return (
    <button
      {...props}
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-full border font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizing} ${VARIANT[variant]} ${className}`}
    />
  );
}
```

- [ ] **Step 4: Create `AdminBadge`**

```tsx
// src/components/admin/AdminBadge.tsx
import React from "react";

export type AdminBadgeTone = "ok" | "warn" | "error" | "info" | "neutral";

const TONE: Record<AdminBadgeTone, string> = {
  ok: "bg-[#e5f4ec] text-[#157a4d]",
  warn: "bg-[#fbf0d8] text-[#8a6410]",
  error: "bg-[#fdeceb] text-[#a2352f]",
  info: "bg-[#e6f4fd] text-[#0b6a95]",
  neutral: "bg-hk-ivory text-plum-light border border-hk-soft-beige",
};

export function AdminBadge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: AdminBadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${TONE[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 5: Create `AdminCard`**

```tsx
// src/components/admin/AdminCard.tsx
import React from "react";

export function AdminCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-hk-soft-beige bg-white shadow-xs ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hk-soft-beige px-5 py-4">
          <div>
            {title && <div className="text-[15px] font-bold text-hk-charcoal">{title}</div>}
            {description && <div className="mt-0.5 text-xs text-plum-light">{description}</div>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
```

- [ ] **Step 6: Create barrel `index.ts`**

```ts
// src/components/admin/index.ts
export * from "./AdminButton";
export * from "./AdminBadge";
export * from "./AdminCard";
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx tsx --test tests/admin-ui-components.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 8: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/components/admin tests/admin-ui-components.test.ts
git commit -m "feat(admin-ui): add shared AdminButton, AdminBadge, AdminCard components"
```

---

### Task 2: Komponen bersama — `AdminPageHeader`, `AdminStatCard`, `AdminTable`

**Files:**
- Create: `src/components/admin/AdminPageHeader.tsx`
- Create: `src/components/admin/AdminStatCard.tsx`
- Create: `src/components/admin/AdminTable.tsx`
- Modify: `src/components/admin/index.ts`
- Test: `tests/admin-ui-components.test.ts` (tambah)

**Interfaces:**
- Produces:
  - `AdminPageHeader({ title: string; description?: string; action?: React.ReactNode })`
  - `AdminStatCard({ label: string; value: string; delta?: string; deltaTone?: "ok"|"warn"|"error" })`
  - `AdminTable<T>({ columns: { key: string; header: string; className?: string }[]; rows: T[]; renderRow: (row: T) => React.ReactNode[]; empty?: React.ReactNode })`

- [ ] **Step 1: Write the failing test**

```ts
// tambahkan ke tests/admin-ui-components.test.ts
test("AdminPageHeader/StatCard/Table exist with expected props", () => {
  assert.match(read("src/components/admin/AdminPageHeader.tsx"), /title/);
  assert.match(read("src/components/admin/AdminStatCard.tsx"), /label/);
  const t = read("src/components/admin/AdminTable.tsx");
  assert.match(t, /columns/);
  assert.match(t, /renderRow/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/admin-ui-components.test.ts`
Expected: FAIL — `AdminPageHeader.tsx` belum ada.

- [ ] **Step 3: Create `AdminPageHeader`**

```tsx
// src/components/admin/AdminPageHeader.tsx
import React from "react";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="font-serif text-2xl font-bold text-hk-charcoal sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-xs text-plum-light sm:text-sm">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
```

- [ ] **Step 4: Create `AdminStatCard`**

```tsx
// src/components/admin/AdminStatCard.tsx
import React from "react";

const DELTA: Record<string, string> = {
  ok: "text-[#157a4d]",
  warn: "text-[#8a6410]",
  error: "text-[#a2352f]",
};

export function AdminStatCard({
  label,
  value,
  delta,
  deltaTone = "ok",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "ok" | "warn" | "error";
}) {
  return (
    <div className="rounded-2xl border border-hk-soft-beige bg-white p-5 shadow-xs">
      <div className="text-[11px] font-bold uppercase tracking-wide text-plum-light">{label}</div>
      <div className="mt-1.5 text-2xl font-extrabold text-hk-charcoal">{value}</div>
      {delta && <div className={`mt-1 text-[11px] font-bold ${DELTA[deltaTone]}`}>{delta}</div>}
    </div>
  );
}
```

- [ ] **Step 5: Create `AdminTable`**

```tsx
// src/components/admin/AdminTable.tsx
import React from "react";

export interface AdminColumn {
  key: string;
  header: string;
  className?: string;
}

export function AdminTable<T>({
  columns,
  rows,
  renderRow,
  empty,
}: {
  columns: AdminColumn[];
  rows: T[];
  renderRow: (row: T, index: number) => React.ReactNode[];
  empty?: React.ReactNode;
}) {
  if (rows.length === 0 && empty) return <>{empty}</>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`border-b border-hk-soft-beige px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-plum-light ${c.className ?? ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-hk-ivory">
              {renderRow(row, i).map((cell, j) => (
                <td key={j} className="border-b border-[#f2ede6] px-4 py-3.5 text-hk-charcoal last:border-b-0">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 6: Update barrel**

```ts
// src/components/admin/index.ts
export * from "./AdminButton";
export * from "./AdminBadge";
export * from "./AdminCard";
export * from "./AdminPageHeader";
export * from "./AdminStatCard";
export * from "./AdminTable";
```

- [ ] **Step 7: Run test + typecheck**

Run: `npx tsx --test tests/admin-ui-components.test.ts && npm run typecheck`
Expected: PASS keduanya.

- [ ] **Step 8: Commit**

```bash
git add src/components/admin tests/admin-ui-components.test.ts
git commit -m "feat(admin-ui): add AdminPageHeader, AdminStatCard, AdminTable"
```

---

### Task 3: Sidebar navigasi + layout shell admin

**Files:**
- Create: `src/app/admin/AdminSidebarNav.tsx`
- Create: `src/app/admin/layout.tsx`
- Test: `tests/admin-sidebar.test.ts`

**Interfaces:**
- Produces:
  - `ADMIN_NAV: Array<{ group: string; items: Array<{ label: string; href: string; icon: LucideIcon }> }>`
  - `AdminSidebarNav()` (client component) — nav aktif berdasar `usePathname()`, drawer mobile.

- [ ] **Step 1: Write the failing test**

```ts
// tests/admin-sidebar.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const nav = readFileSync(path.join(root, "src/app/admin/AdminSidebarNav.tsx"), "utf-8");

test("sidebar lists all admin routes incl. pengaturan sederajat", () => {
  for (const href of [
    "/admin",
    "/admin/verifikasi",
    "/admin/escrow",
    "/admin/dispute",
    "/admin/ba",
    "/admin/kalender",
    "/admin/audit-konten",
    "/admin/pengaturan",
  ]) {
    assert.ok(nav.includes(href), `missing ${href}`);
  }
});

test("sidebar uses lucide icons, no emoji", () => {
  assert.match(nav, /from "lucide-react"/);
  assert.doesNotMatch(nav, /[\u{1F300}-\u{1FAFF}]/u);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/admin-sidebar.test.ts`
Expected: FAIL — file belum ada.

- [ ] **Step 3: Create `AdminSidebarNav`**

```tsx
// src/app/admin/AdminSidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Landmark,
  Scale,
  Megaphone,
  CalendarDays,
  FileSearch,
  Settings,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}
interface NavGroup {
  group: string;
  items: NavItem[];
}

export const ADMIN_NAV: NavGroup[] = [
  {
    group: "Operasional",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Verifikasi Vendor", href: "/admin/verifikasi", icon: ShieldCheck },
      { label: "Kliring & Settlement", href: "/admin/escrow", icon: Landmark },
      { label: "Dispute", href: "/admin/dispute", icon: Scale },
    ],
  },
  {
    group: "Pertumbuhan",
    items: [
      { label: "Brand Ambassador", href: "/admin/ba", icon: Megaphone },
      { label: "Kalender", href: "/admin/kalender", icon: CalendarDays },
      { label: "Audit Konten", href: "/admin/audit-konten", icon: FileSearch },
    ],
  },
  {
    group: "Konfigurasi",
    items: [{ label: "Pengaturan Platform", href: "/admin/pengaturan", icon: Settings }],
  },
];

export function AdminSidebarNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
      {ADMIN_NAV.map((g) => (
        <div key={g.group}>
          <div className="px-3 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
            {g.group}
          </div>
          {g.items.map((it) => {
            const active = it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href);
            const Icon = it.icon;
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${
                  active
                    ? "bg-gold/25 font-bold text-gold-light"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Tombol hamburger (mobile) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka menu admin"
        className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-xl border border-hk-soft-beige bg-white text-hk-charcoal lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col bg-plum-dark p-3.5 lg:flex">
        <SidebarBrand />
        {nav}
      </aside>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-plum-dark p-3.5">
            <div className="flex items-center justify-between">
              <SidebarBrand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu admin"
                className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-2.5 px-2.5 pb-4 pt-1.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gold-light to-gold-dark font-extrabold text-plum-dark">
        H
      </div>
      <div>
        <div className="text-sm font-bold text-white">HariKita</div>
        <div className="text-[10px] uppercase tracking-[0.12em] text-gold-light">Super Admin</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `layout.tsx`**

```tsx
// src/app/admin/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminSidebarNav } from "./AdminSidebarNav";

export const metadata: Metadata = {
  title: "Super Admin — HariKita",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-hk-canvas">
      <AdminSidebarNav />
      <div className="min-w-0 flex-1">
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test + typecheck + build**

Run: `npx tsx --test tests/admin-sidebar.test.ts && npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/layout.tsx src/app/admin/AdminSidebarNav.tsx tests/admin-sidebar.test.ts
git commit -m "feat(admin-ui): add admin sidebar nav + layout shell"
```

> Catatan: `AdminDashboardClient` saat ini merender header-nya sendiri; pada Task 4 kita sederhanakan agar tidak duplikat dengan shell. Untuk sementara layout tetap valid.

---

### Task 4: Redesign dashboard `/admin`

**Files:**
- Modify: `src/app/admin/AdminDashboardClient.tsx`
- Modify: `src/app/admin/page.tsx` (bila perlu)

**Interfaces:**
- Consumes: `AdminPageHeader`, `AdminStatCard`, `AdminCard` (Task 1–2); `AdminTrackingSuite`.
- Produces: dashboard memakai shell; tab lama → section dalam satu halaman.

- [ ] **Step 1: Refactor header & hilangkan link pengaturan lama**

Di `src/app/admin/AdminDashboardClient.tsx`: hapus blok header lama (baris `min-h-screen py-12 ...` pembuka + header + tombol "Pengaturan Platform" + notice) karena header kini dari shell. Struktur baru:

```tsx
"use client";

import React from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { AdminPageHeader, AdminStatCard, AdminCard } from "@/components/admin";
import { AdminTrackingSuite } from "@/components/dashboard";
import type { AdminCalendarEventDTO } from "@/server/queries/orders";

export interface FunnelStepVM {
  step: number;
  name: string;
  count: number;
  pct: string;
  rawEvent: string;
}

export interface AdminDashboardClientProps {
  funnelSteps: FunnelStepVM[];
  calendarEvents: AdminCalendarEventDTO[];
  escrow: {
    orders: Array<{
      id: string;
      orderNumber: string;
      clientName: string;
      status: string;
      totalAmount: number;
      eventDate: string;
      itemCount: number;
    }>;
    journalCount: number;
    totalDebit: number;
    totalCredit: number;
  } | null;
  gmv: number;
  isAdmin: boolean;
}

export function AdminDashboardClient({
  funnelSteps,
  calendarEvents,
  escrow,
  gmv,
  isAdmin,
}: AdminDashboardClientProps) {
  const totalOrders = escrow?.orders.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Master Kontrol HariKita"
        description="Funnel konversi, jadwal multi-vendor, dan kliring escrow Kebumen."
      />

      {!isAdmin && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-[#f0dcae] bg-[#fbf0d8] p-4 text-xs text-[#7a5608]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Anda belum masuk sebagai Super Admin — sebagian data mungkin kosong.{" "}
            <Link href="/auth/login/admin" className="font-semibold underline">
              Masuk sebagai Admin
            </Link>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total GMV" value={formatRupiah(gmv)} />
        <AdminStatCard label="Order dalam Escrow" value={String(totalOrders)} />
        <AdminStatCard
          label="Vendor Pending"
          value={String(calendarEvents.reduce((a, e) => a + e.vendorsCount, 0))}
          delta="perlu review"
          deltaTone="warn"
        />
        <AdminStatCard
          label="Jurnal Ledger"
          value={String(escrow?.journalCount ?? 0)}
        />
      </div>

      <AdminCard title="Master Tracking & Eksekutif" description="Ringkasan operasional dan metrik.">
        <AdminTrackingSuite
          funnelSteps={funnelSteps}
          calendarEvents={calendarEvents}
          escrow={escrow}
          gmv={gmv}
        />
      </AdminCard>
    </div>
  );
}
```

> Pertahankan seluruh logika data yang ada; hanya struktur visual yang berubah. Jika `AdminTrackingSuite` sudah menyajikan funnel/kalender/escrow, tidak perlu tab manual.

- [ ] **Step 2: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 3: Verifikasi visual**

Buka `http://localhost:3000/admin` (setelah login admin). Cek: sidebar tampil; tidak ada duplikasi header; tidak ada horizontal overflow di 375px.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/AdminDashboardClient.tsx
git commit -m "feat(admin-ui): redesign admin dashboard inside shell"
```

---

### Task 5: Redesign halaman admin lain dengan komponen bersama

**Files:**
- Modify: `src/app/admin/verifikasi/AdminVerifikasiClient.tsx`
- Modify: `src/app/admin/escrow/AdminEscrowClient.tsx`
- Modify: `src/app/admin/dispute/AdminDisputeClient.tsx`
- Modify: `src/app/admin/ba/AdminBaClient.tsx`
- Modify: `src/app/admin/kalender/AdminKalenderClient.tsx`
- Modify: `src/app/admin/audit-konten/AdminAuditKontenClient.tsx`

**Interfaces:**
- Consumes: `AdminPageHeader`, `AdminCard`, `AdminTable`, `AdminBadge`, `AdminButton` (Task 1–2).

> Tugas ini **tidak mengubah logika data/aksi**. Hanya: bungkus konten dengan `AdminPageHeader` + `AdminCard`, ganti tabel manual → `AdminTable` bila strukturnya cocok, ganti badge status → `AdminBadge`. Jika struktur tabel sangat spesifik, boleh tetap `<table>` tapi styling diseragamkan dengan token design-system.

- [ ] **Step 1: Ganti header tiap halaman**

Untuk tiap file di atas, tambahkan import & bungkus:

```tsx
import { AdminPageHeader, AdminCard } from "@/components/admin";
// ...
return (
  <div className="flex flex-col gap-6">
    <AdminPageHeader title="<Judul halaman>" description="<deskripsi singkat>" />
    <AdminCard title="<judul kartu>">{/* konten existing */}</AdminCard>
  </div>
);
```

Judul per halaman:
- verifikasi → "Verifikasi Vendor"
- escrow → "Kliring & Settlement Rekening Bersama"
- dispute → "Resolution Center — Dispute"
- ba → "Brand Ambassador"
- kalender → "Kalender Multi-Vendor Se-Kebumen"
- audit-konten → "Audit Konten"

- [ ] **Step 2: Ganti badge status → `AdminBadge`**

Contoh pemetaan:
```tsx
import { AdminBadge } from "@/components/admin";
// PENDING -> <AdminBadge tone="warn">Pending</AdminBadge>
// APPROVED -> <AdminBadge tone="ok">Approved</AdminBadge>
// REJECTED -> <AdminBadge tone="error">Rejected</AdminBadge>
```

- [ ] **Step 3: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 4: Verifikasi visual**

Cek tiap halaman (desktop + 375px). Tidak ada horizontal overflow; header & kartu konsisten; ikon Lucide (bukan emoji).

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/verifikasi src/app/admin/escrow src/app/admin/dispute src/app/admin/ba src/app/admin/kalender src/app/admin/audit-konten
git commit -m "feat(admin-ui): redesign remaining admin pages with shared components"
```

---

### Task 6: Skema — kolom `PlatformSetting.superAdminEmail`

**Files:**
- Modify: `prisma/schema.prisma` (model `PlatformSetting`)
- Modify: `prisma/schema.sqlite.prisma`
- Test: verifikasi via prisma validate/push

- [ ] **Step 1: Backup dev.db**

Run: `copy prisma\dev.db prisma\dev.db.bak`
Expected: file backup dibuat (lewati bila tidak ada dev.db).

- [ ] **Step 2: Tambah kolom di kedua schema**

Pada `model PlatformSetting`, setelah `defaultBaCommissionPct`, tambah:
```prisma
  superAdminEmail        String?   // tujuan OTP gembok edit; null = belum diatur
```
Terapkan identik di `prisma/schema.prisma` dan `prisma/schema.sqlite.prisma`.

- [ ] **Step 3: Validasi kedua schema**

Run:
```bash
npx prisma validate --schema prisma/schema.prisma
npx prisma validate --schema prisma/schema.sqlite.prisma
```
Expected: keduanya `is valid`.

- [ ] **Step 4: Generate + push ke SQLite**

Run:
```bash
npm run generate
npm run generate:sqlite
$env:DATABASE_URL="file:" + ((Resolve-Path "prisma\dev.db").Path -replace '\\','/'); npx prisma db push --schema prisma/schema.sqlite.prisma --skip-generate
```
Expected: client ter-generate; db push sukses.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/schema.sqlite.prisma prisma/dev.db
git commit -m "feat(settings): add PlatformSetting.superAdminEmail column"
```

---

### Task 7: Service — dukung `superAdminEmail` + update

**Files:**
- Modify: `src/server/services/platform-settings-service.ts`
- Test: `tests/platform-settings.test.ts` (tambah)

**Interfaces:**
- Produces: `PlatformSettingsView` bertambah `superAdminEmail: string | null`; `updatePlatformSettings` menulis kolom tsb.

- [ ] **Step 1: Write the failing test**

```ts
// tambahkan ke tests/platform-settings.test.ts
test("updatePlatformSettings persists superAdminEmail", async () => {
  const actor = { userId: "u_super", name: "Super", subRole: "SUPER_ADMIN" as const };
  const saved = await updatePlatformSettings(
    {
      dpPct: 30, settlementPct: 70, platformFeePct: 10, defaultBaCommissionPct: 5,
      superAdminEmail: "owner@harikita.id",
      components: [{ id: "", label: "Operasional", pct: 10, sortOrder: 0 }],
      actor,
    },
    ctx.prisma
  );
  assert.equal(saved.superAdminEmail, "owner@harikita.id");

  await ctx.prisma.platformFeeComponent.deleteMany();
  await ctx.prisma.platformSetting.deleteMany();
  await ctx.prisma.adminAuditLog.deleteMany({ where: { action: "PLATFORM_SETTINGS_UPDATED" } });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/platform-settings.test.ts`
Expected: FAIL — `superAdminEmail` tak ada di tipe.

- [ ] **Step 3: Update service**

Di `PlatformSettingsView` tambah `superAdminEmail: string | null;`.

Di `DEFAULT_PLATFORM_SETTINGS` tambah `superAdminEmail: null,`.

Di `getPlatformSettings` return tambah `superAdminEmail: row.superAdminEmail,` (dan pada fallback default sudah `null`).

Di `updatePlatformSettings` `db.platformSetting.update({ data })` tambah `superAdminEmail: input.superAdminEmail ?? null,`.

- [ ] **Step 4: Run test + typecheck**

Run: `npx tsx --test tests/platform-settings.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/server/services/platform-settings-service.ts tests/platform-settings.test.ts
git commit -m "feat(settings): support superAdminEmail in platform settings service"
```

---

### Task 8: Error code + capability penanda edit

**Files:**
- Modify: `src/types/errors.ts`
- Modify: `src/server/services/errors.ts`
- Test: `tests/platform-settings.test.ts` (tambah)

**Interfaces:**
- Produces: `ADMIN_EDIT_NOT_UNLOCKED` di grup `SETTINGS_ERROR_CODES`.

- [ ] **Step 1: Write the failing test**

```ts
// tambahkan ke tests/platform-settings.test.ts
test("SETTINGS_ERROR_CODES includes ADMIN_EDIT_NOT_UNLOCKED", async () => {
  const { SETTINGS_ERROR_CODES } = await import("../src/types/errors");
  assert.ok(SETTINGS_ERROR_CODES.includes("ADMIN_EDIT_NOT_UNLOCKED"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/platform-settings.test.ts`
Expected: FAIL.

- [ ] **Step 3: Tambah error code**

Di `src/types/errors.ts`:
```ts
export const SETTINGS_ERROR_CODES = [
  'INVALID_PLATFORM_SETTINGS',
  'ADMIN_EDIT_NOT_UNLOCKED',
] as const;
```
(`SettingsErrorCode` & union otomatis ikut karena sudah derived.)
Pastikan `SettingsErrorCode` tetap masuk `AppDomainErrorCode` (sudah dari pekerjaan sebelumnya) dan `AnyDomainErrorCode` (`src/server/services/errors.ts`).

- [ ] **Step 4: Run test + typecheck**

Run: `npx tsx --test tests/platform-settings.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/errors.ts src/server/services/errors.ts tests/platform-settings.test.ts
git commit -m "feat(settings): add ADMIN_EDIT_NOT_UNLOCKED error code"
```

---

### Task 9: Penanda "OTP-verified" (cookie httpOnly bertanda tangan) + service unlock

**Files:**
- Create: `src/server/auth/admin-edit-unlock.ts`
- Test: `tests/admin-edit-unlock.test.ts`

**Interfaces:**
- Produces:
  - `UNLOCK_TTL_MINUTES = 10`
  - `signUnlockToken(adminId: string, now?: Date): Promise<string>`
  - `verifyUnlockToken(token: string | undefined, now?: Date): Promise<{ adminId: string } | null>`
  - cookie name: `hk_admin_unlock`
  - `setAdminUnlockCookie(adminId)`, `clearAdminUnlockCookie()`, `isAdminEditUnlocked(adminId)` (async; baca cookie)

- [ ] **Step 1: Write the failing test**

```ts
// tests/admin-edit-unlock.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

process.env.HARIKITA_SESSION_SECRET = "test-secret-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

test("sign then verify unlock token round-trips", async () => {
  const { signUnlockToken, verifyUnlockToken } = await import("../src/server/auth/admin-edit-unlock");
  const token = await signUnlockToken("admin-1");
  const res = await verifyUnlockToken(token);
  assert.equal(res?.adminId, "admin-1");
});

test("expired token fails", async () => {
  const { signUnlockToken, verifyUnlockToken, UNLOCK_TTL_MINUTES } = await import(
    "../src/server/auth/admin-edit-unlock"
  );
  const past = new Date(Date.now() - (UNLOCK_TTL_MINUTES + 1) * 60 * 1000);
  const token = await signUnlockToken("admin-1", past);
  assert.equal(await verifyUnlockToken(token), null);
});

test("garbage token returns null (never throws)", async () => {
  const { verifyUnlockToken } = await import("../src/server/auth/admin-edit-unlock");
  assert.equal(await verifyUnlockToken("not-a-token"), null);
  assert.equal(await verifyUnlockToken(undefined), null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/admin-edit-unlock.test.ts`
Expected: FAIL — modul belum ada.

- [ ] **Step 3: Implementasi `admin-edit-unlock.ts`**

```ts
// src/server/auth/admin-edit-unlock.ts
/**
 * Penanda "mode edit terbuka" untuk Platform Settings setelah verifikasi OTP.
 * Token HMAC bertanda tangan (memakai HARIKITA_SESSION_SECRET), disimpan di
 * cookie httpOnly. Tidak pernah throw saat verifikasi.
 */
import { cookies } from "next/headers";
import { hmacBase64url } from "@/lib/session-token";

export const UNLOCK_TTL_MINUTES = 10;
export const UNLOCK_COOKIE = "hk_admin_unlock";

interface UnlockPayload {
  adminId: string;
  exp: number; // epoch ms
}

function b64url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function unb64url(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export async function signUnlockToken(adminId: string, now: Date = new Date()): Promise<string> {
  const payload: UnlockPayload = { adminId, exp: now.getTime() + UNLOCK_TTL_MINUTES * 60 * 1000 };
  const body = b64url(JSON.stringify(payload));
  const sig = await hmacBase64url(body);
  return `u1.${body}.${sig}`;
}

export async function verifyUnlockToken(
  token: string | undefined,
  now: Date = new Date()
): Promise<{ adminId: string } | null> {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || parts[0] !== "u1") return null;
    const [, body, sig] = parts;
    const expected = await hmacBase64url(body);
    if (expected !== sig) return null;
    const payload = JSON.parse(unb64url(body)) as UnlockPayload;
    if (typeof payload.adminId !== "string" || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return { adminId: payload.adminId };
  } catch {
    return null;
  }
}

export async function setAdminUnlockCookie(adminId: string): Promise<void> {
  const token = await signUnlockToken(adminId);
  const store = await cookies();
  store.set(UNLOCK_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UNLOCK_TTL_MINUTES * 60,
  });
}

export async function clearAdminUnlockCookie(): Promise<void> {
  const store = await cookies();
  store.delete(UNLOCK_COOKIE);
}

export async function isAdminEditUnlocked(adminId: string): Promise<boolean> {
  const store = await cookies();
  const token = store.get(UNLOCK_COOKIE)?.value;
  const res = await verifyUnlockToken(token);
  return res?.adminId === adminId;
}
```

> Pastikan `hmacBase64url` diekspor dari `src/lib/session-token.ts`. Bila belum, tambahkan `export` pada fungsi itu (perubahan kecil, ikut commit ini).

- [ ] **Step 4: Verify `hmacBase64url` exported**

Run: `Select-String -Path src/lib/session-token.ts -Pattern "export.*hmacBase64url"`
Jika tidak ada `export`, ubah deklarasinya menjadi `export async function hmacBase64url(...)`.

- [ ] **Step 5: Run test + typecheck**

Run: `npx tsx --test tests/admin-edit-unlock.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/server/auth/admin-edit-unlock.ts src/lib/session-token.ts tests/admin-edit-unlock.test.ts
git commit -m "feat(settings): signed admin-edit unlock token (hmac cookie)"
```

---

### Task 10: Aksi OTP — kirim kode & verifikasi untuk membuka edit

**Files:**
- Modify: `src/server/services/otp-service.ts` (tambah purpose `ADMIN_EDIT_UNLOCK`) — bila union purpose tertutup
- Create: `src/server/actions/platform-settings-unlock.ts`
- Test: `tests/platform-settings.test.ts` (tambah, bagian token via service-level)

**Interfaces:**
- Produces:
  - `requestPlatformEditOtpAction(): Promise<ActionResult<{ sent: boolean; devHint?: string }>>`
  - `verifyPlatformEditOtpAction(input: { code: string }): Promise<ActionResult<{ unlocked: boolean }>>`
- Consumes: `getPlatformSettings` (untuk `superAdminEmail`), `issueOtp`/`verifyOtp`, `requireAdminCapability("MANAGE_PLATFORM_SETTINGS")`, `setAdminUnlockCookie`.

> **Fase 2 aktif.** Bila `RESEND_API_KEY` belum ada, `sendOtpEmail` mengembalikan `{ sent: false }`; action mengembalikan pesan yang jelas. UI tetap menampilkan error yang ramah.

- [ ] **Step 1: Cek tipe purpose OTP**

Run: `Select-String -Path src/server/services/otp-service.ts -Pattern "OtpPurpose|purpose"`
Tentukan apakah `purpose` bertipe union tertutup. Jika ya, tambah `"ADMIN_EDIT_UNLOCK"` ke tipe union tersebut dan ke tipe `OtpCode.purpose` bila divalidasi.

- [ ] **Step 2: Write the failing test**

```ts
// tambahkan ke tests/platform-settings.test.ts
test("unlock token issued for admin id can be verified", async () => {
  const { signUnlockToken, verifyUnlockToken } = await import("../src/server/auth/admin-edit-unlock");
  const t = await signUnlockToken("admin-x");
  assert.deepEqual(await verifyUnlockToken(t), { adminId: "admin-x" });
});
```

- [ ] **Step 3: Create action file**

```ts
// src/server/actions/platform-settings-unlock.ts
"use server";

import { requireAdminCapability } from "@/server/auth/admin-guard";
import { getPlatformSettings } from "@/server/services/platform-settings-service";
import { issueOtp, verifyOtp } from "@/server/services/otp-service";
import { sendOtpEmail } from "@/server/services/email-service";
import {
  setAdminUnlockCookie,
  clearAdminUnlockCookie,
} from "@/server/auth/admin-edit-unlock";
import { runAction, type ActionResult } from "./_shared";
import { DomainError } from "@/server/services/errors";

const OTP_PURPOSE = "ADMIN_EDIT_UNLOCK" as const;

export async function requestPlatformEditOtpAction(): Promise<
  ActionResult<{ sent: boolean }>
> {
  return runAction(async () => {
    await requireAdminCapability("MANAGE_PLATFORM_SETTINGS");
    const settings = await getPlatformSettings();
    const email = settings.superAdminEmail;
    if (!email) {
      throw new DomainError(
        "INVALID_PLATFORM_SETTINGS",
        "Email Super Admin belum diatur di Pengaturan Platform."
      );
    }
    const { code } = await issueOtp(email, OTP_PURPOSE);
    const res = await sendOtpEmail(email, code, OTP_PURPOSE);
    if (!res.sent) {
      throw new DomainError(
        "EMAIL_SEND_FAILED",
        "Kode dibuat tetapi email gagal dikirim. Periksa konfigurasi email."
      );
    }
    return { sent: true };
  });
}

export async function verifyPlatformEditOtpAction(input: {
  code: string;
}): Promise<ActionResult<{ unlocked: boolean }>> {
  return runAction(async () => {
    const actor = await requireAdminCapability("MANAGE_PLATFORM_SETTINGS");
    const settings = await getPlatformSettings();
    const email = settings.superAdminEmail;
    if (!email) {
      throw new DomainError("INVALID_PLATFORM_SETTINGS", "Email Super Admin belum diatur.");
    }
    await verifyOtp(email, input.code, OTP_PURPOSE);
    await setAdminUnlockCookie(actor.userId);
    return { unlocked: true };
  });
}

export async function lockPlatformEditAction(): Promise<ActionResult<{ locked: boolean }>> {
  return runAction(async () => {
    await requireAdminCapability("MANAGE_PLATFORM_SETTINGS");
    await clearAdminUnlockCookie();
    return { locked: true };
  });
}
```

> Verifikasi signature `issueOtp`/`verifyOtp`/`sendOtpEmail` di codebase; sesuaikan argumen bila berbeda (mis. `sendOtpEmail(to, code, purpose)` vs `(to, code)`). Jangan mengarang — sesuaikan dengan definisi aktual.

- [ ] **Step 4: Run test + typecheck**

Run: `npx tsx --test tests/platform-settings.test.ts && npm run typecheck`
Expected: PASS (typecheck memastikan signature benar).

- [ ] **Step 5: Commit**

```bash
git add src/server/actions/platform-settings-unlock.ts src/server/services/otp-service.ts tests/platform-settings.test.ts
git commit -m "feat(settings): OTP request/verify actions to unlock platform edit"
```

---

### Task 11: Guard penanda di `updatePlatformSettingsAction`

**Files:**
- Modify: `src/server/actions/platform-settings.ts`
- Test: `tests/platform-settings.test.ts` (tambah; uji service-level guard helper)

**Interfaces:**
- Consumes: `isAdminEditUnlocked` (Task 9), `clearAdminUnlockCookie` (Task 9).
- Produces: action menolak save bila tidak unlocked; setelah sukses, cookie unlock dihapus (kembali terkunci).

- [ ] **Step 1: Write the failing test (guard helper)**

```ts
// tambahkan ke tests/platform-settings.test.ts
test("isAdminEditUnlocked contract: returns false for mismatched admin", async () => {
  const { verifyUnlockToken, signUnlockToken } = await import("../src/server/auth/admin-edit-unlock");
  const t = await signUnlockToken("admin-a");
  const res = await verifyUnlockToken(t);
  assert.notEqual(res?.adminId, "admin-b");
});
```

- [ ] **Step 2: Update action**

Di `src/server/actions/platform-settings.ts`, di dalam `runAction` setelah `requireAdminCapability`:

```ts
import { isAdminEditUnlocked, clearAdminUnlockCookie } from "@/server/auth/admin-edit-unlock";
// ...
const actor = await requireAdminCapability("MANAGE_PLATFORM_SETTINGS");
if (!(await isAdminEditUnlocked(actor.userId))) {
  throw new DomainError(
    "ADMIN_EDIT_NOT_UNLOCKED",
    "Mode edit terkunci. Kirim & verifikasi kode OTP terlebih dahulu."
  );
}
// ...save...
await clearAdminUnlockCookie();
return saved;
```

Tambah `import { DomainError } from "@/server/services/errors";` bila belum ada.

- [ ] **Step 3: Run test + typecheck + full test**

Run: `npx tsx --test tests/platform-settings.test.ts && npm run typecheck && npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/server/actions/platform-settings.ts tests/platform-settings.test.ts
git commit -m "feat(settings): enforce admin-edit unlock guard on save"
```

---

### Task 12: UI Pengaturan Platform — layout 2 kolom + OTP/Edit/Simpan

**Files:**
- Modify: `src/app/admin/pengaturan/page.tsx` (teruskan `settings` + status unlocked)
- Modify: `src/app/admin/pengaturan/AdminPengaturanClient.tsx`

**Interfaces:**
- Consumes: `updatePlatformSettingsAction`, `requestPlatformEditOtpAction`, `verifyPlatformEditOtpAction`, `lockPlatformEditAction`, `getPlatformSettingsForAdmin`; `AdminPageHeader`, `AdminCard`, `AdminButton`, `AdminBadge`.
- Produces: UI sesuai mockup `docs/mockups/admin/admin-panel-mockup.html`.

- [ ] **Step 1: Server page — sediakan status unlocked**

Di `src/app/admin/pengaturan/page.tsx`, setelah ambil `settings`, tentukan unlocked (butuh actor id). Gunakan `getSession()` + `isAdminEditUnlocked(session.userId)`:

```tsx
import { getSession } from "@/lib/session";
import { isAdminEditUnlocked } from "@/server/auth/admin-edit-unlock";
// ...
const session = await getSession();
const unlocked = session ? await isAdminEditUnlocked(session.userId) : false;
return <AdminPengaturanClient initial={settings} unlocked={unlocked} />;
```

- [ ] **Step 2: Client — layout 2 kolom + state mode**

Terapkan struktur mockup: header `AdminPageHeader` dengan aksi `Kirim Kode OTP` + badge `🔒 Terkunci`/`Terbuka` (pakai Lucide `Lock`/`Unlock`, bukan emoji); dua kolom (`grid lg:grid-cols-[1fr_1.15fr]`) — kiri Persentase Finansial (label↔input pendek), kanan Rincian Fee (`AdminTable`); footer `Edit` (ghost) + `Simpan` (primary) sejajar.

Perilaku:
- `unlocked=false` → semua input `readOnly`, `Simpan` disabled, `Edit` disabled.
- Klik `Kirim Kode OTP` → panggil `requestPlatformEditOtpAction()` → tampilkan modal input OTP (6 digit).
- Submit modal → `verifyPlatformEditOtpAction({ code })` → sukses → set `unlocked=true`, tutup modal.
- Klik `Edit` → (bila unlocked) aktifkan input.
- Klik `Simpan` → `updatePlatformSettingsAction(...)` → sukses → set `unlocked=false`, tampilkan toast "Tersimpan".
- `+ Tambah Komponen` / `Hapus` hanya aktif saat unlocked.
- Validasi klien: total komponen = platformFeePct; DP+pelunasan = 100 (tampilkan pesan inline).

Struktur inti (contoh, sesuaikan dengan pola existing):

```tsx
"use client";
import { useState } from "react";
import { Lock, Unlock, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminPageHeader, AdminCard, AdminButton, AdminBadge } from "@/components/admin";
import {
  updatePlatformSettingsAction,
} from "@/server/actions/platform-settings";
import {
  requestPlatformEditOtpAction,
  verifyPlatformEditOtpAction,
  lockPlatformEditAction,
} from "@/server/actions/platform-settings-unlock";
import type { PlatformSettingsView } from "@/server/services/platform-settings-service";

export function AdminPengaturanClient({
  initial,
  unlocked: initialUnlocked,
}: {
  initial: PlatformSettingsView;
  unlocked: boolean;
}) {
  const [unlocked, setUnlocked] = useState(initialUnlocked);
  const [form, setForm] = useState(initial);
  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const feeTotal = form.components.reduce((a, c) => a + c.pct, 0);

  async function requestOtp() {
    setBusy(true); setMsg(null);
    const res = await requestPlatformEditOtpAction();
    setBusy(false);
    if (res.success) setOtpModal(true);
    else setMsg(res.message);
  }

  async function submitOtp() {
    setBusy(true); setMsg(null);
    const res = await verifyPlatformEditOtpAction({ code: otp });
    setBusy(false);
    if (res.success) { setUnlocked(true); setOtpModal(false); setOtp(""); }
    else setMsg(res.message);
  }

  async function save() {
    setBusy(true); setMsg(null);
    const res = await updatePlatformSettingsAction({
      dpPct: form.dpPct, settlementPct: form.settlementPct,
      platformFeePct: form.platformFeePct, defaultBaCommissionPct: form.defaultBaCommissionPct,
      superAdminEmail: form.superAdminEmail,
      components: form.components.map((c, i) => ({ id: c.id, label: c.label, pct: c.pct, sortOrder: i })),
    });
    setBusy(false);
    if (res.success) { setForm(res.data); setUnlocked(false); setMsg("Tersimpan."); }
    else setMsg(res.message);
  }

  // render: AdminPageHeader(action= badge + tombol Kirim OTP),
  //         grid 2 kolom, footer tombol Edit + Simpan.
  // (Implementasi JSX penuh mengikuti mockup.)
}
```

> Catatan: `updatePlatformSettingsAction` perlu memperluas `input` agar menerima `superAdminEmail` (Task 7 sudah menambah tipe service; tambahkan ke signature action `Omit<PlatformSettingsView,"components"> & {...}`).

- [ ] **Step 3: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 4: Verifikasi visual manual**

Login admin → `/admin/pengaturan`. Cek: read-only default; klik Kirim OTP → modal; (bila email terkonfigurasi) alur verifikasi; layout 2 kolom rapi; mobile tanpa overflow.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/pengaturan
git commit -m "feat(settings): redesign platform settings UI with OTP-gated edit"
```

---

### Task 13: Seed — email Super Admin + komponen default

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Set `superAdminEmail` + komponen saat seed**

Di blok pembuatan `platformSetting`, tambahkan `superAdminEmail: adminUser.email` (mis. `admin@harikita.id`). Pastikan komponen seed mencerminkan struktur yang diharapkan (mis. Operasional/Marketing/Cadangan).

- [ ] **Step 2: Jalankan seed ke SQLite**

Run:
```bash
$env:DATABASE_URL="file:" + ((Resolve-Path "prisma\dev.db").Path -replace '\\','/'); npm run db:seed
```
Expected: sukses.

- [ ] **Step 3: Commit**

```bash
git add prisma/seed.ts prisma/dev.db
git commit -m "feat(settings): seed super admin email for OTP edit lock"
```

---

### Task 14: Vendor membaca rincian fee dari config

**Files:**
- Modify: `src/server/queries/vendor.ts` (tambah pengambilan komponen fee)
- Modify: `src/app/dashboard/vendor/paket/page.tsx`
- Modify: `src/app/dashboard/vendor/paket/VendorPaketClient.tsx`
- Test: `tests/platform-settings.test.ts` (tambah)

**Interfaces:**
- Produces: `getPlatformFeeBreakdown(): Promise<Array<{ label: string; pct: number }>>` (read-only; fallback default).

- [ ] **Step 1: Write the failing test**

```ts
// tambahkan ke tests/platform-settings.test.ts
test("getPlatformFeeComponents falls back to default when empty", async () => {
  const { getPlatformSettings } = await import("../src/server/services/platform-settings-service");
  const s = await getPlatformSettings(ctx.prisma);
  assert.ok(Array.isArray(s.components));
});
```

> Test di atas menjaga kontrak dasar; perilaku query diuji lewat typecheck + verifikasi visual (karena query butuh sesi vendor).

- [ ] **Step 2: Tambah query komponen fee**

Di `src/server/queries/vendor.ts`:

```ts
import { getPlatformSettings } from "@/server/services/platform-settings-service";

export async function getPlatformFeeBreakdown(): Promise<
  Array<{ label: string; pct: number }>
> {
  const s = await getPlatformSettings();
  return s.components.map((c) => ({ label: c.label, pct: c.pct }));
}
```

- [ ] **Step 3: Teruskan ke client**

Di `paket/page.tsx`:
```tsx
import { getPlatformFeeBreakdown } from "@/server/queries/vendor";
// ...
const feeBreakdown = await getPlatformFeeBreakdown();
return <VendorPaketClient dbPackages={dbPackages} vendorResolved={Boolean(vendor)} feeBreakdown={feeBreakdown} />;
```

- [ ] **Step 4: Pakai di `VendorPaketClient`**

Tambah prop `feeBreakdown: Array<{ label: string; pct: number }>`. Pada dropdown "Alokasi Komisi 10%", **ganti** baris hardcode (Server Cloud, dll) dengan map `feeBreakdown`:

```tsx
{feeBreakdown.map((c) => (
  <div key={c.label} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 p-1.5 rounded-lg hover:bg-hk-canvas transition-colors">
    <span className="flex items-center gap-2 text-plum min-w-0">
      <ShieldCheck className="w-3.5 h-3.5 text-champagne shrink-0" />
      <span className="whitespace-nowrap">{c.label}</span>
    </span>
    <span className="w-10 text-center font-mono text-[10.5px] text-plum-light shrink-0">{c.pct}%</span>
    <span className="font-mono text-[11px] font-semibold text-plum text-right shrink-0">
      {formatRupiah(Math.round((pkg.basePrice * c.pct) / 100))}
    </span>
  </div>
))}
```

Hapus import ikon & baris hardcode yang tak dipakai lagi (`Server`, `Headphones`, dsb) bila sudah tidak terpakai.

- [ ] **Step 5: Typecheck + test + build**

Run: `npm run typecheck && npm test && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/server/queries/vendor.ts src/app/dashboard/vendor/paket
git commit -m "feat(vendor): read platform fee breakdown from admin config"
```

---

## Verifikasi Akhir (setelah semua task)

- [ ] `npx prisma validate --schema prisma/schema.prisma` → valid
- [ ] `npx prisma validate --schema prisma/schema.sqlite.prisma` → valid
- [ ] `npm run typecheck` → PASS
- [ ] `npm test` → PASS
- [ ] `npm run build` → PASS
- [ ] Visual: tiap halaman admin (desktop + 375px) tanpa horizontal overflow, ikon Lucide, warna/font design-system
- [ ] Migrasi: buat migrasi baru (migrate) untuk `superAdminEmail` lalu `migrate deploy` ke Neon sebelum deploy produksi

## Self-Review

**1. Spec coverage**
- Sidebar SaaS + shell → Task 3. ✅
- Pengaturan sejajar Kliring (menu) → Task 3 (`ADMIN_NAV` menaruh `/admin/pengaturan` di grup Konfigurasi, sederajat item lain). ✅
- Redesign semua halaman admin → Task 4, 5. ✅
- Font & warna design-system + Lucide (no emoji) → Global Constraints + Task 1–3. ✅
- Gembok OTP: email dari config → Task 6, 7; error code → Task 8; token/ cookie → Task 9; action kirim/verif → Task 10; guard save → Task 11; UI → Task 12; seed email → Task 13. ✅
- Setelah Save langsung tersimpan & terkunci → Task 11 (clear cookie) + Task 12 (setUnlocked false). ✅
- Validasi server (bukan hanya UI) → Task 11. ✅
- Vendor baca fee dari config → Task 14. ✅
- Non-tujuan (ledger tak diubah) → tidak ada task menyentuh `executePayout`. ✅

**2. Placeholder scan:** Tidak ada TBD/TODO. Beberapa langkah menyuruh memverifikasi signature aktual (`issueOtp`, `sendOtpEmail`, `hmacBase64url`) — ini instruksi konkret "baca dulu lalu sesuaikan", bukan placeholder.

**3. Type consistency:** `PlatformSettingsView.superAdminEmail` (Task 7) dipakai Task 10/12. `isAdminEditUnlocked`/`clearAdminUnlockCookie` (Task 9) dipakai Task 11/12. `UNLOCK_TTL_MINUTES`, `signUnlockToken`, `verifyUnlockToken`, `setAdminUnlockCookie` konsisten Task 9–10. `ADMIN_EDIT_NOT_UNLOCKED` (Task 8) dipakai Task 11. `getPlatformFeeBreakdown` (Task 14) konsisten.

**Catatan penyesuaian inline:** Task 10 & 12 menyuruh memverifikasi signature fungsi existing (`issueOtp`/`verifyOtp`/`sendOtpEmail`) dan menyesuaikan argumen — jangan mengarang; jaga typecheck bersih.
