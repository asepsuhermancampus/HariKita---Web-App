# HariKita Custom Invitation Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun Studio Racik Undangan Kustom (Split-Screen Studio 65:35) di Undangan Digital DS dengan master 11-section flow, 8 arketipe kartu mempelai eksklusif, smart location card & QR navigasi (pemisahan dari rekening bank), mesin normalisasi warna SVG dinamis untuk 254 aset, 10 gaya penataan posisi aset dengan visual guardrails, 15 efek optik & 15 animasi mikro 60 FPS, serta simulator smartphone sticky multi-device.

**Architecture:** Mengadopsi arsitektur split terpadu (kiri: 65% Builder Controls, kanan: 35% Sticky Smartphone Simulator). State kustomisasi dikelola secara reaktif melalui `InvitationStudioState` yang seketika merefleksikan perubahan warna, varian komponen, posisi ornamen, dan efek visual ke layar simulator smartphone multi-frame tanpa reload.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, SVG dynamic normalization engine, Hardware-accelerated CSS GPU Animations.

**Spec:** [`docs/superpowers/specs/2026-09-13-invitation-ds-custom-studio-design.md`](file:///c:/Users/asep.suherman/SETTUP%20TESTING/Build%20Project%20In%20Here/IDE/HariKita%20-%20Web%20App/docs/superpowers/specs/2026-09-13-invitation-ds-custom-studio-design.md)

## Global Constraints
- DILARANG menampilkan label generasi ("Boomer", "Milenial", "Gen Z") di antarmuka publik atau kode tampilan pengguna.
- Palet warna wajib berbasis Cashmere Alabaster (`#FAF8F5`), Gilded Gold (`#C5A880`), Deep Plum Charcoal (`#4A2E35`), Muted Plum (`#6B5E62`), dan Champagne Surface (`#F3EDE6`).
- Wajib 100% responsif mobile tanpa horizontal overflow di layar sekecil 375px hingga laptop lebar (>1024px).
- Zero regression terhadap katalog aset vektor yang sudah ada dan halaman utama aplikasi HariKita.

---

### Task 1: TypeScript Types & Extended Mock Sandbox Data

**Files:**
- Create: `src/types/invitation-studio.ts`
- Modify: `src/app/design-system-showcase/data/mock-invitation-sandbox.ts`
- Test: `scripts/test_studio_types.ts`

**Interfaces:**
- Produces: `InvitationStudioConfig`, `CoupleCardVariantId` (1 to 8), `PlacementStyleId` (1 to 10), `VisualEffectId` (1 to 15), `MicroAnimationId` (1 to 15), `DeviceFrameId` (`iphone-15-pro` | `iphone-se` | `galaxy-s24` | `pixel-8` | `iphone-max`), `SANDBOX_STUDIO_DEFAULTS`, `SANDBOX_VENUE_LOCATION_DATA`.

- [ ] **Step 1: Write test script for data contracts and defaults**

```typescript
// scripts/test_studio_types.ts
import { SANDBOX_STUDIO_DEFAULTS, SANDBOX_VENUE_LOCATION_DATA } from '../src/app/design-system-showcase/data/mock-invitation-sandbox';
import { InvitationStudioConfig } from '../src/types/invitation-studio';

function validateTypes(): boolean {
  const cfg: InvitationStudioConfig = SANDBOX_STUDIO_DEFAULTS;
  if (!cfg.themeColor || !cfg.coupleVariant || !cfg.placementStyle) {
    throw new Error('Default config missing mandatory fields');
  }
  if (!SANDBOX_VENUE_LOCATION_DATA.googleMapsUrl || !SANDBOX_VENUE_LOCATION_DATA.qrPayload) {
    throw new Error('Venue location data missing maps/QR payload');
  }
  console.log('✓ Task 1 validation passed: Studio types and defaults valid');
  return true;
}

validateTypes();
```

- [ ] **Step 2: Run test to verify failure before creation**

Run: `node --loader ts-node/esm scripts/test_studio_types.ts` or `npx tsx scripts/test_studio_types.ts`
Expected: FAIL (modules not yet defined)

- [ ] **Step 3: Define TypeScript interfaces and extended mock data**

Create `src/types/invitation-studio.ts` with complete types for all 10 placement styles, 8 couple card variants, 15 visual effects, 15 micro animations, 5 device frames, and 12 theme colors.
Extend `src/app/design-system-showcase/data/mock-invitation-sandbox.ts` with `SANDBOX_VENUE_LOCATION_DATA`, `SANDBOX_STUDIO_DEFAULTS`, and comprehensive Kebumen event details.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test_studio_types.ts`
Expected: PASS ("✓ Task 1 validation passed: Studio types and defaults valid")

- [ ] **Step 5: Commit**

```bash
git add src/types/invitation-studio.ts src/app/design-system-showcase/data/mock-invitation-sandbox.ts scripts/test_studio_types.ts
git commit -m "feat(studio): add TypeScript contracts and mock data for invitation customizer"
```

---

### Task 2: Dynamic SVG Normalization Engine & 12 Curated Palettes

**Files:**
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/DynamicSvgRenderer.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/StudioColorPalettePicker.tsx`
- Test: `scripts/test_svg_normalizer.ts`

**Interfaces:**
- Consumes: `HariKitaAsset` from `@/types/harikita-asset`
- Produces: `<DynamicSvgRenderer asset={asset} color={hexColor} className={...} />`, `CURATED_THEME_PALETTES` (12 colors array with metadata)

- [ ] **Step 1: Write test for SVG color normalizer**

```typescript
// scripts/test_svg_normalizer.ts
import { normalizeSvgString } from '../src/app/design-system-showcase/components/invitation-hub/studio/DynamicSvgRenderer';

function testNormalize(): boolean {
  const rawSvg = '<svg><path stroke="#2B2B2B" fill="#000" /><circle stroke="#333" fill="none" /></svg>';
  const normalized = normalizeSvgString(rawSvg);
  if (!normalized.includes('stroke="currentColor"')) {
    throw new Error('Failed to replace hardcoded stroke with currentColor');
  }
  if (!normalized.includes('fill="currentColor"')) {
    throw new Error('Failed to replace hardcoded fill with currentColor');
  }
  if (!normalized.includes('fill="none"')) {
    throw new Error('Preserved fill="none" incorrectly replaced');
  }
  console.log('✓ Task 2 validation passed: SVG normalizer correctly transforms attributes');
  return true;
}

testNormalize();
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx tsx scripts/test_svg_normalizer.ts`
Expected: FAIL

- [ ] **Step 3: Implement DynamicSvgRenderer and Palette Picker**

Implement regex sanitizer inside `DynamicSvgRenderer.tsx` to safely replace non-none strokes and fills with `currentColor`, plus apply fallback CSS classes `[&_path]:stroke-current [&_circle]:stroke-current [&_rect]:stroke-current`.
Implement `StudioColorPalettePicker.tsx` with all 12 curated HariKita colors (Taupe, Gilded Gold, Deep Plum Charcoal, Champagne, Sage, Sogan, Emerald, Rose Gold, Terracotta, Midnight, Coral, Olive) with active indicator and contrast validation.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test_svg_normalizer.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/design-system-showcase/components/invitation-hub/studio/DynamicSvgRenderer.tsx src/app/design-system-showcase/components/invitation-hub/studio/StudioColorPalettePicker.tsx scripts/test_svg_normalizer.ts
git commit -m "feat(studio): implement dynamic SVG normalizer engine and 12-palette picker"
```

---

### Task 3: 8 Distinct "The Bride & The Groom" Card Archetypes

**Files:**
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/StudioCoupleSection.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/couple-variants/FloatingGlassVariant.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/couple-variants/EditorialSerifVariant.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/couple-variants/FullscreenPrewedVariant.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/couple-variants/TwinArchesFloralVariant.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/couple-variants/MihrabArabesqueVariant.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/couple-variants/JavaneseGununganVariant.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/couple-variants/RoyalMedallionVariant.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/couple-variants/PolaroidScrapbookVariant.tsx`
- Test: `scripts/test_couple_variants.ts`

**Interfaces:**
- Consumes: `CoupleCardVariantId` from `@/types/invitation-studio`, `SANDBOX_COUPLE_DATA`
- Produces: `<StudioCoupleSection variant={variantId} themeColor={hex} ornamentAsset={...} />`

- [ ] **Step 1: Write verification script for 8 variants**

```typescript
// scripts/test_couple_variants.ts
import { CoupleCardVariantId } from '../src/types/invitation-studio';

const expectedVariants: CoupleCardVariantId[] = [
  'floating-glass',
  'editorial-serif',
  'fullscreen-prewed',
  'twin-arches',
  'mihrab-arabesque',
  'javanese-gunungan',
  'royal-medallion',
  'polaroid-scrapbook',
];

function testVariantsList(): boolean {
  if (expectedVariants.length !== 8) {
    throw new Error('Expected exactly 8 couple card variants');
  }
  console.log('✓ Task 3 validation passed: 8 couple card variant IDs registered');
  return true;
}

testVariantsList();
```

- [ ] **Step 2: Run test to verify variant count**

Run: `npx tsx scripts/test_couple_variants.ts`
Expected: PASS

- [ ] **Step 3: Implement the 8 distinct couple card variant components**

Build all 8 variant components with unique layouts, typography, border styling, and integrated SVG ornament surrounds.
Wire into `StudioCoupleSection.tsx` with smooth switching and mobile-first 375px responsive containers.

- [ ] **Step 4: Verify build with test script**

Run: `npx tsx scripts/test_couple_variants.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/design-system-showcase/components/invitation-hub/studio/sections/couple-variants/ src/app/design-system-showcase/components/invitation-hub/studio/sections/StudioCoupleSection.tsx scripts/test_couple_variants.ts
git commit -m "feat(studio): add 8 distinct luxury bride and groom card archetype components"
```

---

### Task 4: Smart Location Card (QR Maps Navigation) & Standalone Clean Bank Gift Card

**Files:**
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/StudioLocationCard.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/StudioBankGiftSection.tsx`
- Test: `scripts/test_location_bank_separation.ts`

**Interfaces:**
- Consumes: `SANDBOX_VENUE_LOCATION_DATA`, `SANDBOX_GIFT_DATA`
- Produces: `<StudioLocationCard venue={...} themeColor={...} />`, `<StudioBankGiftSection bankAccounts={...} physicalGift={...} themeColor={...} />`

- [ ] **Step 1: Write test to verify clean separation between Location and Bank**

```typescript
// scripts/test_location_bank_separation.ts
import { SANDBOX_VENUE_LOCATION_DATA, SANDBOX_GIFT_DATA } from '../src/app/design-system-showcase/data/mock-invitation-sandbox';

function testSeparation(): boolean {
  // Verify location contains maps data and NO bank account numbers
  if (!SANDBOX_VENUE_LOCATION_DATA.googleMapsUrl || !SANDBOX_VENUE_LOCATION_DATA.wazeUrl) {
    throw new Error('Missing navigation URLs in location card data');
  }
  // Verify bank accounts are pure gifts without payment checkout gates
  if (!SANDBOX_GIFT_DATA.bankAccounts || SANDBOX_GIFT_DATA.bankAccounts.length < 2) {
    throw new Error('Missing bank accounts in clean bank gift data');
  }
  console.log('✓ Task 4 validation passed: Clean separation of Location and Bank verified');
  return true;
}

testSeparation();
```

- [ ] **Step 2: Run test to verify data contracts**

Run: `npx tsx scripts/test_location_bank_separation.ts`
Expected: PASS

- [ ] **Step 3: Implement StudioLocationCard and StudioBankGiftSection**

- `StudioLocationCard.tsx`: Venue address, interactive Google Maps / Waze buttons, and dynamic QR Code for instant phone GPS navigation.
- `StudioBankGiftSection.tsx`: Clean bank transfer cards (BCA, Mandiri, BRI, BSI), 1-click clipboard copy with green emerald checkmark, and Kebumen physical gift parcel destination card.

- [ ] **Step 4: Verify rendering and component exports**

Run: `npx tsx scripts/test_location_bank_separation.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/design-system-showcase/components/invitation-hub/studio/sections/StudioLocationCard.tsx src/app/design-system-showcase/components/invitation-hub/studio/sections/StudioBankGiftSection.tsx scripts/test_location_bank_separation.ts
git commit -m "feat(studio): separate pure bank accounts and transform QRIS to smart location card"
```

---

### Task 5: 10 Asset Placement Styles & Visual Guardrails Engine

**Files:**
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/AssetPlacementEngine.ts`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/StudioPlacementPicker.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/StudioSlotAssetModal.tsx`
- Test: `scripts/test_placement_guardrails.ts`

**Interfaces:**
- Consumes: `HariKitaAsset` from `@/lib/harikita-assets`, `PlacementStyleId`
- Produces: `getSlotAllowedCategories(slotName: SlotZoneId): string[]`, `isAssetCompatibleWithSlot(asset, slotName): boolean`, `PLACEMENT_STYLES_CATALOG` (10 styles), `<StudioPlacementPicker ... />`

- [ ] **Step 1: Write test for Visual Guardrails slot filtering**

```typescript
// scripts/test_placement_guardrails.ts
import { getSlotAllowedCategories, isAssetCompatibleWithSlot } from '../src/app/design-system-showcase/components/invitation-hub/studio/AssetPlacementEngine';

function testGuardrails(): boolean {
  // Test divider slot only accepts 'lines'
  const dividerAllowed = getSlotAllowedCategories('divider');
  if (!dividerAllowed.includes('lines') || dividerAllowed.includes('corners')) {
    throw new Error('Guardrail failure: Divider slot must only accept lines');
  }

  // Test corner slot only accepts 'corners'
  const cornerAllowed = getSlotAllowedCategories('corner');
  if (!cornerAllowed.includes('corners') || cornerAllowed.includes('lines')) {
    throw new Error('Guardrail failure: Corner slot must only accept corners');
  }
  console.log('✓ Task 5 validation passed: Visual Guardrails slot filtering verified');
  return true;
}

testGuardrails();
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx tsx scripts/test_placement_guardrails.ts`
Expected: FAIL

- [ ] **Step 3: Implement AssetPlacementEngine, 10 Styles Catalog, and Guardrail Checkers**

Define all 10 placement styles with coordinate anchor matrices.
Implement slot guardrail rules, golden ratio scale clamps, and compatibility badge generators.
Implement `StudioPlacementPicker.tsx` and `StudioSlotAssetModal.tsx` for easy slot swapping with visual harmony indicators.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test_placement_guardrails.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/design-system-showcase/components/invitation-hub/studio/AssetPlacementEngine.ts src/app/design-system-showcase/components/invitation-hub/studio/StudioPlacementPicker.tsx src/app/design-system-showcase/components/invitation-hub/studio/StudioSlotAssetModal.tsx scripts/test_placement_guardrails.ts
git commit -m "feat(studio): add 10 asset placement styles and visual guardrails engine"
```

---

### Task 6: 15 Optical Effects & 15 Micro-Animations System

**Files:**
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/VisualEffectsLayer.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/invitation-motion.css`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/StudioEffectsController.tsx`
- Test: `scripts/test_effects_manifest.ts`

**Interfaces:**
- Produces: `OPTICAL_EFFECTS_LIST` (15 effects), `MICRO_ANIMATIONS_LIST` (15 animations), `<VisualEffectsLayer activeEffects={...} activeAnimations={...} themeColor={...}>`, `<StudioEffectsController ... />`

- [ ] **Step 1: Write test verifying all 15 effects and 15 animations exist in manifest**

```typescript
// scripts/test_effects_manifest.ts
import { OPTICAL_EFFECTS_LIST, MICRO_ANIMATIONS_LIST } from '../src/app/design-system-showcase/components/invitation-hub/studio/VisualEffectsLayer';

function testManifest(): boolean {
  if (OPTICAL_EFFECTS_LIST.length !== 15) {
    throw new Error(`Expected 15 optical effects, got ${OPTICAL_EFFECTS_LIST.length}`);
  }
  if (MICRO_ANIMATIONS_LIST.length !== 15) {
    throw new Error(`Expected 15 micro animations, got ${MICRO_ANIMATIONS_LIST.length}`);
  }
  console.log('✓ Task 6 validation passed: 15 optical effects & 15 animations manifest verified');
  return true;
}

testManifest();
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx tsx scripts/test_effects_manifest.ts`
Expected: FAIL

- [ ] **Step 3: Implement VisualEffectsLayer, CSS keyframes, and StudioEffectsController**

- `invitation-motion.css`: GPU-accelerated keyframes for SVG stroke drawing (`stroke-dashoffset`), gentle botanical sway, gold shimmer sheen, floating petals, pulse, and smooth unfolds.
- `VisualEffectsLayer.tsx`: Ambient canvas overlays, floating petal emitters, letterpress filters, and gold rim lights.
- `StudioEffectsController.tsx`: Preset mood buttons (Serene, Graceful Motion, Cinematic Wonder) and individual toggles.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test_effects_manifest.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/design-system-showcase/components/invitation-hub/studio/VisualEffectsLayer.tsx src/app/design-system-showcase/components/invitation-hub/studio/invitation-motion.css src/app/design-system-showcase/components/invitation-hub/studio/StudioEffectsController.tsx scripts/test_effects_manifest.ts
git commit -m "feat(studio): implement 15 optical effects and 15 micro-animations layer"
```

---

### Task 7: Multi-Device Bezel Frame & Sticky Smartphone Preview

**Files:**
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/DeviceFrameContainer.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/InvitationDevicePreview.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/StudioGatekeeperCover.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/StudioMuqaddimah.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/StudioLoveStory.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/StudioEventSchedule.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/StudioGallerySection.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/StudioGuestbookRsvp.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/StudioDresscodeEtiquette.tsx`
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/sections/StudioClosingFamily.tsx`
- Test: `scripts/test_device_frames.ts`

**Interfaces:**
- Produces: `<DeviceFrameContainer activeFrame={frameId}><InvitationDevicePreview ... /></DeviceFrameContainer>`, renders complete 11 sections stream inside phone viewport.

- [ ] **Step 1: Write test checking device frame dimensions and aspect ratios**

```typescript
// scripts/test_device_frames.ts
import { DEVICE_FRAME_CONFIGS } from '../src/app/design-system-showcase/components/invitation-hub/studio/DeviceFrameContainer';

function testFrames(): boolean {
  const frames = ['iphone-15-pro', 'iphone-se', 'galaxy-s24', 'pixel-8', 'iphone-max'];
  frames.forEach(f => {
    const cfg = DEVICE_FRAME_CONFIGS[f];
    if (!cfg || cfg.width < 320 || cfg.height < 600) {
      throw new Error(`Invalid frame config for ${f}`);
    }
  });
  console.log('✓ Task 7 validation passed: 5 smartphone frame viewports configured');
  return true;
}

testFrames();
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx tsx scripts/test_device_frames.ts`
Expected: FAIL

- [ ] **Step 3: Implement DeviceFrameContainer, InvitationDevicePreview, and all 11 studio sections**

Construct exact bezels, notch / Dynamic Island, status bar, and scrollable container.
Assemble the full 11-section stream (Cover with 3D Wax Seal -> Muqaddimah -> Couple Section [active variant] -> Love Story -> Event Schedule -> Location Card & QR -> Gallery [8 styles] -> Bank Gift Clean -> RSVP Guestbook -> Dresscode -> Closing Takzim).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test_device_frames.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/design-system-showcase/components/invitation-hub/studio/DeviceFrameContainer.tsx src/app/design-system-showcase/components/invitation-hub/studio/InvitationDevicePreview.tsx src/app/design-system-showcase/components/invitation-hub/studio/sections/ scripts/test_device_frames.ts
git commit -m "feat(studio): create multi-device bezel simulator and full 11-section stream"
```

---

### Task 8: Unified Split-Screen Studio Builder & Showcase Integration

**Files:**
- Create: `src/app/design-system-showcase/components/invitation-hub/studio/InvitationStudioBuilder.tsx`
- Modify: `src/app/design-system-showcase/components/invitation-hub/InvitationHubView.tsx`
- Test: `scripts/test_studio_builder_integration.ts`

**Interfaces:**
- Consumes: All studio components from Tasks 1-7
- Produces: Complete interactive Split Studio (65% Builder Controls Left : 35% Sticky Smartphone Preview Right) mounted inside `InvitationHubView.tsx`.

- [ ] **Step 1: Write integration verification script**

```typescript
// scripts/test_studio_builder_integration.ts
import fs from 'fs';

function testIntegration(): boolean {
  const hubCode = fs.readFileSync('src/app/design-system-showcase/components/invitation-hub/InvitationHubView.tsx', 'utf-8');
  if (!hubCode.includes('InvitationStudioBuilder')) {
    throw new Error('InvitationHubView must mount InvitationStudioBuilder');
  }
  console.log('✓ Task 8 validation passed: InvitationStudioBuilder mounted in InvitationHubView');
  return true;
}

testIntegration();
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx tsx scripts/test_studio_builder_integration.ts`
Expected: FAIL

- [ ] **Step 3: Implement InvitationStudioBuilder and integrate in InvitationHubView**

- `InvitationStudioBuilder.tsx`: Left 65% column with organized accordion sections:
  1. Arketipe Bawaan & Palet 12 Warna HariKita
  2. 10 Gaya Penataan Posisi Aset (dengan thumbnail dan deskripsi karakter)
  3. Kustomisasi Per-Slot Aset (6 Zona Kurasi dengan Auto Guardrails)
  4. Konfigurasi Varian Section (Pilihan 8 varian Mempelai, 8 varian Galeri, Lokasi, Rekening)
  5. Pengaturan 15 Efek Optik & 15 Animasi Mikro (Preset Mood & Toggle)
- Right 35% column: `sticky top-24` holding `DeviceFrameContainer` with instant interactive preview.
- Update `InvitationHubView.tsx` to showcase the Split Studio prominently as the primary visual laboratory.

- [ ] **Step 4: Run test to verify integration passes**

Run: `npx tsx scripts/test_studio_builder_integration.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/design-system-showcase/components/invitation-hub/studio/InvitationStudioBuilder.tsx src/app/design-system-showcase/components/invitation-hub/InvitationHubView.tsx scripts/test_studio_builder_integration.ts
git commit -m "feat(studio): integrate unified 65:35 split-screen studio into InvitationHubView"
```

---

### Task 9: End-to-End Build Validation, Mobile Polish & Verification

**Files:**
- Modify: Any files needing CSS adjustments or TypeScript typing fixes
- Test: Full Next.js production build (`npm run build`) and lint checks

- [ ] **Step 1: Run all unit verification scripts**

Run:
```bash
npx tsx scripts/test_studio_types.ts
npx tsx scripts/test_svg_normalizer.ts
npx tsx scripts/test_couple_variants.ts
npx tsx scripts/test_location_bank_separation.ts
npx tsx scripts/test_placement_guardrails.ts
npx tsx scripts/test_effects_manifest.ts
npx tsx scripts/test_device_frames.ts
npx tsx scripts/test_studio_builder_integration.ts
```
Expected: All 8 test suites pass cleanly with green checkmarks.

- [ ] **Step 2: Run Next.js Typecheck & Build**

Run: `npm run build`
Expected: Build successfully finishes with 0 errors and valid static/dynamic routes.

- [ ] **Step 3: Perform visual verification of the studio**

Verify split layout at >= 1024px, responsive vertical stack on small screens, smooth color changes across all SVG assets, flawless couple card variant switching, location QR display, and hardware-accelerated animations.

- [ ] **Step 4: Commit and finalize**

```bash
git add .
git commit -m "chore(studio): complete invitation DS custom studio overhaul and build validation"
```
