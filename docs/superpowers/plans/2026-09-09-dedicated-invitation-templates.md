# Dedicated Digital Invitation Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 8 distinct dedicated template engine components, canvas particle physics engines, bespoke SVG ornaments, and a dynamic engine resolver so that all 65+ digital invitation themes in HariKita receive genuine visual identities, unique opening covers, and bespoke layouts.

**Architecture:** Next.js 15 App Router + TypeScript + Tailwind CSS v4 + daisyUI 5 + HTML5 2D Canvas particle engines + dynamic template resolver routing.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Lucide React, HTML5 Canvas, Prisma ORM.

**Spec:** `docs/superpowers/specs/2026-09-09-harikita-dedicated-invitation-templates-design.md`

## Global Constraints

- Pilot Hyperlocal strictly Kabupaten Kebumen.
- Demographic labels ("Boomer", "Milenial", "Gen Z") are strictly prohibited on user-facing UI.
- All interactive buttons must have a minimum touch target of 44px.
- Zero horizontal overflow across mobile (375px), tablet (768px), and desktop (1440px).
- Strict library-first: Tailwind CSS v4 + daisyUI 5 + Lucide React + Bespoke Canvas/CSS.

---

### Task 1: Canvas Motion Engines & Bespoke SVG Ornaments

**Files:**
- Create: `src/components/invitation/canvas/AutumnLeavesCanvas.tsx`
- Create: `src/components/invitation/canvas/FloatingPetalsCanvas.tsx`
- Create: `src/components/invitation/canvas/GoldenDustCanvas.tsx`
- Create: `src/components/invitation/canvas/ConfettiCanvas.tsx`
- Create: `src/components/invitation/ornaments/OrnamentGunungan.tsx`
- Create: `src/components/invitation/ornaments/OrnamentMoroccanArch.tsx`
- Create: `src/components/invitation/ornaments/OrnamentFloralWreath.tsx`
- Create: `src/components/invitation/ornaments/OrnamentGoldFoilFrame.tsx`
- Create: `src/components/invitation/ornaments/OrnamentMinimalLine.tsx`

**Interfaces:**
- Produces: Canvas components (`AutumnLeavesCanvas`, `FloatingPetalsCanvas`, `GoldenDustCanvas`, `ConfettiCanvas`) accepting `{ className?: string }`.
- Produces: SVG Ornaments accepting `{ className?: string; color?: string; size?: number }`.

- [ ] **Step 1: Create canvas particle engines**
Write `AutumnLeavesCanvas.tsx`, `FloatingPetalsCanvas.tsx`, `GoldenDustCanvas.tsx`, and `ConfettiCanvas.tsx` with requestAnimationFrame 2D canvas loops, auto-resize listeners, and smooth particle movement.

- [ ] **Step 2: Create pure SVG ornament components**
Write `OrnamentGunungan.tsx`, `OrnamentMoroccanArch.tsx`, `OrnamentFloralWreath.tsx`, `OrnamentGoldFoilFrame.tsx`, and `OrnamentMinimalLine.tsx`.

- [ ] **Step 3: Verify TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**
```bash
git add src/components/invitation/canvas src/components/invitation/ornaments
git commit -m "feat(templates): add canvas particle engines and bespoke SVG ornaments"
```

---

### Task 2: Archetype Engines 1 & 2 (`AutumnelleAnimatedTemplate` & `SeraphicusMinimalistTemplate`)

**Files:**
- Create: `src/components/templates/AutumnelleAnimatedTemplate.tsx`
- Create: `src/components/templates/SeraphicusMinimalistTemplate.tsx`
- Consumes: `DedicatedTemplateProps` from `src/lib/templates/types.ts`
- Consumes: `AutumnLeavesCanvas`, `OrnamentMinimalLine`, shared invitation modules (`MusicPlayer`, `RsvpGuestbookForm`, `DigitalGiftModal`, `ReceptionQrCheckin`, `EventSchedule`, `PhotoGallery`)

- [ ] **Step 1: Implement `AutumnelleAnimatedTemplate.tsx`**
Build the animated motion engine:
- Slide-to-unlock / illustrated envelope cover with warm seal.
- Full background `AutumnLeavesCanvas`.
- Rounded cards (`rounded-3xl`), warm pastel palette, polaroid-style couple cards, playful timeline.

- [ ] **Step 2: Implement `SeraphicusMinimalistTemplate.tsx`**
Build the editorial typographic engine:
- Split curtain reveal cover (*Curtain Reveal* opening animation).
- Hairline borders, high-contrast monochrome typography, asymmetric editorial layout, zero floral decorations.

- [ ] **Step 3: Verify build**
Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**
```bash
git add src/components/templates/AutumnelleAnimatedTemplate.tsx src/components/templates/SeraphicusMinimalistTemplate.tsx
git commit -m "feat(templates): implement AutumnelleAnimated and SeraphicusMinimalist engines"
```

---

### Task 3: Archetype Engines 3 & 4 (`LunarMelodyPrewedTemplate` & `FloralSerenityTemplate`)

**Files:**
- Create: `src/components/templates/LunarMelodyPrewedTemplate.tsx`
- Create: `src/components/templates/FloralSerenityTemplate.tsx`
- Consumes: `FloatingPetalsCanvas`, `OrnamentFloralWreath`

- [ ] **Step 1: Implement `LunarMelodyPrewedTemplate.tsx`**
Build the cinematic couple prewedding engine:
- Fullscreen 100vh prewedding hero photo with slow Ken Burns parallax effect.
- Slide-up frosted glass cover card.
- Dark luxury aesthetic, glassmorphism cards (`backdrop-blur-xl bg-black/40 border-white/10`), rose gold text highlights.

- [ ] **Step 2: Implement `FloralSerenityTemplate.tsx`**
Build the romantic botanical floral engine:
- Gatefold floral card opening cover.
- `FloatingPetalsCanvas` gentle rose petal drift.
- Watercolor floral wreaths at corner borders, elegant cursive headings, soft blush/sage tones.

- [ ] **Step 3: Verify build**
Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**
```bash
git add src/components/templates/LunarMelodyPrewedTemplate.tsx src/components/templates/FloralSerenityTemplate.tsx
git commit -m "feat(templates): implement LunarMelodyPrewed and FloralSerenity engines"
```

---

### Task 4: Archetype Engines 5 & 6 (`SyariIslamicTemplate` & `JavaneseRoyalTemplate`)

**Files:**
- Create: `src/components/templates/SyariIslamicTemplate.tsx`
- Create: `src/components/templates/JavaneseRoyalTemplate.tsx`
- Consumes: `GoldenDustCanvas`, `OrnamentGunungan`, `OrnamentMoroccanArch`

- [ ] **Step 1: Implement `SyariIslamicTemplate.tsx`**
Build the Islamic heritage & walimatul 'urs engine:
- Moroccan arch portal lift cover.
- Basmalah & QS. Ar-Rum 21 calligraphy banner in prime focal position.
- Courteous separate profile cards for bride and groom, lantern ambient glow, emerald/gold accents.

- [ ] **Step 2: Implement `JavaneseRoyalTemplate.tsx`**
Build the royal Javanese cultural engine:
- Split Gunungan Wayang Kulit reveal cover.
- `GoldenDustCanvas` floating keraton dust particles.
- Batik parang & kawung patterned borders, carved teakwood aesthetics, Javanese kromo inggil greeting and aksara decor.

- [ ] **Step 3: Verify build**
Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**
```bash
git add src/components/templates/SyariIslamicTemplate.tsx src/components/templates/JavaneseRoyalTemplate.tsx
git commit -m "feat(templates): implement SyariIslamic and JavaneseRoyal engines"
```

---

### Task 5: Archetype Engines 7 & 8 (`RoseGoldLuxuryTemplate` & `KhitananFamilyTemplate`)

**Files:**
- Create: `src/components/templates/RoseGoldLuxuryTemplate.tsx`
- Create: `src/components/templates/KhitananFamilyTemplate.tsx`
- Consumes: `ConfettiCanvas`, `OrnamentGoldFoilFrame`

- [ ] **Step 1: Implement `RoseGoldLuxuryTemplate.tsx`**
Build the royal foil & wax seal engine:
- 3D wax seal stamp break animation on royal velvet envelope cover.
- Metallic foil shimmer light streak animations, embossed gold monogram seals, deep burgundy/velvet textures.

- [ ] **Step 2: Implement `KhitananFamilyTemplate.tsx`**
Build the celebratory family event engine:
- Pop-up festive card cover.
- `ConfettiCanvas` celebratory confetti and ribbon physics.
- Cheerful typography, child photo highlight, parents' prayer, joyful timeline.

- [ ] **Step 3: Verify build**
Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**
```bash
git add src/components/templates/RoseGoldLuxuryTemplate.tsx src/components/templates/KhitananFamilyTemplate.tsx
git commit -m "feat(templates): implement RoseGoldLuxury and KhitananFamily engines"
```

---

### Task 6: Dynamic Resolver, Live Theme Switcher Toolbar, and Routing Integration

**Files:**
- Create: `src/components/templates/TemplateEngineResolver.tsx`
- Create: `src/components/invitation/LiveThemeSwitcherToolbar.tsx`
- Modify: `src/app/undangan/[slug]/page.tsx`
- Modify: `src/app/undangan/page.tsx`

- [ ] **Step 1: Implement `TemplateEngineResolver.tsx`**
Route incoming invitation props to the exact archetype engine (`AutumnelleAnimated`, `SeraphicusMinimalist`, `LunarMelodyPrewed`, `FloralSerenity`, `SyariIslamic`, `JavaneseRoyal`, `RoseGoldLuxury`, or `KhitananFamily`) based on `props.theme.archetypeId`.

- [ ] **Step 2: Implement `LiveThemeSwitcherToolbar.tsx`**
Create a floating bottom/top preview toolbar on `/undangan/[slug]` allowing quick switching between the 65+ themes to test and compare designs instantly.

- [ ] **Step 3: Integrate with `/undangan/[slug]/page.tsx` and catalogue `/undangan/page.tsx`**
Wire `TemplateEngineResolver` into the slug page, passing the loaded database model or demo fallback, and update the catalogue cards so clicking any template opens its live preview.

- [ ] **Step 4: Verify build**
Run: `npm run build`
Expected: Successful build with 0 TypeScript errors.

- [ ] **Step 5: Commit**
```bash
git add src/components/templates/TemplateEngineResolver.tsx src/components/invitation/LiveThemeSwitcherToolbar.tsx src/app/undangan
git commit -m "feat(templates): wire dynamic engine resolver and live theme switcher"
```

---

### Task 7: End-to-End Verification & Git Push

**Files:**
- Verification only: Browser testing, mobile responsiveness, audio trigger, RSVP test.

- [ ] **Step 1: Test all 8 template engines in browser**
Test in browser via `http://localhost:3000/undangan/bima-citra?theme=[archetype-theme]`.
Verify:
- Cover opening interaction.
- Particle canvas rendering.
- Layout distinctions.
- Audio play trigger.

- [ ] **Step 2: Verify zero mobile horizontal overflow**
Test viewports 375px, 768px, and 1440px.

- [ ] **Step 3: Run production build**
Run: `npm run build`
Expected: 9/9 routes compiled cleanly with 0 warnings/errors.

- [ ] **Step 4: Push to GitHub repository**
```bash
git push origin main
```
