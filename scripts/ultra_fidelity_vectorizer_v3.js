const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const potrace = require("potrace");

// ============================================================================
// ULTRA-FIDELITY SEAMLESS VECTORIZER V3 CORE ENGINE
// ============================================================================

// 1. CIELAB Perceptual Color Science
function rgb2xyz(r, g, b) {
  let [r1, g1, b1] = [r / 255, g / 255, b / 255].map((v) =>
    v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92
  );
  let x = (r1 * 0.4124 + g1 * 0.3576 + b1 * 0.1805) * 100;
  let y = (r1 * 0.2126 + g1 * 0.7152 + b1 * 0.0722) * 100;
  let z = (r1 * 0.0193 + g1 * 0.1192 + b1 * 0.9505) * 100;
  return [x, y, z];
}

function xyz2lab(x, y, z) {
  const xn = 95.047, yn = 100.0, zn = 108.883;
  let [fx, fy, fz] = [x / xn, y / yn, z / zn].map((v) =>
    v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116
  );
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function rgb2lab(r, g, b) {
  const [x, y, z] = rgb2xyz(r, g, b);
  return xyz2lab(x, y, z);
}

function deltaE(lab1, lab2) {
  return Math.sqrt(
    (lab1[0] - lab2[0]) ** 2 +
    (lab1[1] - lab2[1]) ** 2 +
    (lab1[2] - lab2[2]) ** 2
  );
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function getLuminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// 2. Adaptive Bilinear Interpolation Upscaler
function upscaleBilinear(srcPng, scale = 1.5) {
  if (scale <= 1.0) return srcPng;

  const targetW = Math.round(srcPng.width * scale);
  const targetH = Math.round(srcPng.height * scale);
  const dstPng = new PNG({ width: targetW, height: targetH });

  for (let y = 0; y < targetH; y++) {
    const srcY = y / scale;
    const y0 = Math.floor(srcY);
    const y1 = Math.min(srcPng.height - 1, y0 + 1);
    const dy = srcY - y0;

    for (let x = 0; x < targetW; x++) {
      const srcX = x / scale;
      const x0 = Math.floor(srcX);
      const x1 = Math.min(srcPng.width - 1, x0 + 1);
      const dx = srcX - x0;

      const idx00 = (srcPng.width * y0 + x0) << 2;
      const idx10 = (srcPng.width * y0 + x1) << 2;
      const idx01 = (srcPng.width * y1 + x0) << 2;
      const idx11 = (srcPng.width * y1 + x1) << 2;

      const dstIdx = (targetW * y + x) << 2;

      for (let c = 0; c < 4; c++) {
        const val0 = srcPng.data[idx00 + c] * (1 - dx) + srcPng.data[idx10 + c] * dx;
        const val1 = srcPng.data[idx01 + c] * (1 - dx) + srcPng.data[idx11 + c] * dx;
        dstPng.data[dstIdx + c] = Math.round(val0 * (1 - dy) + val1 * dy);
      }
    }
  }
  return dstPng;
}

// 3. Bilateral Edge-Preserving Pre-Smoothing
// Eliminates stepped contour bands while preserving crisp boundaries
function applyBilateralSmoothing(png, minAlphaThreshold = 25) {
  const w = png.width;
  const h = png.height;
  const outPng = new PNG({ width: w, height: h });
  outPng.data.set(png.data);

  const sigmaR = 25; // Color distance threshold for smoothing
  const sigmaRSq2 = 2 * sigmaR * sigmaR;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const centerIdx = (w * y + x) << 2;
      const centerA = png.data[centerIdx + 3];
      if (centerA < minAlphaThreshold) continue;

      const cR = png.data[centerIdx];
      const cG = png.data[centerIdx + 1];
      const cB = png.data[centerIdx + 2];
      const cLab = rgb2lab(cR, cG, cB);

      let wSum = 0;
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = (w * (y + dy) + (x + dx)) << 2;
          if (png.data[nIdx + 3] < 30) continue;

          const nR = png.data[nIdx];
          const nG = png.data[nIdx + 1];
          const nB = png.data[nIdx + 2];
          const nLab = rgb2lab(nR, nG, nB);

          const dE = deltaE(cLab, nLab);
          const spatialWeight = dx === 0 && dy === 0 ? 1.0 : 0.707;
          const rangeWeight = Math.exp(-(dE * dE) / sigmaRSq2);
          const weight = spatialWeight * rangeWeight;

          rSum += nR * weight;
          gSum += nG * weight;
          bSum += nB * weight;
          wSum += weight;
        }
      }

      if (wSum > 0) {
        outPng.data[centerIdx] = Math.round(rSum / wSum);
        outPng.data[centerIdx + 1] = Math.round(gSum / wSum);
        outPng.data[centerIdx + 2] = Math.round(bSum / wSum);
      }
    }
  }

  return outPng;
}

// 4. Perceptual CIELAB K-Means Clustering
function kMeansCielab(pixels, k = 7, iterations = 6) {
  if (pixels.length === 0) return [];
  k = Math.min(k, pixels.length);

  // Sub-sample up to 6,000 pixels for fast convergence
  const sampleSize = Math.min(pixels.length, 6000);
  const sample = [];
  const step = Math.max(1, Math.floor(pixels.length / sampleSize));
  for (let i = 0; i < pixels.length && sample.length < sampleSize; i += step) {
    sample.push(pixels[i]);
  }

  const sampleLab = sample.map((p) => rgb2lab(p[0], p[1], p[2]));

  // K-means++ initialization in Lab space
  const centroids = [sample[0].slice()];
  const centroidsLab = [sampleLab[0].slice()];

  while (centroids.length < k) {
    let bestDist = -1;
    let bestIdx = 0;
    for (let s = 0; s < 30; s++) {
      const idx = Math.floor(Math.random() * sample.length);
      const slab = sampleLab[idx];
      let minDist = Infinity;
      for (const clab of centroidsLab) {
        const d = deltaE(slab, clab);
        if (d < minDist) minDist = d;
      }
      if (minDist > bestDist) {
        bestDist = minDist;
        bestIdx = idx;
      }
    }
    centroids.push(sample[bestIdx].slice());
    centroidsLab.push(sampleLab[bestIdx].slice());
  }

  // Iterative refinement in Lab space
  for (let iter = 0; iter < iterations; iter++) {
    const sums = centroids.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < sample.length; i++) {
      const slab = sampleLab[i];
      let minDist = Infinity;
      let bestC = 0;
      for (let c = 0; c < centroidsLab.length; c++) {
        const d = deltaE(slab, centroidsLab[c]);
        if (d < minDist) {
          minDist = d;
          bestC = c;
        }
      }
      sums[bestC][0] += sample[i][0];
      sums[bestC][1] += sample[i][1];
      sums[bestC][2] += sample[i][2];
      sums[bestC][3]++;
    }

    for (let c = 0; c < centroids.length; c++) {
      if (sums[c][3] > 0) {
        centroids[c][0] = Math.round(sums[c][0] / sums[c][3]);
        centroids[c][1] = Math.round(sums[c][1] / sums[c][3]);
        centroids[c][2] = Math.round(sums[c][2] / sums[c][3]);
        centroidsLab[c] = rgb2lab(centroids[c][0], centroids[c][1], centroids[c][2]);
      }
    }
  }

  return centroids;
}

function traceMaskBuffer(maskPng, color, optTolerance = 0.25, turdSize = 6) {
  return new Promise((resolve) => {
    const buf = PNG.sync.write(maskPng);
    potrace.trace(
      buf,
      {
        threshold: 128,
        optTolerance,
        turdSize,
        color,
      },
      (err, svg) => {
        if (err || !svg) return resolve(null);
        const match = svg.match(/d="([^"]+)"/);
        if (match && match[1]) {
          resolve({ color, d: match[1] });
        } else {
          resolve(null);
        }
      }
    );
  });
}

// 5. Profiler A: Simple Glow & Clean Geometry (e.g. vector-2.png)
async function traceSimpleGlow(upPng, domHex) {
  const mask = new PNG({ width: upPng.width, height: upPng.height });
  mask.data.fill(255);

  for (let i = 0; i < upPng.data.length; i += 4) {
    if (upPng.data[i + 3] > 35) {
      mask.data[i] = 0;
      mask.data[i + 1] = 0;
      mask.data[i + 2] = 0;
      mask.data[i + 3] = 255;
    }
  }

  const res = await traceMaskBuffer(mask, domHex, 0.2, 4);
  if (!res) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}" width="100%" height="100%">
  <path d="${res.d}" fill="${domHex}" stroke="${domHex}" stroke-width="0.6" stroke-linejoin="round" fill-rule="evenodd"/>
</svg>
`;
}

// 6. Profiler B: Sketched Floral with Stamen / Ink Lines (e.g. rsvp-flower-3.png)
async function traceSketchedFloral(upPng, minLum, maxLum) {
  const lumSpan = maxLum - minLum;
  const inkThreshold = minLum + lumSpan * 0.30;
  const highlightThreshold = minLum + lumSpan * 0.70;

  // Find dominant body tone and ink tone
  const inkMask = new PNG({ width: upPng.width, height: upPng.height });
  const bodyMask = new PNG({ width: upPng.width, height: upPng.height });
  const highMask = new PNG({ width: upPng.width, height: upPng.height });

  inkMask.data.fill(255);
  bodyMask.data.fill(255);
  highMask.data.fill(255);

  let bodyColor = [210, 195, 255];
  let inkColor = [80, 60, 100];
  let highColor = [240, 245, 255];

  for (let y = 0; y < upPng.height; y++) {
    for (let x = 0; x < upPng.width; x++) {
      const idx = (upPng.width * y + x) << 2;
      const a = upPng.data[idx + 3];
      if (a > 35) {
        const r = upPng.data[idx];
        const g = upPng.data[idx + 1];
        const b = upPng.data[idx + 2];
        const lum = getLuminance(r, g, b);

        // All visible pixels belong to the foundational body
        bodyMask.data[idx] = 0;
        bodyMask.data[idx + 1] = 0;
        bodyMask.data[idx + 2] = 0;
        bodyMask.data[idx + 3] = 255;

        if (lum <= inkThreshold) {
          inkMask.data[idx] = 0;
          inkMask.data[idx + 1] = 0;
          inkMask.data[idx + 2] = 0;
          inkMask.data[idx + 3] = 255;
          inkColor = [r, g, b];
        } else if (lum >= highlightThreshold) {
          highMask.data[idx] = 0;
          highMask.data[idx + 1] = 0;
          highMask.data[idx + 2] = 0;
          highMask.data[idx + 3] = 255;
          highColor = [r, g, b];
        } else {
          bodyColor = [r, g, b];
        }
      }
    }
  }

  const hexBody = rgbToHex(bodyColor[0], bodyColor[1], bodyColor[2]);
  const hexInk = rgbToHex(inkColor[0], inkColor[1], inkColor[2]);
  const hexHigh = rgbToHex(highColor[0], highColor[1], highColor[2]);

  // Clean, noise-free tracing with proper turdSize
  const [resBody, resHigh, resInk] = await Promise.all([
    traceMaskBuffer(bodyMask, hexBody, 0.25, 10), // Smooth, broad body
    traceMaskBuffer(highMask, hexHigh, 0.25, 8),  // Smooth highlight petals
    traceMaskBuffer(inkMask, hexInk, 0.18, 5),    // Crisp stamen & ink hatching
  ]);

  let pathsHtml = "";
  if (resBody) {
    pathsHtml += `  <path d="${resBody.d}" fill="${hexBody}" stroke="${hexBody}" stroke-width="0.6" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }
  if (resHigh) {
    pathsHtml += `  <path d="${resHigh.d}" fill="${hexHigh}" stroke="${hexHigh}" stroke-width="0.6" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }
  if (resInk) {
    pathsHtml += `  <path d="${resInk.d}" fill="${hexInk}" stroke="${hexInk}" stroke-width="0.4" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}" width="100%" height="100%">
${pathsHtml}
</svg>
`;
}

// 7. Profiler C: Cumulative Stacking for Rich Watercolor & Botanicals
async function traceCumulativeFloral(upPng, visiblePixels, filename, minAlphaThreshold = 25) {
  // Apply edge-preserving bilateral pre-smoothing to eliminate isoline banding
  const smoothPng = applyBilateralSmoothing(upPng, minAlphaThreshold);

  // K-means clustering in CIELAB space: 5 to 7 rich, perceptually distinct layers
  const k = Math.min(7, Math.max(5, Math.floor(Math.sqrt(visiblePixels.length) / 50)));
  const centroids = kMeansCielab(visiblePixels, k, 6);

  // Sort centroids: Darkest foundation first -> midtones -> bright highlights
  centroids.sort((c1, c2) => getLuminance(c1[0], c1[1], c1[2]) - getLuminance(c2[0], c2[1], c2[2]));
  const centroidsLab = centroids.map((c) => rgb2lab(c[0], c[1], c[2]));

  // Layer 0: FOUNDATION SILHOUETTE (covers 100% of visible pixels)
  // This completely eliminates any see-through cracks or seam gaps!
  const foundationMask = new PNG({ width: smoothPng.width, height: smoothPng.height });
  foundationMask.data.fill(255);

  const upperMasks = centroids.slice(1).map(() => new PNG({ width: smoothPng.width, height: smoothPng.height }));
  for (const m of upperMasks) m.data.fill(255);

  for (let y = 0; y < smoothPng.height; y++) {
    for (let x = 0; x < smoothPng.width; x++) {
      const idx = (smoothPng.width * y + x) << 2;
      const a = smoothPng.data[idx + 3];
      if (a >= minAlphaThreshold) {
        // Mark foundation
        foundationMask.data[idx] = 0;
        foundationMask.data[idx + 1] = 0;
        foundationMask.data[idx + 2] = 0;
        foundationMask.data[idx + 3] = 255;

        const r = smoothPng.data[idx];
        const g = smoothPng.data[idx + 1];
        const b = smoothPng.data[idx + 2];
        const pLab = rgb2lab(r, g, b);

        let bestDist = Infinity;
        let bestC = 0;
        for (let c = 0; c < centroidsLab.length; c++) {
          const d = deltaE(pLab, centroidsLab[c]);
          if (d < bestDist) {
            bestDist = d;
            bestC = c;
          }
        }

        // Over-stamp upper layers on top of foundation
        if (bestC > 0) {
          const uIdx = bestC - 1;
          upperMasks[uIdx].data[idx] = 0;
          upperMasks[uIdx].data[idx + 1] = 0;
          upperMasks[uIdx].data[idx + 2] = 0;
          upperMasks[uIdx].data[idx + 3] = 255;
        }
      }
    }
  }

  const baseHex = rgbToHex(centroids[0][0], centroids[0][1], centroids[0][2]);

  // Trace foundation with high fidelity (turdSize: 6 to prevent tiny noise)
  const foundationRes = await traceMaskBuffer(foundationMask, baseHex, 0.25, 6);

  // Trace upper layers
  const upperPromises = upperMasks.map((mask, i) => {
    const c = centroids[i + 1];
    const hex = rgbToHex(c[0], c[1], c[2]);
    return traceMaskBuffer(mask, hex, 0.25, 7);
  });

  const upperLayers = (await Promise.all(upperPromises)).filter(Boolean);

  let pathsHtml = "";
  if (foundationRes) {
    pathsHtml += `  <path d="${foundationRes.d}" fill="${baseHex}" stroke="${baseHex}" stroke-width="0.6" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }
  for (const l of upperLayers) {
    pathsHtml += `  <path d="${l.d}" fill="${l.color}" stroke="${l.color}" stroke-width="0.6" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${smoothPng.width} ${smoothPng.height}" width="100%" height="100%">
${pathsHtml}
</svg>
`;
}

// 8. Profiler D: Single-Pass Monochrome Line Art / Dividers
async function traceLineArtV3(origPng, defaultColor) {
  const scale = origPng.width < 400 ? 1.5 : 1.2;
  const upPng = upscaleBilinear(origPng, scale);
  const mask = new PNG({ width: upPng.width, height: upPng.height });
  mask.data.fill(255);

  let maxA = 0;
  for (let i = 0; i < upPng.data.length; i += 4) {
    if (upPng.data[i + 3] > maxA) maxA = upPng.data[i + 3];
  }
  const minA = Math.min(35, Math.floor(maxA * 0.3));

  for (let y = 0; y < upPng.height; y++) {
    for (let x = 0; x < upPng.width; x++) {
      const idx = (upPng.width * y + x) << 2;
      const a = upPng.data[idx + 3];
      if (a >= minA) {
        mask.data[idx] = 0;
        mask.data[idx + 1] = 0;
        mask.data[idx + 2] = 0;
        mask.data[idx + 3] = 255;
      }
    }
  }

  const res = await traceMaskBuffer(mask, defaultColor, 0.18, 3);
  if (!res) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${origPng.width} ${origPng.height}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}" width="100%" height="100%">
  <path d="${res.d}" fill="currentColor" style="color: var(--ornament-color, ${defaultColor})" stroke="currentColor" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>
</svg>
`;
}

// 9. Main V3 Universal Dispatcher
async function vectorizeV3(origPng, filename = "") {
  const maxDim = Math.max(origPng.width, origPng.height);
  let scale = 1.2;
  if (maxDim < 350) scale = 2.0;
  else if (maxDim < 700) scale = 1.5;
  else scale = 1.2;

  const upPng = upscaleBilinear(origPng, scale);

  // Detect max alpha dynamically for faint watermarks or low-opacity textures
  let maxAlpha = 0;
  for (let i = 0; i < upPng.data.length; i += 16) {
    if (upPng.data[i + 3] > maxAlpha) maxAlpha = upPng.data[i + 3];
  }
  const minAlphaThreshold = Math.min(30, Math.max(5, Math.floor(maxAlpha * 0.25)));

  // Sample visible pixels
  const visiblePixels = [];
  const lums = [];
  for (let y = 0; y < upPng.height; y++) {
    for (let x = 0; x < upPng.width; x++) {
      const idx = (upPng.width * y + x) << 2;
      const a = upPng.data[idx + 3];
      if (a >= minAlphaThreshold) {
        const r = upPng.data[idx];
        const g = upPng.data[idx + 1];
        const b = upPng.data[idx + 2];
        visiblePixels.push([r, g, b]);
        lums.push(getLuminance(r, g, b));
      }
    }
  }

  if (visiblePixels.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${origPng.width} ${origPng.height}"/>`;
  }

  lums.sort((a, b) => a - b);
  const minLum = lums[0];
  const maxLum = lums[lums.length - 1];
  const lumSpan = maxLum - minLum;

  // Calculate DeltaE color spread
  const pSample = [];
  const step = Math.max(1, Math.floor(visiblePixels.length / 300));
  for (let i = 0; i < visiblePixels.length; i += step) pSample.push(visiblePixels[i]);
  const labs = pSample.map((p) => rgb2lab(p[0], p[1], p[2]));

  let maxDeltaE = 0;
  const cRef = labs[0];
  for (let i = 1; i < labs.length; i++) {
    const d = deltaE(cRef, labs[i]);
    if (d > maxDeltaE) maxDeltaE = d;
  }

  // Profile selection
  const isDivider =
    filename.includes("divider") ||
    filename.includes("frame") ||
    filename.includes("stamp") ||
    filename.includes("wave") ||
    filename.includes("line") ||
    filename.includes("border");

  // Profile A: Subtle Glow / Single Geometry (e.g. vector-2.png)
  if (!isDivider && maxDeltaE < 18 && (filename.includes("vector") || filename.includes("star") || visiblePixels.length < 5000)) {
    const domHex = rgbToHex(visiblePixels[0][0], visiblePixels[0][1], visiblePixels[0][2]);
    return traceSimpleGlow(upPng, domHex);
  }

  // Profile D: Monochrome Line Art
  if (isDivider || (maxDeltaE < 12 && !filename.includes("flower") && !filename.includes("leaf"))) {
    const domHex = rgbToHex(visiblePixels[0][0], visiblePixels[0][1], visiblePixels[0][2]);
    return traceLineArtV3(origPng, domHex);
  }

  // Profile B: Sketched Florals with Ink/Stamen (e.g. rsvp-flower-3.png, bg-bride-flower-3.png)
  const isSketch =
    filename.includes("flower-3") ||
    filename.includes("bg-bride-flower") ||
    (filename.includes("rsvp-flower") && lumSpan > 25);

  if (isSketch) {
    return traceSketchedFloral(upPng, minLum, maxLum);
  }

  // Profile C: Rich Watercolor & Botanical Florals (Default for florals/foliage)
  return traceCumulativeFloral(upPng, visiblePixels, filename, minAlphaThreshold);
}

module.exports = {
  vectorizeV3,
  rgb2lab,
  deltaE,
  rgbToHex,
  getLuminance,
  upscaleBilinear,
  applyBilateralSmoothing,
};
