const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const potrace = require('potrace');

// Perceptual Lab utilities
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

function applyBilateralSmoothing(png, minAlphaThreshold = 25) {
  const w = png.width;
  const h = png.height;
  const outPng = new PNG({ width: w, height: h });
  outPng.data.set(png.data);

  const sigmaR = 20;
  const sigmaRSq2 = 2 * sigmaR * sigmaR;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const centerIdx = (w * y + x) << 2;
      if (png.data[centerIdx + 3] < minAlphaThreshold) continue;

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

function kMeansCielab(pixels, k = 5, iterations = 6) {
  if (pixels.length === 0) return [];
  k = Math.min(k, pixels.length);

  const sampleSize = Math.min(pixels.length, 5000);
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
    for (let s = 0; s < 25; s++) {
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

function traceMaskBuffer(maskPng, color, optTolerance = 0.2, turdSize = 5) {
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

// ============================================================================
// V3.5 ENHANCED ARCHETYPES
// ============================================================================

// 1. Hollow Filigree Corner Lace (event-bottom-right)
async function traceHollowFiligree(origPng) {
  const upPng = upscaleBilinear(origPng, 2.0);
  
  // Layer A: soft icy outer aura (alpha 30..80)
  const auraMask = new PNG({ width: upPng.width, height: upPng.height });
  auraMask.data.fill(255);
  
  // Layer B: core filigree lace (alpha >= 75) - hollow loops preserved!
  const coreMask = new PNG({ width: upPng.width, height: upPng.height });
  coreMask.data.fill(255);

  // Layer C: bright embroidery highlight (alpha >= 160)
  const highMask = new PNG({ width: upPng.width, height: upPng.height });
  highMask.data.fill(255);

  for (let i = 0; i < upPng.data.length; i += 4) {
    const a = upPng.data[i + 3];
    if (a >= 30) {
      auraMask.data[i] = 0;
      auraMask.data[i + 1] = 0;
      auraMask.data[i + 2] = 0;
      auraMask.data[i + 3] = 255;
    }
    if (a >= 75) {
      coreMask.data[i] = 0;
      coreMask.data[i + 1] = 0;
      coreMask.data[i + 2] = 0;
      coreMask.data[i + 3] = 255;
    }
    if (a >= 160) {
      highMask.data[i] = 0;
      highMask.data[i + 1] = 0;
      highMask.data[i + 2] = 0;
      highMask.data[i + 3] = 255;
    }
  }

  const [resAura, resCore, resHigh] = await Promise.all([
    traceMaskBuffer(auraMask, "#bcd5fc", 0.25, 8),
    traceMaskBuffer(coreMask, "#eaf1fd", 0.18, 4),
    traceMaskBuffer(highMask, "#ffffff", 0.18, 4),
  ]);

  let paths = "";
  if (resAura) {
    paths += `  <path d="${resAura.d}" fill="#bcd5fc" fill-opacity="0.30" stroke="#bcd5fc" stroke-opacity="0.30" stroke-width="0.5" fill-rule="evenodd"/>\n`;
  }
  if (resCore) {
    paths += `  <path d="${resCore.d}" fill="#eaf1fd" stroke="#eaf1fd" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }
  if (resHigh) {
    paths += `  <path d="${resHigh.d}" fill="#ffffff" stroke="#ffffff" stroke-width="0.4" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}" width="100%" height="100%">\n${paths}</svg>\n`;
}

// 2. Sketched Botanical Line-Art (1754403915_kdo56-flower-1)
async function traceSketchedLineArt(origPng) {
  const upPng = upscaleBilinear(origPng, 1.5);
  
  const copperMask = new PNG({ width: upPng.width, height: upPng.height });
  const copperHighMask = new PNG({ width: upPng.width, height: upPng.height });
  const charcoalDarkMask = new PNG({ width: upPng.width, height: upPng.height });
  const charcoalLightMask = new PNG({ width: upPng.width, height: upPng.height });

  copperMask.data.fill(255);
  copperHighMask.data.fill(255);
  charcoalDarkMask.data.fill(255);
  charcoalLightMask.data.fill(255);

  let copperR = 0, copperG = 0, copperB = 0, copperCount = 0;

  for (let i = 0; i < upPng.data.length; i += 4) {
    const a = upPng.data[i + 3];
    if (a < 35) continue;

    const r = upPng.data[i];
    const g = upPng.data[i + 1];
    const b = upPng.data[i + 2];
    const lum = getLuminance(r, g, b);

    const isCopper = (r - b > 35 && r > 120);

    if (isCopper) {
      copperR += r; copperG += g; copperB += b; copperCount++;
      copperMask.data[i] = 0;
      copperMask.data[i + 1] = 0;
      copperMask.data[i + 2] = 0;
      copperMask.data[i + 3] = 255;

      if (lum > 170) {
        copperHighMask.data[i] = 0;
        copperHighMask.data[i + 1] = 0;
        copperHighMask.data[i + 2] = 0;
        copperHighMask.data[i + 3] = 255;
      }
    } else {
      if (lum <= 70) {
        charcoalDarkMask.data[i] = 0;
        charcoalDarkMask.data[i + 1] = 0;
        charcoalDarkMask.data[i + 2] = 0;
        charcoalDarkMask.data[i + 3] = 255;
      } else {
        charcoalLightMask.data[i] = 0;
        charcoalLightMask.data[i + 1] = 0;
        charcoalLightMask.data[i + 2] = 0;
        charcoalLightMask.data[i + 3] = 255;
      }
    }
  }

  const avgCopper = copperCount > 0 ? rgbToHex(copperR / copperCount, copperG / copperCount, copperB / copperCount) : "#df852e";
  const [resCharDark, resCharLight, resCopBase, resCopHigh] = await Promise.all([
    traceMaskBuffer(charcoalDarkMask, "#222222", 0.18, 4),
    traceMaskBuffer(charcoalLightMask, "#666666", 0.18, 4),
    traceMaskBuffer(copperMask, avgCopper, 0.18, 4),
    traceMaskBuffer(copperHighMask, "#f4c688", 0.18, 4),
  ]);

  let paths = "";
  if (resCharDark) {
    paths += `  <path d="${resCharDark.d}" fill="#222222" stroke="#222222" stroke-width="0.4" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }
  if (resCharLight) {
    paths += `  <path d="${resCharLight.d}" fill="#777777" stroke="#777777" stroke-width="0.3" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }
  if (resCopBase) {
    paths += `  <path d="${resCopBase.d}" fill="${avgCopper}" stroke="${avgCopper}" stroke-width="0.4" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }
  if (resCopHigh) {
    paths += `  <path d="${resCopHigh.d}" fill="#f4c688" stroke="#f4c688" stroke-width="0.3" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}" width="100%" height="100%">\n${paths}</svg>\n`;
}

// 3. Small Botanical Leaf Sprig (bride-flower-3)
async function traceSmallBotanicalLeaf(origPng) {
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

  // 4 natural botanical sage tones
  const centroids = kMeansCielab(pixels, 4, 8);
  centroids.sort((a, b) => getLuminance(a[0], a[1], a[2]) - getLuminance(b[0], b[1], b[2]));
  const centroidsLab = centroids.map((c) => rgb2lab(c[0], c[1], c[2]));

  // Base foundation
  const baseMask = new PNG({ width: smoothPng.width, height: smoothPng.height });
  baseMask.data.fill(255);
  const midMask = new PNG({ width: smoothPng.width, height: smoothPng.height });
  midMask.data.fill(255);
  const lightMask = new PNG({ width: smoothPng.width, height: smoothPng.height });
  lightMask.data.fill(255);
  const highMask = new PNG({ width: smoothPng.width, height: smoothPng.height });
  highMask.data.fill(255);

  for (let y = 0; y < smoothPng.height; y++) {
    for (let x = 0; x < smoothPng.width; x++) {
      const idx = (smoothPng.width * y + x) << 2;
      if (smoothPng.data[idx + 3] >= 25) {
        baseMask.data[idx] = 0;
        baseMask.data[idx + 1] = 0;
        baseMask.data[idx + 2] = 0;
        baseMask.data[idx + 3] = 255;

        const pLab = rgb2lab(smoothPng.data[idx], smoothPng.data[idx + 1], smoothPng.data[idx + 2]);
        let bestDist = Infinity, bestC = 0;
        for (let c = 0; c < centroidsLab.length; c++) {
          const d = deltaE(pLab, centroidsLab[c]);
          if (d < bestDist) { bestDist = d; bestC = c; }
        }

        if (bestC === 1) {
          midMask.data[idx] = 0; midMask.data[idx + 1] = 0; midMask.data[idx + 2] = 0; midMask.data[idx + 3] = 255;
        } else if (bestC === 2) {
          lightMask.data[idx] = 0; lightMask.data[idx + 1] = 0; lightMask.data[idx + 2] = 0; lightMask.data[idx + 3] = 255;
        } else if (bestC === 3) {
          highMask.data[idx] = 0; highMask.data[idx + 1] = 0; highMask.data[idx + 2] = 0; highMask.data[idx + 3] = 255;
        }
      }
    }
  }

  const hex0 = rgbToHex(centroids[0][0], centroids[0][1], centroids[0][2]);
  const hex1 = rgbToHex(centroids[1][0], centroids[1][1], centroids[1][2]);
  const hex2 = rgbToHex(centroids[2][0], centroids[2][1], centroids[2][2]);
  const hex3 = rgbToHex(centroids[3][0], centroids[3][1], centroids[3][2]);

  const [res0, res1, res2, res3] = await Promise.all([
    traceMaskBuffer(baseMask, hex0, 0.22, 6),
    traceMaskBuffer(midMask, hex1, 0.22, 6),
    traceMaskBuffer(lightMask, hex2, 0.22, 6),
    traceMaskBuffer(highMask, hex3, 0.22, 5),
  ]);

  let paths = "";
  if (res0) paths += `  <path d="${res0.d}" fill="${hex0}" stroke="${hex0}" stroke-width="0.6" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (res1) paths += `  <path d="${res1.d}" fill="${hex1}" stroke="${hex1}" stroke-width="0.6" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (res2) paths += `  <path d="${res2.d}" fill="${hex2}" stroke="${hex2}" stroke-width="0.6" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (res3) paths += `  <path d="${res3.d}" fill="${hex3}" stroke="${hex3}" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${smoothPng.width} ${smoothPng.height}" width="100%" height="100%">\n${paths}</svg>\n`;
}

// 4. Domain-Partitioned Botanical Bouquet (1754648453_kdo54-bg-3 & bg-flower-3)
async function traceDomainPartitionedBouquet(origPng) {
  const upPng = upscaleBilinear(origPng, 1.5);
  const smoothPng = applyBilateralSmoothing(upPng, 25);

  const foliagePixels = [];
  const floralPixels = [];
  const deepShadowPixels = [];

  for (let y = 0; y < smoothPng.height; y++) {
    for (let x = 0; x < smoothPng.width; x++) {
      const idx = (smoothPng.width * y + x) << 2;
      if (smoothPng.data[idx + 3] >= 25) {
        const r = smoothPng.data[idx];
        const g = smoothPng.data[idx + 1];
        const b = smoothPng.data[idx + 2];
        const lum = getLuminance(r, g, b);

        if (lum < 45) {
          deepShadowPixels.push([r, g, b]);
        } else if (g >= r * 0.90 && g > b + 12) {
          // Foliage / leaf
          foliagePixels.push([r, g, b]);
        } else {
          // Floral / Petal / Ribbon
          floralPixels.push([r, g, b]);
        }
      }
    }
  }

  console.log(`Bouquet partitioning -> Foliage: ${foliagePixels.length}, Floral/Ribbon: ${floralPixels.length}, DeepShadow: ${deepShadowPixels.length}`);

  // Cluster foliage independently (3 centroids)
  const foliageCentroids = kMeansCielab(foliagePixels, 3, 6);
  foliageCentroids.sort((a, b) => getLuminance(a[0], a[1], a[2]) - getLuminance(b[0], b[1], b[2]));
  const foliageLab = foliageCentroids.map(c => rgb2lab(c[0], c[1], c[2]));

  // Cluster floral/petal independently (4 centroids: crease, shadow, body, highlight)
  const floralCentroids = kMeansCielab(floralPixels, 4, 6);
  floralCentroids.sort((a, b) => getLuminance(a[0], a[1], a[2]) - getLuminance(b[0], b[1], b[2]));
  const floralLab = floralCentroids.map(c => rgb2lab(c[0], c[1], c[2]));

  // Create Foundation Layer (covers all visible pixels with deepest shadow/base)
  const foundationMask = new PNG({ width: smoothPng.width, height: smoothPng.height });
  foundationMask.data.fill(255);

  // Masks for foliage
  const foliageMasks = foliageCentroids.map(() => {
    const m = new PNG({ width: smoothPng.width, height: smoothPng.height });
    m.data.fill(255);
    return m;
  });

  // Masks for floral/ribbon
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

        const isFoliage = (g >= r * 0.90 && g > b + 12);
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

  // Base foundation color (deep foliage or deep shadow)
  const baseHex = foliageCentroids.length > 0 ? rgbToHex(foliageCentroids[0][0], foliageCentroids[0][1], foliageCentroids[0][2]) : "#3a4428";
  const resFoundation = await traceMaskBuffer(foundationMask, baseHex, 0.25, 6);

  const foliagePromises = foliageMasks.map((m, i) => {
    const hex = rgbToHex(foliageCentroids[i][0], foliageCentroids[i][1], foliageCentroids[i][2]);
    return traceMaskBuffer(m, hex, 0.25, 7);
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
    paths += `  <!-- Foundation Underlay -->\n  <path d="${resFoundation.d}" fill="${baseHex}" stroke="${baseHex}" stroke-width="0.6" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }
  for (const f of foliageResults) {
    if (f) paths += `  <!-- Foliage Layer -->\n  <path d="${f.d}" fill="${f.color}" stroke="${f.color}" stroke-width="0.6" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }
  for (const fl of floralResults) {
    if (fl) paths += `  <!-- Floral / Petal Layer -->\n  <path d="${fl.d}" fill="${fl.color}" stroke="${fl.color}" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${smoothPng.width} ${smoothPng.height}" width="100%" height="100%">\n${paths}</svg>\n`;
}

async function runAll() {
  console.log('1. Processing event-bottom-right...');
  const b1 = fs.readFileSync('references/kadio-assets/harvested/event-bottom-right.png');
  const s1 = await traceHollowFiligree(PNG.sync.read(b1));
  fs.writeFileSync('references/kadio-assets/harvested/svg/proto_event-bottom-right.svg', s1);

  console.log('2. Processing 1754403915_kdo56-flower-1...');
  const b2 = fs.readFileSync('references/kadio-assets/harvested/1754403915_kdo56-flower-1.png');
  const s2 = await traceSketchedLineArt(PNG.sync.read(b2));
  fs.writeFileSync('references/kadio-assets/harvested/svg/proto_1754403915_kdo56-flower-1.svg', s2);

  console.log('3. Processing bride-flower-3...');
  const b3 = fs.readFileSync('references/kadio-assets/harvested/bride-flower-3.png');
  const s3 = await traceSmallBotanicalLeaf(PNG.sync.read(b3));
  fs.writeFileSync('references/kadio-assets/harvested/svg/proto_bride-flower-3.svg', s3);

  console.log('4. Processing 1754648453_kdo54-bg-3...');
  const b4 = fs.readFileSync('references/kadio-assets/harvested/1754648453_kdo54-bg-3.png');
  const s4 = await traceDomainPartitionedBouquet(PNG.sync.read(b4));
  fs.writeFileSync('references/kadio-assets/harvested/svg/proto_1754648453_kdo54-bg-3.svg', s4);

  console.log('5. Processing bg-flower-3...');
  const b5 = fs.readFileSync('references/kadio-assets/harvested/bg-flower-3.png');
  const s5 = await traceDomainPartitionedBouquet(PNG.sync.read(b5));
  fs.writeFileSync('references/kadio-assets/harvested/svg/proto_bg-flower-3.svg', s5);

  console.log('ALL 5 PROTOTYPES GENERATED SUCCESSFULLY!');
}

runAll();
