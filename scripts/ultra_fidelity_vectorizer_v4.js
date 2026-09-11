const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const potrace = require("potrace");

// ============================================================================
// ULTRA-FIDELITY SEAMLESS VECTORIZER V4 CORE ENGINE
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

// 2. Adaptive Bilinear Upscaler
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
function applyBilateralSmoothing(png, minAlphaThreshold = 25) {
  const w = png.width;
  const h = png.height;
  const outPng = new PNG({ width: w, height: h });
  outPng.data.set(png.data);

  const sigmaR = 25;
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

      let wSum = 0, rSum = 0, gSum = 0, bSum = 0;

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
function kMeansCielab(pixels, k = 6, iterations = 6) {
  if (pixels.length === 0) return [];
  k = Math.min(k, pixels.length);

  const sampleSize = Math.min(pixels.length, 6000);
  const sample = [];
  const step = Math.max(1, Math.floor(pixels.length / sampleSize));
  for (let i = 0; i < pixels.length && sample.length < sampleSize; i += step) {
    sample.push(pixels[i]);
  }

  const sampleLab = sample.map((p) => rgb2lab(p[0], p[1], p[2]));
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

function traceMaskBuffer(maskPng, color, optTolerance = 0.22, turdSize = 5) {
  return new Promise((resolve) => {
    const buf = PNG.sync.write(maskPng);
    potrace.trace(
      buf,
      { threshold: 128, optTolerance, turdSize, color },
      (err, svg) => {
        if (err || !svg) return resolve(null);
        const match = svg.match(/d="([^"]+)"/);
        resolve(match && match[1] ? { color, d: match[1] } : null);
      }
    );
  });
}

// 5. Archetype 1: Pure Delicate Filigree & Lace (100% Hollow Negative Space)
async function traceHollowFiligree(origPng) {
  const upPng = upscaleBilinear(origPng, 2.5);

  const coreMask = new PNG({ width: upPng.width, height: upPng.height });
  const highMask = new PNG({ width: upPng.width, height: upPng.height });
  coreMask.data.fill(255);
  highMask.data.fill(255);

  for (let i = 0; i < upPng.data.length; i += 4) {
    const a = upPng.data[i + 3];
    if (a >= 80) {
      coreMask.data[i] = 0; coreMask.data[i + 1] = 0; coreMask.data[i + 2] = 0; coreMask.data[i + 3] = 255;
    }
    if (a >= 165) {
      highMask.data[i] = 0; highMask.data[i + 1] = 0; highMask.data[i + 2] = 0; highMask.data[i + 3] = 255;
    }
  }

  const [resCore, resHigh] = await Promise.all([
    traceMaskBuffer(coreMask, "#eef3fb", 0.18, 3),
    traceMaskBuffer(highMask, "#ffffff", 0.18, 3),
  ]);

  let paths = "";
  if (resCore) {
    paths += `  <path d="${resCore.d}" fill="#eef3fb" stroke="#eef3fb" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }
  if (resHigh) {
    paths += `  <path d="${resHigh.d}" fill="#ffffff" stroke="#ffffff" stroke-width="0.4" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}" width="100%" height="100%">\n${paths}</svg>\n`;
}

// 6. Archetype 2: Domain-Partitioned Botanical Bouquet (Foliage + Florals)
async function traceDomainPartitionedBouquet(upPng) {
  const smoothPng = applyBilateralSmoothing(upPng, 25);

  const foliagePixels = [];
  const floralPixels = [];

  for (let y = 0; y < smoothPng.height; y++) {
    for (let x = 0; x < smoothPng.width; x++) {
      const idx = (smoothPng.width * y + x) << 2;
      if (smoothPng.data[idx + 3] >= 25) {
        const r = smoothPng.data[idx];
        const g = smoothPng.data[idx + 1];
        const b = smoothPng.data[idx + 2];

        // Green foliage saturation
        if ((g > r + 3 && g > b + 10) || (r < 170 && g > b + 10)) {
          foliagePixels.push([r, g, b]);
        } else {
          floralPixels.push([r, g, b]);
        }
      }
    }
  }

  const foliageCentroids = kMeansCielab(foliagePixels, 3, 6);
  foliageCentroids.sort((a, b) => getLuminance(a[0], a[1], a[2]) - getLuminance(b[0], b[1], b[2]));
  const foliageLab = foliageCentroids.map(c => rgb2lab(c[0], c[1], c[2]));

  const floralCentroids = kMeansCielab(floralPixels, 4, 6);
  floralCentroids.sort((a, b) => getLuminance(a[0], a[1], a[2]) - getLuminance(b[0], b[1], b[2]));
  const floralLab = floralCentroids.map(c => rgb2lab(c[0], c[1], c[2]));

  const foundationMask = new PNG({ width: smoothPng.width, height: smoothPng.height });
  foundationMask.data.fill(255);

  const foliageMasks = foliageCentroids.map(() => {
    const m = new PNG({ width: smoothPng.width, height: smoothPng.height });
    m.data.fill(255);
    return m;
  });

  const floralMasks = floralCentroids.map(() => {
    const m = new PNG({ width: smoothPng.width, height: smoothPng.height });
    m.data.fill(255);
    return m;
  });

  for (let y = 0; y < smoothPng.height; y++) {
    for (let x = 0; x < smoothPng.width; x++) {
      const idx = (smoothPng.width * y + x) << 2;
      if (smoothPng.data[idx + 3] >= 25) {
        foundationMask.data[idx] = 0;
        foundationMask.data[idx + 1] = 0;
        foundationMask.data[idx + 2] = 0;
        foundationMask.data[idx + 3] = 255;

        const r = smoothPng.data[idx];
        const g = smoothPng.data[idx + 1];
        const b = smoothPng.data[idx + 2];
        const pLab = rgb2lab(r, g, b);

        const isFoliage = (g > r + 3 && g > b + 10) || (r < 170 && g > b + 10);
        if (isFoliage && foliageLab.length > 0) {
          let bestDist = Infinity, bestC = 0;
          for (let c = 0; c < foliageLab.length; c++) {
            const d = deltaE(pLab, foliageLab[c]);
            if (d < bestDist) { bestDist = d; bestC = c; }
          }
          foliageMasks[bestC].data[idx] = 0;
          foliageMasks[bestC].data[idx + 1] = 0;
          foliageMasks[bestC].data[idx + 2] = 0;
          foliageMasks[bestC].data[idx + 3] = 255;
        } else if (floralLab.length > 0) {
          let bestDist = Infinity, bestC = 0;
          for (let c = 0; c < floralLab.length; c++) {
            const d = deltaE(pLab, floralLab[c]);
            if (d < bestDist) { bestDist = d; bestC = c; }
          }
          floralMasks[bestC].data[idx] = 0;
          floralMasks[bestC].data[idx + 1] = 0;
          floralMasks[bestC].data[idx + 2] = 0;
          floralMasks[bestC].data[idx + 3] = 255;
        }
      }
    }
  }

  const baseHex = foliageCentroids.length > 0 ? rgbToHex(foliageCentroids[0][0], foliageCentroids[0][1], foliageCentroids[0][2]) : "#3a4428";
  const resFoundation = await traceMaskBuffer(foundationMask, baseHex, 0.25, 6);

  const foliagePromises = foliageMasks.map((m, i) => {
    const hex = rgbToHex(foliageCentroids[i][0], foliageCentroids[i][1], foliageCentroids[i][2]);
    return traceMaskBuffer(m, hex, 0.22, 6);
  });
  const floralPromises = floralMasks.map((m, i) => {
    const hex = rgbToHex(floralCentroids[i][0], floralCentroids[i][1], floralCentroids[i][2]);
    return traceMaskBuffer(m, hex, 0.22, 6);
  });

  const [foliageResults, floralResults] = await Promise.all([
    Promise.all(foliagePromises),
    Promise.all(floralPromises)
  ]);

  let paths = "";
  if (resFoundation) {
    paths += `  <path d="${resFoundation.d}" fill="${baseHex}" stroke="${baseHex}" stroke-width="0.6" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }
  for (const f of foliageResults) {
    if (f) paths += `  <path d="${f.d}" fill="${f.color}" stroke="${f.color}" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }
  for (const fl of floralResults) {
    if (fl) paths += `  <path d="${fl.d}" fill="${fl.color}" stroke="${fl.color}" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${smoothPng.width} ${smoothPng.height}" width="100%" height="100%">\n${paths}</svg>\n`;
}

// 7. Archetype 3: Smooth Multi-Layer Botanical Watercolor (Leaves/Foliage)
async function traceMultiLayerBotanical(origPng) {
  const upPng = upscaleBilinear(origPng, 2.5);
  const smoothPng = applyBilateralSmoothing(upPng, 25);

  const pixels = [];
  for (let y = 0; y < smoothPng.height; y++) {
    for (let x = 0; x < smoothPng.width; x++) {
      const idx = (smoothPng.width * y + x) << 2;
      if (smoothPng.data[idx + 3] >= 25) {
        pixels.push([smoothPng.data[idx], smoothPng.data[idx + 1], smoothPng.data[idx + 2]]);
      }
    }
  }

  const k = Math.min(6, Math.max(4, Math.floor(Math.sqrt(pixels.length) / 60)));
  const centroids = kMeansCielab(pixels, k, 6);
  centroids.sort((a, b) => getLuminance(a[0], a[1], a[2]) - getLuminance(b[0], b[1], b[2]));
  const centroidsLab = centroids.map((c) => rgb2lab(c[0], c[1], c[2]));

  const baseMask = new PNG({ width: smoothPng.width, height: smoothPng.height });
  baseMask.data.fill(255);

  const upperMasks = centroids.slice(1).map(() => {
    const m = new PNG({ width: smoothPng.width, height: smoothPng.height });
    m.data.fill(255);
    return m;
  });

  for (let y = 0; y < smoothPng.height; y++) {
    for (let x = 0; x < smoothPng.width; x++) {
      const idx = (smoothPng.width * y + x) << 2;
      if (smoothPng.data[idx + 3] >= 25) {
        baseMask.data[idx] = 0; baseMask.data[idx + 1] = 0; baseMask.data[idx + 2] = 0; baseMask.data[idx + 3] = 255;

        const pLab = rgb2lab(smoothPng.data[idx], smoothPng.data[idx + 1], smoothPng.data[idx + 2]);
        let bestDist = Infinity, bestC = 0;
        for (let c = 0; c < centroidsLab.length; c++) {
          const d = deltaE(pLab, centroidsLab[c]);
          if (d < bestDist) { bestDist = d; bestC = c; }
        }

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
  const baseRes = await traceMaskBuffer(baseMask, baseHex, 0.22, 6);

  const upperPromises = upperMasks.map((m, i) => {
    const hex = rgbToHex(centroids[i + 1][0], centroids[i + 1][1], centroids[i + 1][2]);
    return traceMaskBuffer(m, hex, 0.22, 6);
  });

  const upperResults = await Promise.all(upperPromises);

  let paths = "";
  if (baseRes) {
    paths += `  <path d="${baseRes.d}" fill="${baseHex}" stroke="${baseHex}" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }
  for (const u of upperResults) {
    if (u) {
      paths += `  <path d="${u.d}" fill="${u.color}" stroke="${u.color}" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${smoothPng.width} ${smoothPng.height}" width="100%" height="100%">\n${paths}</svg>\n`;
}

// 8. Archetype 4: Single-Pass Clean Line-Art / Dividers
async function traceLineArtV4(origPng, defaultColor) {
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
        mask.data[idx] = 0; mask.data[idx + 1] = 0; mask.data[idx + 2] = 0; mask.data[idx + 3] = 255;
      }
    }
  }

  const res = await traceMaskBuffer(mask, defaultColor, 0.18, 3);
  if (!res) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${origPng.width} ${origPng.height}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}" width="100%" height="100%">
  <path d="${res.d}" fill="currentColor" style="color: var(--ornament-color, ${defaultColor})" stroke="currentColor" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>
</svg>\n`;
}

// 9. Archetype 5: Simple Geometry Glow (e.g. vector-2.png)
async function traceSimpleGlow(upPng, domHex) {
  const mask = new PNG({ width: upPng.width, height: upPng.height });
  mask.data.fill(255);

  for (let i = 0; i < upPng.data.length; i += 4) {
    if (upPng.data[i + 3] > 35) {
      mask.data[i] = 0; mask.data[i + 1] = 0; mask.data[i + 2] = 0; mask.data[i + 3] = 255;
    }
  }

  const res = await traceMaskBuffer(mask, domHex, 0.2, 4);
  if (!res) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}" width="100%" height="100%">
  <path d="${res.d}" fill="${domHex}" stroke="${domHex}" stroke-width="0.6" stroke-linejoin="round" fill-rule="evenodd"/>
</svg>\n`;
}

// 10. Main V4 Universal Dispatcher
async function vectorizeV4(origPng, filename = "") {
  const maxDim = Math.max(origPng.width, origPng.height);
  let scale = 1.2;
  if (maxDim < 350) scale = 2.0;
  else if (maxDim < 700) scale = 1.5;
  else scale = 1.2;

  const upPng = upscaleBilinear(origPng, scale);

  let maxAlpha = 0;
  for (let i = 0; i < upPng.data.length; i += 16) {
    if (upPng.data[i + 3] > maxAlpha) maxAlpha = upPng.data[i + 3];
  }
  const minAlphaThreshold = Math.min(30, Math.max(5, Math.floor(maxAlpha * 0.25)));

  const visiblePixels = [];
  for (let y = 0; y < upPng.height; y++) {
    for (let x = 0; x < upPng.width; x++) {
      const idx = (upPng.width * y + x) << 2;
      if (upPng.data[idx + 3] >= minAlphaThreshold) {
        visiblePixels.push([upPng.data[idx], upPng.data[idx + 1], upPng.data[idx + 2]]);
      }
    }
  }

  if (visiblePixels.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${origPng.width} ${origPng.height}"/>`;
  }

  const isDivider =
    filename.includes("divider") ||
    filename.includes("stamp") ||
    filename.includes("wave") ||
    filename.includes("line");

  const isFiligreeOrFrame =
    filename.includes("frame") ||
    filename.includes("border") ||
    filename.includes("corner") ||
    filename.includes("top-left") ||
    filename.includes("top-right") ||
    filename.includes("bottom-left") ||
    filename.includes("bottom-right");

  // Subtle Glow (vector-2)
  if (filename.includes("vector") || filename.includes("star")) {
    const domHex = rgbToHex(visiblePixels[0][0], visiblePixels[0][1], visiblePixels[0][2]);
    return traceSimpleGlow(upPng, domHex);
  }

  // Dividers
  if (isDivider) {
    const domHex = rgbToHex(visiblePixels[0][0], visiblePixels[0][1], visiblePixels[0][2]);
    return traceLineArtV4(origPng, domHex);
  }

  // Pure Filigree Lace (100% Hollow Negative Space)
  if (isFiligreeOrFrame) {
    return traceHollowFiligree(origPng);
  }

  // Multi-Chromatic Bouquets (foliage + colored petals)
  let foliageCount = 0;
  let floralCount = 0;
  for (let i = 0; i < visiblePixels.length; i += 20) {
    const [r, g, b] = visiblePixels[i];
    if ((g > r + 3 && g > b + 10) || (r < 170 && g > b + 10)) foliageCount++;
    else floralCount++;
  }

  if (foliageCount > 10 && floralCount > 10) {
    return traceDomainPartitionedBouquet(upPng);
  }

  // Pure Botanical Watercolor Leaves
  return traceMultiLayerBotanical(origPng);
}

module.exports = {
  vectorizeV4,
  rgb2lab,
  deltaE,
  rgbToHex,
  getLuminance,
  upscaleBilinear,
  applyBilateralSmoothing,
};
