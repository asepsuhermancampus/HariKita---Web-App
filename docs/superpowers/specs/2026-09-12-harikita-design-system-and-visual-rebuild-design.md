# HariKita Design System & Visual Rebuild Specification
**Date:** 2026-09-12  
**Status:** Approved by User  
**Scope:** Hyperlocal Event Platform (Kebumen, Central Java) — Visual Identity, Color Tokens, Typography, Asset Pipeline & UI Components

---

## 1. Executive Summary & Brand Identity
HariKita is a hyperlocal pre-wedding, engagement, and intimate wedding service platform piloting in Kebumen, Central Java.
- **Tagline:** *"Rangkai Hari Bahagiamu, Menyelaraskan Restu & Impian."*
- **Aesthetic Direction:** Editorial fine-line luxury, warm neutral minimalism, restrained floral ornamentation, and romantic sophistication. Clichés such as loud yellow gold (`#D4AF37`), glossy 3D chrome, and cartoon wedding clipart are strictly prohibited.
- **Logo System Status (COMMITTED & LOCKED):**
  - The unified single-SVG HariKita logo lockup (`viewBox="0 0 424 100"`) and monogram variants are finalized and committed in git (`3ce72a8`, `1c0538d`).
  - **Hard Constraint:** The logo will **NOT** be modified, replaced, or redesigned. All visual rebuild activities support and complement this locked logo.

---

## 2. Color Palette & Token Architecture

### 2.1 Core Palette Tokens
The design system enforces a strict 5-color palette:

| Token Name | CSS Variable | Hex Code | RGB | Role & Usage |
|:---|:---|:---:|:---:|:---|
| **Charcoal** | `--color-charcoal` / `--hk-charcoal` | `#2B2B2B` | `43, 43, 43` | Primary text, high-contrast headings, dark section background |
| **Taupe** | `--color-taupe` / `--hk-taupe` | `#88735B` | `136, 115, 91` | Primary brand accent, main CTA buttons, luxury line art |
| **Champagne** | `--color-champagne` / `--hk-champagne` | `#C9A88A` | `201, 168, 138` | Secondary accent, card borders, interactive hover states |
| **Soft Beige** | `--color-soft-beige` / `--hk-soft-beige` | `#E8DED1` | `232, 222, 209` | Card surfaces, container fills, secondary background |
| **Ivory** | `--color-ivory` / `--hk-ivory` | `#F8F6F1` | `248, 246, 241` | Primary canvas/body background |

### 2.2 Backward Compatibility Aliases
Legacy tokens (`--color-canvas`, `--color-gold`, `--color-plum`) are mapped to the new palette to guarantee zero broken styles across existing components.

---

## 3. Typography Hierarchy

### 3.1 Font Families
1. **Display & Headings:** `Cormorant Garamond` (Weights: 400, 500, 600)
   - Serifs with high contrast, editorial refinement, and romantic cadence.
2. **UI, Body & Controls:** `Manrope` (Weights: 400, 500, 600, 700)
   - Modern, geometric, open grotesque sans-serif engineered for digital readability and touch ergonomics.

### 3.2 Typography Scale
- **H1 (Hero Display):** `Cormorant Garamond 500` (40px–56px, leading-tight)
- **H2 (Section Titles):** `Cormorant Garamond 500` (32px–40px)
- **H3 (Card & Subsections):** `Cormorant Garamond 500` (22px–28px)
- **Tagline / Captions:** `Cormorant Garamond 400 Italic` (16px–20px)
- **Navigation Links:** `Manrope 500` (14px–15px, tracking-wide)
- **Buttons & Badges:** `Manrope 600` (14px–15px)
- **Body & Description:** `Manrope 400` (14px–16px, leading-relaxed)
- **Form Inputs & Metadata:** `Manrope 400 / 500` (13px–14px)

---

## 4. Visual Asset System Architecture (13 Categories, ~136 Assets)

All assets reside in `public/assets/harikita/` with strict kebab-case naming.

### 4.1 Asset Categories & Target Inventories
1. **Floral & Botanical Ornaments (`ornaments/`):** 12 SVGs (`botanical-01.svg` to `12.svg`)
2. **Decorative Lines & Dividers (`lines/`):** 12 SVGs (`divider-01.svg` to `12.svg`)
3. **Corner Elements (`corners/`):** 8 SVGs (`corner-01.svg` to `08.svg`)
4. **Abstract Symbols (`abstract/`):** 10 SVGs (`symbol-01.svg` to `10.svg`)
5. **Single Stem Flowers (`flowers/single-stem/`):** 12 SVGs (`flower-single-stem-01.svg` to `12.svg`)
6. **Flower Blooms (`flowers/blooms/`):** 6 SVGs (`flower-bloom-01.svg` to `06.svg`)
7. **Small Floral Accents (`flowers/accents/`):** 6 SVGs (`flower-accent-01.svg` to `06.svg`)
8. **Leaf Sprigs, Branches & Stems (`leaves/`):** 16 SVGs
   - `sprigs/`: 8 SVGs (`leaf-sprig-01.svg` to `08.svg`)
   - `branches/`: 4 SVGs (`branch-01.svg` to `04.svg`)
   - `stems/`: 4 SVGs (`stem-01.svg` to `04.svg`)
9. **Floral Compositions (`compositions/`):** 8 SVGs (`composition-01.svg` to `08.svg`)
10. **Background Patterns & Textures (`patterns/`, `textures/`):** 12 Assets
    - 8 Seamless tileable SVGs (`pattern-01.svg` to `08.svg`)
    - 4 Optimized WebP textures (`texture-paper-light.webp`, `texture-paper-dark.webp`, `texture-linen-light.webp`, `texture-linen-dark.webp`)
11. **Custom Concept Icons (`icons/`):** 6 SVGs
    - `icon-two-people.svg`, `icon-love-story.svg`, `icon-wedding-event.svg`, `icon-invitation.svg`, `icon-togetherness.svg`, `icon-journey.svg`
12. **UI Decorative Assets (`decorative/`):** 12 SVGs
    - Badges (`badge-premium.svg`, `badge-new.svg`)
    - Seals & Stamps (`stamp-harikita.svg`, `wax-seal-hk.svg`)
    - Architectural frames & masks (`frame-arch-01.svg`, `frame-arch-02.svg`, `mask-arch-01.svg`)
    - Editorial marks & dividers (`quote-mark.svg`, `card-corner-01.svg`, `card-corner-02.svg`, `section-line-01.svg`, `section-line-02.svg`)
13. **Invitation / Card Layouts (`cards/`):** 8 Layout SVGs (`card-invitation-01.svg` to `08.svg`)
14. **Social Avatars (`avatars/`):** 6 SVGs based on the locked HariKita logo.

### 4.2 SVG Vector Technical Standards
- `stroke="currentColor"` or `fill="currentColor"` (no hardcoded `#000` or rigid fills).
- `vector-effect="non-scaling-stroke"` to prevent stroke distortion on scaling.
- Fine-line stroke weight: 1.0px to 1.5px.
- Clean `viewBox` coordinates with no extraneous editor artifacts.

---

## 5. UI Components & Mobile Implementation

### 5.1 Button & Control Variants (`src/components/harikita/ui/`)
1. `ButtonPrimary`: Solid Taupe (`#88735B`), white text, Manrope 600, optional arrow (`Mulai Sekarang →`).
2. `ButtonSecondary`: Outline Champagne (`#C9A88A`), Taupe text (`Lihat Detail`).
3. `ButtonGhost`: Text link with micro-arrow (`Selengkapnya →`).
4. `ButtonDark`: For Charcoal dark sections with Taupe/Champagne outline.
5. `IconButtonCircle`: Minimal circular buttons (Heart, Bookmark, Action).
6. `ToggleSwitch`: Pill switch with smooth translation.
7. `PaginationControls`: Minimalist slide indicator (`01 / 03 ← →`).
8. `BadgePremium`: Scalloped rosette badge with *PREMIUM* text.
9. `BadgeNew`: Octagonal badge with *NEW* text.
10. `WaxSealBadge`: Embossed wax seal visual component.
11. `VintageStampBadge`: Circular postal cancellation stamp.
12. `ArchFrameCard`: Arch-shaped photo container with optional botanical line accent.
13. `DecorativeDivider`: Content divider with center diamond or symmetrical loops.
14. `SerifQuoteCard`: Testimonial card with oversized editorial quotation mark.
15. `FloralCornerCard`: Card container with delicate corner flourishes.

### 5.2 Responsive Mobile Components (`src/components/harikita/mobile/`)
- `MobileHeader`: Compact sticky bar with official HariKita logo and action triggers.
- `MobileHero`: Touch-first editorial hero with arch photo mask and primary CTA.
- `MobileServiceCard`: Compact card with custom concept icon and pricing hint.
- `MobileInvitationPreview`: Vertical digital invitation preview with RSVP trigger.
- `MobileBottomNav`: 4-tab thumb navigation for mobile users.
- `MobileStickyBookingBar`: Floating bottom bar on service/detail pages for one-tap booking.

---

## 6. Verification & Interactive Showcase

### 6.1 Internal Showcase Route (`/design-system-showcase`)
A dedicated development page (`src/app/design-system-showcase/page.tsx`) providing:
1. Interactive color swatch grid with copyable hex values and luminance contrast checks.
2. Typography specimen viewer for Cormorant Garamond and Manrope.
3. Filterable visual gallery for all 13 SVG asset categories with live stroke color toggling (`Taupe`, `Charcoal`, `Champagne`) and zoom scaling.
4. Component testbed displaying all 15 UI variants and mobile component simulations.

### 6.2 Automated Quality Gates
- TypeScript compilation check (`npm run build` or `npx tsc --noEmit`).
- Dev server HTTP 200 validation on `http://localhost:3000/design-system-showcase`.
- Zero console runtime warnings or broken asset links.
