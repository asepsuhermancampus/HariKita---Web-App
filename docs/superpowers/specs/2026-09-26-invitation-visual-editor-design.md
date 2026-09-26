# Invitation Visual Editor — Design Specification

## 1. Goal

Build a fresh SuperAdmin-only invitation studio for creating unlimited independent invitation drafts. Existing invitation themes remain untouched. The first release supports full page composition through a controlled React/DOM scene graph, SVG/PNG catalog assets, Motion for React animation presets, responsive mobile-first overrides, sandbox preview, autosave, undo/redo, review workflow, and immutable publishing snapshots.

This is an exploratory authoring tool. Client/vendor consumption and replacement of existing themes are explicitly outside the initial release.

## 2. Approved decisions

- Editor device: desktop/laptop; smartphone is preview-only.
- Drafts: unlimited; create, rename, duplicate, archive, delete with confirmation.
- Workflow: `DRAFT -> REVIEW -> APPROVED -> PUBLISHED`; unpublish archives/deactivates the public snapshot.
- Approval and publication: only the project owner SuperAdmin.
- Editing an Approved or Published design creates a new working version in Draft; published snapshots remain unchanged.
- Publish creates an immutable snapshot. Approved does not publish automatically.
- Blank starting point: neutral template with structure and fixture content; decoration/content composition starts empty.
- Sections: 16 total. Cover and closing are mandatory and locked in order. The other 14 may be enabled, disabled, and reordered.
- Section list: Cover, Hero, Couple Profile, Events, Countdown, Love Story, Gallery, Map, RSVP, Guestbook, Gifts, Rundown, Dress Code, Entourage, Quote/Prayer, Closing.
- Editor model: DOM/React scene graph with SVG/PNG/image/text/component nodes and Motion for React.
- Asset source: project directory catalog through a curated manifest; no upload in MVP.
- Asset catalog: categories plus tags, thumbnails, names, and search/filter surface.
- Coordinates: percentage-based with min/max size constraints. Mobile is the base; desktop is an optional override.
- Overflow: visual nodes may cross section boundaries without affecting layout. Section-origin stacking context remains authoritative. Public page horizontal overflow is forbidden.
- Layers: background, content, behind-content, and front-decoration/component ordering. Layer thumbnails, reorder, visibility, lock, rename, duplicate, and delete are required.
- Interactions: drag on canvas plus numeric inspector. Locked nodes cannot transform. Interactive hit areas remain protected.
- Components: all visual and official interactive blocks are configurable through typed inspectors, not arbitrary HTML.
- Preview: sandbox fixtures only, full invitation preview, 375px, 768px, and desktop checks.
- Persistence: debounced server-side autosave, visible save status, retry, undo/redo, optimistic conflict protection.

## 3. Editor architecture

```text
SuperAdmin Invitation Studio
├── Top bar: draft, status, undo/redo, save, preview, review, publish
├── Section navigator: enabled state and ordering
├── Asset catalog: category/tag/search/thumbnail
├── Responsive canvas: mobile base and desktop override
├── Layer tree: thumbnail, reorder, lock, visibility, rename, duplicate, delete
└── Properties inspector: transform, appearance, animation, responsive, interaction
```

The renderer consumes a versioned document JSON and renders the same document model in editor preview and future public output. Editor-only selection handles and guides are not persisted as public nodes.

### Document model

```text
InvitationStudioDocument
├── schemaVersion
├── metadata
├── sectionOrder
├── sections[]
│   ├── sectionType
│   ├── enabled
│   ├── layout
│   ├── nodes[]
│   └── overflowPolicy
└── fixtureProfile
```

Each node has a stable ID, typed node kind, layer, visibility, lock state, base mobile transform, optional desktop override, appearance, animation preset, accessibility metadata, and component-specific configuration.

## 4. Storage and workflow

Use isolated studio records rather than modifying existing invitation/theme records:

```text
InvitationStudioDraft
InvitationStudioVersion
InvitationStudioPublish
```

Versions store schema version, complete document JSON, version number, change summary, and timestamps. Publish records store an immutable snapshot, source version, publisher, and lifecycle timestamps. All mutations are server-side validated and SuperAdmin-guarded. Audit entries are required for review, approve, publish, unpublish, archive, and delete.

Transitions reject invalid status changes. A review submission freezes ordinary editing until the owner returns it to Draft or records a review decision. Any edit to Approved/Published creates a new working version; it never mutates the immutable snapshot.

## 5. Validation and safety

Server validation must verify schema version, mandatory sections, unique section/node IDs, valid node kinds, registered asset IDs, safe transforms, size bounds, valid layer values, registered animation presets, complete interactive component configuration, and absence of arbitrary external asset URLs. Interactive nodes receive protected hit areas. SVG paths resolve only through the curated asset manifest. No upload or live payment integration is included.

The editor must not modify or migrate existing invitation/theme data in this phase. Existing client/vendor routes remain unchanged. Published studio output remains internal until a later, separately approved integration phase.

## 6. Motion and asset behavior

Motion for React supplies a finite preset registry: entrance, float, sway, pulse, drift, reveal, and exit variants as appropriate. Presets expose bounded duration, delay, intensity, direction, repeat, and trigger values. Arbitrary user-authored JavaScript animation is out of scope. Reduced-motion preview/render behavior is required.

SVG and PNG assets render as controlled React nodes. SVG files are cataloged and trusted from the project manifest; runtime URL input is rejected. Asset nodes support position, size, rotation, flip, opacity, layer ordering, visibility, lock, and animation configuration.

## 7. Verification

Tests must cover document validation, transform normalization, layer ordering and lock behavior, mobile-to-desktop inheritance, undo/redo, autosave conflicts, lifecycle transitions, immutable snapshots, asset manifest resolution, SuperAdmin authorization, reduced motion, and responsive overflow at 375px/768px/desktop. Existing invitation regression tests must remain green.

## 8. Delivery phases

1. Foundation: schema, storage, validator, SuperAdmin guard, draft CRUD, lifecycle.
2. Editor shell: navigation, catalog, layer tree, inspector, responsive canvas, fixtures.
3. Composition: all node types, transform operations, responsive overrides, overflow behavior.
4. Motion/components: preset registry and 16 section/component renderers.
5. Persistence: autosave, undo/redo, conflicts, versions, snapshots, audit.
6. Verification: unit, integration, responsive, security, and regression checks.

## 9. Explicit non-goals

- No changes to the existing 60+/71 invitation themes.
- No client/vendor access in the initial release.
- No upload pipeline.
- No arbitrary HTML/JavaScript execution.
- No free-form SVG/WebGL/canvas renderer as the primary document model.
- No automatic public publication.
- No production payment or RSVP behavior in the sandbox preview.
