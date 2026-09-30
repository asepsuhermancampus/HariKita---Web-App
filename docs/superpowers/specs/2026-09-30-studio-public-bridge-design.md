# Studio Invitation → Public Page Bridge (B1) — Design

**Date:** 2026-09-30
**Status:** Shipped
**Depends on:** Canvas Background feature (shipped: `StudioBackground`, `backgroundToCss`)

## Problem

The invitation studio renders a free-form canvas document (`InvitationStudioDocument`)
via `StudioSceneRenderer`. Publishing a draft stores an immutable snapshot in
`InvitationStudioPublish.snapshotJson`, but **nothing renders that snapshot publicly**.

The public invitation page `/undangan/[slug]` reads a completely separate record
(`DigitalInvitation`) and renders it through `TemplateEngineResolver` + a theme preset
from the registry. There is no foreign key or shared field linking the two.

Consequence: any design made in the studio — including the new canvas background —
never reaches a real guest. This bridges the two so a **published studio document
renders on `/undangan/[slug]`**.

## Goals

- A published studio snapshot renders at `/undangan/[slug]` for a real slug.
- The canvas background (solid / gradient / texture) and all studio sections/nodes render.
- Existing theme-based invitations keep working unchanged (backward compatible).
- No data migration required for existing invites.

## Non-Goals

- Replacing `TemplateEngineResolver` for theme-based invites.
- Editing studio documents from the public page.
- Data-binding studio `component` nodes to live RSVP records (fixtures only, matching current studio contract).
- Guest session tokens (kept as the existing `?to=` / `?sesi=` query params).

## Key Decision: how the link is made

`DigitalInvitation` gains two **nullable** fields:

```prisma
model DigitalInvitation {
  // ...existing fields
  studioDraftId     String?   // links to InvitationStudioDraft.id (logical FK, no relation enforced)
  studioVersionId   String?   // pinned published version at link time (optional)
  @@index([studioDraftId])
}
```

Nullable ⇒ every existing row stays valid, no backfill, no data migration. The link is a
**logical** reference (not a Prisma `@relation`) so the public read path stays decoupled and
the studio tables' onDelete rules are untouched.

## Rendering Decision

`/undangan/[slug]` resolution becomes:

1. Fetch `DigitalInvitation` by slug (as today).
2. If `invitation.studioDraftId` is set **and** an active publish exists
   (`InvitationStudioPublish` where `unpublishedAt === null`, latest `publishedAt`),
   render the studio snapshot.
3. Otherwise, render the existing `TemplateEngineResolver` path exactly as today.

Studio render branch uses a new `StudioInvitationPage` client component that wraps
`StudioSceneRenderer` with `transparent={false}`, wrapping data (guest name, session) from
the same `DigitalInvitation` row. `StudioSceneRenderer` already resolves
`backgroundToCss(document.background)`, so the background flows through automatically.

## Components / Units

| Unit | Responsibility | Depends on |
|------|----------------|------------|
| `prisma` schema (both postgres + sqlite) | Add nullable `studioDraftId` / `studioVersionId` + index | — |
| `server/queries/public-invitation.ts` | Given slug → `{ invitation, studioSnapshot }`. Encapsulates publish lookup + JSON parse + validation | prisma, `validateStudioDocument` |
| `components/invitation/studio-public/StudioInvitationPage.tsx` | Public shell: renders studio scene, guest/session header, no editor chrome | `StudioSceneRenderer` |
| `app/undangan/[slug]/page.tsx` | Branch: studio snapshot present → `StudioInvitationPage`; else existing path | query module |
| admin link action (`server/actions/invitation-studio.ts` or invite editor) | Attach a published draft to a `DigitalInvitation.slug` | prisma |

## Data Flow

```
GET /undangan/[slug]
  → getPublicInvitation(slug)
      → prisma.digitalInvitation.findUnique({ where:{slug} })
      → if studioDraftId: prisma.invitationStudioPublish.findFirst({ where:{draftId, unpublishedAt:null}, orderBy:{publishedAt:'desc'} })
          → validateStudioDocument(JSON.parse(snapshotJson))  // reuse existing validator
  → if valid snapshot: <StudioInvitationPage document=... invitation=.../>
  → else: <TemplateEngineResolver .../>   (unchanged)
```

## Error Handling

- Snapshot missing / unpublished / invalid JSON / fails `validateStudioDocument` →
  **silently fall back** to the theme path (never 500 a live guest page).
- `studioDraftId` set but draft deleted → fall back to theme path.
- Log a server-side warning on fallback (no stack leak to client).

## Testing

- Unit: `getPublicInvitation` resolves correctly for (a) plain invitation, (b) linked +
  published, (c) linked but unpublished → fallback, (d) invalid snapshot → fallback.
- Unit: `StudioInvitationPage` renders the background style for solid/gradient/texture.
- Integration: a linked published doc renders studio markup at `/undangan/[slug]`.
- Regression: existing `/undangan/[slug]` tests still pass unchanged.
- Gate: `npm run verify` (typecheck + prisma validate + full test suite).

## Rollout

1. Schema change (nullable) + `prisma db push` locally; production migration via `prisma migrate`.
2. Query module + public component + page branch.
3. Admin link action (attach published draft to a slug).
4. Verify gate + manual smoke on `/undangan/<linked-slug>`.

## Risks / Open Questions

- **Ownership linking**: only SUPER_ADMIN owns studio drafts today; linking a draft to a
  client's `DigitalInvitation` is an admin action. Confirm the admin UX entry point.
- **Node data binding**: studio `component` nodes render neutral fixtures, so a public
  studio invite shows placeholder RSVP/gallery content, not the client's real data. This
  matches the current studio contract but is a visible limitation — call it out in the UI.
- **Snapshot immutability**: rendering the *published snapshot* (not the latest version)
  keeps guests stable across later edits; confirm this is desired (recommended: yes).
