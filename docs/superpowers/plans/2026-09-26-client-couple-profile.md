# Client Couple Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan profil canonical mempelai pria/wanita, nama tampilan pasangan untuk sidebar, penyimpanan atomik yang benar, serta redirect login client ke Ringkasan `/client`.

**Architecture:** `ClientProfile` menyimpan `accountOwnerRole`, `groomName`, `brideName`, dan `coupleDisplayName`; `User.name` tetap nama legal pemilik akun. Helper domain murni menangani mapping legacy dan fallback label, server action menyimpan `User` + `ClientProfile` dalam satu transaction, sedangkan layout/sidebar dan planner overview membaca data canonical langsung dari database.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Prisma 6, PostgreSQL + SQLite, Tailwind CSS, Lucide React, `node:test` via `tsx`.

**Spec:** `docs/superpowers/specs/2026-09-26-client-couple-profile-design.md`

## Global Constraints

- Kerjakan hanya pada branch `feat/client-couple-profile` di worktree `.worktrees/client-couple-profile`.
- Jangan menghapus `ClientProfile.partnerName`; gunakan sebagai compatibility bridge.
- Semua perubahan schema harus identik pada `prisma/schema.prisma` dan `prisma/schema.sqlite.prisma`.
- Backup `prisma/dev.db` sebelum `db push` SQLite.
- Migration PostgreSQL harus additive dan tidak menebak gender data lama.
- `User.name` tetap nama legal pemilik akun.
- `accountOwnerRole` hanya `GROOM | BRIDE`.
- Desktop: mempelai pria kiri, mempelai wanita kanan. Mobile: pria lalu wanita.
- `coupleDisplayName` maksimal 40 karakter dan menjadi sumber utama label sidebar.
- Tombol/segmented control minimal 44px; tanpa horizontal overflow pada 375px.
- Gunakan token `hk-*`, `font-editorial`, `font-manrope`, dan Lucide; tanpa emoji.
- Semua mutation owner-scoped dari session server; role wajib `CLIENT`.
- Form tidak kehilangan data saat save gagal; error field harus terlihat dan accessible.
- Login client tanpa callback diarahkan ke `/client`; role lain tidak berubah.
- TDD wajib: test gagal harus terlihat sebelum implementasi production.

---

## File Structure

**Schema/migration:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/schema.sqlite.prisma`
- Create: `prisma/migrations/20260926000000_client_couple_profile/migration.sql`

**Domain and validation:**
- Modify: `src/lib/validations/client-profile.ts`
- Create: `src/lib/client-couple-profile.ts`

**Persistence/read model:**
- Modify: `src/server/actions/client-profile.ts`
- Modify: `src/server/queries/wedding-planner.ts`

**UI/layout:**
- Modify: `src/app/client/profil/ClientProfileForm.tsx`
- Modify: `src/app/client/profil/page.tsx`
- Modify: `src/app/client/layout.tsx`
- Modify: `src/lib/session.ts`

**Tests:**
- Create: `tests/client-couple-profile.test.ts`
- Modify: `tests/session-token.test.ts` only if redirect coverage does not fit the new focused test.

---

### Task 1: Add Canonical Couple Profile Schema

**Files:**
- Modify: `prisma/schema.prisma` (`ClientProfile`)
- Modify: `prisma/schema.sqlite.prisma` (`ClientProfile`)
- Create: `prisma/migrations/20260926000000_client_couple_profile/migration.sql`
- Test: `tests/client-couple-profile.test.ts`

**Interfaces:**
- Produces DB fields: `accountOwnerRole: String?`, `groomName: String?`, `brideName: String?`, `coupleDisplayName: String?`.
- Preserves: `partnerName: String?`.
- Consumed by Tasks 2-5 through generated Prisma clients.

- [ ] **Step 1: Write the failing schema contract test**

Create `tests/client-couple-profile.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const read = (file: string) =>
  readFileSync(path.join(process.cwd(), file), "utf8");

test("both Prisma schemas expose canonical couple profile fields", () => {
  for (const file of ["prisma/schema.prisma", "prisma/schema.sqlite.prisma"]) {
    const schema = read(file);
    assert.match(schema, /accountOwnerRole\s+String\?/);
    assert.match(schema, /groomName\s+String\?/);
    assert.match(schema, /brideName\s+String\?/);
    assert.match(schema, /coupleDisplayName\s+String\?/);
    assert.match(schema, /partnerName\s+String\?/);
  }
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npx tsx --test tests/client-couple-profile.test.ts
```

Expected: FAIL because canonical fields do not exist.

- [ ] **Step 3: Add nullable fields to both schemas**

Add after `partnerName` in both `ClientProfile` models:

```prisma
  accountOwnerRole  String?
  groomName         String?
  brideName         String?
  coupleDisplayName String?
```

Do not add defaults. Legacy rows must remain explicitly unmigrated until users choose their role.

- [ ] **Step 4: Create additive PostgreSQL migration**

Create migration SQL:

```sql
ALTER TABLE "ClientProfile"
ADD COLUMN "accountOwnerRole" TEXT,
ADD COLUMN "groomName" TEXT,
ADD COLUMN "brideName" TEXT,
ADD COLUMN "coupleDisplayName" TEXT;
```

- [ ] **Step 5: Backup SQLite and validate both schemas**

Run:

```powershell
Copy-Item prisma/dev.db prisma/dev.db.backup_client_couple_profile_pre
npx prisma validate
$env:DATABASE_URL='file:./dev.db'
npx prisma validate --schema prisma/schema.sqlite.prisma
Remove-Item Env:DATABASE_URL
```

Expected: both schemas valid.

- [ ] **Step 6: Apply SQLite schema and regenerate both clients**

Run:

```powershell
$env:DATABASE_URL='file:./dev.db'
npx prisma db push --schema prisma/schema.sqlite.prisma
npx prisma generate --schema prisma/schema.sqlite.prisma
Remove-Item Env:DATABASE_URL
npx prisma generate
```

Expected: additive columns applied; no model/field deletion.

- [ ] **Step 7: Run schema test GREEN and typecheck**

Run:

```powershell
npx tsx --test tests/client-couple-profile.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma prisma/schema.sqlite.prisma prisma/migrations tests/client-couple-profile.test.ts prisma/dev.db
git commit -m "feat(client): add canonical couple profile fields"
```

---

### Task 2: Add Couple Profile Domain Mapping and Validation

**Files:**
- Create: `src/lib/client-couple-profile.ts`
- Modify: `src/lib/validations/client-profile.ts`
- Test: `tests/client-couple-profile.test.ts`

**Interfaces:**
- Produces `type AccountOwnerRole = "GROOM" | "BRIDE"`.
- Produces `mapCoupleProfileOwner(input): { ownerName: string; partnerName: string }`.
- Produces `resolveCoupleDisplayName(input): string`.
- Extends `UpdateClientProfileInput` with `accountOwnerRole`, `groomName`, `brideName`, `coupleDisplayName`.
- Consumed by server action, layout, profile page, planner overview.

- [ ] **Step 1: Append failing mapping tests**

```ts
import {
  mapCoupleProfileOwner,
  resolveCoupleDisplayName,
} from "../src/lib/client-couple-profile";
import { validateClientProfileInput } from "../src/lib/validations/client-profile";

test("GROOM owner maps groom to User.name and bride to legacy partnerName", () => {
  assert.deepEqual(
    mapCoupleProfileOwner({
      accountOwnerRole: "GROOM",
      groomName: "Muhammad Rizky Pratama",
      brideName: "Siti Nur Aisyah",
    }),
    { ownerName: "Muhammad Rizky Pratama", partnerName: "Siti Nur Aisyah" }
  );
});

test("BRIDE owner maps bride to User.name and groom to legacy partnerName", () => {
  assert.deepEqual(
    mapCoupleProfileOwner({
      accountOwnerRole: "BRIDE",
      groomName: "Muhammad Rizky Pratama",
      brideName: "Siti Nur Aisyah",
    }),
    { ownerName: "Siti Nur Aisyah", partnerName: "Muhammad Rizky Pratama" }
  );
});

test("sidebar label prioritizes explicit display then canonical names then legacy", () => {
  assert.equal(resolveCoupleDisplayName({ coupleDisplayName: "Rizky & Aisyah" }), "Rizky & Aisyah");
  assert.equal(
    resolveCoupleDisplayName({ groomName: "Muhammad Rizky", brideName: "Siti Aisyah" }),
    "Muhammad & Siti"
  );
  assert.equal(
    resolveCoupleDisplayName({ userName: "Bima", partnerName: "Citra" }),
    "Bima & Citra"
  );
  assert.equal(resolveCoupleDisplayName({ userName: "Bima" }), "Bima");
});
```

- [ ] **Step 2: Append failing validator tests**

```ts
const validProfile = {
  accountOwnerRole: "BRIDE",
  groomName: "Muhammad Rizky Pratama",
  brideName: "Siti Nur Aisyah",
  coupleDisplayName: "Rizky & Aisyah",
  email: "client@example.com",
  eventDate: "2027-06-15",
  district: "Kebumen",
};

test("couple profile validator accepts canonical identity", () => {
  const result = validateClientProfileInput(validProfile);
  assert.equal(result.success, true);
  assert.equal(result.data?.accountOwnerRole, "BRIDE");
});

test("couple profile validator rejects invalid role and long display name", () => {
  const result = validateClientProfileInput({
    ...validProfile,
    accountOwnerRole: "OTHER",
    coupleDisplayName: "x".repeat(41),
  });
  assert.equal(result.success, false);
  assert.ok(result.errors?.accountOwnerRole);
  assert.ok(result.errors?.coupleDisplayName);
});
```

- [ ] **Step 3: Run focused tests and verify RED**

Run: `npx tsx --test tests/client-couple-profile.test.ts`

Expected: missing module/functions/fields.

- [ ] **Step 4: Implement domain helpers**

Create `src/lib/client-couple-profile.ts`:

```ts
export type AccountOwnerRole = "GROOM" | "BRIDE";

export function mapCoupleProfileOwner(input: {
  accountOwnerRole: AccountOwnerRole;
  groomName: string;
  brideName: string;
}) {
  return input.accountOwnerRole === "GROOM"
    ? { ownerName: input.groomName, partnerName: input.brideName }
    : { ownerName: input.brideName, partnerName: input.groomName };
}

const firstName = (value?: string | null) => value?.trim().split(/\s+/)[0] ?? "";

export function resolveCoupleDisplayName(input: {
  coupleDisplayName?: string | null;
  groomName?: string | null;
  brideName?: string | null;
  userName?: string | null;
  partnerName?: string | null;
}): string {
  if (input.coupleDisplayName?.trim()) return input.coupleDisplayName.trim();
  if (input.groomName?.trim() && input.brideName?.trim()) {
    return `${firstName(input.groomName)} & ${firstName(input.brideName)}`;
  }
  if (input.userName?.trim() && input.partnerName?.trim()) {
    return `${firstName(input.userName)} & ${firstName(input.partnerName)}`;
  }
  return input.userName?.trim() || "Klien";
}
```

- [ ] **Step 5: Replace legacy validator identity contract**

Update `UpdateClientProfileInput`:

```ts
accountOwnerRole: AccountOwnerRole;
groomName: string;
brideName: string;
coupleDisplayName: string;
email?: string;
```

Validation rules:

```ts
const accountOwnerRole = raw.accountOwnerRole === "GROOM" || raw.accountOwnerRole === "BRIDE"
  ? raw.accountOwnerRole
  : null;
if (!accountOwnerRole) errors.accountOwnerRole = ["Pilih peran pemilik akun."];

const groomName = typeof raw.groomName === "string" ? raw.groomName.trim() : "";
if (groomName.length < 2 || groomName.length > 100)
  errors.groomName = ["Nama mempelai pria harus 2-100 karakter."];

const brideName = typeof raw.brideName === "string" ? raw.brideName.trim() : "";
if (brideName.length < 2 || brideName.length > 100)
  errors.brideName = ["Nama mempelai wanita harus 2-100 karakter."];

const coupleDisplayName = typeof raw.coupleDisplayName === "string"
  ? raw.coupleDisplayName.trim() : "";
if (coupleDisplayName.length < 2 || coupleDisplayName.length > 40)
  errors.coupleDisplayName = ["Nama tampilan pasangan harus 2-40 karakter."];
```

Remove `name` and `partnerName` from the new canonical validator return data. They are derived by `mapCoupleProfileOwner()`.

- [ ] **Step 6: Run focused tests GREEN and full validation tests**

```powershell
npx tsx --test tests/client-couple-profile.test.ts
npm run typecheck
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/client-couple-profile.ts src/lib/validations/client-profile.ts tests/client-couple-profile.test.ts
git commit -m "feat(client): validate and map couple identity"
```

---

### Task 3: Persist Couple Identity Atomically

**Files:**
- Modify: `src/server/actions/client-profile.ts`
- Test: `tests/client-couple-profile.test.ts`

**Interfaces:**
- Consumes validator and `mapCoupleProfileOwner` from Task 2.
- Extends `ClientProfileData` with canonical fields.
- Produces updated `ClientProfileData` in `ProfileActionResult.data` after successful save.
- Revalidates client profile, root dashboard, and client layout.

- [ ] **Step 1: Add failing read-model source contract test**

```ts
test("client profile action reads and writes canonical couple fields", () => {
  const source = read("src/server/actions/client-profile.ts");
  for (const field of ["accountOwnerRole", "groomName", "brideName", "coupleDisplayName"]) {
    assert.match(source, new RegExp(field));
  }
  assert.match(source, /mapCoupleProfileOwner/);
  assert.match(source, /session\.role !== "CLIENT"/);
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npx tsx --test tests/client-couple-profile.test.ts`

Expected: canonical fields and role guard missing.

- [ ] **Step 3: Extend `ClientProfileData` and read mapping**

Add:

```ts
accountOwnerRole: AccountOwnerRole | null;
groomName: string | null;
brideName: string | null;
coupleDisplayName: string | null;
```

Map nullable Prisma fields in `getClientProfile()`; preserve `name` and `partnerName` for legacy prompt.

- [ ] **Step 4: Add role guard and canonical FormData extraction**

Guard:

```ts
if (!session || session.role !== "CLIENT") {
  return { success: false, error: "Sesi klien tidak valid. Silakan masuk kembali." };
}
```

Extract:

```ts
accountOwnerRole: formData.get("accountOwnerRole"),
groomName: formData.get("groomName"),
brideName: formData.get("brideName"),
coupleDisplayName: formData.get("coupleDisplayName"),
```

- [ ] **Step 5: Persist canonical and compatibility fields in one transaction**

Derive:

```ts
const identity = mapCoupleProfileOwner({
  accountOwnerRole,
  groomName,
  brideName,
});
```

Transaction behavior:

```ts
prisma.user.update({
  where: { id: session.userId },
  data: { name: identity.ownerName, email: email || null },
}),
prisma.clientProfile.upsert({
  where: { userId: session.userId },
  create: {
    userId: session.userId,
    accountOwnerRole,
    groomName,
    brideName,
    coupleDisplayName,
    partnerName: identity.partnerName,
    // existing event/address fields
  },
  update: {
    accountOwnerRole,
    groomName,
    brideName,
    coupleDisplayName,
    partnerName: identity.partnerName,
    // existing event/address fields
  },
}),
```

- [ ] **Step 6: Return fresh readback and revalidate**

After transaction:

```ts
revalidatePath("/client", "layout");
revalidatePath("/client");
revalidatePath("/client/profil");
const data = await getClientProfile();
return { success: true, message: "Data pasangan berhasil diperbarui.", data: data ?? undefined };
```

- [ ] **Step 7: Run focused test, typecheck, and test owner mapping**

```powershell
npx tsx --test tests/client-couple-profile.test.ts
npm run typecheck
```

- [ ] **Step 8: Commit**

```bash
git add src/server/actions/client-profile.ts tests/client-couple-profile.test.ts
git commit -m "feat(client): persist canonical couple profile"
```

---

### Task 4: Build Elegant Two-Column Couple Profile UI

**Files:**
- Modify: `src/app/client/profil/ClientProfileForm.tsx`
- Modify: `src/app/client/profil/page.tsx`
- Test: `tests/client-couple-profile.test.ts`

**Interfaces:**
- Consumes canonical `ClientProfileData` and profile action from Task 3.
- Produces accessible fields named `accountOwnerRole`, `groomName`, `brideName`, `coupleDisplayName`.
- Preserves all existing event, location, map, theme, and notes controls.

- [ ] **Step 1: Add failing UI contract test**

```ts
test("profile form renders one canonical two-person section", () => {
  const source = read("src/app/client/profil/ClientProfileForm.tsx");
  assert.match(source, /Identitas Kedua Mempelai/);
  assert.match(source, /Mempelai Pria/);
  assert.match(source, /Mempelai Wanita/);
  assert.match(source, /name="accountOwnerRole"/);
  assert.match(source, /name="groomName"/);
  assert.match(source, /name="brideName"/);
  assert.match(source, /name="coupleDisplayName"/);
  assert.match(source, /md:grid-cols-2/);
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npx tsx --test tests/client-couple-profile.test.ts`

- [ ] **Step 3: Replace form identity state**

State must include:

```ts
accountOwnerRole: initialData.accountOwnerRole ?? "",
groomName: initialData.groomName ?? "",
brideName: initialData.brideName ?? "",
coupleDisplayName: initialData.coupleDisplayName ?? "",
```

Keep legacy candidates separately:

```ts
const legacyOwnerName = initialData.name;
const legacyPartnerName = initialData.partnerName ?? "";
```

When role changes from empty:

```ts
setFormData((current) => ({
  ...current,
  accountOwnerRole: role,
  groomName: current.groomName || (role === "GROOM" ? legacyOwnerName : legacyPartnerName),
  brideName: current.brideName || (role === "BRIDE" ? legacyOwnerName : legacyPartnerName),
}));
```

- [ ] **Step 4: Build segmented owner-role control**

Use two `button type="button"` controls inside a `role="group"`, each `min-h-11`, `aria-pressed`, clear focus ring, and active state using `bg-hk-charcoal text-white`.

Copy:

```text
Saya mempelai pria
Saya mempelai wanita
```

Render migration helper when role empty:

```text
Pilih posisi Anda agar HariKita dapat menempatkan data lama dengan benar.
Data lama: <User.name> & <partnerName>
```

- [ ] **Step 5: Build two-column identity cards**

Container:

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
```

Each card:

```text
rounded-2xl border border-hk-champagne/40 bg-hk-ivory/40 p-5
```

Left always contains `groomName`; right always contains `brideName`. Render owner badge conditionally, never swap visual positions.

- [ ] **Step 6: Add shared display-name field and preview**

Input requirements:

```tsx
name="coupleDisplayName"
maxLength={40}
aria-invalid={Boolean(fieldErrors.coupleDisplayName)}
```

Preview copy:

```text
Pratinjau sidebar
Rizky & Aisyah
```

Show `{formData.coupleDisplayName.length}/40` with tabular numerals.

- [ ] **Step 7: Separate contact and event sections**

Move WhatsApp/email into "Kontak Pemilik Akun" below the couple identity surface. Move event date/location/district into "Rencana Hari H". Preserve map/address and preference sections unchanged except numbering.

- [ ] **Step 8: Wire payload and success readback**

Set all four canonical fields in `FormData`. On success with `result.data`, update state from returned canonical data so saved values remain synchronized without manual reload.

- [ ] **Step 9: Update page banner to canonical names**

`page.tsx` must display `groomName` left, heart center, `brideName` right, with legacy fallback before first migration. Do not label the owner as one gender until `accountOwnerRole` exists.

- [ ] **Step 10: Run focused test and production typecheck**

```powershell
npx tsx --test tests/client-couple-profile.test.ts
npm run typecheck
```

- [ ] **Step 11: Commit**

```bash
git add src/app/client/profil/ClientProfileForm.tsx src/app/client/profil/page.tsx tests/client-couple-profile.test.ts
git commit -m "feat(client): redesign couple identity profile"
```

---

### Task 5: Use Couple Display Name Across Sidebar and Dashboard

**Files:**
- Modify: `src/app/client/layout.tsx`
- Modify: `src/server/queries/wedding-planner.ts`
- Modify: `src/app/client/page.tsx` only if DTO rendering needs adjustment
- Test: `tests/client-couple-profile.test.ts`

**Interfaces:**
- Consumes `resolveCoupleDisplayName()` and canonical Prisma fields.
- Produces DB-backed `userName` for `DashboardShell`.
- Extends planner overview with canonical groom/bride/display data or resolves final display server-side.

- [ ] **Step 1: Add failing sidebar/read-model test**

```ts
test("client layout resolves sidebar label from database profile", () => {
  const source = read("src/app/client/layout.tsx");
  assert.match(source, /prisma\.user\.findUnique/);
  assert.match(source, /resolveCoupleDisplayName/);
  assert.doesNotMatch(source, /userName=\{session\?\.name\}/);
});

test("planner overview reads canonical couple fields", () => {
  const source = read("src/server/queries/wedding-planner.ts");
  assert.match(source, /groomName/);
  assert.match(source, /brideName/);
  assert.match(source, /coupleDisplayName/);
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npx tsx --test tests/client-couple-profile.test.ts`

- [ ] **Step 3: Query DB-backed label in client layout**

Use session only for `userId` and authorization. Query:

```ts
const user = session?.role === "CLIENT"
  ? await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        name: true,
        clientProfile: {
          select: {
            partnerName: true,
            groomName: true,
            brideName: true,
            coupleDisplayName: true,
          },
        },
      },
    })
  : null;
```

Resolve `userName` with `resolveCoupleDisplayName()` and pass it to `DashboardShell`.

- [ ] **Step 4: Update planner overview canonical data**

Add canonical fields to user query and resolve couple labels. Preserve legacy fallback for unmigrated profiles. Root greeting should use full canonical names; sidebar continues using compact display name.

- [ ] **Step 5: Verify immediate update contract**

Ensure Task 3 revalidates `"/client", "layout"`; no session mutation is needed. Confirm no client component caches sidebar name independently.

- [ ] **Step 6: Run tests and typecheck**

```powershell
npx tsx --test tests/client-couple-profile.test.ts
npm run typecheck
```

- [ ] **Step 7: Commit**

```bash
git add src/app/client/layout.tsx src/server/queries/wedding-planner.ts src/app/client/page.tsx tests/client-couple-profile.test.ts
git commit -m "feat(client): show couple display name in portal"
```

---

### Task 6: Redirect Client Login to Ringkasan and Verify End-to-End

**Files:**
- Modify: `src/lib/session.ts`
- Test: `tests/client-couple-profile.test.ts`
- Potentially modify: `docs/TESTING_GUIDE.md` only if its expected redirect still states `/client/profil`.

**Interfaces:**
- Changes `getDashboardPath("CLIENT")` from `/client/profil` to `/client`.
- Preserves validated internal callback behavior in `loginAction`.
- Other role destinations unchanged.

- [ ] **Step 1: Add failing redirect test**

```ts
import { getDashboardPath } from "../src/lib/session";

test("client login defaults to the Ringkasan route", () => {
  assert.equal(getDashboardPath("CLIENT"), "/client");
  assert.equal(getDashboardPath("VENDOR"), "/dashboard/vendor/profil");
  assert.equal(getDashboardPath("BA"), "/dashboard/ba");
  assert.equal(getDashboardPath("ADMIN"), "/admin");
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npx tsx --test tests/client-couple-profile.test.ts`

Expected: CLIENT currently returns `/client/profil`.

- [ ] **Step 3: Change default client route**

In `getDashboardPath()`:

```ts
case "CLIENT":
default:
  return "/client";
```

Do not alter callback validation; `/client/profil` remains reachable by direct navigation.

- [ ] **Step 4: Run focused tests GREEN**

Run: `npx tsx --test tests/client-couple-profile.test.ts`

- [ ] **Step 5: Run complete database safety checks**

```powershell
npx prisma validate
$env:DATABASE_URL='file:./dev.db'
npx prisma validate --schema prisma/schema.sqlite.prisma
Remove-Item Env:DATABASE_URL
npx prisma migrate status
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script --exit-code
```

Expected: schema valid, migration current, PostgreSQL drift empty.

- [ ] **Step 6: Run full verification**

```powershell
npm run typecheck
npm test
npm run build
git diff --check
```

Expected: all tests and build pass; no whitespace errors.

- [ ] **Step 7: Manual responsive verification**

Login client demo, then verify:

```text
1. Login tanpa callback menuju /client.
2. /client/profil menampilkan role chooser untuk profil legacy.
3. Pilih pemilik pria: data lama masuk kartu kiri sebagai pemilik.
4. Pilih pemilik wanita: data lama masuk kartu kanan sebagai pemilik.
5. Desktop: pria kiri, wanita kanan.
6. 375px: pria di atas, wanita di bawah, tanpa overflow.
7. Save sukses memperbarui banner dan sidebar tanpa login ulang.
8. Refresh mempertahankan semua nilai.
9. Error validation tetap mempertahankan input.
```

- [ ] **Step 8: Request final code review and resolve Critical/Important findings**

Reviewer scope: migration safety, owner mapping, transaction atomicity, legacy fallback, sidebar freshness, mobile accessibility, redirect behavior.

- [ ] **Step 9: Commit final redirect/docs adjustments**

```bash
git add src/lib/session.ts tests/client-couple-profile.test.ts docs/TESTING_GUIDE.md
git commit -m "fix(auth): route clients to portal summary"
```

- [ ] **Step 10: Push feature branch**

```bash
git push -u origin feat/client-couple-profile
```

Do not merge directly. Create a Pull Request targeting `main`, verify Vercel preview, then merge after user approval.

---

## Final Acceptance Checklist

- [ ] `ClientProfile` has four canonical nullable fields in both schemas.
- [ ] PostgreSQL migration is additive; SQLite was backed up before push.
- [ ] User explicitly chooses whether account owner is groom or bride.
- [ ] Groom is always left; bride is always right on desktop.
- [ ] Mobile stacks groom then bride without horizontal overflow.
- [ ] Save updates `User.name`, compatibility `partnerName`, and canonical fields atomically.
- [ ] Save response refreshes form/banner/sidebar without login again.
- [ ] Sidebar uses `coupleDisplayName`, then canonical/legacy fallback.
- [ ] Root dashboard uses canonical couple identity.
- [ ] Client login without callback redirects to `/client`.
- [ ] Other role redirects remain unchanged.
- [ ] Field errors, pending state, focus state, and 44px targets work.
- [ ] Typecheck, full tests, both schema validations, migration/drift check, and production build pass.
