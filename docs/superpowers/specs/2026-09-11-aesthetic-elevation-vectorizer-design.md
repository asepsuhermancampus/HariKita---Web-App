# Design Specification: Aesthetic Elevation & Autonomous Art Improvisation Engine (V4)
**Date:** 2026-09-11  
**Project:** HariKita - Web App (Digital Invitation Asset Overhaul)  
**Directive:** Break free from blurry/drab raster limitations. Independently improvise and elevate vector assets into luxury digital wedding grade illustrations while preserving already-accurate assets.

---

## 1. Context & Motivation
Past vectorization iterations focused strictly on passive 1:1 raster replication. However, many source PNGs harvested from older platforms suffer from:
- Extremely low resolution (80–120px) with severe loss of leaf venation and petal folds.
- Dull, muddy, desaturated color palettes (drab army olive, muddy brown).
- Blurred/out-of-focus background textures that degenerate into weird polygon staircases.
- Antialiasing fringe creating opaque silhouette backings over hollow lace/filigree.

Per user approval, the vector engine is upgraded to an **Aesthetic Elevation & Autonomous Art Improvisation Engine (V4)**. When a source asset is visually drab or degraded, the engine independently enhances its vibrancy, structural clarity, and luxury wedding aesthetic aligned with HariKita's design standards.

---

## 2. Core Architectural Pillars

### 2.1. Color Vibrancy & Harmonization (Jewel & Botanical Palette)
- Automatically remap desaturated, muddy olive tones into fresh **Botanical Sage & Emerald Olive** (`#738359`, `#5a6b42`, `#8ea072`).
- Boost vibrant jewel tones in florals: **Royal Purple & Violet** (`#6b3b82`, `#854d9e`), **Golden Stamen** (`#f3c032`), **Blush Silk Pink** (`#f7e8ee`), **Gilded Champagne** (`#c5a880`).
- Eliminate dirty gray/mud shadows caused by raster compression.

### 2.2. Crisp Negative-Space Filigree & Lace
- Completely eliminate solid silhouette underlays behind intricate lace, arabesques, and corner ornaments.
- Trace delicate, high-contrast, paper-thin vector paths (`alpha >= 70-90`) with `fill-rule="evenodd"`.
- Support dual-tone luxury finish: **Pure Pearl White** (`#ffffff` / `#f4f8ff`) and **Gilded Champagne Gold** (`#c5a880` / `#dfc79b`).

### 2.3. Smooth Multi-Layer Botanical Shading
- Discard crude 3-band posterization.
- Implement 6–8 progressive tonal watercolor layers with micro-overlap (`stroke-width="0.5"`) to eliminate seam cracks while rendering lush, continuous botanical gradients without military camouflage banding.

### 2.4. Structural Definition for Blurry/Abstract Assets
- For blurry flower bouquets (like `1754648453_kdo54-bg-3`), reconstruct crisp petal contours and volume rather than tracing blurry mud staircases.
- Distinct petal separation: crease shadow -> midtone petal -> highlight tip -> warm stamen core.

### 2.5. Whitelist Registry (Non-Regression Protection)
- Assets that are already sharp, accurate, and visually harmonious (such as `vector-2.svg` star glow, clean dividers, proper line-art) are registered in a Whitelist and locked against modification.

---

## 3. Benchmark Targets (Phase 1)
1. `event-bottom-right.svg` -> Luxury Pearl White filigree lace with 100% hollow arabesque cutouts.
2. `bride-flower-3.svg` -> Fresh botanical eucalyptus/sage sprig with 6 watercolor tonal layers.
3. `bg-flower-3.svg` -> Royal violet flower basket with golden straw weave and blush silk ribbon.
4. `1754648453_kdo54-bg-3.svg` -> English ivory rose bouquet with crisp layered petals and lush olive leaves.
5. `1754403915_kdo56-flower-1.svg` -> Radiant copper botanical outline and charcoal pencil hatching.

---

## 4. Verification Plan
- Render all generated SVGs to PNG via Sharp at high resolution.
- Visually inspect rendered assets using `view_file` to verify aesthetic elegance, vibrant colors, and absence of visual artifacts.
- Verify 100% pure vector paths, zero raster `<image>`, zero base64, 100% offline independence.
