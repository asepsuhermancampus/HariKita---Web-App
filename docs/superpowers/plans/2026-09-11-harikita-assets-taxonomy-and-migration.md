# HariKita Assets Taxonomy & Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a permanent, categorized, and semantically named production asset library at `public/harikita-assets/` completely decoupled from `references/`, with 1-to-1 traceability and an interactive visual catalog.

**Architecture:** An automated classification and migration engine that maps over 280 pure vector SVGs into 5 semantic visual categories (`floral/`, `frames/`, `backgrounds/`, `decorative/`, `icons/`), renames cryptic files into clean sequential identifiers, records a full `harikita_manifest.json`, and builds a public interactive catalog.

**Tech Stack:** Node.js, `sharp`, `pngjs`, Next.js static asset convention (`public/`), Vanilla CSS/JS for catalog.

**Spec:** `docs/superpowers/specs/2026-09-11-harikita-assets-taxonomy-and-migration-design.md`

## Global Constraints

- Pure Vector Guarantee: Strictly 0 `<image>` tags, 0 `base64` in `public/harikita-assets/`.
- 100% Preserved References: Do NOT delete or modify files in `references/kadio-assets/`.
- Whitelist Protection: All 9 Grade A whitelisted assets must be migrated bit-exact.
- Lower-kebab-case: All new filenames and folder names must follow `{category}/{subcategory}/{name}-{index:02d}.svg`.
- Traceability: Every migrated asset must have an entry in `harikita_manifest.json` pointing back to its original reference file.

---

### Task 1: Scaffolding & Migration Engine Implementation

**Files:**
- Create: `scripts/test_asset_categorization.js`
- Create: `scripts/organize_harikita_assets.js`

**Interfaces:**
- Produces: `classifyAsset(filename, svgContent)` -> `{ category, subCategory, descriptor, color }`
- Produces: `generateSemanticName(classification, index)` -> `string`

- [ ] **Step 1: Write failing unit test for classification rules**

Test that:
1. `1754648453_kdo54-bg-3.svg` is classified as `floral/corners`.
2. `event-bottom-right.svg` is classified as `frames/filigree`.
3. `frame-2.svg` is classified as `frames/borders`.
4. `divider-1.svg` or `event-border-1.svg` is classified as `frames/dividers`.
5. `1745992861_bg-kdo43.svg` is classified as `backgrounds/gradients`.
6. `vector-2.svg` is classified as `decorative/stars`.
7. `gift.svg` or `map.svg` is classified as `icons/events`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test_asset_categorization.js`  
Expected: FAIL ("Cannot find module organize_harikita_assets").

- [ ] **Step 3: Implement `scripts/organize_harikita_assets.js`**

Implement:
1. Directory structure creator for `public/harikita-assets/{floral,frames,backgrounds,decorative,icons}/*`.
2. Classification engine inspecting filenames, tags, aspect ratio, and color palettes.
3. Sequential naming generator with zero collisions.
4. Copy routine from `references/kadio-assets/harvested/svg/` to `public/harikita-assets/`.
5. Manifest writer emitting `public/harikita-assets/harikita_manifest.json`.

- [ ] **Step 4: Run unit test to verify it passes**

Run: `node scripts/test_asset_categorization.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/test_asset_categorization.js scripts/organize_harikita_assets.js
git commit -m "feat(assets): implement classification and migration engine for harikita-assets"
```

---

### Task 2: Execute Migration & Verify Asset Integrity

**Files:**
- Create: `public/harikita-assets/**`
- Create: `public/harikita-assets/harikita_manifest.json`
- Create: `scripts/verify_harikita_assets.js`

**Interfaces:**
- Consumes: `references/kadio-assets/harvested/svg/`, `scripts/whitelist_registry.json`.
- Produces: Over 280 organized, pure-vector SVG files in `public/harikita-assets/`.

- [ ] **Step 1: Write verification script `scripts/verify_harikita_assets.js`**

Check that:
1. Every file in `public/harikita-assets/` is a valid SVG with no raster artifacts (0 `<image>`, 0 `base64`).
2. Every entry in `harikita_manifest.json` points to an existing file on disk.
3. All 9 whitelisted Grade A assets exist and match their locked originals.
4. Source files in `references/kadio-assets/harvested/svg/` remain intact.

- [ ] **Step 2: Execute migration engine**

Run: `node scripts/organize_harikita_assets.js`  
Expected: Output showing all assets categorized and copied with zero errors.

- [ ] **Step 3: Run verification script**

Run: `node scripts/verify_harikita_assets.js`  
Expected: PASS with 100% pure vector validation and complete manifest coverage.

- [ ] **Step 4: Commit**

```bash
git add public/harikita-assets/ scripts/verify_harikita_assets.js
git commit -m "feat(assets): deploy organized harikita-assets library and manifest"
```

---

### Task 3: Interactive Public Visual Catalog & Developer Search

**Files:**
- Create: `scripts/generate_harikita_catalog.js`
- Create: `public/harikita-assets/catalog.html`

**Interfaces:**
- Consumes: `public/harikita-assets/harikita_manifest.json`.
- Produces: Standalone responsive web catalog at `public/harikita-assets/catalog.html`.

- [ ] **Step 1: Implement `scripts/generate_harikita_catalog.js`**

Features:
1. Category tabs (`Semua`, `Floral`, `Frames`, `Backgrounds`, `Decorative`, `Icons`).
2. Search bar with instant real-time filtering by semantic name, category, or original filename.
3. Direct visual preview on dark luxury checkered grid.
4. "Salin Path" (Copy URL) button copying `/harikita-assets/...` for quick developer copy-pasting.
5. Live Palette Switcher for monochrome assets.

- [ ] **Step 2: Generate catalog**

Run: `node scripts/generate_harikita_catalog.js`  
Expected: Generates `public/harikita-assets/catalog.html`.

- [ ] **Step 3: Verify catalog**

Run automated check ensuring all image links in `catalog.html` point to existing SVGs with 0 broken links.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate_harikita_catalog.js public/harikita-assets/catalog.html
git commit -m "docs(assets): add interactive public visual catalog for harikita-assets"
```
