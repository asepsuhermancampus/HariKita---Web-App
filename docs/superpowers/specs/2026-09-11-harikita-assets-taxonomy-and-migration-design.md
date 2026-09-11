# HariKita Assets Taxonomy & Migration Design Document

**Date:** 2026-09-11  
**Status:** Validated & Ready for Planning  
**Target Architecture:** Next.js 15 App Router Public Static Asset System (`public/harikita-assets/`)  

---

## 1. Vision & Objective

The HariKita platform requires a clean, permanent, and production-ready asset repository that is completely decoupled from the reference workspace (`references/`). The current harvested asset library contains over 280 pure vector SVG assets, but many retain cryptic timestamp names (e.g., `1754648453_kdo54-bg-3.svg`, `1742797881_event-flower.svg`) or unorganized folder structures inherited from scraping.

This project delivers:
1. A permanent production asset directory at `public/harikita-assets/` directly servable by Next.js.
2. A clean, 5-tier semantic visual taxonomy (`floral/`, `frames/`, `backgrounds/`, `decorative/`, `icons/`) with dedicated subdirectories.
3. Clean, human-readable, and sequential filenames (e.g., `floral/corners/rose-ivory-corner-01.svg`).
4. Full bidirectional traceability via `harikita_manifest.json` (mapping original reference filenames to new semantic paths).
5. A high-performance interactive visual catalog at `public/harikita-assets/catalog.html`.
6. Zero disruption to `references/kadio-assets/`, allowing `references/` to remain the raw research workbench.

---

## 2. Directory Architecture & Visual Anatomy Taxonomy

```
public/harikita-assets/
├── floral/
│   ├── corners/           # 19 assets (L-shape corner floral brackets, e.g. English Rose corner)
│   ├── headers-garlands/  # 15 assets (Horizontal wreaths & garlands, width/height ratio >= 2.0)
│   ├── side-cascades/     # 44 assets (Vertical side creepers & pillars, height/width ratio >= 1.8)
│   ├── centerpieces/      # 103 assets (Compact, symmetrical centerpiece bouquets)
│   └── single-stems/      # 9 assets (Minimalist single stem & solitary blossoms)
├── frames/
│   ├── full-cards/        # 8 assets (Full 1-page invitation card borders)
│   ├── filigree-corners/  # 14 assets (Hollow lace negative-space corner filigree)
│   ├── dividers-horizontal/ # 20 assets (Section dividers, flourish lines, wave separators)
│   └── photo-frames/      # 7 assets (Couple photo frames, arch & countdown cards)
├── backgrounds/
│   ├── gradients/         # 25 assets (Soft champagne, alabaster & rose card gradients)
│   └── textures/          # 6 assets (Fine paper textures, watercolor washes)
├── decorative/
│   └── stars-sparkles/    # 1 asset (Gold starlight sparkles & ambient glow)
├── icons/
│   └── events/            # 2 assets (Wedding event markers: map, gift, etc.)
├── harikita_manifest.json # Complete metadata & backward-compatibility registry
└── catalog.html           # Interactive public visual catalog with anatomy filters
```

---

## 3. Semantic Naming Conventions

All assets follow a consistent, lower-kebab-case naming structure:
```
{category}/{subcategory}/{descriptor}-{color_or_style}-{index:02d}.svg
```

### Examples:
| Original Name | Category | Subcategory | New Semantic Name |
| :--- | :--- | :--- | :--- |
| `1754648453_kdo54-bg-3.svg` | `floral` | `corners` | `rose-ivory-english-corner-01.svg` |
| `1754403915_kdo56-flower-1.svg` | `floral` | `bouquets` | `bouquet-terracotta-blossom-01.svg` |
| `event-bottom-right.svg` | `frames` | `filigree` | `filigree-corner-iceblue-01.svg` |
| `frame-2.svg` | `frames` | `borders` | `card-frame-gold-filigree-01.svg` |
| `vector-2.svg` | `decorative` | `stars` | `star-sparkle-gold-01.svg` |
| `1745992861_bg-kdo43.svg` | `backgrounds` | `gradients` | `gradient-alabaster-card-01.svg` |
| `1748925440_flower-3-44.svg` | `floral` | `bouquets` | `bouquet-watercolor-rose-01.svg` |

---

## 4. Metadata Registry Specification (`harikita_manifest.json`)

To guarantee 100% backward traceability to original research files, `public/harikita-assets/harikita_manifest.json` will be generated with the following schema:

```json
[
  {
    "id": "floral-corner-rose-ivory-01",
    "originalFile": "1754648453_kdo54-bg-3.svg",
    "relativePath": "floral/corners/rose-ivory-english-corner-01.svg",
    "publicUrl": "/harikita-assets/floral/corners/rose-ivory-english-corner-01.svg",
    "category": "floral",
    "subCategory": "corners",
    "viewBox": "0 0 1200 1200",
    "width": 1200,
    "height": 1200,
    "pathCount": 7,
    "isV4Elevated": true,
    "isWhitelisted": true,
    "grade": "A+",
    "palette": ["#faf5ea", "#bfa888", "#785848"]
  }
]
```

---

## 5. Automated Migration & Organization Script (`scripts/organize_harikita_assets.js`)

A dedicated Node.js automation script will execute the reorganization:
1. **Scan Source Assets:** Reads all validated SVGs from `references/kadio-assets/harvested/svg/` and `references/kadio-assets/kdo-library/`.
2. **Category Classification Rules:**
   - **Frames / Filigree:** Files containing `frame`, `border`, `corner`, `top-left`, `bottom-right`, or having high aspect-ratio hollow negative space.
   - **Dividers:** Files containing `divider`, `stamp`, `wave`, `line`.
   - **Backgrounds:** Files containing `<linearGradient>` with `<rect>`, or names matching `bg-`, `paper-`.
   - **Stars / Sparkles:** Files containing `vector-`, `star`.
   - **Icons:** Small dimension assets (< 150px) with icons for calendar, gift, map, message.
   - **Floral:** All remaining botanical, blossom, leaf, rose, and bouquet assets.
3. **Collision-Free Sequencing:** Automatically detects existing indexes per subcategory to ensure sequential numbering (`01`, `02`, `03`...).
4. **Copy & Preserve:** Copies the SVGs into `public/harikita-assets/` under their new paths without deleting source files in `references/`.
5. **Catalog & Manifest Emission:** Generates `harikita_manifest.json` and `catalog.html`.

---

## 6. Verification & Quality Assurance

- **Asset Integrity Test (`scripts/verify_harikita_assets.js`):**
  - Verify all copied SVGs in `public/harikita-assets/` are valid XML and non-empty.
  - Pure Vector Guarantee: Strictly 0 `<image>` tags, 0 `base64` strings.
  - Manifest Check: Every entry in `harikita_manifest.json` must correspond to an existing physical file.
  - Whitelist Protection Check: All 9 Grade A whitelisted assets must be present in the new structure and bit-exact to their locked counterparts.
