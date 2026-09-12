# HariKita Design System & Visual Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform HariKita's design system and visual style across colors, typography, ~136 fine-line SVG assets, UI components, mobile interfaces, and an interactive showcase while strictly preserving the committed logo.

**Architecture:** Build a clean token foundation in CSS/Tailwind, generate and index all 13 SVG asset categories with standardized attributes (`stroke="currentColor"`, `vector-effect="non-scaling-stroke"`), create 15 modular UI variants and responsive mobile components, and provide an interactive verification showcase at `/design-system-showcase`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, DaisyUI, Lucide React, Sharp, Node.js.

**Spec:** `docs/superpowers/specs/2026-09-12-harikita-design-system-and-visual-rebuild-design.md`

## Global Constraints
- Strictly preserve the existing HariKita single-SVG logo (`viewBox="0 0 424 100"`). Do NOT edit, rename, or re-render it.
- Strict 5-color palette: Charcoal `#2B2B2B`, Taupe `#88735B`, Champagne `#C9A88A`, Soft Beige `#E8DED1`, Ivory `#F8F6F1`.
- Never use bright yellow gold `#D4AF37` as primary.
- Strict typography: `Cormorant Garamond` (Display/Headings) and `Manrope` (UI/Body/Navigation).
- All SVG assets must use strict kebab-case naming, clean viewBox, `stroke="currentColor"`, and `vector-effect="non-scaling-stroke"`.
- Do not create a separate "Website UI Preview" asset folder (UI is code, not image assets).
- Maintain 100% backward compatibility for existing pages and components.

---

### Task 1: Color Tokens & Global Typography Calibration

**Files:**
- Create: `src/styles/harikita-tokens.css`
- Modify: `src/app/globals.css:5-30`
- Modify: `tailwind.config.ts:11-39`
- Modify: `src/app/layout.tsx:60-72`
- Test: `scripts/verify_tokens.js`

**Interfaces:**
- Produces: CSS custom properties `--color-charcoal`, `--color-taupe`, `--color-champagne`, `--color-soft-beige`, `--color-ivory` and Tailwind utilities `bg-hk-taupe`, `text-hk-charcoal`, `border-hk-champagne`, `font-editorial`, `font-manrope`.

- [ ] **Step 1: Write verification script to test token presence and values**

Create `scripts/verify_tokens.js` to assert that `globals.css` and `tailwind.config.ts` define the official colors and fonts.

- [ ] **Step 2: Run verification script to confirm initial failure/discrepancies**

Run: `node scripts/verify_tokens.js`  
Expected: Discrepancy detected between old `#FAF8F5`/`#C5A880` and new `#2B2B2B`/`#88735B`/`#C9A88A`/`#E8DED1`/`#F8F6F1`.

- [ ] **Step 3: Implement token files and update Tailwind and globals.css**

Update `src/styles/harikita-tokens.css`, `src/app/globals.css`, `tailwind.config.ts`, and `src/app/layout.tsx` to link Manrope and Cormorant Garamond and define the 5 official tokens.

- [ ] **Step 4: Run verification script to ensure all tokens pass**

Run: `node scripts/verify_tokens.js`  
Expected: PASS with all tokens and fonts verified.

- [ ] **Step 5: Commit changes**

```bash
git add src/styles/harikita-tokens.css src/app/globals.css tailwind.config.ts src/app/layout.tsx scripts/verify_tokens.js
git commit -m "feat(tokens): configure official HariKita color tokens and typography"
```

---

### Task 2: Asset Directory Scaffolding & Vector Generation Pipeline

**Files:**
- Create: `scripts/build_harikita_assets.js`
- Create directories & files in `public/assets/harikita/`:
  - `ornaments/` (12 SVGs: `botanical-01.svg` to `12.svg`)
  - `lines/` (12 SVGs: `divider-01.svg` to `12.svg`)
  - `corners/` (8 SVGs: `corner-01.svg` to `08.svg`)
  - `abstract/` (10 SVGs: `symbol-01.svg` to `10.svg`)
  - `flowers/single-stem/` (12 SVGs: `flower-single-stem-01.svg` to `12.svg`)
  - `flowers/blooms/` (6 SVGs: `flower-bloom-01.svg` to `06.svg`)
  - `flowers/accents/` (6 SVGs: `flower-accent-01.svg` to `06.svg`)
  - `leaves/sprigs/` (8 SVGs: `leaf-sprig-01.svg` to `08.svg`)
  - `leaves/branches/` (4 SVGs: `branch-01.svg` to `04.svg`)
  - `leaves/stems/` (4 SVGs: `stem-01.svg` to `04.svg`)
  - `compositions/` (8 SVGs: `composition-01.svg` to `08.svg`)
  - `patterns/` (8 SVGs: `pattern-01.svg` to `08.svg`)
  - `textures/` (4 WebP: `texture-paper-light.webp`, `texture-paper-dark.webp`, etc.)
  - `icons/` (6 SVGs: `icon-two-people.svg`, `icon-love-story.svg`, etc.)
  - `decorative/` (12 SVGs: `badge-premium.svg`, `badge-new.svg`, `stamp-harikita.svg`, `wax-seal-hk.svg`, `frame-arch-01.svg`, etc.)
  - `cards/` (8 SVGs: `card-invitation-01.svg` to `08.svg`)
  - `avatars/` (6 SVGs: `avatar-taupe.svg`, `avatar-charcoal.svg`, etc.)
- Test: `scripts/verify_assets_complete.js`

**Interfaces:**
- Produces: ~136 valid SVG and WebP visual asset files in `public/assets/harikita/` satisfying all XML standards and attributes.

- [ ] **Step 1: Write asset verification script**

Create `scripts/verify_assets_complete.js` checking that all 136 files exist and contain valid XML/SVG with `stroke="currentColor"` and `vector-effect="non-scaling-stroke"`.

- [ ] **Step 2: Run verification script to verify it fails initially**

Run: `node scripts/verify_assets_complete.js`  
Expected: FAIL (0 / 136 assets found).

- [ ] **Step 3: Implement asset builder script and execute generation**

Create `scripts/build_harikita_assets.js` to create directories, extract/generate vector geometry from the raw asset references, and write out all 136 assets in their exact folders.

- [ ] **Step 4: Run asset verification script to verify all 136 assets pass**

Run: `node scripts/verify_assets_complete.js`  
Expected: PASS (136 / 136 assets verified valid).

- [ ] **Step 5: Commit changes**

```bash
git add public/assets/harikita/ scripts/build_harikita_assets.js scripts/verify_assets_complete.js
git commit -m "feat(assets): scaffold directory structure and generate ~136 official HariKita visual assets"
```

---

### Task 3: Asset Catalog Manifest & TypeScript Schema

**Files:**
- Create: `src/types/harikita-asset.ts`
- Create: `src/data/harikita-assets.json`
- Create: `src/lib/harikita-assets.ts`
- Test: `scripts/verify_asset_manifest.js`

**Interfaces:**
- Produces: `getHariKitaAssets()`, `getAssetsByCategory(category)`, `getAssetById(id)` functions and strongly-typed asset catalog.

- [ ] **Step 1: Write manifest verification script**

Create `scripts/verify_asset_manifest.js` checking that each manifest item has a valid path, category, and matching physical file.

- [ ] **Step 2: Run test to verify initial failure**

Run: `node scripts/verify_asset_manifest.js`  
Expected: FAIL (manifest file not found).

- [ ] **Step 3: Implement TypeScript types, JSON manifest, and helper library**

Create `src/types/harikita-asset.ts`, generate `src/data/harikita-assets.json` from the asset directory, and implement `src/lib/harikita-assets.ts`.

- [ ] **Step 4: Run test to verify all entries pass**

Run: `node scripts/verify_asset_manifest.js`  
Expected: PASS (all assets registered with correct categories).

- [ ] **Step 5: Commit changes**

```bash
git add src/types/harikita-asset.ts src/data/harikita-assets.json src/lib/harikita-assets.ts scripts/verify_asset_manifest.js
git commit -m "feat(manifest): create strongly-typed HariKita asset catalog and helper library"
```

---

### Task 4: HariKita UI Component Library (15 Variants)

**Files:**
- Create: `src/components/harikita/ui/ButtonPrimary.tsx`
- Create: `src/components/harikita/ui/ButtonSecondary.tsx`
- Create: `src/components/harikita/ui/ButtonGhost.tsx`
- Create: `src/components/harikita/ui/ButtonDark.tsx`
- Create: `src/components/harikita/ui/IconButtonCircle.tsx`
- Create: `src/components/harikita/ui/ToggleSwitch.tsx`
- Create: `src/components/harikita/ui/PaginationControls.tsx`
- Create: `src/components/harikita/ui/BadgePremium.tsx`
- Create: `src/components/harikita/ui/BadgeNew.tsx`
- Create: `src/components/harikita/ui/WaxSealBadge.tsx`
- Create: `src/components/harikita/ui/VintageStampBadge.tsx`
- Create: `src/components/harikita/ui/ArchFrameCard.tsx`
- Create: `src/components/harikita/ui/DecorativeDivider.tsx`
- Create: `src/components/harikita/ui/SerifQuoteCard.tsx`
- Create: `src/components/harikita/ui/FloralCornerCard.tsx`
- Create: `src/components/harikita/ui/index.ts`
- Test: `scripts/verify_ui_components.js`

**Interfaces:**
- Produces: Exported UI components consuming official tokens (`bg-hk-taupe`, `border-hk-champagne`, `text-hk-charcoal`, `font-manrope`, `font-editorial`).

- [ ] **Step 1: Write component verification script**

Create `scripts/verify_ui_components.js` checking exports and rendering viability.

- [ ] **Step 2: Run verification script to verify it fails initially**

Run: `node scripts/verify_ui_components.js`  
Expected: FAIL (components not found).

- [ ] **Step 3: Implement all 15 UI component variants**

Build the 15 components in `src/components/harikita/ui/` with props, accessible button elements, and clean styling.

- [ ] **Step 4: Run verification script to verify all components pass**

Run: `node scripts/verify_ui_components.js`  
Expected: PASS (15 / 15 components verified).

- [ ] **Step 5: Commit changes**

```bash
git add src/components/harikita/ui/ scripts/verify_ui_components.js
git commit -m "feat(ui): implement 15 official HariKita button and UI component variants"
```

---

### Task 5: Mobile UI Components

**Files:**
- Create: `src/components/harikita/mobile/MobileHeader.tsx`
- Create: `src/components/harikita/mobile/MobileHero.tsx`
- Create: `src/components/harikita/mobile/MobileServiceCard.tsx`
- Create: `src/components/harikita/mobile/MobileInvitationPreview.tsx`
- Create: `src/components/harikita/mobile/MobileBottomNav.tsx`
- Create: `src/components/harikita/mobile/MobileStickyBookingBar.tsx`
- Create: `src/components/harikita/mobile/index.ts`
- Test: `scripts/verify_mobile_components.js`

**Interfaces:**
- Produces: Mobile-first responsive components engineered for 375px+ screens, with $\ge 44\text{px}$ touch targets.

- [ ] **Step 1: Write mobile component verification script**

Create `scripts/verify_mobile_components.js` checking exports and mobile styling props.

- [ ] **Step 2: Run verification script to verify initial failure**

Run: `node scripts/verify_mobile_components.js`  
Expected: FAIL.

- [ ] **Step 3: Implement all 6 mobile components**

Implement `MobileHeader`, `MobileHero`, `MobileServiceCard`, `MobileInvitationPreview`, `MobileBottomNav`, and `MobileStickyBookingBar`.

- [ ] **Step 4: Run verification script to verify pass**

Run: `node scripts/verify_mobile_components.js`  
Expected: PASS.

- [ ] **Step 5: Commit changes**

```bash
git add src/components/harikita/mobile/ scripts/verify_mobile_components.js
git commit -m "feat(mobile): implement responsive mobile UI components for HariKita"
```

---

### Task 6: Interactive Showcase Route & Verification Page

**Files:**
- Create: `src/app/design-system-showcase/page.tsx`
- Test: Integration test verifying HTTP 200 via `curl` / `fetch` on `http://localhost:3000/design-system-showcase`.

**Interfaces:**
- Produces: Live Next.js page displaying:
  - Color palette swatch grid with copy-to-clipboard.
  - Cormorant Garamond & Manrope typography specimens.
  - Interactive asset gallery with category filter and color swapper (Taupe, Charcoal, Champagne).
  - All 15 UI component variants.
  - Mobile viewport simulator (375px frame).

- [ ] **Step 1: Implement the showcase page**

Build `src/app/design-system-showcase/page.tsx` integrating all tokens, the asset catalog, UI components, and mobile components.

- [ ] **Step 2: Verify page build and HTTP response**

Run: `node -e "fetch('http://localhost:3000/design-system-showcase').then(r => console.log('STATUS:', r.status))"`  
Expected: `STATUS: 200`

- [ ] **Step 3: Commit changes**

```bash
git add src/app/design-system-showcase/page.tsx
git commit -m "feat(showcase): add interactive design system and asset showcase page"
```

---

### Task 7: Comprehensive Documentation & Quality Gate Verification

**Files:**
- Create: `docs/brand/harikita-brand-guidelines.md`
- Create: `docs/assets/asset-catalog.md`
- Create: `docs/ui/component-system.md`
- Test: `scripts/run_all_verifications.js`

**Interfaces:**
- Produces: Full documentation suite detailing the brand identity, asset catalog usage, and component guides.

- [ ] **Step 1: Write comprehensive brand, asset, and UI docs**

Create `docs/brand/harikita-brand-guidelines.md`, `docs/assets/asset-catalog.md`, and `docs/ui/component-system.md`.

- [ ] **Step 2: Create and run master verification runner**

Create `scripts/run_all_verifications.js` that runs all verification scripts (tokens, assets, manifest, UI, mobile, showcase HTTP).
Run: `node scripts/run_all_verifications.js`  
Expected: All tests PASS (0 failures).

- [ ] **Step 3: Commit documentation and master verification script**

```bash
git add docs/brand/ docs/assets/ docs/ui/ scripts/run_all_verifications.js
git commit -m "docs: add comprehensive HariKita brand guidelines, asset catalog, and UI docs"
```
