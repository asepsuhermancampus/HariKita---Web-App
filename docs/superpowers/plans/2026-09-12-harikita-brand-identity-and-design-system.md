# HariKita Brand Identity & Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete vector-based HariKita brand identity system (monogram H+K symbol, editorial typography, 6 calibrated core color tokens, reusable React logo components, and PWA icons) across the HariKita web application based on `HariKita-Design.png`.

**Architecture:** Create pure vector SVG master assets and a zero-dependency React component `<HariKitaLogo />` supporting horizontal, stacked, and symbol-only variants. Update design tokens in `globals.css` and `tailwind.config.ts`, update typography fonts in `layout.tsx`, and refactor `LogoBadge.tsx` as a backward-compatible adapter across `Navbar.tsx` and `Footer.tsx`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Sharp, SVG / Bézier Curves, Google Fonts (Cormorant Garamond, Manrope).

**Spec:** [docs/superpowers/specs/2026-09-12-harikita-brand-identity-and-design-system.md](file:///c:/Users/asep.suherman/SETTUP%20TESTING/Build%20Project%20In%20Here/IDE/HariKita%20-%20Web%20App/docs/superpowers/specs/2026-09-12-harikita-brand-identity-and-design-system.md)

## Global Constraints

- **Strictly In-Scope:** Pure vector SVG (0% raster images inside logo components, 0% heavy filters, 0% blur).
- **Core Color Tokens (Exact Values):**
  - `--hk-canvas`: `#FAF8F5`
  - `--hk-ivory`: `#F8F6F1`
  - `--hk-soft-beige`: `#E5DED5`
  - `--hk-charcoal`: `#2B2B2B`
  - `--hk-taupe`: `#88735B`
  - `--hk-champagne`: `#C5B39F`
- **Typography:** Display / Logo Wordmark: *Cormorant Garamond*; UI / Body / Buttons / Navigation: *Manrope*.
- **Backwards Compatibility:** Do NOT break or rewrite existing booking flows, rundown generator, escrow calculators, or invitation engines. `LogoBadge.tsx` must maintain its interface.
- **ViewBox Precision:** Monogram symbol must use exact normalized `viewBox="602 13 741 678"` with zero hidden whitespace offsets.

---

### Task 1: Generate Master Vector SVG Assets and Brand Directory

**Files:**
- Create: `public/brand/harikita-symbol.svg`
- Create: `public/brand/harikita-logo-horizontal.svg`
- Create: `public/brand/harikita-logo-stacked.svg`
- Create: `public/favicon.svg`
- Test: `scripts/test_brand_assets.js`

**Interfaces:**
- Consumes: Normalized SVG paths from `scripts/build_perfect_board.js`
- Produces: Static SVG files in `public/brand/` and `public/favicon.svg`

- [ ] **Step 1: Write test to verify master SVG files exist and are valid pure vectors**

Create `scripts/test_brand_assets.js`:
```javascript
const fs = require('fs');
const assert = require('assert');

const files = [
  'public/brand/harikita-symbol.svg',
  'public/brand/harikita-logo-horizontal.svg',
  'public/brand/harikita-logo-stacked.svg',
  'public/favicon.svg'
];

for (const file of files) {
  assert(fs.existsSync(file), `File ${file} must exist`);
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('<svg'), `${file} must contain <svg`);
  assert(!content.includes('<image'), `${file} must not contain raster <image tags`);
  assert(!content.includes('data:image'), `${file} must not contain base64 bitmaps`);
}

console.log('✅ Task 1 SVG Asset Test Passed!');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test_brand_assets.js`
Expected: FAIL with "File public/brand/harikita-symbol.svg must exist"

- [ ] **Step 3: Generate the static SVG master files into public/brand/ and public/favicon.svg**

Create `scripts/generate_public_brand_assets.js`:
```javascript
const fs = require('fs');
const path = require('path');

const brandDir = path.join(__dirname, '..', 'public', 'brand');
if (!fs.existsSync(brandDir)) {
  fs.mkdirSync(brandDir, { recursive: true });
}

// Read verified normalized SVGs from artifact directory
const artifactDir = 'C:/Users/asep.suherman/.gemini/antigravity-ide/brain/0864abd2-810a-440d-9f93-bfaafb312e1a';
const symbolSvg = fs.readFileSync(path.join(artifactDir, 'harikita_symbol_taupe.svg'), 'utf8');
const wordmarkSvg = fs.readFileSync(path.join(artifactDir, 'harikita_wordmark_charcoal.svg'), 'utf8');

const symbolPath = symbolSvg.match(/<path[^>]*d="([^"]+)"/)[1];
const wordmarkPath = wordmarkSvg.match(/<path[^>]*d="([^"]+)"/)[1];

// 1. Symbol Only SVG
const symbolFile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="602 13 741 678" width="741" height="678" fill="currentColor">
  <path d="${symbolPath}" fill-rule="evenodd"/>
</svg>`;
fs.writeFileSync(path.join(brandDir, 'harikita-symbol.svg'), symbolFile);

// 2. Horizontal Logo SVG
const horizontalFile = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="140" viewBox="0 0 500 140" fill="none">
  <!-- Symbol: Taupe #88735B -->
  <svg x="20" y="35" width="76" height="70" viewBox="602 13 741 678">
    <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
  </svg>
  <!-- Wordmark: Charcoal #2B2B2B -->
  <svg x="115" y="35" width="240" height="49" viewBox="26 36 1898 388">
    <path d="${wordmarkPath}" fill="#2B2B2B" fill-rule="evenodd"/>
  </svg>
  <!-- Subtitle: WEDDING & EVENTS -->
  <text x="117" y="103" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10.5" font-weight="600" fill="#88735B" letter-spacing="3.8">WEDDING &amp; EVENTS</text>
</svg>`;
fs.writeFileSync(path.join(brandDir, 'harikita-logo-horizontal.svg'), horizontalFile);

// 3. Stacked Logo SVG
const stackedFile = `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="500" viewBox="0 0 460 500" fill="none">
  <!-- Symbol -->
  <svg x="155" y="45" width="150" height="137.2" viewBox="602 13 741 678">
    <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
  </svg>
  <!-- Wordmark -->
  <svg x="90" y="205" width="280" height="57.2" viewBox="26 36 1898 388">
    <path d="${wordmarkPath}" fill="#2B2B2B" fill-rule="evenodd"/>
  </svg>
  <!-- Subtitle -->
  <text x="230" y="300" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="600" fill="#88735B" letter-spacing="5">WEDDING &amp; EVENTS</text>
  <!-- Hairline divider -->
  <line x1="195" y1="340" x2="265" y2="340" stroke="#88735B" stroke-width="1.2" opacity="0.5"/>
  <!-- Tagline -->
  <text x="230" y="390" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="21" fill="#88735B">Your Day. Our Story</text>
</svg>`;
fs.writeFileSync(path.join(brandDir, 'harikita-logo-stacked.svg'), stackedFile);

// 4. Favicon SVG (Squircle 512x512)
const faviconFile = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#88735B"/>
  <svg x="126" y="137" width="260" height="237.9" viewBox="602 13 741 678">
    <path d="${symbolPath}" fill="#FAF8F5" fill-rule="evenodd"/>
  </svg>
</svg>`;
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), faviconFile);

console.log('Successfully generated public SVG brand assets!');
```

Run: `node scripts/generate_public_brand_assets.js`

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/test_brand_assets.js`
Expected: PASS with "✅ Task 1 SVG Asset Test Passed!"

- [ ] **Step 5: Commit**

```bash
git add public/brand public/favicon.svg scripts/generate_public_brand_assets.js scripts/test_brand_assets.js
git commit -m "feat(brand): add master vector SVG logo assets and favicon.svg"
```

---

### Task 2: PWA Icons Generation & Web Manifest Update

**Files:**
- Create/Overwrite: `public/icons/icon-192x192.png`
- Create/Overwrite: `public/icons/icon-512x512.png`
- Create/Overwrite: `public/icons/apple-touch-icon.png`
- Modify: `public/manifest.webmanifest`
- Test: `scripts/test_pwa_icons.js`

**Interfaces:**
- Consumes: `public/favicon.svg`
- Produces: Crisp PWA launcher PNG icons rendered at exact dimensions

- [ ] **Step 1: Write test for PWA icon dimensions and manifest validity**

Create `scripts/test_pwa_icons.js`:
```javascript
const sharp = require('sharp');
const fs = require('fs');
const assert = require('assert');

async function test() {
  const icon192 = await sharp('public/icons/icon-192x192.png').metadata();
  assert.strictEqual(icon192.width, 192);
  assert.strictEqual(icon192.height, 192);

  const icon512 = await sharp('public/icons/icon-512x512.png').metadata();
  assert.strictEqual(icon512.width, 512);
  assert.strictEqual(icon512.height, 512);

  const manifest = JSON.parse(fs.readFileSync('public/manifest.webmanifest', 'utf8'));
  assert.strictEqual(manifest.name, 'HariKita');
  assert.strictEqual(manifest.theme_color, '#FAF8F5');
  console.log('✅ Task 2 PWA Icon Test Passed!');
}
test().catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test_pwa_icons.js`
Expected: FAIL (theme_color mismatch or old icons)

- [ ] **Step 3: Generate crisp PNG icons with Sharp and update manifest**

Create `scripts/generate_pwa_icons.js`:
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generate() {
  const svgBuffer = fs.readFileSync('public/favicon.svg');
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192x192.png'));
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512x512.png'));
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));

  // Update manifest theme color to #FAF8F5 and background_color to #FAF8F5
  const manifestPath = 'public/manifest.webmanifest';
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.theme_color = '#FAF8F5';
    manifest.background_color = '#FAF8F5';
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }

  console.log('PWA icons successfully generated!');
}
generate().catch(console.error);
```

Run: `node scripts/generate_pwa_icons.js`

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/test_pwa_icons.js`
Expected: PASS with "✅ Task 2 PWA Icon Test Passed!"

- [ ] **Step 5: Commit**

```bash
git add public/icons public/manifest.webmanifest scripts/generate_pwa_icons.js scripts/test_pwa_icons.js
git commit -m "feat(pwa): regenerate PWA app launcher icons with taupe squircle monogram"
```

---

### Task 3: Color Tokens & Typography Setup in globals.css, tailwind.config.ts, and layout.tsx

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `src/app/layout.tsx`
- Test: `scripts/test_design_tokens.js`

**Interfaces:**
- Produces: CSS variables `--hk-*`, Tailwind color classes `hk-*`, and Google Fonts Cormorant Garamond + Manrope

- [ ] **Step 1: Write test to verify design tokens and typography are defined**

Create `scripts/test_design_tokens.js`:
```javascript
const fs = require('fs');
const assert = require('assert');

const globals = fs.readFileSync('src/app/globals.css', 'utf8');
assert(globals.includes('--hk-canvas: #FAF8F5;'), 'globals.css must define --hk-canvas');
assert(globals.includes('--hk-ivory: #F8F6F1;'), 'globals.css must define --hk-ivory');
assert(globals.includes('--hk-soft-beige: #E5DED5;'), 'globals.css must define --hk-soft-beige');
assert(globals.includes('--hk-charcoal: #2B2B2B;'), 'globals.css must define --hk-charcoal');
assert(globals.includes('--hk-taupe: #88735B;'), 'globals.css must define --hk-taupe');
assert(globals.includes('--hk-champagne: #C5B39F;'), 'globals.css must define --hk-champagne');

const tailwind = fs.readFileSync('tailwind.config.ts', 'utf8');
assert(tailwind.includes('hk:'), 'tailwind.config.ts must extend hk color tokens');

const layout = fs.readFileSync('src/app/layout.tsx', 'utf8');
assert(layout.includes('family=Manrope'), 'layout.tsx must load Manrope font');
assert(layout.includes('family=Cormorant+Garamond'), 'layout.tsx must load Cormorant Garamond font');

console.log('✅ Task 3 Design Tokens Test Passed!');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test_design_tokens.js`
Expected: FAIL (missing `--hk-canvas` in globals.css)

- [ ] **Step 3: Update globals.css, tailwind.config.ts, and layout.tsx**

In `src/app/globals.css`, add:
```css
:root {
  --hk-canvas: #FAF8F5;
  --hk-ivory: #F8F6F1;
  --hk-soft-beige: #E5DED5;
  --hk-charcoal: #2B2B2B;
  --hk-taupe: #88735B;
  --hk-champagne: #C5B39F;
  /* Existing color tokens retained for compatibility */
  --color-canvas: #FAF8F5;
  ...
}
```

In `tailwind.config.ts`, extend:
```typescript
colors: {
  hk: {
    canvas: "var(--hk-canvas)",
    ivory: "var(--hk-ivory)",
    "soft-beige": "var(--hk-soft-beige)",
    charcoal: "var(--hk-charcoal)",
    taupe: "var(--hk-taupe)",
    champagne: "var(--hk-champagne)",
  },
  ...
},
fontFamily: {
  editorial: ["Cormorant Garamond", "Georgia", "serif"],
  manrope: ["Manrope", "system-ui", "sans-serif"],
  serif: ["Playfair Display", "Cinzel", "Georgia", "serif"],
  sans: ["Manrope", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
}
```

In `src/app/layout.tsx`, update the Google Fonts URL:
```html
href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Manrope:wght@300;400;500;600;700;800&family=Cinzel:wght@400;600;700;900&family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap"
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/test_design_tokens.js`
Expected: PASS with "✅ Task 3 Design Tokens Test Passed!"

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css tailwind.config.ts src/app/layout.tsx scripts/test_design_tokens.js
git commit -m "feat(design-system): register --hk core color tokens and Manrope font"
```

---

### Task 4: Reusable Component `<HariKitaLogo />`

**Files:**
- Create: `src/components/brand/HariKitaLogo.tsx`
- Test: `scripts/test_logo_component.js`

**Interfaces:**
- Produces: `<HariKitaLogo />` component supporting `variant` (`horizontal` | `stacked` | `symbol`), `tone` (`dark` | `light` | `currentColor`), `size`, and `asLink`.

- [ ] **Step 1: Write test for `<HariKitaLogo />` component export and props**

Create `scripts/test_logo_component.js`:
```javascript
const fs = require('fs');
const assert = require('assert');

const file = 'src/components/brand/HariKitaLogo.tsx';
assert(fs.existsSync(file), 'HariKitaLogo.tsx must exist');

const content = fs.readFileSync(file, 'utf8');
assert(content.includes('export const HariKitaLogo'), 'Must export HariKitaLogo');
assert(content.includes('viewBox="602 13 741 678"'), 'Must use normalized symbol viewBox');
assert(content.includes('viewBox="26 36 1898 388"'), 'Must use normalized wordmark viewBox');
assert(content.includes('fill="currentColor"'), 'Must support currentColor');

console.log('✅ Task 4 Logo Component Test Passed!');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test_logo_component.js`
Expected: FAIL (file does not exist)

- [ ] **Step 3: Implement `src/components/brand/HariKitaLogo.tsx`**

Create `src/components/brand/HariKitaLogo.tsx`:
```tsx
import React from "react";
import Link from "next/link";

export interface HariKitaLogoProps {
  variant?: "horizontal" | "stacked" | "symbol";
  tone?: "dark" | "light" | "currentColor";
  size?: "sm" | "md" | "lg" | "xl" | number;
  showTagline?: boolean;
  showSubtitle?: boolean;
  asLink?: boolean;
  href?: string;
  className?: string;
}

// Normalized mathematical Bézier path strings from HariKita-Design.png
const SYMBOL_PATH = "..."; // Exact 6KB path
const WORDMARK_PATH = "..."; // Exact 14KB path

export const HariKitaLogo: React.FC<HariKitaLogoProps> = ({
  variant = "horizontal",
  tone = "dark",
  size = "md",
  showTagline = false,
  showSubtitle = true,
  asLink = true,
  href = "/",
  className = "",
}) => {
  // Compute color based on tone
  // tone="dark" -> on light canvas: Symbol Taupe #88735B, Wordmark Charcoal #2B2B2B
  // tone="light" -> on dark canvas: Symbol Champagne #C5B39F, Wordmark Ivory #FAF8F5
  // tone="currentColor" -> inherits CSS text color
  ...
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/test_logo_component.js`
Expected: PASS with "✅ Task 4 Logo Component Test Passed!"

- [ ] **Step 5: Run TypeScript compilation check**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors

- [ ] **Step 6: Commit**

```bash
git add src/components/brand/HariKitaLogo.tsx scripts/test_logo_component.js
git commit -m "feat(brand): implement reusable HariKitaLogo SVG component"
```

---

### Task 5: Refactor `LogoBadge.tsx` Adapter & Update `Navbar.tsx` and `Footer.tsx`

**Files:**
- Modify: `src/components/layout/LogoBadge.tsx`
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Test: `scripts/test_layout_integration.js`

**Interfaces:**
- Consumes: `<HariKitaLogo />` from `src/components/brand/HariKitaLogo.tsx`
- Produces: Refactored `LogoBadge.tsx` rendering pure vector logo without `/logo_badge.png` raster image.

- [ ] **Step 1: Write integration test for LogoBadge, Navbar, and Footer**

Create `scripts/test_layout_integration.js`:
```javascript
const fs = require('fs');
const assert = require('assert');

const logoBadge = fs.readFileSync('src/components/layout/LogoBadge.tsx', 'utf8');
assert(!logoBadge.includes('/logo_badge.png'), 'LogoBadge must not use old raster logo_badge.png');
assert(logoBadge.includes('HariKitaLogo'), 'LogoBadge must wrap HariKitaLogo');

const navbar = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');
assert(navbar.includes('LogoBadge'), 'Navbar must include logo');

const footer = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');
assert(footer.includes('LogoBadge') || footer.includes('HariKitaLogo'), 'Footer must include logo');

console.log('✅ Task 5 Layout Integration Test Passed!');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test_layout_integration.js`
Expected: FAIL (LogoBadge still uses `/logo_badge.png`)

- [ ] **Step 3: Refactor `LogoBadge.tsx`**

Update `src/components/layout/LogoBadge.tsx`:
```tsx
import React from "react";
import { HariKitaLogo } from "@/components/brand/HariKitaLogo";

interface LogoBadgeProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  variant?: "default" | "light";
  className?: string;
}

export const LogoBadge: React.FC<LogoBadgeProps> = ({
  size = "md",
  showTagline = true,
  variant = "default",
  className = "",
}) => {
  const tone = variant === "light" ? "light" : "dark";
  return (
    <div className={`inline-flex items-center ${className}`}>
      <HariKitaLogo
        variant="horizontal"
        tone={tone}
        size={size}
        showSubtitle={showTagline}
        asLink={true}
      />
    </div>
  );
};
```

- [ ] **Step 4: Update `Footer.tsx` and `Navbar.tsx` styling for new brand aesthetic**

In `Footer.tsx`, remove the old cameo circle container and allow the light-toned logo to render cleanly against the dark background.

- [ ] **Step 5: Run test to verify it passes**

Run: `node scripts/test_layout_integration.js`
Expected: PASS with "✅ Task 5 Layout Integration Test Passed!"

- [ ] **Step 6: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/LogoBadge.tsx src/components/layout/Navbar.tsx src/components/layout/Footer.tsx scripts/test_layout_integration.js
git commit -m "feat(layout): refactor LogoBadge adapter to use vector HariKitaLogo across Navbar and Footer"
```

---

### Task 6: Full Verification Suite & Build Validation

**Files:**
- Create: `scripts/verify_brand_system.js`
- Test: Next.js Production Build (`npm run build`)

- [ ] **Step 1: Write master health check script**

Create `scripts/verify_brand_system.js`:
```javascript
const fs = require('fs');
const assert = require('assert');

console.log('Running Master Brand Health Check...');

// 1. Check all generated public brand assets
assert(fs.existsSync('public/brand/harikita-symbol.svg'), 'Missing harikita-symbol.svg');
assert(fs.existsSync('public/brand/harikita-logo-horizontal.svg'), 'Missing harikita-logo-horizontal.svg');
assert(fs.existsSync('public/brand/harikita-logo-stacked.svg'), 'Missing harikita-logo-stacked.svg');
assert(fs.existsSync('public/favicon.svg'), 'Missing favicon.svg');
assert(fs.existsSync('public/icons/icon-192x192.png'), 'Missing icon-192x192.png');
assert(fs.existsSync('public/icons/icon-512x512.png'), 'Missing icon-512x512.png');

// 2. Check no broken raster image imports in components
const logoComp = fs.readFileSync('src/components/brand/HariKitaLogo.tsx', 'utf8');
assert(!logoComp.includes('next/image'), 'HariKitaLogo must not use raster Next Image');
assert(!logoComp.includes('<img'), 'HariKitaLogo must not use html img');

// 3. Check CSS tokens
const css = fs.readFileSync('src/app/globals.css', 'utf8');
assert(css.includes('--hk-canvas: #FAF8F5;'), 'Missing --hk-canvas');
assert(css.includes('--hk-champagne: #C5B39F;'), 'Missing calibrated champagne');

console.log('🎉 All Master Brand Checks Passed!');
```

- [ ] **Step 2: Run health check script**

Run: `node scripts/verify_brand_system.js`
Expected: PASS

- [ ] **Step 3: Run TypeScript compiler**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Run Next.js production build**

Run: `npm run build`
Expected: Build successfully completes with 0 errors

- [ ] **Step 5: Commit**

```bash
git add scripts/verify_brand_system.js
git commit -m "test(brand): add master brand verification suite and validate build"
```
