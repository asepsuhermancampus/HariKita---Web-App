# Technical Specification: Ultra-Fidelity Seamless Vectorizer V3 Engine
**Date:** 2026-09-11  
**Project:** HariKita - Web App (Digital Invitation Asset Engine)  
**Target:** Elimination of seam gaps, stepped posterization banding, and shredded artifacts across all SVG assets (`harvested/` & `kdo-library/`).

---

## 1. Problem Statement & Root Cause Analysis
During manual inspection in VS Code (with dark checkered canvas), several visual defects were identified:
1. **Inter-Color Seam Gaps (*Garis Retak / Celah Jahitan*):**
   - *Cause:* Disjoint polygon tracing. When Potrace traces non-overlapping adjacent color masks, Bezier curve rounding leaves sub-pixel (0.5–1px) gaps along shared borders, exposing the background.
2. **Stepped Posterization Banding (*Garis Kontur Topografi Kaku*):**
   - *Cause:* Fixed Euclidean RGB K-Means clustering on smooth gradients (such as succulent leaves or blush petals) creates hard isoline step-boundaries.
3. **Micro-Speckle Shredding (*Bintik Rusak / Robek-robek*):**
   - *Cause:* Unfiltered tracing of antialiased sub-pixel noise with low `turdSize` (1–2), producing thousands of fragmented path commands in complex floral sketches.
4. **Distortion of Simple Gradients:**
   - *Cause:* Low-variance assets (like `vector-2.png`, a 4-point sparkle star) being split into 5 concentric disjoint polygons instead of a unified vector shape.

---

## 2. Architecture: Ultra-Fidelity Seamless Vectorizer V3

### 2.1. Cumulative Foundation Stacking (Anti-Seam Engine)
To eliminate seam gaps mathematically:
- **Layer 0 (Underlay Foundation):** A solid silhouette covering 100% of visible pixels, filled with the deepest base/shadow tone of the illustration.
- **Progressive Over-Stamping:** Subsequent layers (midtones, petal bodies, bright highlights, and fine veins) are stamped cumulatively on top of Layer 0.
- **Sub-Pixel Micro-Dilation:** Each path includes a 0.6px stroke matching its fill color (`stroke-linejoin="round"`) to prevent SVG rasterizer sub-pixel antialiasing hairline cracks.

### 2.2. Perceptual CIELAB $\Delta E$ Color Clustering
- Conversion of sampled pixel RGB to CIELAB space ($L^*, a^*, b^*$).
- K-Means color distance measured using Euclidean distance in Lab space ($\Delta E$), matching human visual perception.
- Accurately preserves delicate pastel whites, blushes, and soft lavenders without gouache-like blotching.

### 2.3. Bilateral Edge-Preserving Pre-Smoothing
- A 3×3 bilateral smoothing kernel is applied to gradient regions before mask extraction.
- High-frequency pixel staircases are softened into continuous, sweeping Bezier contours, eliminating topographic isoline banding.

### 2.4. Adaptive Asset Profiler
1. **Type A (Subtle Glow / Simple Geometry - e.g., `vector-2.png`):**
   - Detected via low color variance ($\Delta E < 18$).
   - Traced as a single unified silhouette with native SVG `<radialGradient>` / `<linearGradient>`, preserving smooth lighting without contour rings.
2. **Type B (Sketched Florals with Hatching & Stamen - e.g., `rsvp-flower-3.png`, `bg-bride-flower-3.png`):**
   - Structural line extraction: fine ink strokes and stamen are traced with high contrast and noise despeckling (`turdSize >= 4`).
   - Soft petal fills are traced underneath with broad contours (`turdSize >= 10`), preventing shredded speckles.
3. **Type C (Watercolor & Botanical Florals - e.g., `1750171860_kdo46-bg-7`, `story-flower-2`):**
   - 6–8 cumulative layers with bilateral smoothing and micro-overprint.
4. **Type D (Monochrome Dividers & Calligraphy):**
   - Single-pass high-precision vector with `fill="currentColor"`, reactive to CSS theme variables.

---

## 3. Scope of Execution
1. **Harvested Assets:** All 280 assets in `references/kadio-assets/harvested/svg/`.
2. **KDO Library Assets:** All original master templates in `references/kadio-assets/kdo-library/svg/` (kdo1 to kdo33).
3. **Verification & Catalog Update:**
   - Zero `<image>`, zero `base64` (100% pure vector).
   - Zero empty SVG files.
   - Comprehensive comparison update in `harvested_catalog.html`.

---

## 4. Success Criteria
- [ ] No visible seam gaps / transparent cracks between adjacent colors when viewed over dark or light canvases.
- [ ] No harsh stepped topographic banding on gradient illustrations.
- [ ] Zero micro-speckle noise on sketched flowers.
- [ ] `vector-2.svg` rendered cleanly as a single smooth glowing star.
- [ ] `story-flower-2.svg` succulent leaves transition smoothly without terraced cuts.
- [ ] 100% pure vector paths, 100% offline independence.
