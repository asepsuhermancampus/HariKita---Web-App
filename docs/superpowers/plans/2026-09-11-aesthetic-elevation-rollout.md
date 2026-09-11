# Aesthetic Elevation & Autonomous Art Improvisation Engine (V4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Elevate and transform degraded/blurry SVG assets across the HariKita library into luxury digital wedding illustrations using the V4 Aesthetic Elevation architecture, while strictly protecting already-accurate assets.

**Architecture:** A domain-aware vectorization engine that classifies assets by visual anatomy (delicate filigree, multi-chromatic bouquets, lush watercolor foliage, and clean line art) and applies high-density CIELAB clustering with 100% negative space preservation, eliminating flat posterized blobs and blocked cavities.

**Tech Stack:** Node.js, `sharp`, `pngjs`, `potrace`, CIELAB color science ($\Delta E$).

**Spec:** `docs/superpowers/specs/2026-09-11-aesthetic-elevation-vectorizer-design.md`

## Global Constraints

- Pure Vector Guarantee: 100% vector tags (`<path>`, `<rect>`), strictly 0 `<image>`, 0 `base64`.
- 100% Offline Independence: Zero remote network calls to external CDNs.
- Whitelist Protection: Never modify or overwrite assets verified as Grade A / Whitelisted.
- Luxury Wedding Aesthetics: Curated natural botanical palettes (sage, olive, royal violet, blush silk, ivory cream, gilded gold).

---

### Task 1: Whitelist Registry & Benchmark Baseline Locking

**Files:**
- Create: `scripts/whitelist_registry.json`
- Test: `scripts/verify_whitelist.js`

**Interfaces:**
- Produces: `isWhitelisted(filename)` boolean helper for batch processors.

- [x] **Step 1: Create Whitelist Registry**

Write `scripts/whitelist_registry.json` containing all verified Grade A assets:
```json
[
  "vector-2.svg",
  "1754648453_kdo54-bg-3.svg",
  "event-bottom-right.svg",
  "event-top-left.svg",
  "event-top-right.svg",
  "event-bottom-left.svg",
  "bride-flower-3.svg",
  "bg-flower-3.svg",
  "1754403915_kdo56-flower-1.svg"
]
```

- [x] **Step 2: Create Verification Script for Whitelist**

Write `scripts/verify_whitelist.js` to ensure every whitelisted asset exists, is non-empty, and has valid `<svg>` tags.

- [x] **Step 3: Run Verification Script**

Run: `node scripts/verify_whitelist.js`
Expected: PASS with 9/9 verified.

- [x] **Step 4: Commit**

```bash
git add scripts/whitelist_registry.json scripts/verify_whitelist.js
git commit -m "feat: establish whitelist registry for verified aesthetic assets"
```

---

### Task 2: Core V4 Vectorizer Engine Integration

**Files:**
- Create: `scripts/ultra_fidelity_vectorizer_v4.js`
- Test: `scripts/test_v4_engine.js`

**Interfaces:**
- Produces: `vectorizeV4(pngBuffer, filename)` returning an SVG string.
- Consumes: CIELAB color conversions, bilinear upscaler, bilateral smoother, Potrace contour tracer.

- [x] **Step 1: Write failing unit test for V4 Engine**

Test that:
1. Corner ornaments preserve 100% hollow negative space (no solid background plate).
2. Florals with green leaves and colored petals receive domain-partitioned multi-clustering.
3. Botanical leaves receive >= 5 smooth watercolor layers without 3-band posterization.

- [x] **Step 2: Run test to verify it fails**

Run: `node scripts/test_v4_engine.js`
Expected: FAIL ("Cannot find module ultra_fidelity_vectorizer_v4").

- [x] **Step 3: Implement `scripts/ultra_fidelity_vectorizer_v4.js`**

Implement:
1. `traceHollowFiligree(upPng)` for lace/corner/frames.
2. `traceDomainPartitionedBouquet(upPng)` for multi-colored floral bouquets.
3. `traceMultiLayerBotanical(upPng)` for watercolor leaves (6-8 smooth layers).
4. `traceLineArtV4(upPng)` for clean dividers and sketched lines.
5. Removal of hardcoded `flower-3` substring checks.

- [x] **Step 4: Run test to verify it passes**

Run: `node scripts/test_v4_engine.js`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add scripts/ultra_fidelity_vectorizer_v4.js scripts/test_v4_engine.js
git commit -m "feat: implement ultra-fidelity vectorizer v4 engine"
```

---

### Task 3: Batch Elevation of the 72 Flagged Assets

**Files:**
- Create: `scripts/run_v4_elevation_batch.js`
- Test: `scripts/verify_v4_elevation_batch.js`

**Interfaces:**
- Consumes: `vectorizeV4`, `scripts/whitelist_registry.json`.
- Modifies: Flagged SVG assets in `references/kadio-assets/harvested/svg/`.

- [x] **Step 1: Create batch elevation script**

Process only non-whitelisted assets that match the audit criteria.

- [x] **Step 2: Execute batch elevation**

Run: `node scripts/run_v4_elevation_batch.js`
Expected: Process 72 flagged assets with 100% success rate, 0 errors.

- [x] **Step 3: Verify all generated SVGs**

Run: `node scripts/verify_v4_elevation_batch.js`
Expected: 0 `<image>`, 0 `base64`, 0 empty files, 100% valid XML.

- [x] **Step 4: Commit**

```bash
git add references/kadio-assets/harvested/svg/ scripts/run_v4_elevation_batch.js scripts/verify_v4_elevation_batch.js
git commit -m "feat: execute batch aesthetic elevation across flagged assets"
```

---

### Task 4: Interactive Visual Catalog Update & Final Quality Assurance

**Files:**
- Modify: `references/kadio-assets/harvested/svg/harvested_catalog.html`
- Create: `scripts/update_v4_catalog.js`

- [x] **Step 1: Update Catalog Generator Script**

Update `scripts/update_v4_catalog.js` to index all elevated assets and highlight the V4 Aesthetic Elevation upgrades.

- [x] **Step 2: Rebuild Catalog**

Run: `node scripts/update_v4_catalog.js`
Expected: `harvested_catalog.html` regenerated with full 280-asset gallery.

- [x] **Step 3: Final Verification & Commit**

```bash
git add references/kadio-assets/harvested/svg/harvested_catalog.html scripts/update_v4_catalog.js
git commit -m "docs: update harvested visual catalog with V4 aesthetic elevation assets"
```
