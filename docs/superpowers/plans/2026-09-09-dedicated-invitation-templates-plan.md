# Dedicated Digital Invitation Architecture & 8 Archetype Engines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and integrate the Universal Luxury Shell (Dual-pane desktop showcase, envelope cover gate, rotating vinyl audio player, floating scroll-spy dock, auto-scroll button, e-ticket boarding pass download) and 8 bespoke archetype layout engines with 64 template presets for HariKita's Kebumen hyperlocal wedding platform.

**Architecture:** Hybrid Next.js 15 App Router + React 19 + Tailwind CSS v4 + daisyUI 5 + Lucide React + HTML5 Canvas 2D motion engines & e-ticket generator + LocalStorage optimistic state. The Universal Luxury Shell wraps 8 bespoke layout engines (`BotanicalEngine`, `JavaneseEngine`, `IslamicEngine`, `MinimalistEngine`, `RoseGoldEngine`, `RusticEngine`, `CelestialEngine`, `CuteIllustratedEngine`) resolved dynamically via `TemplateEngineResolver` and driven by the 64-template registry matrix in `templatesCatalog.ts`.

**Tech Stack:** Next.js 15 App Router, TypeScript 5.7, Tailwind CSS v4, daisyUI 5, Lucide React, HTML5 Canvas 2D, LocalStorage.

**Spec:** `docs/superpowers/specs/2026-09-09-harikita-dedicated-invitation-templates-design.md`

## Global Constraints

- **Pilot Hyperlocal strictly Kabupaten Kebumen** (Venues: Mexolie Hotel Kebumen, Grand Kolopaking Hotel, Pendopo Kabumian, Trio Azana Hotel).
- **Demographic labels ("Boomer", "Milenial", "Gen Z") are strictly prohibited** in any user-facing UI copy.
- **Dual-pane layout on desktop** (`min-width: 1024px`): 50% left sticky 100vh Ken Burns prewedding slideshow + grand monogram + date badge + live countdown; 50% right max-w-[480px] centered container for vertical invitation scroll.
- **Full-width mobile responsiveness** (`< 768px`): Left pane hidden, right container 100vw edge-to-edge, zero horizontal scroll.
- **Minimum 44px touch targets** for all interactive buttons.
- **CORS safety for Canvas PNG export**: All assets in boarding pass generator must use inline SVG or base64 data URIs to avoid tainted canvas security exceptions.
- **Zero build errors**: `npm run build` must complete with 0 TypeScript/lint errors.

---

### Task 1: Universal Luxury Shell Components

**Files:**
- Create: `src/components/invitation/shell/InvitationDesktopLayout.tsx`
- Create: `src/components/invitation/shell/EnvelopeCoverGate.tsx`
- Create: `src/components/invitation/shell/InvitationBottomDock.tsx`
- Create: `src/components/invitation/shell/RotatingVinylPlayer.tsx`
- Create: `src/components/invitation/shell/AutoScrollButton.tsx`
- Create: `src/components/invitation/shell/ETicketBoardingPass.tsx`
- Create: `src/components/invitation/shell/index.ts`
- Test: `scripts/verify-task1-shell.ts`

**Interfaces:**
- Produces: `InvitationDesktopLayout` accepting `{ leftPaneContent: React.ReactNode; children: React.ReactNode }`
- Produces: `EnvelopeCoverGate` accepting `{ brideName: string; groomName: string; guestName: string; eventDate: string; onOpen: () => void; isOpened: boolean; archetypeId?: string }`
- Produces: `InvitationBottomDock` accepting `{ activeSection: string; onNavigate: (sectionId: string) => void; isVisible: boolean }`
- Produces: `RotatingVinylPlayer` accepting `{ audioUrl: string; isPlaying: boolean; onTogglePlay: () => void; albumCoverUrl?: string; songTitle?: string }`
- Produces: `AutoScrollButton` accepting `{ isAutoScrolling: boolean; onToggleAutoScroll: () => void; isVisible: boolean }`
- Produces: `ETicketBoardingPass` accepting `{ guestName: string; sessionTitle: string; timeSlot: string; venueName: string; venueAddress: string; qrValue: string; brideGroomInitials: string; isOpen: boolean; onClose: () => void }`

- [ ] **Step 1: Write the failing verification test**

Create `scripts/verify-task1-shell.ts`:
```typescript
import assert from "node:assert";

async function verifyShellComponents() {
  console.log("Checking Universal Luxury Shell component exports...");
  const shell = await import("../src/components/invitation/shell/index");
  
  assert.ok(shell.InvitationDesktopLayout, "InvitationDesktopLayout must be exported");
  assert.ok(shell.EnvelopeCoverGate, "EnvelopeCoverGate must be exported");
  assert.ok(shell.InvitationBottomDock, "InvitationBottomDock must be exported");
  assert.ok(shell.RotatingVinylPlayer, "RotatingVinylPlayer must be exported");
  assert.ok(shell.AutoScrollButton, "AutoScrollButton must be exported");
  assert.ok(shell.ETicketBoardingPass, "ETicketBoardingPass must be exported");

  console.log("PASS: All 6 Universal Luxury Shell components are properly exported.");
}

verifyShellComponents().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx scripts/verify-task1-shell.ts`
Expected: FAIL with "Cannot find module '../src/components/invitation/shell/index'"

- [ ] **Step 3: Implement Universal Luxury Shell components**

1. Create `src/components/invitation/shell/InvitationDesktopLayout.tsx`:
   - Dual-pane layout on desktop: Left panel (50% w, sticky 100vh) with prewed photo slideshow, Ken Burns subtle motion, live countdown timer to wedding date, and Kebumen hyperlocal stamp. Right panel (50% w) centered `max-w-[480px]` container.
   - Mobile: Left panel hidden (`hidden lg:flex`), right container 100vw full width.

2. Create `src/components/invitation/shell/EnvelopeCoverGate.tsx`:
   - Fullscreen gate modal (`fixed inset-0 z-50`) with guest recipient card ("Kepada Yth. Bapak/Ibu/Saudara/i: [NamaTamu]").
   - "Buka Undangan" button with open envelope icon.
   - On click: triggers `onOpen()`, unlocks `body.overflow`, initiates audio autoplay via user gesture, slides curtain upward.

3. Create `src/components/invitation/shell/InvitationBottomDock.tsx`:
   - Frosted glass dock floating at `fixed bottom-6 left-1/2 -translate-x-1/2 z-40`.
   - Safe area padding `pb-[env(safe-area-inset-bottom,16px)]`.
   - 7 icons: Sampul (`#hero`), Mempelai (`#couple`), Acara (`#event`), Kisah (`#story`), Galeri (`#gallery`), Kado (`#gift`), Ucapan (`#rsvp`).
   - Active section highlight indicator using theme accent color.

4. Create `src/components/invitation/shell/RotatingVinylPlayer.tsx`:
   - Floating circular vinyl disc in top-right corner (`fixed top-4 right-4 z-40`).
   - Realistic vinyl grooved texture with spinning animation (`@keyframes spin 12s linear infinite` when playing, paused when stopped).
   - Concentric pulsating soundwaves around the disc.
   - Click toggles audio play/pause.

5. Create `src/components/invitation/shell/AutoScrollButton.tsx`:
   - Floating pill button (`fixed bottom-24 left-4 z-40`).
   - Smooth vertical scroll using `requestAnimationFrame` at 1.5px/frame.
   - Auto-pauses on user scroll or touch interaction.

6. Create `src/components/invitation/shell/ETicketBoardingPass.tsx`:
   - Drawer / modal boarding pass styling: perforated divider stub, barcode/QR code, guest name, seat/session class (VIP/Reguler), Kebumen venue location.
   - "Unduh Tiket (PNG)" button generating high-resolution PNG using HTML5 Canvas 2D (`toDataURL('image/png')`) with zero external cross-origin images.

7. Create `src/components/invitation/shell/index.ts`:
   - Re-export all 6 shell components.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/verify-task1-shell.ts`
Expected: PASS: All 6 Universal Luxury Shell components are properly exported.

- [ ] **Step 5: Commit**

```bash
git add src/components/invitation/shell scripts/verify-task1-shell.ts
git commit -m "feat(invitation): implement universal luxury shell components"
```

---

### Task 2: Botanical & Javanese Archetype Engines

**Files:**
- Create: `src/components/templates/engines/BotanicalEngine.tsx`
- Create: `src/components/templates/engines/JavaneseEngine.tsx`
- Test: `scripts/verify-task2-botanical-javanese.ts`

**Interfaces:**
- Consumes: `DedicatedTemplateProps` from `src/lib/templates/types.ts`
- Consumes: `FloatingPetalsCanvas` from `src/components/invitation/canvas/FloatingPetalsCanvas.tsx`
- Consumes: `GoldenDustCanvas` from `src/components/invitation/canvas/GoldenDustCanvas.tsx`
- Consumes: `OrnamentFloralWreath` from `src/components/invitation/ornaments/OrnamentFloralWreath.tsx`
- Consumes: `OrnamentGunungan` from `src/components/invitation/ornaments/OrnamentGunungan.tsx`
- Produces: `BotanicalEngine: React.FC<DedicatedTemplateProps>`
- Produces: `JavaneseEngine: React.FC<DedicatedTemplateProps>`

- [ ] **Step 1: Write the failing verification test**

Create `scripts/verify-task2-botanical-javanese.ts`:
```typescript
import assert from "node:assert";

async function verifyBotanicalAndJavanese() {
  console.log("Checking Botanical and Javanese engine exports...");
  const { BotanicalEngine } = await import("../src/components/templates/engines/BotanicalEngine");
  const { JavaneseEngine } = await import("../src/components/templates/engines/JavaneseEngine");

  assert.strictEqual(typeof BotanicalEngine, "function", "BotanicalEngine must be a React component");
  assert.strictEqual(typeof JavaneseEngine, "function", "JavaneseEngine must be a React component");

  console.log("PASS: Botanical and Javanese layout engines are properly exported.");
}

verifyBotanicalAndJavanese().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx scripts/verify-task2-botanical-javanese.ts`
Expected: FAIL with "Cannot find module '../src/components/templates/engines/BotanicalEngine'"

- [ ] **Step 3: Implement Botanical and Javanese Archetype Engines**

1. Create `src/components/templates/engines/BotanicalEngine.tsx`:
   - Organic curved cards (`rounded-2xl` / `rounded-3xl`).
   - Polaroid-style couple presentation with subtle organic rotation (`-rotate-1` and `rotate-1`).
   - 4 corner floral botanical accents with continuous gentle sway (`@keyframes botanicalSway`).
   - Background canvas: `FloatingPetalsCanvas` with soft eucalyptus leaves and rose petals.
   - Playfair Display serif typography, sage green and terracotta color palette.
   - Comprehensive sections: Hero, Couple with parents' blessings, Multi-Session Akad & Resepsi at Kebumen venues, Love Story Timeline, Photo Gallery, Digital Cashless Gift (BCA/Mandiri copy toast), and Live Wishes Wall.

2. Create `src/components/templates/engines/JavaneseEngine.tsx`:
   - Traditional Javanese royal palace aesthetic: Gebyok teakwood carved border frame, golden prada accents (`#CCA873` / `#D4AF37`).
   - Split Gunungan gate animation: Wayang Gunungan opening to reveal couple (`@keyframes gununganKiri` and `@keyframes gununganKanan`).
   - Background canvas: `GoldenDustCanvas` floating golden embers.
   - Cinzel Decorative typography, deep velvet black / royal brown teakwood cards.
   - Cultural copy: *"Serat Ulem / Nuwun Sewu"*, Bismillah, doa pengantin adat Jawa, detailed rundown for Sesi 1 & Sesi 2 with Kebumen venues (Pendopo Kabumian / Mexolie).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/verify-task2-botanical-javanese.ts`
Expected: PASS: Botanical and Javanese layout engines are properly exported.

- [ ] **Step 5: Commit**

```bash
git add src/components/templates/engines/BotanicalEngine.tsx src/components/templates/engines/JavaneseEngine.tsx scripts/verify-task2-botanical-javanese.ts
git commit -m "feat(invitation): implement botanical and javanese archetype engines"
```

---

### Task 3: Islamic & Minimalist Archetype Engines

**Files:**
- Create: `src/components/templates/engines/IslamicEngine.tsx`
- Create: `src/components/templates/engines/MinimalistEngine.tsx`
- Test: `scripts/verify-task3-islamic-minimalist.ts`

**Interfaces:**
- Consumes: `DedicatedTemplateProps` from `src/lib/templates/types.ts`
- Consumes: `OrnamentMoroccanArch` from `src/components/invitation/ornaments/OrnamentMoroccanArch.tsx`
- Consumes: `OrnamentMinimalLine` from `src/components/invitation/ornaments/OrnamentMinimalLine.tsx`
- Consumes: `GoldenDustCanvas` from `src/components/invitation/canvas/GoldenDustCanvas.tsx`
- Produces: `IslamicEngine: React.FC<DedicatedTemplateProps>`
- Produces: `MinimalistEngine: React.FC<DedicatedTemplateProps>`

- [ ] **Step 1: Write the failing verification test**

Create `scripts/verify-task3-islamic-minimalist.ts`:
```typescript
import assert from "node:assert";

async function verifyIslamicAndMinimalist() {
  console.log("Checking Islamic and Minimalist engine exports...");
  const { IslamicEngine } = await import("../src/components/templates/engines/IslamicEngine");
  const { MinimalistEngine } = await import("../src/components/templates/engines/MinimalistEngine");

  assert.strictEqual(typeof IslamicEngine, "function", "IslamicEngine must be a React component");
  assert.strictEqual(typeof MinimalistEngine, "function", "MinimalistEngine must be a React component");

  console.log("PASS: Islamic and Minimalist layout engines are properly exported.");
}

verifyIslamicAndMinimalist().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx scripts/verify-task3-islamic-minimalist.ts`
Expected: FAIL with "Cannot find module '../src/components/templates/engines/IslamicEngine'"

- [ ] **Step 3: Implement Islamic and Minimalist Archetype Engines**

1. Create `src/components/templates/engines/IslamicEngine.tsx`:
   - Moorish architectural arches (*Moroccan Archway* geometry) framing photos and event cards.
   - Arabic calligraphy Basmalah header and Surah Ar-Rum ayat 21 card.
   - 8-point Islamic geometric star (*Rub el Hizb*) decorative dividers.
   - Emerald green and soft champagne gold palette.
   - Calm, respectful walimatul 'urs layout: separate prayer cards, dress code syar'i guide, Akad & Walimah timings at Kebumen venues.

2. Create `src/components/templates/engines/MinimalistEngine.tsx`:
   - Asymmetric Vogue/Kinfolk editorial magazine grid layout.
   - Hairline 1px borders, generous whitespace, stark high contrast typography (Cormorant Garamond + Inter).
   - Zero particle canvas for crisp, clean, distraction-free high fashion aesthetic.
   - Large architectural typography monograms, numbered editorial sections (01 / COUPLE, 02 / CEREMONY, 03 / STORY).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/verify-task3-islamic-minimalist.ts`
Expected: PASS: Islamic and Minimalist layout engines are properly exported.

- [ ] **Step 5: Commit**

```bash
git add src/components/templates/engines/IslamicEngine.tsx src/components/templates/engines/MinimalistEngine.tsx scripts/verify-task3-islamic-minimalist.ts
git commit -m "feat(invitation): implement islamic and minimalist archetype engines"
```

---

### Task 4: Rose Gold & Rustic Archetype Engines

**Files:**
- Create: `src/components/templates/engines/RoseGoldEngine.tsx`
- Create: `src/components/templates/engines/RusticEngine.tsx`
- Test: `scripts/verify-task4-rosegold-rustic.ts`

**Interfaces:**
- Consumes: `DedicatedTemplateProps` from `src/lib/templates/types.ts`
- Consumes: `OrnamentGoldFoilFrame` from `src/components/invitation/ornaments/OrnamentGoldFoilFrame.tsx`
- Consumes: `GoldenDustCanvas` from `src/components/invitation/canvas/GoldenDustCanvas.tsx`
- Consumes: `AutumnLeavesCanvas` from `src/components/invitation/canvas/AutumnLeavesCanvas.tsx`
- Produces: `RoseGoldEngine: React.FC<DedicatedTemplateProps>`
- Produces: `RusticEngine: React.FC<DedicatedTemplateProps>`

- [ ] **Step 1: Write the failing verification test**

Create `scripts/verify-task4-rosegold-rustic.ts`:
```typescript
import assert from "node:assert";

async function verifyRoseGoldAndRustic() {
  console.log("Checking Rose Gold and Rustic engine exports...");
  const { RoseGoldEngine } = await import("../src/components/templates/engines/RoseGoldEngine");
  const { RusticEngine } = await import("../src/components/templates/engines/RusticEngine");

  assert.strictEqual(typeof RoseGoldEngine, "function", "RoseGoldEngine must be a React component");
  assert.strictEqual(typeof RusticEngine, "function", "RusticEngine must be a React component");

  console.log("PASS: Rose Gold and Rustic layout engines are properly exported.");
}

verifyRoseGoldAndRustic().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx scripts/verify-task4-rosegold-rustic.ts`
Expected: FAIL with "Cannot find module '../src/components/templates/engines/RoseGoldEngine'"

- [ ] **Step 3: Implement Rose Gold and Rustic Archetype Engines**

1. Create `src/components/templates/engines/RoseGoldEngine.tsx`:
   - Gilded luxury with beveled cut corners and diamond geometry.
   - Metallic foil shimmer borders (`@keyframes shimmerFoil`) on cards and buttons.
   - `GoldenDustCanvas` rendering fine rose gold crystal specks.
   - Script calligraphy titles (Alex Brush / Cinzel) with rose sand (`#D4A89C`) and gilded gold (`#CCA873`).
   - VIP styling for event cards, QR check-in display, and digital bank envelope.

2. Create `src/components/templates/engines/RusticEngine.tsx`:
   - Earthy Kraft paper and woven linen fiber textures.
   - Vintage postal stamps, cancellation ink marks, and 3D wax seal badges.
   - Dried pampas grass botanical ornaments and warm terracotta/sienna tones (`#B85D3B`, `#8C533E`).
   - `AutumnLeavesCanvas` with falling rustic leaves.
   - Story timeline styled as vintage travel postcards with destination milestones.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/verify-task4-rosegold-rustic.ts`
Expected: PASS: Rose Gold and Rustic layout engines are properly exported.

- [ ] **Step 5: Commit**

```bash
git add src/components/templates/engines/RoseGoldEngine.tsx src/components/templates/engines/RusticEngine.tsx scripts/verify-task4-rosegold-rustic.ts
git commit -m "feat(invitation): implement rose gold and rustic archetype engines"
```

---

### Task 5: Celestial & Cute Illustrated Archetype Engines

**Files:**
- Create: `src/components/templates/engines/CelestialEngine.tsx`
- Create: `src/components/templates/engines/CuteIllustratedEngine.tsx`
- Create: `src/components/templates/engines/index.ts`
- Test: `scripts/verify-task5-celestial-cute.ts`

**Interfaces:**
- Consumes: `DedicatedTemplateProps` from `src/lib/templates/types.ts`
- Consumes: `ConfettiCanvas` from `src/components/invitation/canvas/ConfettiCanvas.tsx`
- Consumes: `GoldenDustCanvas` from `src/components/invitation/canvas/GoldenDustCanvas.tsx`
- Produces: `CelestialEngine: React.FC<DedicatedTemplateProps>`
- Produces: `CuteIllustratedEngine: React.FC<DedicatedTemplateProps>`
- Produces: Re-export of all 8 archetype engines in `src/components/templates/engines/index.ts`

- [ ] **Step 1: Write the failing verification test**

Create `scripts/verify-task5-celestial-cute.ts`:
```typescript
import assert from "node:assert";

async function verifyCelestialAndCute() {
  console.log("Checking Celestial and Cute Illustrated engine exports...");
  const engines = await import("../src/components/templates/engines/index");

  assert.strictEqual(typeof engines.BotanicalEngine, "function", "BotanicalEngine must be in index");
  assert.strictEqual(typeof engines.JavaneseEngine, "function", "JavaneseEngine must be in index");
  assert.strictEqual(typeof engines.IslamicEngine, "function", "IslamicEngine must be in index");
  assert.strictEqual(typeof engines.MinimalistEngine, "function", "MinimalistEngine must be in index");
  assert.strictEqual(typeof engines.RoseGoldEngine, "function", "RoseGoldEngine must be in index");
  assert.strictEqual(typeof engines.RusticEngine, "function", "RusticEngine must be in index");
  assert.strictEqual(typeof engines.CelestialEngine, "function", "CelestialEngine must be in index");
  assert.strictEqual(typeof engines.CuteIllustratedEngine, "function", "CuteIllustratedEngine must be in index");

  console.log("PASS: All 8 archetype layout engines are exported in index.ts.");
}

verifyCelestialAndCute().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx scripts/verify-task5-celestial-cute.ts`
Expected: FAIL with "Cannot find module '../src/components/templates/engines/index'"

- [ ] **Step 3: Implement Celestial and Cute Illustrated Archetype Engines**

1. Create `src/components/templates/engines/CelestialEngine.tsx`:
   - True dark mode luxury: deep midnight navy / velvet charcoal canvas (`bg-slate-950`).
   - Dark glassmorphism cards (`backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-2xl`).
   - Glowing aura neon accents (`shadow-[0_0_25px_rgba(204,168,115,0.2)]`).
   - Twinkling stardust canvas simulation with subtle star constellations.
   - Romantic astronomical metaphors: *"Two souls written in the stars"*, moon phase icon, elegant cosmic dividers.

2. Create `src/components/templates/engines/CuteIllustratedEngine.tsx`:
   - Chubby pill-shaped cards (`rounded-3xl`), cheerful pastel color scheme (blush pink, baby blue, warm cream).
   - Cute cartoon illustrated couple avatars and speech bubbles.
   - Floating heart particles and party confetti canvas (`ConfettiCanvas`).
   - Integrated Cute Illustrated Map of Kebumen: cartoon landmarks (Tugu Lawet, Mexolie, Pantai Menganti, Alun-Alun Kebumen) with direct Google Maps navigation link.
   - Hand-drawn playful timeline and bubbly guestbook cards.

3. Create `src/components/templates/engines/index.ts`:
   - Export `BotanicalEngine`, `JavaneseEngine`, `IslamicEngine`, `MinimalistEngine`, `RoseGoldEngine`, `RusticEngine`, `CelestialEngine`, `CuteIllustratedEngine`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/verify-task5-celestial-cute.ts`
Expected: PASS: All 8 archetype layout engines are exported in index.ts.

- [ ] **Step 5: Commit**

```bash
git add src/components/templates/engines/CelestialEngine.tsx src/components/templates/engines/CuteIllustratedEngine.tsx src/components/templates/engines/index.ts scripts/verify-task5-celestial-cute.ts
git commit -m "feat(invitation): implement celestial and cute illustrated archetype engines"
```

---

### Task 6: 64 Templates Registry Matrix & Live Switcher Integration

**Files:**
- Modify: `src/lib/templates/types.ts`
- Create: `src/lib/templates/templatesCatalog.ts`
- Modify: `src/lib/templates/registry.ts`
- Modify: `src/components/templates/TemplateEngineResolver.tsx`
- Modify: `src/components/invitation/LiveThemeSwitcherToolbar.tsx`
- Modify: `src/app/globals.css`
- Test: `scripts/verify-task6-registry-build.ts`

**Interfaces:**
- Consumes: All 8 layout engines from `src/components/templates/engines`
- Consumes: All 6 shell components from `src/components/invitation/shell`
- Produces: `TEMPLATES_CATALOG: TemplateThemePreset[]` containing 64 verified presets across all 8 archetypes (8 per archetype).
- Produces: `TemplateEngineResolver` rendering the active engine wrapped inside the Universal Luxury Shell.
- Produces: `LiveThemeSwitcherToolbar` with search, category tabs, and instant live URL switching.

- [ ] **Step 1: Write the failing verification test**

Create `scripts/verify-task6-registry-build.ts`:
```typescript
import assert from "node:assert";

async function verifyRegistryAndCatalog() {
  console.log("Checking 64 templates catalog matrix...");
  const { TEMPLATES_CATALOG } = await import("../src/lib/templates/templatesCatalog");
  const { getThemeById } = await import("../src/lib/templates/registry");

  assert.strictEqual(TEMPLATES_CATALOG.length, 64, `Expected exactly 64 templates, got ${TEMPLATES_CATALOG.length}`);

  const archetypes = [
    "botanical",
    "javanese",
    "islamic",
    "minimalist",
    "rose-gold",
    "rustic",
    "celestial",
    "cute-illustrated",
  ];

  for (const arch of archetypes) {
    const count = TEMPLATES_CATALOG.filter((t) => t.archetypeId === arch).length;
    assert.strictEqual(count, 8, `Expected 8 templates for archetype ${arch}, got ${count}`);
  }

  // Verify sample theme lookups
  const sample1 = getThemeById("autumnelle");
  assert.ok(sample1, "autumnelle must be retrievable");
  assert.strictEqual(sample1.archetypeId, "botanical");

  const sample2 = getThemeById("javanese-royal");
  assert.ok(sample2, "javanese-royal must be retrievable");
  assert.strictEqual(sample2.archetypeId, "javanese");

  const sample3 = getThemeById("medina-gold");
  assert.ok(sample3, "medina-gold must be retrievable");
  assert.strictEqual(sample3.archetypeId, "islamic");

  const sample4 = getThemeById("cartoon-maps-kebumen");
  assert.ok(sample4, "cartoon-maps-kebumen must be retrievable");
  assert.strictEqual(sample4.archetypeId, "cute-illustrated");

  console.log("PASS: 64 Templates catalog matrix verified with 8 presets per archetype engine.");
}

verifyRegistryAndCatalog().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx scripts/verify-task6-registry-build.ts`
Expected: FAIL with "Cannot find module '../src/lib/templates/templatesCatalog'"

- [ ] **Step 3: Implement 64 Templates Registry and Resolver Integration**

1. Update `src/lib/templates/types.ts`:
   - Expand `ArchetypeId` to:
     ```typescript
     export type ArchetypeId =
       | "botanical"
       | "javanese"
       | "islamic"
       | "minimalist"
       | "rose-gold"
       | "rustic"
       | "celestial"
       | "cute-illustrated"
       // Legacy aliases for backward compatibility
       | "animated-motion"
       | "minimalist-typographic"
       | "fullscreen-prewed"
       | "romantic-floral"
       | "syari-islamic"
       | "cultural-traditional"
       | "royal-luxury"
       | "special-family-event";
     ```

2. Create `src/lib/templates/templatesCatalog.ts`:
   - Define all 64 presets with custom color palettes, font pairings, and preview image links (8 per archetype as specified in spec section 5).

3. Update `src/lib/templates/registry.ts`:
   - Merge and re-export `TEMPLATES_CATALOG`. Ensure `getThemeById(id)` resolves both new 64 IDs and legacy IDs with archetype aliasing.

4. Update `src/components/templates/TemplateEngineResolver.tsx`:
   - Integrate the Universal Luxury Shell:
     - Wrap layout inside `InvitationDesktopLayout` (providing prewedding left showcase and centered right container).
     - Include `EnvelopeCoverGate` with sound trigger on "Buka Undangan".
     - Include `InvitationBottomDock` with scroll-spy navigation.
     - Include `RotatingVinylPlayer` and `AutoScrollButton`.
     - Include `ETicketBoardingPass` trigger and modal with canvas PNG download.
     - Dynamically route to the active archetype engine (`BotanicalEngine`, `JavaneseEngine`, etc.).

5. Update `src/components/invitation/LiveThemeSwitcherToolbar.tsx`:
   - Display a sleek dock with archetype category tabs and full searchable list of 64 templates.
   - Clicking a template instantly switches `?theme=...` in URL without full page reload.

6. Update `src/app/globals.css`:
   - Add custom `@keyframes` for `@keyframes botanicalSway`, `@keyframes gununganKiri`, `@keyframes gununganKanan`, `@keyframes shimmerFoil`.

- [ ] **Step 4: Run verification tests and build**

Run: `npx tsx scripts/verify-task6-registry-build.ts`
Expected: PASS: 64 Templates catalog matrix verified with 8 presets per archetype engine.

Run: `npm run build`
Expected: `✓ Generating static pages` with 0 errors.

- [ ] **Step 5: Commit and push**

```bash
git add src/lib/templates src/components/templates src/components/invitation src/app/globals.css scripts/verify-task6-registry-build.ts docs/superpowers/plans/2026-09-09-dedicated-invitation-templates-plan.md
git commit -m "feat(invitation): integrate 64 template matrix with live theme switcher and universal shell"
git push origin main
```

---

## Plan Review & Verification Checklist

- [x] **Spec coverage**: Covers all 6 sections from the approved design spec (`docs/superpowers/specs/2026-09-09-harikita-dedicated-invitation-templates-design.md`).
- [x] **Universal Luxury Shell**: Fully specified with all 6 components (`InvitationDesktopLayout`, `EnvelopeCoverGate`, `InvitationBottomDock`, `RotatingVinylPlayer`, `AutoScrollButton`, `ETicketBoardingPass`).
- [x] **8 Bespoke Engines**: Each engine implemented in its own isolated component with distinct layout geometry, ornaments, and canvas particle animations.
- [x] **64 Templates Matrix**: Explicitly registers 8 variants per archetype engine with Kebumen pilot venues.
- [x] **No Placeholders**: Every task contains concrete code snippets, exact paths, test commands, and git commits.
- [x] **TDD & Verification**: Every task begins with a failing verification script and ends with an automated pass.
