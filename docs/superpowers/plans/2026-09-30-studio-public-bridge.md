# Studio → Public Invitation Bridge (B1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a published studio document render on `/undangan/[slug]`, including the canvas background, without breaking the existing theme-based invitation path.

**Architecture:** Add two nullable logical-link columns to `DigitalInvitation`. A new query module resolves a slug to either a validated studio snapshot (from the latest active `InvitationStudioPublish`) or `null`. The public page branches: studio snapshot present → render via a thin `StudioInvitationPage` wrapper around the existing `StudioSceneRenderer`; otherwise the existing `TemplateEngineResolver` path runs unchanged. Fallback is silent and never errors.

**Tech Stack:** Next.js 15 (App Router, server components), Prisma 6 (PostgreSQL prod + SQLite dev/test), TypeScript, React 19, `node:test` + `node:assert/strict` for tests, `tsx --test`.

**Spec:** `docs/superpowers/specs/2026-09-30-studio-public-bridge-design.md`

## Global Constraints

- Dual Prisma schema: every schema change MUST be applied to both `prisma/schema.prisma` (PostgreSQL, source of truth) and `prisma/schema.sqlite.prisma` (dev/test), copied verbatim per existing convention.
- New `DigitalInvitation` columns MUST be nullable (`String?`) — no data migration, existing rows stay valid.
- The link is a **logical** reference (plain `String?` + `@@index`), NOT a Prisma `@relation`.
- Public render path MUST NEVER 500: any missing/unpublished/invalid snapshot falls back silently to the theme path.
- Reuse the existing `validateStudioDocument` for snapshot validation; do not write a new validator.
- Studio `component` nodes render neutral fixtures — do not attempt live data binding.
- Gate every task on `npm run typecheck`; run `npm test` (tsx --test tests/*.test.ts) for test tasks.
- Commit message style in this repo: conventional prefixes (`feat:`, `test:`, `docs:`), lowercase, imperative.

---

### Task 1: Schema — add nullable studio link columns

**Files:**
- Modify: `prisma/schema.prisma:514-544` (the `DigitalInvitation` model)
- Modify: `prisma/schema.sqlite.prisma` (mirror, same model)
- Test: `tests/invitation-studio-public-link.test.ts` (create)

**Interfaces:**
- Produces: `DigitalInvitation.studioDraftId: string | null`, `DigitalInvitation.studioVersionId: string | null` available on the Prisma client types.

- [ ] **Step 1: Write the failing test**

Create `tests/invitation-studio-public-link.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDb, type TestDb } from './helpers/test-db';
import type { PrismaClient } from '@prisma/client';

let ctx: TestDb;
let prisma: PrismaClient;

test('DigitalInvitation accepts nullable studio link columns', async () => {
  ctx = await createTestDb();
  prisma = ctx.prisma;
  try {
    const inv = await prisma.digitalInvitation.create({
      data: {
        slug: `link-${Date.now()}`,
        themeId: 'autumnelle',
        title: 'Test',
        brideName: 'A',
        groomName: 'B',
        eventDate: new Date('2026-11-20T09:00:00Z'),
        venueName: 'V',
        venueAddress: 'X',
        studioDraftId: 'draft-123',
      },
    });
    assert.equal(inv.studioDraftId, 'draft-123');
    assert.equal(inv.studioVersionId, null);
  } finally {
    await ctx.cleanup();
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/invitation-studio-public-link.test.ts`
Expected: FAIL — `studioDraftId` is not a known argument (types/DB column missing).

- [ ] **Step 3: Add columns to both schemas**

In `prisma/schema.prisma`, inside `model DigitalInvitation`, add after `galleryPhotos`:

```prisma
  studioDraftId     String?   // logical link to InvitationStudioDraft.id (nullable, no relation)
  studioVersionId   String?   // pinned published InvitationStudioVersion.id at link time
```

Then add an index next to `updatedAt` (before the closing brace of the model):

```prisma
  @@index([studioDraftId])
```

Apply the **exact same two fields and the same `@@index`** to the `DigitalInvitation` model in `prisma/schema.sqlite.prisma`.

- [ ] **Step 4: Regenerate clients and push local test DB**

Run:
```bash
npx prisma generate
npx prisma generate --schema prisma/schema.sqlite.prisma
```
Expected: both succeed ("Generated Prisma Client").

- [ ] **Step 5: Run test to verify it passes**

Run: `npx tsx --test tests/invitation-studio-public-link.test.ts`
Expected: PASS.

- [ ] **Step 6: Validate schemas and commit**

Run: `npm run typecheck && npm run validate`
Expected: both clean.

```bash
git add prisma/schema.prisma prisma/schema.sqlite.prisma tests/invitation-studio-public-link.test.ts
git commit -m "feat: add nullable studio link columns to DigitalInvitation"
```

---

### Task 2: Query module — resolve slug + published studio snapshot

**Files:**
- Create: `src/server/queries/public-invitation.ts`
- Test: `tests/invitation-studio-public-link.test.ts` (extend)

**Interfaces:**
- Consumes: `validateStudioDocument` from `@/lib/invitation-studio/validation`; `InvitationStudioDocument` from `@/lib/invitation-studio/types`; prisma tables `DigitalInvitation`, `InvitationStudioPublish`.
- Produces:
  - `type PublicInvitation = { invitation: DigitalInvitationRecord; studioSnapshot: InvitationStudioDocument | null }`
  - `async function resolvePublicInvitation(slug: string, deps?: { db?: PrismaClientLike }): Promise<PublicInvitation | null>` — returns `null` when no invitation row exists; `studioSnapshot` is `null` on any fallback.

**Design note:** `deps.db` is injectable so the DB test can pass the isolated test client; production calls use the shared `prisma`.

- [ ] **Step 1: Write the failing test (extend the file)**

Append to `tests/invitation-studio-public-link.test.ts`:

```ts
import { resolvePublicInvitation } from '../src/server/queries/public-invitation';

test('resolvePublicInvitation returns null for unknown slug', async () => {
  const ctx2 = await createTestDb();
  try {
    const res = await resolvePublicInvitation('does-not-exist', { db: ctx2.prisma });
    assert.equal(res, null);
  } finally {
    await ctx2.cleanup();
  }
});

test('resolvePublicInvitation returns studioSnapshot null when no active publish', async () => {
  const ctx3 = await createTestDb();
  try {
    const slug = `plain-${Date.now()}`;
    await ctx3.prisma.digitalInvitation.create({
      data: { slug, themeId: 'autumnelle', title: 'T', brideName: 'A', groomName: 'B',
        eventDate: new Date('2026-11-20T09:00:00Z'), venueName: 'V', venueAddress: 'X',
        studioDraftId: 'draft-x' },
    });
    const res = await resolvePublicInvitation(slug, { db: ctx3.prisma });
    assert.ok(res);
    assert.equal(res!.studioSnapshot, null);
  } finally {
    await ctx3.cleanup();
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/invitation-studio-public-link.test.ts`
Expected: FAIL — module `../src/server/queries/public-invitation` not found.

- [ ] **Step 3: Implement the query module**

Create `src/server/queries/public-invitation.ts`:

```ts
import { prisma } from "@/lib/prisma";
import { validateStudioDocument } from "@/lib/invitation-studio/validation";
import type { InvitationStudioDocument } from "@/lib/invitation-studio/types";

/** Minimal DB surface used by this module; keeps the module testable. */
type PrismaLike = Pick<typeof prisma, "digitalInvitation" | "invitationStudioPublish">;

export type PublicInvitation = {
  invitation: Awaited<ReturnType<PrismaLike["digitalInvitation"]["findUnique"]>>;
  studioSnapshot: InvitationStudioDocument | null;
};

/**
 * Resolve a public invitation by slug. When the row is linked to a studio draft
 * and that draft has an active published snapshot, the validated snapshot is
 * returned; otherwise `studioSnapshot` is null and callers fall back to the
 * theme renderer. Never throws on snapshot problems — it degrades to null.
 */
export async function resolvePublicInvitation(
  slug: string,
  deps?: { db?: PrismaLike },
): Promise<PublicInvitation | null> {
  const db = deps?.db ?? prisma;
  const invitation = await db.digitalInvitation.findUnique({ where: { slug } });
  if (!invitation) return null;

  const draftId = invitation.studioDraftId;
  if (!draftId) return { invitation, studioSnapshot: null };

  try {
    const publish = await db.invitationStudioPublish.findFirst({
      where: { draftId, unpublishedAt: null },
      orderBy: { publishedAt: "desc" },
    });
    if (!publish?.snapshotJson) return { invitation, studioSnapshot: null };

    const parsed = JSON.parse(publish.snapshotJson) as unknown;
    const checked = validateStudioDocument(parsed);
    if (!checked.success) {
      console.warn(`[public-invitation] invalid studio snapshot for draft ${draftId}: ${checked.errors.join("; ")}`);
      return { invitation, studioSnapshot: null };
    }
    return { invitation, studioSnapshot: checked.data };
  } catch (error) {
    console.warn(`[public-invitation] snapshot resolution failed for draft ${draftId}:`, error);
    return { invitation, studioSnapshot: null };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/invitation-studio-public-link.test.ts`
Expected: PASS (all three tests).

- [ ] **Step 5: Typecheck and commit**

Run: `npm run typecheck`
Expected: clean.

```bash
git add src/server/queries/public-invitation.ts tests/invitation-studio-public-link.test.ts
git commit -m "feat: add public invitation query with studio snapshot resolution"
```

---

### Task 3: Public studio render component

**Files:**
- Create: `src/components/invitation/studio-public/StudioInvitationPage.tsx`
- Test: `tests/invitation-studio-public-link.test.ts` (extend with a render assertion)

**Interfaces:**
- Consumes: `StudioSceneRenderer` from `@/components/admin/invitation-studio/StudioSceneRenderer`; `InvitationStudioDocument`; `backgroundToCss` from `@/lib/invitation-studio/colors`.
- Produces: `function StudioInvitationPage(props: { document: InvitationStudioDocument; guestName?: string }): JSX.Element`.

- [ ] **Step 1: Write the failing test**

Append to `tests/invitation-studio-public-link.test.ts`:

```ts
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StudioInvitationPage } from '../src/components/invitation/studio-public/StudioInvitationPage';
import { createBlankStudioDocument } from '../src/lib/invitation-studio/sections';

test('StudioInvitationPage renders the canvas background from the document', () => {
  const doc = createBlankStudioDocument();
  doc.sections[0].enabled = true;
  doc.background = { kind: 'gradient', from: '#FFFFFF', to: '#F3EDE6', angle: 135 };
  const html = renderToStaticMarkup(
    React.createElement(StudioInvitationPage, { document: doc, guestName: 'Tamu Uji' }),
  );
  assert.match(html, /linear-gradient\(135deg/);
  assert.match(html, /Tamu Uji/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/invitation-studio-public-link.test.ts`
Expected: FAIL — module `StudioInvitationPage` not found.

- [ ] **Step 3: Implement the component**

Create `src/components/invitation/studio-public/StudioInvitationPage.tsx`:

```tsx
"use client";

import { StudioSceneRenderer } from "@/components/admin/invitation-studio/StudioSceneRenderer";
import { backgroundToCss } from "@/lib/invitation-studio/colors";
import { STUDIO_SECTIONS } from "@/lib/invitation-studio/sections";
import type { InvitationStudioDocument } from "@/lib/invitation-studio/types";

/**
 * Public renderer for a published studio document. Reuses StudioSceneRenderer so
 * the canvas background and all sections/nodes render exactly as designed in the
 * editor, without any editor chrome.
 */
export function StudioInvitationPage({
  document,
  guestName,
}: {
  document: InvitationStudioDocument;
  guestName?: string;
}) {
  const lastId = document.sectionOrder[document.sectionOrder.length - 1];

  return (
    <div className="min-h-screen">
      {guestName ? (
        <div className="bg-white/70 px-4 py-2 text-center text-xs font-semibold text-[#4A2E35] backdrop-blur">
          Kepada: {guestName}
        </div>
      ) : null}
      <div className="mx-auto w-full max-w-[480px]" style={backgroundToCss(document.background)}>
        <StudioSceneRenderer document={document} device="mobile" editor={false} transparent={false} />
      </div>
      <div className="sr-only" data-studio-sections={document.sectionOrder.length}>
        {STUDIO_SECTIONS.find((s) => s.id === lastId)?.label ?? ""}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/invitation-studio-public-link.test.ts`
Expected: PASS.

- [ ] **Step 5: Typecheck and commit**

Run: `npm run typecheck`
Expected: clean.

```bash
git add src/components/invitation/studio-public/StudioInvitationPage.tsx tests/invitation-studio-public-link.test.ts
git commit -m "feat: add public studio invitation render component"
```

---

### Task 4: Wire the public page branch

**Files:**
- Modify: `src/app/undangan/[slug]/page.tsx:19-37` (data fetch) and `:127-201` (return block)
- Test: `tests/invitation-studio-routes.test.ts` (extend with a structural assertion)

**Interfaces:**
- Consumes: `resolvePublicInvitation` from `@/server/queries/public-invitation`; `StudioInvitationPage`.
- Produces: `/undangan/[slug]` renders the studio branch when `studioSnapshot` is valid.

- [ ] **Step 1: Write the failing test**

Append to `tests/invitation-studio-routes.test.ts`:

```ts
test('public invitation page branches to the studio renderer when a snapshot exists', () => {
  const page = readFileSync('src/app/undangan/[slug]/page.tsx', 'utf8');
  assert.match(page, /resolvePublicInvitation/);
  assert.match(page, /StudioInvitationPage/);
  assert.match(page, /studioSnapshot/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/invitation-studio-routes.test.ts`
Expected: FAIL — `resolvePublicInvitation` not present in the page.

- [ ] **Step 3: Add the query call and branch**

At the top of `UndanganDetailPage`, add imports:

```tsx
import { resolvePublicInvitation } from "@/server/queries/public-invitation";
import { StudioInvitationPage } from "@/components/invitation/studio-public/StudioInvitationPage";
```

Immediately after `const { slug } = await params;` (before the existing `prisma.digitalInvitation.findUnique`), resolve the studio snapshot and short-circuit when present. Insert:

```tsx
  const resolved = await resolvePublicInvitation(slug).catch(() => null);
  if (resolved?.studioSnapshot) {
    return (
      <StudioInvitationPage document={resolved.studioSnapshot} guestName={guestName} />
    );
  }
```

Keep the existing `prisma.digitalInvitation.findUnique` fallback fetch and everything below it unchanged — when `resolvePublicInvitation` returns null/studioSnapshot null, the page behaves exactly as before.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/invitation-studio-routes.test.ts`
Expected: PASS.

- [ ] **Step 5: Full verify and commit**

Run: `npm run verify`
Expected: typecheck + validate + all tests pass (including existing undangan tests).

```bash
git add "src/app/undangan/[slug]/page.tsx" tests/invitation-studio-routes.test.ts
git commit -m "feat: render published studio snapshot on public invitation page"
```

---

### Task 5: Admin action — link a published draft to a slug

**Files:**
- Modify: `src/server/actions/invitation-studio.ts` (add action)
- Modify: `src/server/actions/invitation-studio-core.ts` (add core function)
- Create: `tests/helpers/studio-link-db.ts` (seed helper)
- Test: `tests/invitation-studio-public-link.test.ts` (extend with a DB-level link test)

**Interfaces:**
- Consumes: existing `prisma`, `requireAdminCapability('MANAGE_ADMIN')`, `recordAdminAudit`.
- Produces:
  - Core: `async function linkStudioDraftToSlug(input: { slug: string; draftId: string }, deps): Promise<ActionResult<{ slug: string; draftId: string }>>`
  - Server action: `export async function linkStudioDraftToSlug(input: { slug: string; draftId: string })`

- [ ] **Step 1: Write the failing test (core link logic, DB-level)**

Append to `tests/invitation-studio-public-link.test.ts`:

```ts
import { linkStudioDraftToInvitation } from '../src/server/actions/invitation-studio-core';

test('linkStudioDraftToInvitation sets studioDraftId on the matching slug', async () => {
  const ctx4 = await createTestDb();
  try {
    const slug = `linkable-${Date.now()}`;
    await ctx4.prisma.digitalInvitation.create({
      data: { slug, themeId: 'autumnelle', title: 'T', brideName: 'A', groomName: 'B',
        eventDate: new Date('2026-11-20T09:00:00Z'), venueName: 'V', venueAddress: 'X' },
    });
    // Pure helper takes a db; no session/audit needed for the domain rule.
    await linkStudioDraftToInvitation({ slug, draftId: 'draft-abc' }, { db: ctx4.prisma });
    const after = await ctx4.prisma.digitalInvitation.findUnique({ where: { slug } });
    assert.equal(after?.studioDraftId, 'draft-abc');
  } finally {
    await ctx4.cleanup();
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/invitation-studio-public-link.test.ts`
Expected: FAIL — `linkStudioDraftToInvitation` not exported.

- [ ] **Step 3: Implement the core helper**

Add to `src/server/actions/invitation-studio-core.ts` (export a small pure helper near the top, alongside the other exported functions; it does not need actor/audit):

```ts
/** Attach a studio draft to an existing public invitation slug. */
export async function linkStudioDraftToInvitation(
  input: { slug: string; draftId: string },
  deps: { db: PrismaClient },
): Promise<void> {
  const updated = await deps.db.digitalInvitation.updateMany({
    where: { slug: input.slug },
    data: { studioDraftId: input.draftId },
  });
  if (updated.count === 0) throw new DomainError('STUDIO_LINK_NOT_FOUND', `Invitation slug tidak ditemukan: ${input.slug}`);
}
```

If `DomainError` is not already imported in that file, add:
```ts
import { DomainError } from '@/server/services/errors';
```
`invitation-studio-core.ts` already imports `{ DomainError, toMappedError }` from `@/server/services/errors` (line 8), so no import change is needed — just use `DomainError` directly.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/invitation-studio-public-link.test.ts`
Expected: PASS.

- [ ] **Step 5: Add the guarded server action wrapper**

Append to `src/server/actions/invitation-studio.ts`:

```ts
export async function linkStudioDraftToSlug(input: { slug: string; draftId: string }) {
  return finish(
    (async (): Promise<ActionResult<{ slug: string; draftId: string }>> => {
      const { requireAdminCapability } = await import('@/server/auth/admin-guard');
      await requireAdminCapability('MANAGE_ADMIN');
      await linkStudioDraftToInvitation(input, { db: prisma });
      return { success: true, data: input };
    })(),
    input.draftId,
  );
}
```

Add the import at the top of `src/server/actions/invitation-studio.ts`:
```ts
import { studioActionDependencies, linkStudioDraftToInvitation } from './invitation-studio-core';
```
(replace the existing `studioActionDependencies` import line.)

- [ ] **Step 6: Typecheck, verify, commit**

Run: `npm run typecheck && npm test`
Expected: clean + all tests pass.

```bash
git add src/server/actions/invitation-studio.ts src/server/actions/invitation-studio-core.ts tests/invitation-studio-public-link.test.ts
git commit -m "feat: add admin action to link published studio draft to a slug"
```

---

### Task 6: End-to-end integration test

**Files:**
- Test: `tests/invitation-studio-public-link.test.ts` (extend with a full flow)

**Interfaces:**
- Consumes: `resolvePublicInvitation`, `linkStudioDraftToInvitation`, prisma tables.

- [ ] **Step 1: Write the failing test**

Append to `tests/invitation-studio-public-link.test.ts`:

```ts
import { createBlankStudioDocument } from '../src/lib/invitation-studio/sections';

test('linked + published draft resolves to a validated studio snapshot', async () => {
  const ctx5 = await createTestDb();
  try {
    const now = Date.now();
    const owner = await ctx5.prisma.user.create({
      data: { name: 'Admin', phone: `0877${String(now).slice(-8)}`, role: 'ADMIN', adminRole: 'SUPER_ADMIN' },
    });
    const draft = await ctx5.prisma.invitationStudioDraft.create({
      data: { ownerId: owner.id, name: `Draft ${now}`, status: 'PUBLISHED' },
    });
    const doc = createBlankStudioDocument();
    doc.background = { kind: 'solid', color: '#4A2E35' };
    const version = await ctx5.prisma.invitationStudioVersion.create({
      data: { draftId: draft.id, authorId: owner.id, versionNumber: 1, schemaVersion: 1, documentJson: JSON.stringify(doc) },
    });
    await ctx5.prisma.invitationStudioPublish.create({
      data: { draftId: draft.id, sourceVersionId: version.id, publisherId: owner.id, schemaVersion: 1, snapshotJson: JSON.stringify(doc) },
    });

    const slug = `full-${now}`;
    await ctx5.prisma.digitalInvitation.create({
      data: { slug, themeId: 'autumnelle', title: 'T', brideName: 'A', groomName: 'B',
        eventDate: new Date('2026-11-20T09:00:00Z'), venueName: 'V', venueAddress: 'X' },
    });
    await linkStudioDraftToInvitation({ slug, draftId: draft.id }, { db: ctx5.prisma });

    const res = await resolvePublicInvitation(slug, { db: ctx5.prisma });
    assert.ok(res?.studioSnapshot);
    assert.deepEqual(res!.studioSnapshot!.background, { kind: 'solid', color: '#4A2E35' });
  } finally {
    await ctx5.cleanup();
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/invitation-studio-public-link.test.ts`
Expected: FAIL if any earlier wiring is missing; PASS once Tasks 1–5 are complete. (If it already passes, that confirms the wiring — proceed.)

- [ ] **Step 3: Fix any gaps revealed**

If the test fails, the error points to the missing piece (schema column, query branch, or link helper). Fix the corresponding source file from Tasks 1–5.

- [ ] **Step 4: Run the full gate**

Run: `npm run verify`
Expected: typecheck clean, prisma validate clean, all tests pass.

- [ ] **Step 5: Commit**

```bash
git add tests/invitation-studio-public-link.test.ts
git commit -m "test: end-to-end resolution of linked published studio snapshot"
```

---

### Task 7: Manual smoke + docs

**Files:**
- Modify: `docs/superpowers/specs/2026-09-30-studio-public-bridge-design.md` (mark status Shipped)

- [ ] **Step 1: Smoke test locally**

With the dev server running on port 3000 (`npm run dev`), seed one linked+publishing draft to a real slug (use the pattern from Task 6's test against `prisma/dev.db` via a one-off `tsx` script), then open `http://localhost:3000/undangan/<slug>`.
Expected: the studio document renders with the chosen background; no editor chrome; the theme path still works for non-linked slugs.

- [ ] **Step 2: Existing-slug regression check**

Open `http://localhost:3000/undangan/autumnelle` (a theme slug).
Expected: renders the original theme exactly as before (no studio branch).

- [ ] **Step 3: Update spec status and commit**

Change the spec header `**Status:** Draft` → `**Status:** Shipped`.

```bash
git add docs/superpowers/specs/2026-09-30-studio-public-bridge-design.md
git commit -m "docs: mark studio public bridge spec as shipped"
```

---

## Self-Review

**Spec coverage:**
- Nullable link columns → Task 1 ✓
- Query module with validation + silent fallback → Task 2 ✓
- Studio render component (background flows via `backgroundToCss`) → Task 3 ✓
- Page branch with theme fallback → Task 4 ✓
- Admin link action → Task 5 ✓
- Unit + integration tests + regression → Tasks 2, 3, 4, 6 ✓
- Error handling (never 500) → Task 2 (`try/catch`, `console.warn`, returns null) ✓
- Rollout / manual smoke / docs → Task 7 ✓

**Placeholder scan:** No TBD/TODO. Task 5's error handling uses `DomainError` from `@/server/services/errors`, which `invitation-studio-core.ts` already imports.

**Type consistency:** `resolvePublicInvitation(slug, deps?)` used identically in Tasks 2, 4, 6. `linkStudioDraftToInvitation({ slug, draftId }, { db })` used identically in Tasks 5 and 6 (the server action `linkStudioDraftToSlug` names the same pair as `{ slug, draftId }`). `StudioInvitationPage({ document, guestName })` consistent in Tasks 3 and 4. `InvitationStudioDocument.background` is the already-shipped optional field.

**Known limitations carried from spec:** studio `component` nodes render neutral fixtures; ownership linking is an admin action; the snapshot (not the latest version) is rendered.
