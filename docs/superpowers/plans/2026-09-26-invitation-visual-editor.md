# Invitation Visual Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an isolated SuperAdmin invitation studio for unlimited fresh drafts with a React/DOM scene graph, responsive layer editing, Motion for React presets, sandbox preview, autosave, review workflow, and immutable publish snapshots.

**Architecture:** Add isolated studio persistence and typed document validation beside existing invitation models. Render a versioned JSON document through a client editor shell: section navigator, asset catalog, layer tree, canvas, and inspector. Keep existing template registry, public routes, client/vendor flows, and production invitation records unchanged.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind/DaisyUI, Prisma + SQLite/PostgreSQL schemas, Server Actions, React hooks, Motion for React (`motion/react`).

**Spec:** `docs/superpowers/specs/2026-09-26-invitation-visual-editor-design.md`

## Global Constraints

- SuperAdmin only; draft preview internal until explicit Publish.
- Existing themes and public client/vendor invitation routes remain unchanged.
- Mobile is the base layout; desktop is an optional override.
- Cover and Closing remain enabled and fixed in order; other 14 sections can be enabled and reordered.
- SVG/PNG assets resolve only through the curated project manifest; no upload or external asset URLs.
- Asset overflow may cross section boundaries visually but must never cause page horizontal overflow.
- All database mutations use validated server actions; publish snapshots are immutable.
- Back up `prisma/dev.db` before schema changes; update both Prisma schemas and validate both database targets.
- No floating-point currency fields; no live payment or public RSVP integration in sandbox preview.

## File Map

- Create `src/lib/invitation-studio/types.ts`: document, node, section, lifecycle, and inspector contracts.
- Create `src/lib/invitation-studio/sections.ts`: canonical 16-section registry and ordering rules.
- Create `src/lib/invitation-studio/assets.ts`: curated manifest adapter, categories, tags, and safe asset lookup.
- Create `src/lib/invitation-studio/validation.ts`: server-safe document and transition validators.
- Create `src/server/queries/invitation-studio.ts`: SuperAdmin-scoped reads.
- Create `src/server/actions/invitation-studio.ts`: draft/version/autosave/workflow mutations.
- Create `src/components/admin/invitation-studio/`: shell, canvas, layer tree, catalog, inspector, section navigator, preview.
- Create `src/app/admin/undangan-studio/page.tsx`: guarded studio index.
- Create `src/app/admin/undangan-studio/[draftId]/page.tsx`: guarded editor route.
- Modify both `prisma/schema.prisma` and `prisma/schema.sqlite.prisma`: isolated studio models and relations.
- Create Prisma migration and schema-focused tests.
- Create `tests/invitation-studio.test.ts`: domain, persistence, workflow, and security coverage.

### Task 1: Define typed document contract and section registry

**Files:** Create `src/lib/invitation-studio/types.ts`, `src/lib/invitation-studio/sections.ts`, `tests/invitation-studio.test.ts`.

- [ ] Write failing tests for all 16 IDs, mandatory cover/closing, mobile base/desktop override, node transforms, layer values, and lifecycle values.
- [ ] Run `npx tsx --test tests/invitation-studio.test.ts`; expect missing exports.
- [ ] Implement discriminated TypeScript types: `InvitationStudioDocument`, `StudioSection`, `StudioNode`, `StudioTransform`, `StudioAnimation`, `StudioStatus`, and `StudioLayer`.
- [ ] Implement `STUDIO_SECTIONS`, `createBlankStudioDocument()`, `canReorderSection()`, and `normalizeSectionOrder()`.
- [ ] Run the focused test; expect pass.
- [ ] Commit: `feat(studio): define invitation editor document contract`.

### Task 2: Add asset catalog and document validation

**Files:** Create `src/lib/invitation-studio/assets.ts`, `src/lib/invitation-studio/validation.ts`; extend `tests/invitation-studio.test.ts`.

- [ ] Test registered SVG/PNG lookup, category/tag filtering, rejection of unknown paths, duplicate IDs, missing mandatory sections, invalid transforms, unsafe URLs, and unknown animation presets.
- [ ] Implement manifest-backed `listStudioAssets()`, `findStudioAsset()`, and `filterStudioAssets()` without upload support.
- [ ] Implement `validateStudioDocument(input): {success:true,data:InvitationStudioDocument}|{success:false,errors:string[]}` with bounded percentages, size limits, safe z-index, typed component config, and mandatory sections.
- [ ] Implement `validateStudioTransition(from, to, actor)` limiting approval/publication to SuperAdmin and requiring valid documents.
- [ ] Run focused tests; commit `feat(studio): validate documents and catalog assets`.

### Task 3: Persist isolated drafts and immutable versions

**Files:** Modify both Prisma schemas; create migration; create `src/server/queries/invitation-studio.ts`; extend tests.

- [ ] Back up `prisma/dev.db`.
- [ ] Add `InvitationStudioDraft`, `InvitationStudioVersion`, `InvitationStudioPublish`, and audit relation fields without changing existing invitation models.
- [ ] Add uniqueness/index constraints for draft owner/name, draft-version number, and publish source version.
- [ ] Run `prisma validate` for both schemas and `prisma db push --schema prisma/schema.sqlite.prisma` against a test database; verify relation reads/writes.
- [ ] Implement SuperAdmin-scoped `listStudioDrafts`, `getStudioDraft`, `getStudioVersion`, and `getPublishedSnapshot`.
- [ ] Test unlimited draft creation, version retrieval, isolation from existing `DigitalInvitation`, and immutable snapshot reads.
- [ ] Commit `feat(studio): add isolated draft version persistence`.

### Task 4: Implement server actions and lifecycle

**Files:** Create `src/server/actions/invitation-studio.ts`; extend tests.

- [ ] Test create, rename, duplicate, archive, delete confirmation token, autosave, optimistic version conflict, submit review, approve, publish, unpublish, and edit-after-publish.
- [ ] Implement actions returning typed `ActionResult`: `createStudioDraft`, `renameStudioDraft`, `duplicateStudioDraft`, `archiveStudioDraft`, `deleteStudioDraft`, `saveStudioDocument`, `submitStudioReview`, `approveStudioDraft`, `publishStudioVersion`, and `unpublishStudioDraft`.
- [ ] Require authenticated `ADMIN` with resolved `SUPER_ADMIN`; validate all input and transition server-side.
- [ ] Autosave creates a new working version only when content changed; publish copies validated JSON into immutable snapshot storage.
- [ ] Record audit entries for review, approve, publish, unpublish, archive, and delete.
- [ ] Run focused and schema tests; commit `feat(studio): add draft workflow actions`.

### Task 5: Build guarded SuperAdmin studio routes and shell

**Files:** Create `src/app/admin/undangan-studio/page.tsx`, `src/app/admin/undangan-studio/[draftId]/page.tsx`, and `src/components/admin/invitation-studio/StudioShell.tsx`.

- [ ] Test route-level SuperAdmin authorization and not-found behavior using existing admin guard conventions.
- [ ] Implement index cards with create, rename, duplicate, archive, delete, status, and last-saved controls.
- [ ] Implement editor shell with top bar, workflow actions, save indicator, undo/redo controls, preview control, and responsive desktop-first layout.
- [ ] Preserve mobile usability: touch targets at least 44px, no horizontal overflow at 375px/768px.
- [ ] Add the studio route to SuperAdmin navigation only; do not expose it to other roles.
- [ ] Run typecheck and focused route tests; commit `feat(studio): add SuperAdmin invitation studio shell`.

### Task 6: Implement section navigator, catalog, layers, and inspector

**Files:** Create `SectionNavigator.tsx`, `AssetCatalog.tsx`, `LayerTree.tsx`, `PropertiesInspector.tsx`; add component tests.

- [ ] Test section enabled/order rules, layer selection under overlap, lock behavior, visibility, duplicate/delete, numeric transform edits, and desktop override inheritance.
- [ ] Implement section list with fixed cover/closing, enabled toggles, and reorder controls for the remaining sections.
- [ ] Implement categorized/tagged asset catalog with thumbnails and search.
- [ ] Implement layer thumbnails with reorder, lock, visibility, rename, duplicate, delete; locked nodes reject canvas transformations.
- [ ] Implement inspector controls for percentage position/size, rotate, flip, opacity, layer, overflow, animation preset, and responsive override.
- [ ] Run component tests; commit `feat(studio): add editor controls and layer management`.

### Task 7: Implement responsive canvas and React scene renderer

**Files:** Create `ResponsiveStudioCanvas.tsx`, `StudioSceneRenderer.tsx`, `StudioNodeRenderer.tsx`, `studio-motion-presets.ts`; add tests.

- [ ] Test drag normalization to percentage coordinates, min/max size clamping, mobile-to-desktop fallback, cross-section visual overflow, and protected interactive hit areas.
- [ ] Implement mobile and desktop frames with guides, selection handles, drag/resize/rotate/flip operations, and numeric state updates.
- [ ] Render SVG/PNG/photo/background/text and typed interactive component nodes through React DOM; keep editor handles separate from persisted document nodes.
- [ ] Add Motion for React dependency and bounded presets for entrance, float, sway, pulse, drift, reveal, and exit with reduced-motion behavior.
- [ ] Enforce section-origin stacking context and `pointer-events` protection for interactive nodes; verify page-level overflow remains hidden.
- [ ] Run component tests and typecheck; commit `feat(studio): add responsive scene canvas and motion presets`.

### Task 8: Add sandbox preview and full invitation composition

**Files:** Create `StudioPreview.tsx`, `studio-fixtures.ts`, section renderer modules under `src/components/admin/invitation-studio/sections/`; add tests.

- [ ] Test all 16 section renderers, disabled-section omission, order preservation, fixture-only content, and preview viewport modes.
- [ ] Implement neutral structure with sandbox fixture data for couple, events, gallery, RSVP, maps, gifts, rundown, dress code, entourage, and quote/prayer.
- [ ] Implement official interactive blocks as controlled typed components; preview actions remain simulated and cannot mutate production RSVP/payment data.
- [ ] Implement full preview using the same document renderer as canvas/public future integration.
- [ ] Run responsive preview tests at 375px, 768px, and desktop; commit `feat(studio): add sandbox invitation preview`.

### Task 9: Add history, autosave UX, and verification suite

**Files:** Create `src/lib/invitation-studio/history.ts`, `SaveStatus.tsx`, `UndoRedoControls.tsx`; extend tests and docs.

- [ ] Test bounded undo/redo snapshots, redo invalidation after new edits, debounce behavior, retry state, and conflict rejection.
- [ ] Implement local working history over validated document snapshots; persist only through the server action with optimistic version token.
- [ ] Add visible `Saving`, `Saved`, and `Error` status with retry and no silent data loss.
- [ ] Run `npm run typecheck`, `npm run validate`, `npm run test`, and asset/schema checks; verify existing invitation tests remain green.
- [ ] Review diff for existing theme/database scope violations and run `git diff --check`.
- [ ] Commit `test(studio): verify editor persistence and responsive behavior`.

## Final Verification

Run from the feature worktree:

```powershell
npm run typecheck
npm run validate
npm test
git diff --check
```

Confirm manually: non-SuperAdmin access is rejected; existing themes render unchanged; draft CRUD is unlimited; mobile/desktop overrides persist; locked layers do not move; publish snapshots do not change after later edits; no preview produces horizontal overflow.
