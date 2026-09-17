# Seamless Ultra-Fidelity Vectorizer V3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all seam gaps (garis retak), stepped posterization isolines (garis kontur kaku), and shredded micro-speckle artifacts across all project SVG assets (`harvested/` & `kdo-library/`), achieving 100% smooth, elegant, authentic vector reproduction.

**Architecture:** Cumulative Foundation Stacking (Layer 0 full-silhouette foundation + progressive over-stamping + 0.6px micro-overprint dilation) combined with CIELAB perceptual $\Delta E$ clustering, bilateral edge-preserving smoothing, and adaptive asset profiling for geometry, sketched florals, and watercolor botanicals.

**Tech Stack:** Node.js, `pngjs`, `potrace`, CIELAB color science, SVG 1.1 pure vectors.

**Spec:** `docs/superpowers/specs/2026-09-11-seamless-ultra-vectorizer-v3-design.md`

## Global Constraints
- 100% pure vector paths (`<path>`, `<rect>`); strictly 0 `<image>` and 0 `base64`.
- 100% offline local storage; zero external HTTP/HTTPS network calls.
- Single-color line art / dividers must maintain `fill="currentColor"` with authentic fallback hex.
- Mathematical elimination of inter-color seam cracks via Cumulative Foundation Stacking.

---

### Task 1: Core Engine Implementation (`scripts/ultra_fidelity_vectorizer_v3.js`)

**Files:**
- Create: `scripts/ultra_fidelity_vectorizer_v3.js`

**Interfaces:**
- Produces: `vectorizeV3(png, filename): Promise<string>` returning clean, seamless SVG XML string.

- [ ] **Step 1: Implement CIELAB color conversion & $\Delta E$ functions**
```javascript
// RGB <-> XYZ <-> CIELAB conversion formulas
function rgb2lab(r, g, b) {
  let [r1, g1, b1] = [r / 255, g / 255, b / 255].map(v =>
    v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92
  );
  let x = (r1 * 0.4124 + g1 * 0.3576 + b1 * 0.1805) / 0.95047;
  let y = (r1 * 0.2126 + g1 * 0.7152 + b1 * 0.0722) / 1.00000;
  let z = (r1 * 0.0193 + g1 * 0.1192 + b1 * 0.9505) / 1.08883;
  [x, y, z] = [x, y, z].map(v => v > 0.008856 ? Math.cbrt(v) : (7.787 * v) + (16 / 116));
  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
}
function deltaE(lab1, lab2) {
  return Math.sqrt((lab1[0] - lab2[0])**2 + (lab1[1] - lab2[1])**2 + (lab1[2] - lab2[2])**2);
}
```

- [ ] **Step 2: Implement Bilateral edge-preserving pre-smoothing filter**
```javascript
function applyBilateralSmoothing(png) { ... }
```

- [ ] **Step 3: Implement Cumulative Foundation Stacking with 0.6px overprint**
```javascript
// Layer 0 is the complete silhouette base of all visible pixels
// Subsequent layers are stamped on top with stroke dilation
```

- [ ] **Step 4: Implement Adaptive Asset Profilers (Types A, B, C, D)**
- [ ] **Step 5: Run unit tests on sample assets to verify compilation and execution**
```bash
node -e "require('./scripts/ultra_fidelity_vectorizer_v3.js')"
```

---

### Task 2: Validate Engine on the 5 Flagged Problem Assets

**Files:**
- Test files: `references/kadio-assets/harvested/vector-2.png`, `story-flower-2.png`, `rsvp-flower-3.png`, `1750171860_kdo46-bg-7.png`, `index-bg-bottom-right.png`

- [ ] **Step 1: Run V3 on the 5 flagged assets**
```bash
node scripts/test_v3_flagged.js
```
- [ ] **Step 2: Verify `vector-2.svg` is a unified smooth star (no 5-ring contour isolines)**
- [ ] **Step 3: Verify `story-flower-2.svg` has smooth succulent leaves without stepped cracks**
- [ ] **Step 4: Verify `rsvp-flower-3.svg` has clean stamen lines without shredded noise**
- [ ] **Step 5: Verify `1750171860_kdo46-bg-7.svg` has zero seam cracks over dark canvas**

---

### Task 3: Batch Re-vectorize All 280 Harvested Assets & Update Catalog

**Files:**
- Modify: `references/kadio-assets/harvested/svg/*.svg` (all 280 assets)
- Modify: `references/kadio-assets/harvested/svg/harvested_catalog.html`
- Modify: `references/kadio-assets/harvested/svg/harvested_catalog_data.json`

- [ ] **Step 1: Execute V3 batch processing across all 280 harvested assets**
```bash
node scripts/run_v3_harvested.js
```
- [ ] **Step 2: Rebuild `harvested_catalog.html`**
```bash
node scripts/generate_harvested_catalog.js
```
- [ ] **Step 3: Verify all 280 files: 100% pure vector, 0% raster, 0% empty**

---

### Task 4: Batch Re-vectorize `kdo-library` Assets (kdo1 to kdo33)

**Files:**
- Target: `references/kadio-assets/kdo-library/svg/**`

- [ ] **Step 1: Scan all original raster PNGs in `kdo-library`**
- [ ] **Step 2: Run V3 vectorizer on all `kdo-library` floral and illustration assets**
- [ ] **Step 3: Verify zero regression on existing wedding template assets**

---

### Task 5: End-to-End Verification & Commit

- [ ] **Step 1: Run comprehensive verification script `scripts/verify_v3_all.js`**
- [ ] **Step 2: Stage and commit all updated SVGs, scripts, and plans to Git**
```bash
git add .
git commit -m "feat(assets): deploy Ultra-Fidelity Seamless Vectorizer V3 across all assets"
```
