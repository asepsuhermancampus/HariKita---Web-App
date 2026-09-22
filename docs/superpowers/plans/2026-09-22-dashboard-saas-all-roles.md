# Dashboard SaaS untuk Semua Role — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Semua dashboard role (Vendor, BA, Klien) memakai shell SaaS yang sama seperti admin — sidebar Charcoal + komponen bersama dari brand hub (Charcoal/Taupe/Champagne/Soft Beige/Ivory, Cormorant + Manrope) — dan semua halaman tiap role dirapikan; Navbar/Footer publik disembunyikan di area dashboard.

**Architecture:** Pindahkan `src/components/admin/*` → `src/components/dashboard/*` (rename `Admin*`→`Dash*`), buat `DashboardShell` + `DashboardSidebarNav` generik + `nav-config.ts` (ADMIN/VENDOR/BA/CLIENT). Tiap `layout.tsx` role memakai `DashboardShell` + nav-nya. Navbar/Footer `return null` di `/admin`, `/dashboard`, `/client`. Logika data tidak diubah.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind + design-system, Lucide, `node:test` via `tsx`.

**Spec:** `docs/superpowers/specs/2026-09-22-dashboard-saas-all-roles-design.md`

## Global Constraints

- Warna hanya token brand: `hk-charcoal`, `hk-taupe`, `hk-champagne`, `hk-soft-beige`, `hk-ivory`, plus `gold`/`plum` bila perlu. **Dilarang** hex ad-hoc (kecuali turunan teks badge status: `#157a4d/#8a6410/#a2352f/#0b6a95`).
- Font: `font-manrope` (body), `font-editorial` (Cormorant, judul). **Dilarang** `-apple-system`/`Segoe UI`/`Georgia` eksplisit.
- Icon: **Lucide React** saja. **Tanpa emoji** di UI produksi.
- Sidebar: `bg-hk-charcoal`, item aktif `bg-hk-champagne/20 text-hk-champagne`.
- Tombol aksi `min-h-11`, kelas `focus-ring`.
- **Jangan** ubah logika data/aksi halaman; hanya tampilan.
- Responsif: drawer ≤`lg`, tanpa horizontal overflow di 375px.
- Verifikasi setiap akhir task: `npm run typecheck`; akhir fase: + `npm test` + `npm run build`.

---

### Task 1: Pindahkan komponen bersama ke `components/dashboard` (rename Dash*)

**Files:**
- Create: `src/components/dashboard/DashButton.tsx` (dari `AdminButton.tsx`)
- Create: `src/components/dashboard/DashBadge.tsx`
- Create: `src/components/dashboard/DashCard.tsx`
- Create: `src/components/dashboard/DashPageHeader.tsx`
- Create: `src/components/dashboard/DashStatCard.tsx`
- Create: `src/components/dashboard/DashTable.tsx`
- Create: `src/components/dashboard/index.ts`
- Modify: `src/app/admin/**` (ganti import `@/components/admin` → `@/components/dashboard`, nama `Admin*` → `Dash*`)
- Delete: `src/components/admin/*`
- Modify: `tests/admin-ui-components.test.ts` → `tests/dashboard-ui-components.test.ts`

**Interfaces:**
- Produces: `DashButton`, `DashBadge`, `DashCard`, `DashPageHeader`, `DashStatCard`, `DashTable` (API sama seperti `Admin*` lama, hanya nama berubah).

- [ ] **Step 1: Rename test & sesuaikan path**

Buat `tests/dashboard-ui-components.test.ts` (hasil rename dari `admin-ui-components`), baca `src/components/dashboard/*`. Hapus file test lama.

```ts
// tests/dashboard-ui-components.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const read = (p: string) => readFileSync(path.join(root, p), "utf-8");

test("DashButton exposes variants and min-h-11", () => {
  const src = read("src/components/dashboard/DashButton.tsx");
  assert.match(src, /variant/);
  assert.match(src, /min-h-11/);
  assert.match(src, /primary/);
  assert.match(src, /danger/);
});

test("DashBadge maps tone to design-system tokens", () => {
  const src = read("src/components/dashboard/DashBadge.tsx");
  assert.match(src, /success|ok/);
  assert.match(src, /warning|warn/);
  assert.match(src, /error/);
});

test("DashCard renders title/description/action slots", () => {
  const src = read("src/components/dashboard/DashCard.tsx");
  assert.match(src, /title/);
  assert.match(src, /description/);
  assert.match(src, /action/);
});

test("DashPageHeader/StatCard/Table exist with expected props", () => {
  assert.match(read("src/components/dashboard/DashPageHeader.tsx"), /title/);
  assert.match(read("src/components/dashboard/DashStatCard.tsx"), /label/);
  const t = read("src/components/dashboard/DashTable.tsx");
  assert.match(t, /columns/);
  assert.match(t, /renderRow/);
});
```

- [ ] **Step 2: Run test — verify it fails**

Run: `npx tsx --test tests/dashboard-ui-components.test.ts`
Expected: FAIL — `DashButton.tsx` belum ada.

- [ ] **Step 3: Salin & rename komponen**

Untuk tiap file `src/components/admin/{AdminButton,AdminBadge,AdminCard,AdminPageHeader,AdminStatCard,AdminTable}.tsx`, buat versi `src/components/dashboard/Dash*.tsx` dengan:
- Nama export diganti: `AdminButton`→`DashButton`, dst.
- Isi/logika/style identik.
- Ganti referensi internal `AdminButtonProps` → `DashButtonProps`, dsb.

Contoh `DashButton.tsx`:
```tsx
import React from "react";

export type DashButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export interface DashButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: DashButtonVariant;
  size?: "sm" | "md";
}

const VARIANT: Record<DashButtonVariant, string> = {
  primary: "bg-hk-taupe text-white hover:bg-hk-charcoal border-transparent",
  secondary: "bg-white text-hk-charcoal border-hk-soft-beige hover:bg-hk-ivory",
  danger: "bg-white text-[#a2352f] border-[#f3c9c6] hover:bg-[#fdf2f1]",
  ghost: "bg-transparent text-hk-charcoal border-transparent hover:bg-hk-ivory",
};

export function DashButton({ variant = "primary", size = "md", className = "", ...props }: DashButtonProps) {
  const sizing = size === "sm" ? "px-3.5 min-h-9 text-xs" : "px-5 min-h-11 text-sm";
  return (
    <button
      {...props}
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-full border font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizing} ${VARIANT[variant]} ${className}`}
    />
  );
}
```
> Catatan: `primary` sekarang pakai `bg-hk-taupe` (brand primary), bukan `bg-gold` seperti admin lama — agar sesuai brand hub.

`DashBadge.tsx`, `DashCard.tsx`, `DashPageHeader.tsx`, `DashStatCard.tsx`, `DashTable.tsx`: salin identik, hanya rename `Admin`→`Dash`. (`DashPageHeader` tetap `font-editorial`.)

- [ ] **Step 4: Barrel `index.ts`**

```ts
// src/components/dashboard/index.ts
export * from "./DashButton";
export * from "./DashBadge";
export * from "./DashCard";
export * from "./DashPageHeader";
export * from "./DashStatCard";
export * from "./DashTable";
```

- [ ] **Step 5: Update semua konsumen admin**

Di seluruh `src/app/admin/**`:
- Ganti `import { ... } from "@/components/admin"` → `"@/components/dashboard"`.
- Ganti pemakaian `AdminButton`→`DashButton`, `AdminBadge`→`DashBadge`, `AdminCard`→`DashCard`, `AdminPageHeader`→`DashPageHeader`, `AdminStatCard`→`DashStatCard`, `AdminTable`→`DashTable`.

Cari semua pemakaian:
```bash
grep -rn "components/admin\|AdminButton\|AdminBadge\|AdminCard\|AdminPageHeader\|AdminStatCard\|AdminTable" src/app/admin
```

- [ ] **Step 6: Hapus komponen admin lama**

```bash
rm -rf src/components/admin
```

- [ ] **Step 7: Run test + typecheck**

Run: `npx tsx --test tests/dashboard-ui-components.test.ts && npm run typecheck`
Expected: PASS keduanya.

- [ ] **Step 8: Commit**

```bash
git add src/components/dashboard src/app/admin tests/dashboard-ui-components.test.ts
git rm -r src/components/admin
git commit -m "refactor(dashboard): move shared components to components/dashboard (Dash*)"
```

---

### Task 2: Shell generik + nav config

**Files:**
- Create: `src/components/dashboard/nav-config.ts`
- Create: `src/components/dashboard/DashboardSidebarNav.tsx`
- Create: `src/components/dashboard/DashboardShell.tsx`
- Modify: `src/components/dashboard/index.ts`
- Test: `tests/dashboard-nav.test.ts`

**Interfaces:**
- Produces:
  - `type NavItem = { label: string; href: string; icon: LucideIcon }`, `type NavGroup = { group: string; items: NavItem[] }`
  - `ADMIN_NAV`, `VENDOR_NAV`, `BA_NAV`, `CLIENT_NAV: NavGroup[]`
  - `DashboardSidebarNav({ nav, roleLabel, homeHref })` (client)
  - `DashboardShell({ nav, roleLabel, homeHref, children })` (server)

- [ ] **Step 1: Write the failing test**

```ts
// tests/dashboard-nav.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const nav = readFileSync(path.join(root, "src/components/dashboard/nav-config.ts"), "utf-8");

test("nav config covers all role routes", () => {
  const routes = [
    // admin
    "/admin", "/admin/verifikasi", "/admin/escrow", "/admin/dispute",
    "/admin/ba", "/admin/kalender", "/admin/audit-konten", "/admin/pengaturan",
    // vendor
    "/dashboard/vendor", "/dashboard/vendor/inbox", "/dashboard/vendor/kalender",
    "/dashboard/vendor/dompet", "/dashboard/vendor/paket", "/dashboard/vendor/portofolio",
    "/dashboard/vendor/profil",
    // ba
    "/dashboard/ba", "/dashboard/ba/vendor", "/dashboard/ba/komisi", "/dashboard/ba/dompet",
    // client
    "/client", "/client/pesanan", "/client/jadwal", "/client/undangan", "/client/profil",
  ];
  for (const r of routes) assert.ok(nav.includes(r), `missing ${r}`);
});

test("nav config uses lucide icons, no emoji", () => {
  assert.match(nav, /from "lucide-react"/);
  assert.doesNotMatch(nav, /[\u{1F300}-\u{1FAFF}]/u);
});
```

- [ ] **Step 2: Run test — verify it fails**

Run: `npx tsx --test tests/dashboard-nav.test.ts`
Expected: FAIL — file belum ada.

- [ ] **Step 3: Create `nav-config.ts`**

Pindahkan `ADMIN_NAV` (dari `AdminSidebarNav.tsx`) ke sini, tambah 3 nav baru:

```ts
// src/components/dashboard/nav-config.ts
import {
  LayoutDashboard, ShieldCheck, Landmark, Scale, Megaphone, CalendarDays,
  FileSearch, Settings, Inbox, Wallet, Package, ImageIcon, UserRound,
  Store, Coins, ReceiptText, CalendarClock, Mail, type LucideIcon,
} from "lucide-react";

export interface NavItem { label: string; href: string; icon: LucideIcon; }
export interface NavGroup { group: string; items: NavItem[]; }

export const ADMIN_NAV: NavGroup[] = [
  { group: "Operasional", items: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Verifikasi Vendor", href: "/admin/verifikasi", icon: ShieldCheck },
    { label: "Kliring & Settlement", href: "/admin/escrow", icon: Landmark },
    { label: "Dispute", href: "/admin/dispute", icon: Scale },
  ]},
  { group: "Pertumbuhan", items: [
    { label: "Brand Ambassador", href: "/admin/ba", icon: Megaphone },
    { label: "Kalender", href: "/admin/kalender", icon: CalendarDays },
    { label: "Audit Konten", href: "/admin/audit-konten", icon: FileSearch },
  ]},
  { group: "Konfigurasi", items: [
    { label: "Pengaturan Platform", href: "/admin/pengaturan", icon: Settings },
  ]},
];

export const VENDOR_NAV: NavGroup[] = [
  { group: "Operasional", items: [
    { label: "Ringkasan", href: "/dashboard/vendor", icon: LayoutDashboard },
    { label: "Kotak Masuk Order", href: "/dashboard/vendor/inbox", icon: Inbox },
    { label: "Kalender Blackout", href: "/dashboard/vendor/kalender", icon: CalendarDays },
    { label: "Dompet Saldo Escrow", href: "/dashboard/vendor/dompet", icon: Wallet },
  ]},
  { group: "Katalog", items: [
    { label: "Paket & Layanan", href: "/dashboard/vendor/paket", icon: Package },
    { label: "Portofolio & Feed", href: "/dashboard/vendor/portofolio", icon: ImageIcon },
  ]},
  { group: "Akun", items: [
    { label: "Data Diri & Profil", href: "/dashboard/vendor/profil", icon: UserRound },
  ]},
];

export const BA_NAV: NavGroup[] = [
  { group: "Kemitraan", items: [
    { label: "Ringkasan", href: "/dashboard/ba", icon: LayoutDashboard },
    { label: "Vendor Rekrutan", href: "/dashboard/ba/vendor", icon: Store },
    { label: "Komisi", href: "/dashboard/ba/komisi", icon: Coins },
    { label: "Dompet", href: "/dashboard/ba/dompet", icon: Wallet },
  ]},
];

export const CLIENT_NAV: NavGroup[] = [
  { group: "Acara Saya", items: [
    { label: "Ringkasan", href: "/client", icon: LayoutDashboard },
    { label: "Pesanan & Escrow", href: "/client/pesanan", icon: ReceiptText },
    { label: "Jadwal Fitting & Sesi", href: "/client/jadwal", icon: CalendarClock },
    { label: "Undangan Digital & Tamu", href: "/client/undangan", icon: Mail },
  ]},
  { group: "Akun", items: [
    { label: "Data Diri & Profil", href: "/client/profil", icon: UserRound },
  ]},
];
```

- [ ] **Step 4: Create `DashboardSidebarNav.tsx`** (generalisasi dari `AdminSidebarNav`)

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { NavGroup } from "./nav-config";

export function DashboardSidebarNav({
  nav,
  roleLabel,
  homeHref,
}: {
  nav: NavGroup[];
  roleLabel: string;
  homeHref: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const body = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
      {nav.map((g) => (
        <div key={g.group}>
          <div className="px-3 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
            {g.group}
          </div>
          {g.items.map((it) => {
            const active = it.href === homeHref ? pathname === it.href : pathname.startsWith(it.href);
            const Icon = it.icon;
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${
                  active
                    ? "bg-hk-champagne/20 font-bold text-hk-champagne"
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

  const brand = (
    <div className="flex items-center gap-2.5 px-2.5 pb-4 pt-1.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-hk-champagne to-hk-taupe font-extrabold text-white">
        H
      </div>
      <div>
        <div className="text-sm font-bold text-white">HariKita</div>
        <div className="text-[10px] uppercase tracking-[0.12em] text-hk-champagne">{roleLabel}</div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
        className="focus-ring fixed left-4 top-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-hk-soft-beige bg-white text-hk-charcoal lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col bg-hk-charcoal p-3.5 lg:flex">
        {brand}
        {body}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-hk-charcoal p-3.5">
            <div className="flex items-center justify-between">
              {brand}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {body}
          </aside>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 5: Create `DashboardShell.tsx`**

```tsx
import type { ReactNode } from "react";
import { DashboardSidebarNav } from "./DashboardSidebarNav";
import type { NavGroup } from "./nav-config";

export function DashboardShell({
  nav,
  roleLabel,
  homeHref,
  children,
}: {
  nav: NavGroup[];
  roleLabel: string;
  homeHref: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-hk-canvas">
      <DashboardSidebarNav nav={nav} roleLabel={roleLabel} homeHref={homeHref} />
      <div className="min-w-0 flex-1">
        <main className="px-4 py-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Update barrel**

```ts
// src/components/dashboard/index.ts
export * from "./DashButton";
export * from "./DashBadge";
export * from "./DashCard";
export * from "./DashPageHeader";
export * from "./DashStatCard";
export * from "./DashTable";
export * from "./DashboardShell";
export * from "./DashboardSidebarNav";
export * from "./nav-config";
```

- [ ] **Step 7: Run test + typecheck**

Run: `npx tsx --test tests/dashboard-nav.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/dashboard tests/dashboard-nav.test.ts
git commit -m "feat(dashboard): add generic DashboardShell + nav config for all roles"
```

---

### Task 3: Admin layout pakai shell generik

**Files:**
- Modify: `src/app/admin/layout.tsx`
- Delete: `src/app/admin/AdminSidebarNav.tsx`
- Modify: `tests/admin-sidebar.test.ts` → hapus (digantikan `dashboard-nav.test.ts`)

- [ ] **Step 1: Rewrite `admin/layout.tsx`**

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell, ADMIN_NAV } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Super Admin — HariKita",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell nav={ADMIN_NAV} roleLabel="Super Admin" homeHref="/admin">
      {children}
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Hapus `AdminSidebarNav.tsx` & test lama**

```bash
rm src/app/admin/AdminSidebarNav.tsx tests/admin-sidebar.test.ts
```

- [ ] **Step 3: Typecheck + test + build**

Run: `npm run typecheck && npm test && npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/layout.tsx
git rm src/app/admin/AdminSidebarNav.tsx tests/admin-sidebar.test.ts
git commit -m "refactor(admin): use generic DashboardShell for admin layout"
```

---

### Task 4: Vendor layout + halaman

**Files:**
- Modify: `src/app/dashboard/vendor/layout.tsx`
- Modify: `src/app/dashboard/vendor/page.tsx` (+ client bila ada)
- Modify: `src/app/dashboard/vendor/{paket,portofolio,kalender,inbox,dompet,profil}/*`
- Delete: `src/components/vendor/VendorHeaderNav.tsx` (bila tak dipakai lagi)

- [ ] **Step 1: Rewrite `vendor/layout.tsx`**

```tsx
import React from "react";
import { getVendorProfile } from "@/server/actions/vendor-profile";
import { DashboardShell, VENDOR_NAV } from "@/components/dashboard";

export const metadata = {
  title: "Portal Mitra Vendor Kebumen | HariKita",
  description:
    "Pusat manajemen portofolio, kalender ketersediaan, order escrow, dan statistik mitra vendor HariKita Kebumen.",
};

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  await getVendorProfile(); // pastikan profil ter-resolve (guard data)
  return (
    <DashboardShell nav={VENDOR_NAV} roleLabel="Mitra Vendor" homeHref="/dashboard/vendor">
      {children}
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Rapikan `vendor/page.tsx`**

Bungkus konten dengan `DashPageHeader` + `DashCard`; stat cards → `DashStatCard`. **Pertahankan** `VendorTrackingSuite` & seluruh query/props existing. Contoh kerangka:

```tsx
import { DashPageHeader, DashStatCard, DashCard } from "@/components/dashboard";
// ...
return (
  <div className="flex flex-col gap-6">
    <DashPageHeader title="Ringkasan Portal Mitra" description="Statistik performa, order, dan saldo escrow Anda." />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* DashStatCard existing data */}
    </div>
    <DashCard title="Analitik & Tracking">{/* VendorTrackingSuite existing */}</DashCard>
  </div>
);
```

- [ ] **Step 3: Rapikan halaman vendor lain**

Untuk `paket`, `portofolio`, `kalender`, `inbox`, `dompet`, `profil`: tambah `DashPageHeader` di atas konten; ganti pembungkus luar `min-h-screen ... py-8 px-4` → `flex flex-col gap-6`. **Jangan ubah logika data/aksi.** (Halaman-halaman ini punya client component masing-masing; hanya lapisan visual.)

- [ ] **Step 4: Hapus `VendorHeaderNav` bila tak dipakai**

Cari pemakaian: `grep -rn "VendorHeaderNav" src`. Bila hanya di layout lama (sudah diganti), hapus file.

- [ ] **Step 5: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 6: Verifikasi visual**

`/dashboard/vendor` → sidebar Charcoal muncul; tiap halaman konsisten; 375px tanpa overflow.

- [ ] **Step 7: Commit**

```bash
git add src/app/dashboard/vendor
git rm src/components/vendor/VendorHeaderNav.tsx 2>/dev/null || true
git commit -m "feat(vendor): SaaS shell + tidy vendor dashboard pages"
```

---

### Task 5: BA layout + halaman

**Files:**
- Modify: `src/app/dashboard/ba/layout.tsx`
- Modify: `src/app/dashboard/ba/page.tsx` + `{vendor,komisi,dompet}/*`
- Delete: `src/components/ba/BaHeaderNav.tsx` (bila tak dipakai)

- [ ] **Step 1: Rewrite `ba/layout.tsx`**

```tsx
import React from "react";
import { getAmbassadorSummary } from "@/server/queries/ambassador";
import { DashboardShell, BA_NAV } from "@/components/dashboard";

export const metadata = {
  title: "Portal Brand Ambassador | HariKita",
  description:
    "Portal Brand Ambassador HariKita: pantau vendor rekrutan, komisi, dan saldo dompet Anda.",
};

export default async function BaLayout({ children }: { children: React.ReactNode }) {
  await getAmbassadorSummary();
  return (
    <DashboardShell nav={BA_NAV} roleLabel="Brand Ambassador" homeHref="/dashboard/ba">
      {children}
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Rapikan `ba/page.tsx`**

Ganti `max-w-3xl mx-auto px-4 py-12` → `flex flex-col gap-6`; header & stat cards → `DashPageHeader` + `DashStatCard`. Pertahankan `getAmbassadorSummary()` & logika existing.

- [ ] **Step 3: Rapikan `{vendor,komisi,dompet}`**

Tambah `DashPageHeader`; pembungkus luar → `flex flex-col gap-6`. Logika tidak diubah.

- [ ] **Step 4: Hapus `BaHeaderNav` bila tak dipakai**

`grep -rn "BaHeaderNav" src` → hapus bila hanya di layout lama.

- [ ] **Step 5: Typecheck + build + verifikasi visual**

Run: `npm run typecheck && npm run build`.
Cek `/dashboard/ba` + sub-halaman.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/ba
git rm src/components/ba/BaHeaderNav.tsx 2>/dev/null || true
git commit -m "feat(ba): SaaS shell + tidy BA dashboard pages"
```

---

### Task 6: Client layout + halaman

**Files:**
- Modify: `src/app/client/layout.tsx`
- Modify: `src/app/client/page.tsx` + `{pesanan,jadwal,undangan,profil}/*`
- Delete: `src/components/client/ClientHeaderNav.tsx` (bila tak dipakai)

- [ ] **Step 1: Rewrite `client/layout.tsx`**

```tsx
import React from "react";
import { getSession } from "@/lib/session";
import { DashboardShell, CLIENT_NAV } from "@/components/dashboard";

export const metadata = {
  title: "Portal Klien HariKita — Ekosistem Acara Kebumen",
  description:
    "Pusat pengelolaan profil pengantin, riwayat pesanan vendor, pelacak jadwal fitting & test food, dan undangan digital HariKita Kebumen.",
};

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  await getSession();
  return (
    <DashboardShell nav={CLIENT_NAV} roleLabel="Klien" homeHref="/client">
      {children}
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Rapikan `client/page.tsx` + sub-halaman**

`DashPageHeader` + `DashCard`/`DashStatCard`; pembungkus `flex flex-col gap-6`. Logika tidak diubah.

- [ ] **Step 3: Hapus `ClientHeaderNav` bila tak dipakai**

`grep -rn "ClientHeaderNav" src` → hapus bila hanya di layout lama.

- [ ] **Step 4: Typecheck + build + verifikasi visual**

Run: `npm run typecheck && npm run build`.
Cek `/client` + sub-halaman.

- [ ] **Step 5: Commit**

```bash
git add src/app/client
git rm src/components/client/ClientHeaderNav.tsx 2>/dev/null || true
git commit -m "feat(client): SaaS shell + tidy client dashboard pages"
```

---

### Task 7: Sembunyikan Navbar/Footer publik di area dashboard

**Files:**
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Update `Navbar.tsx`**

Setelah blok `isInvitationDetailPage`/`isDesignSystemShowcase`, tambah:

```tsx
const isDashboardArea =
  pathname &&
  (pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/client"));

if (isInvitationDetailPage || isDesignSystemShowcase || isDashboardArea) {
  return null;
}
```

- [ ] **Step 2: Update `Footer.tsx`**

Cari kondisi `return null` yang sudah ada; tambah `isDashboardArea` dengan logika sama.

- [ ] **Step 3: Typecheck + build + verifikasi**

Run: `npm run typecheck && npm run build`.
Cek `/admin`, `/dashboard/vendor`, `/client` → tanpa navbar/footer publik.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Navbar.tsx src/components/layout/Footer.tsx
git commit -m "feat(layout): hide public navbar/footer in dashboard areas"
```

---

## Verifikasi Akhir

- [ ] `npm run typecheck` → PASS
- [ ] `npm test` → PASS
- [ ] `npm run build` → PASS
- [ ] Visual tiap role (admin/vendor/BA/client) desktop + 375px: sidebar Charcoal, komponen konsisten, tanpa overflow, ikon Lucide, tanpa emoji
- [ ] Navbar/Footer publik tidak tampil di `/admin`, `/dashboard/*`, `/client/*`
- [ ] Tidak ada regresi logika data/aksi (test hijau)

## Self-Review

**1. Spec coverage**
- Shell sama semua role → Task 2–6. ✅
- Palet/font brand hub → Global Constraints + Task 1 (`DashButton` = taupe) + Task 2. ✅
- Sidebar Charcoal + aksen Champagne → Task 2 (`DashboardSidebarNav`). ✅
- Komponen bersama `components/dashboard` → Task 1. ✅
- Semua halaman semua role → Task 4 (vendor), 5 (BA), 6 (client) + 3 (admin refactor). ✅
- Navbar/Footer disembunyikan → Task 7. ✅
- Test → Task 1 (komponen), Task 2 (nav), Task 3 (hapus test lama). ✅

**2. Placeholder scan:** Tidak ada TBD/TODO. Langkah "rapikan halaman" menyertakan contoh kerangka konkret + instruksi eksplisit "jangan ubah logika" (bukan placeholder).

**3. Type consistency:** `NavGroup`/`NavItem` didefinisikan Task 2 dipakai Task 3–6. `DashboardShell` props (`nav/roleLabel/homeHref/children`) konsisten. `Dash*` menggantikan `Admin*` seragam (Task 1).

**Catatan penyesuaian inline:** Task 4–6 menyuruh memeriksa pemakaian header nav lama sebelum menghapus (`grep`) — jangan hapus bila masih dipakai; jaga typecheck bersih.
