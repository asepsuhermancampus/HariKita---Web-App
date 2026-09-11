# Theme Asset Registry & Template Individuation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a centralized type-safe `THEME_ASSET_REGISTRY` and universal `<ThemedAssetOrnament />` component, integrating >280 pure vector SVG assets into the remaining 6 template engines (48 master templates) across Islamic, Minimalist, Rose Gold, Celestial, Rustic, and Cute Illustrated archetypes.

**Architecture:** An asset-mapping configuration maps each of the 64 template IDs to curated SVG asset paths in `public/harikita-assets/` (hero centerpiece, corner filigree, section divider, card border, background, closing seal). A responsive, zero-CLS vector component renders the assets within each template engine section with automatic graceful degradation.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, SVG.

**Spec:** `docs/superpowers/specs/2026-09-11-theme-asset-registry-and-individuation-design.md`

## Global Constraints

- Pure Vector Guarantee: Strictly 0 `<image>` tags and 0 `base64` in `public/harikita-assets/`.
- 100% Valid Path Guarantee: Every asset path in `THEME_ASSET_REGISTRY` must exist on disk with file size > 0 bytes.
- Zero Layout Shift: All SVG containers must maintain fixed aspect ratios or standard responsive height bounds.
- Hyperlocal Kebumen Brand Governance: Respect palette constraints (`#FAF8F5`, `#C5A880`, `#4A2E35`, `#6B5E62`, `#F3EDE6`).
- No Demographic Labels: Never render "Boomer", "Gen Z", "Milenial" in any UI.

---

### Task 1: Scaffolding Theme Asset Registry & Test Suite

**Files:**
- Create: `scripts/test_theme_asset_registry.js`
- Create: `src/lib/templates/themeAssetRegistry.ts`

**Interfaces:**
- Produces: `export interface ThemeAssetBundle`
- Produces: `export const THEME_ASSET_REGISTRY: Record<string, ThemeAssetBundle>`
- Produces: `export const DEFAULT_ARCHETYPE_FALLBACKS: Record<string, ThemeAssetBundle>`
- Produces: `export function getThemeAssets(themeId: string, archetypeId?: string): ThemeAssetBundle`

- [ ] **Step 1: Write failing test for theme asset registry**

Create `scripts/test_theme_asset_registry.js` verifying that:
1. All 64 templates in `TEMPLATES_CATALOG` have an entry in `THEME_ASSET_REGISTRY` (or fallback).
2. Every `heroCenterpiece` and `sectionDivider` path exists physically in `public/`.
3. Default fallbacks exist for all 8 archetypes.

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test_theme_asset_registry.js`  
Expected: FAIL (Cannot find module `themeAssetRegistry`).

- [ ] **Step 3: Implement `src/lib/templates/themeAssetRegistry.ts`**

Map all 64 template IDs (with bespoke mappings for Islamic, Minimalist, Rose Gold, Celestial, Rustic, Cute Illustrated, plus fallback references for Botanical and Javanese) to valid existing files in `public/harikita-assets/`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/test_theme_asset_registry.js`  
Expected: PASS (all paths exist on disk, 0 broken links).

- [ ] **Step 5: Commit**

```bash
git add scripts/test_theme_asset_registry.js src/lib/templates/themeAssetRegistry.ts
git commit -m "feat(templates): implement theme asset registry for all 64 templates"
```

---

### Task 2: Implement Universal `<ThemedAssetOrnament />` Component

**Files:**
- Create: `src/components/invitation/ornaments/ThemedAssetOrnament.tsx`
- Modify: `src/components/invitation/ornaments/index.ts`

**Interfaces:**
- Produces: `export const ThemedAssetOrnament: React.FC<ThemedAssetOrnamentProps>`

- [ ] **Step 1: Create `ThemedAssetOrnament.tsx`**

Implement:
1. Props: `src`, `alt`, `className`, `width`, `height`, `priority`, `tintColor`, `flipHorizontal`, `flipVertical`.
2. Clean `<img>` rendering with `decoding="async"` (or `sync` if `priority`), `loading={priority ? "eager" : "lazy"}`.
3. Silent fallback if `src` is missing or undefined (renders `null`).
4. Inline CSS filter support when `tintColor` is specified.

- [ ] **Step 2: Export in `src/components/invitation/ornaments/index.ts`**

Export `ThemedAssetOrnament` alongside existing ornaments.

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`  
Expected: PASS (0 errors).

- [ ] **Step 4: Commit**

```bash
git add src/components/invitation/ornaments/ThemedAssetOrnament.tsx src/components/invitation/ornaments/index.ts
git commit -m "feat(ornaments): add universal ThemedAssetOrnament component"
```

---

### Task 3: Integrate Asset Registry into Islamic & Rose Gold Engines

**Files:**
- Modify: `src/components/templates/engines/IslamicEngine.tsx`
- Modify: `src/components/templates/engines/RoseGoldEngine.tsx`

**Interfaces:**
- Consumes: `getThemeAssets` from `@/lib/templates/themeAssetRegistry`
- Consumes: `ThemedAssetOrnament` from `@/components/invitation/ornaments`

- [ ] **Step 1: Update `IslamicEngine.tsx`**

1. Inject `getThemeAssets(theme?.id, "islamic")`.
2. In `#hero`: Render `heroCenterpiece` (Arabic/Kubah/Mihrab ornament) and `sectionDivider`.
3. In sections (Akad, Resepsi, Stories, Closing): Insert thematic dividers and corner filigree.
4. In closing gate: Render closing barakah seal.

- [ ] **Step 2: Update `RoseGoldEngine.tsx`**

1. Inject `getThemeAssets(theme?.id, "rose-gold")`.
2. In `#hero`: Render luxury rose/foil centerpiece and filigree corners.
3. In schedule/stories: Render metallic dividers.
4. In closing gate: Render 3D wax stamp seal (`closingSeal`).

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`  
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/templates/engines/IslamicEngine.tsx src/components/templates/engines/RoseGoldEngine.tsx
git commit -m "feat(engines): integrate theme asset registry into Islamic and Rose Gold engines"
```

---

### Task 4: Integrate Asset Registry into Minimalist & Celestial Engines

**Files:**
- Modify: `src/components/templates/engines/MinimalistEngine.tsx`
- Modify: `src/components/templates/engines/CelestialEngine.tsx`

**Interfaces:**
- Consumes: `getThemeAssets` from `@/lib/templates/themeAssetRegistry`
- Consumes: `ThemedAssetOrnament` from `@/components/invitation/ornaments`

- [ ] **Step 1: Update `MinimalistEngine.tsx`**

1. Inject `getThemeAssets(theme?.id, "minimalist")`.
2. In `#hero`: Render clean 1px hairline dividers, subtle frame accents, preserving typography focus.
3. In sections: Render minimal geometric dividers.

- [ ] **Step 2: Update `CelestialEngine.tsx`**

1. Inject `getThemeAssets(theme?.id, "celestial")`.
2. In `#hero`: Render gold star sparkles (`star-sparkle-gold-01.svg`) and constellation dividers.
3. In gallery/stories: Render star dust accents and starlight dividers.

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`  
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/templates/engines/MinimalistEngine.tsx src/components/templates/engines/CelestialEngine.tsx
git commit -m "feat(engines): integrate theme asset registry into Minimalist and Celestial engines"
```

---

### Task 5: Integrate Asset Registry into Rustic & Cute Illustrated Engines

**Files:**
- Modify: `src/components/templates/engines/RusticEngine.tsx`
- Modify: `src/components/templates/engines/CuteIllustratedEngine.tsx`

**Interfaces:**
- Consumes: `getThemeAssets` from `@/lib/templates/themeAssetRegistry`
- Consumes: `ThemedAssetOrnament` from `@/components/invitation/ornaments`

- [ ] **Step 1: Update `RusticEngine.tsx`**

1. Inject `getThemeAssets(theme?.id, "rustic")`.
2. In `#hero`: Render terracotta side cascades, sage dry bouquets, and twine/wood dividers.
3. In schedule/stories: Render bohemian leaf accents.

- [ ] **Step 2: Update `CuteIllustratedEngine.tsx`**

1. Inject `getThemeAssets(theme?.id, "cute-illustrated")`.
2. In `#hero`: Render pastel bouquet illustrations and curved cloud dividers.
3. In schedule/map: Render cute event icons (gift, map pin, rings).

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`  
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/templates/engines/RusticEngine.tsx src/components/templates/engines/CuteIllustratedEngine.tsx
git commit -m "feat(engines): integrate theme asset registry into Rustic and Cute Illustrated engines"
```

---

### Task 6: Comprehensive Verification & Visual Smoke Test

**Files:**
- Create: `scripts/verify_theme_asset_registry.js`

- [ ] **Step 1: Create and run `scripts/verify_theme_asset_registry.js`**

Verify that:
1. All 64 templates in `TEMPLATES_CATALOG` resolve to valid bundles.
2. 100% of referenced SVG paths exist on disk.
3. Zero raster images (<image> or base64) are referenced.
4. Total execution reports 0 errors and 100% coverage.

- [ ] **Step 2: Run verification script**

Run: `node scripts/verify_theme_asset_registry.js`  
Expected: PASS with 64/64 templates verified.

- [ ] **Step 3: Run full TypeScript check**

Run: `npx tsc --noEmit`  
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add scripts/verify_theme_asset_registry.js
git commit -m "test(templates): add comprehensive verification suite for theme asset registry"
```
