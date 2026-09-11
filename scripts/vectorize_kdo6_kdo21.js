const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const potrace = require("potrace");
const { optimize } = require("svgo");

function upscalePng(srcPng, scale = 1.5) {
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

function colorDist(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return 0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db;
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
}

function getLuminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function kMeans(pixels, k, iterations = 8) {
  if (pixels.length === 0) return [];
  k = Math.min(k, pixels.length);
  const step = Math.floor(pixels.length / k);
  let centroids = [];
  for (let i = 0; i < k; i++) {
    centroids.push([...pixels[Math.min(pixels.length - 1, i * step)]]);
  }

  for (let iter = 0; iter < iterations; iter++) {
    const clusters = Array.from({ length: k }, () => []);
    for (const p of pixels) {
      let bestDist = Infinity;
      let bestIdx = 0;
      for (let c = 0; c < k; c++) {
        const d = colorDist(p[0], p[1], p[2], centroids[c][0], centroids[c][1], centroids[c][2]);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = c;
        }
      }
      clusters[bestIdx].push(p);
    }

    for (let c = 0; c < k; c++) {
      if (clusters[c].length > 0) {
        const sumR = clusters[c].reduce((a, b) => a + b[0], 0);
        const sumG = clusters[c].reduce((a, b) => a + b[1], 0);
        const sumB = clusters[c].reduce((a, b) => a + b[2], 0);
        centroids[c] = [
          Math.round(sumR / clusters[c].length),
          Math.round(sumG / clusters[c].length),
          Math.round(sumB / clusters[c].length)
        ];
      }
    }
  }

  return centroids.map(c => ({
    r: c[0],
    g: c[1],
    b: c[2],
    hex: rgbToHex(c[0], c[1], c[2]),
    luminance: getLuminance(c[0], c[1], c[2])
  }));
}

function dilateMask(mask, width, height) {
  const out = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (mask[idx] === 1) {
        out[idx] = 1;
        if (x > 0) out[idx - 1] = 1;
        if (x < width - 1) out[idx + 1] = 1;
        if (y > 0) out[idx - width] = 1;
        if (y < height - 1) out[idx + width] = 1;
      }
    }
  }
  return out;
}

function traceMaskToPath(mask, width, height, colorHex, params = {}) {
  return new Promise((resolve) => {
    const maskPng = new PNG({ width, height });
    let count = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        if (mask[width * y + x] === 1) {
          maskPng.data[idx] = 0;
          maskPng.data[idx + 1] = 0;
          maskPng.data[idx + 2] = 0;
          maskPng.data[idx + 3] = 255;
          count++;
        } else {
          maskPng.data[idx] = 255;
          maskPng.data[idx + 1] = 255;
          maskPng.data[idx + 2] = 255;
          maskPng.data[idx + 3] = 0;
        }
      }
    }

    if (count < 4) return resolve("");

    const pngBuffer = PNG.sync.write(maskPng);
    const traceParams = {
      optCurve: true,
      alphamax: 1.15,
      optTolerance: 0.16,
      turdSize: 2,
      color: colorHex,
      ...params
    };

    potrace.trace(pngBuffer, traceParams, (err, svg) => {
      if (err || !svg) return resolve("");
      const pathMatch = svg.match(/<path[^>]+>/gi);
      if (pathMatch) {
        const cleanPaths = pathMatch.map(p => p.replace(/fill="[^"]*"/, `fill="${colorHex}"`));
        resolve(cleanPaths.join("\n  "));
      } else {
        resolve("");
      }
    });
  });
}

// -----------------------------------------------------------------------------------
// Vectorize kdo6/event-flower (Dusty Blue Hydrangea & Sage Eucalyptus Garland)
// -----------------------------------------------------------------------------------
async function vectorizeKdo6(srcPath, destPath) {
  const origData = fs.readFileSync(srcPath);
  const origPng = PNG.sync.read(origData);
  const { width: origW, height: origH } = origPng;

  console.log(`\n========================================================`);
  console.log(`  VECTORIZING kdo6/event-flower (${origW}x${origH})`);
  console.log(`  Palette: Dusty Blue, Periwinkle, Sage & Eucalyptus`);
  console.log(`========================================================`);

  // Scale 1.25x (native resolution 999x403 is already very detailed)
  const scale = 1.25;
  const upPng = upscalePng(origPng, scale);
  const { width, height } = upPng;

  // Separate semantic zones:
  // 1. Foliage (Green / Sage / Olive)
  // 2. Blue Flowers (Dusty blue / Periwinkle / Slate)
  // 3. White / Neutral Flowers (Ivory / White roses)
  const foliagePixels = [];
  const bluePixels = [];
  const whitePixels = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const a = upPng.data[idx + 3];
      if (a > 30) {
        const r = upPng.data[idx];
        const g = upPng.data[idx + 1];
        const b = upPng.data[idx + 2];

        // Green/Foliage: Green is dominant or olive
        if (g > b * 0.95 && g > r * 0.90 && (g > 60 || (g > r && g > b))) {
          foliagePixels.push([r, g, b]);
        }
        // Blue flowers: Blue dominant over red
        else if (b > r * 1.05 && b > 70) {
          bluePixels.push([r, g, b]);
        }
        // White / Cream neutrals
        else {
          whitePixels.push([r, g, b]);
        }
      }
    }
  }

  const foliagePalette = kMeans(foliagePixels, 8);
  foliagePalette.sort((a, b) => a.luminance - b.luminance);

  const bluePalette = kMeans(bluePixels, 9);
  bluePalette.sort((a, b) => a.luminance - b.luminance);

  const whitePalette = kMeans(whitePixels, 6);
  whitePalette.sort((a, b) => a.luminance - b.luminance);

  const allLayers = [
    ...foliagePalette.map(p => ({ ...p, type: 'foliage' })),
    ...bluePalette.map(p => ({ ...p, type: 'blue' })),
    ...whitePalette.map(p => ({ ...p, type: 'white' }))
  ];

  console.log(`Extracted total ${allLayers.length} Layers:`);
  console.log(`  🌿 Foliage: ${foliagePalette.length} layers`);
  console.log(`  🪻 Dusty Blue Flowers: ${bluePalette.length} layers`);
  console.log(`  🤍 White Roses & Highlights: ${whitePalette.length} layers`);

  // Mask assignment
  const foliageBaseMask = new Uint8Array(width * height);
  const flowerBaseMask = new Uint8Array(width * height);
  const layerMasks = Array.from({ length: allLayers.length }, () => new Uint8Array(width * height));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const a = upPng.data[idx + 3];
      if (a > 30) {
        const r = upPng.data[idx];
        const g = upPng.data[idx + 1];
        const b = upPng.data[idx + 2];

        let targetType = 'white';
        if (g > b * 0.95 && g > r * 0.90 && (g > 60 || (g > r && g > b))) {
          targetType = 'foliage';
          foliageBaseMask[width * y + x] = 1;
        } else if (b > r * 1.05 && b > 70) {
          targetType = 'blue';
          flowerBaseMask[width * y + x] = 1;
        } else {
          flowerBaseMask[width * y + x] = 1;
        }

        let bestDist = Infinity;
        let bestIdx = -1;
        for (let l = 0; l < allLayers.length; l++) {
          if (allLayers[l].type === targetType) {
            const d = colorDist(r, g, b, allLayers[l].r, allLayers[l].g, allLayers[l].b);
            if (d < bestDist) {
              bestDist = d;
              bestIdx = l;
            }
          }
        }

        if (bestIdx >= 0) {
          layerMasks[bestIdx][width * y + x] = 1;
        }
      }
    }
  }

  const paths = [];

  // Underfill bases
  console.log("Tracing Foliage Underfill Base...");
  const foliageBaseSvg = await traceMaskToPath(foliageBaseMask, width, height, foliagePalette[0].hex, { turdSize: 3 });
  if (foliageBaseSvg) paths.push(`  <!-- Foliage Underfill Base -->\n  ${foliageBaseSvg}`);

  // Foliage layers
  for (let l = 0; l < foliagePalette.length; l++) {
    const hex = allLayers[l].hex;
    process.stdout.write(`Tracing Foliage Layer ${l + 1}/${foliagePalette.length} (${hex})... `);
    const dilated = (l < foliagePalette.length - 2) ? dilateMask(layerMasks[l], width, height) : layerMasks[l];
    const svg = await traceMaskToPath(dilated, width, height, hex, { turdSize: 2 });
    if (svg) {
      paths.push(`  <!-- Foliage Layer ${l + 1}: ${hex} -->\n  ${svg}`);
      console.log("OK");
    } else {
      console.log("Empty");
    }
  }

  // Flower Underfill Base (soft periwinkle tone)
  console.log("Tracing Flower Underfill Base...");
  const flowerBaseSvg = await traceMaskToPath(flowerBaseMask, width, height, "#b8c0d4", { turdSize: 3 });
  if (flowerBaseSvg) paths.push(`  <!-- Flower Underfill Base -->\n  ${flowerBaseSvg}`);

  // Blue flower layers
  const blueStartIndex = foliagePalette.length;
  const blueEndIndex = blueStartIndex + bluePalette.length;
  for (let l = blueStartIndex; l < blueEndIndex; l++) {
    const hex = allLayers[l].hex;
    const layerNum = l - blueStartIndex + 1;
    process.stdout.write(`Tracing Blue Flower Layer ${layerNum}/${bluePalette.length} (${hex})... `);
    const dilated = (layerNum > 1 && layerNum < bluePalette.length - 1) ? dilateMask(layerMasks[l], width, height) : layerMasks[l];
    const svg = await traceMaskToPath(dilated, width, height, hex, { turdSize: 2 });
    if (svg) {
      paths.push(`  <!-- Blue Flower Layer ${layerNum}: ${hex} -->\n  ${svg}`);
      console.log("OK");
    } else {
      console.log("Empty");
    }
  }

  // White flower layers
  for (let l = blueEndIndex; l < allLayers.length; l++) {
    const hex = allLayers[l].hex;
    const layerNum = l - blueEndIndex + 1;
    process.stdout.write(`Tracing White Flower Layer ${layerNum}/${whitePalette.length} (${hex})... `);
    const svg = await traceMaskToPath(layerMasks[l], width, height, hex, { turdSize: 2 });
    if (svg) {
      paths.push(`  <!-- White Flower Layer ${layerNum}: ${hex} -->\n  ${svg}`);
      console.log("OK");
    } else {
      console.log("Empty");
    }
  }

  const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${origW}" height="${origH}" viewBox="0 0 ${width} ${height}">
${paths.join("\n")}
</svg>`;

  console.log("Optimizing with SVGO...");
  const optimized = optimize(rawSvg, {
    multipass: true,
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            cleanupNumericValues: { floatPrecision: 2 },
          }
        }
      }
    ]
  });

  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(destPath, optimized.data, "utf8");

  const origSize = fs.statSync(srcPath).size;
  const svgSize = fs.statSync(destPath).size;
  console.log(`SUCCESS! Saved: ${destPath}`);
  console.log(`PNG: ${(origSize / 1024).toFixed(1)} KB -> SVG: ${(svgSize / 1024).toFixed(1)} KB\n`);
}

// -----------------------------------------------------------------------------------
// Vectorize kdo21/bride-flower (White Roses & Muted Sage Eucalyptus Bouquet)
// -----------------------------------------------------------------------------------
async function vectorizeKdo21(srcPath, destPath) {
  const origData = fs.readFileSync(srcPath);
  const origPng = PNG.sync.read(origData);
  const { width: origW, height: origH } = origPng;

  console.log(`\n========================================================`);
  console.log(`  VECTORIZING kdo21/bride-flower (${origW}x${origH})`);
  console.log(`  Palette: Ivory, White Roses, Taupe Shading & Muted Sage`);
  console.log(`========================================================`);

  // Scale 1.6x (from 428x442 to ~685x707 for smooth curves)
  const scale = 1.6;
  const upPng = upscalePng(origPng, scale);
  const { width, height } = upPng;

  // Separate semantic zones:
  // 1. Foliage: Muted sage / eucalyptus leaves & stems
  // 2. White Roses: Taupe shadows, cream body, pure white highlights
  const foliagePixels = [];
  const flowerPixels = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const a = upPng.data[idx + 3];
      if (a > 30) {
        const r = upPng.data[idx];
        const g = upPng.data[idx + 1];
        const b = upPng.data[idx + 2];

        // Foliage: Greenish-gray / sage
        if (g >= r * 0.95 && g >= b * 0.95 && r < 185 && b < 185) {
          foliagePixels.push([r, g, b]);
        } else {
          flowerPixels.push([r, g, b]);
        }
      }
    }
  }

  const foliagePalette = kMeans(foliagePixels, 6);
  foliagePalette.sort((a, b) => a.luminance - b.luminance);

  const flowerPalette = kMeans(flowerPixels, 12);
  flowerPalette.sort((a, b) => a.luminance - b.luminance);

  const allLayers = [
    ...foliagePalette.map(p => ({ ...p, type: 'foliage' })),
    ...flowerPalette.map(p => ({ ...p, type: 'flower' }))
  ];

  console.log(`Extracted total ${allLayers.length} Layers:`);
  console.log(`  🌿 Sage Foliage: ${foliagePalette.length} layers`);
  console.log(`  🤍 White Rose Gradations: ${flowerPalette.length} layers`);

  // Mask assignment
  const foliageBaseMask = new Uint8Array(width * height);
  const flowerBaseMask = new Uint8Array(width * height);
  const layerMasks = Array.from({ length: allLayers.length }, () => new Uint8Array(width * height));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const a = upPng.data[idx + 3];
      if (a > 30) {
        const r = upPng.data[idx];
        const g = upPng.data[idx + 1];
        const b = upPng.data[idx + 2];

        let targetType = 'flower';
        if (g >= r * 0.95 && g >= b * 0.95 && r < 185 && b < 185) {
          targetType = 'foliage';
          foliageBaseMask[width * y + x] = 1;
        } else {
          flowerBaseMask[width * y + x] = 1;
        }

        let bestDist = Infinity;
        let bestIdx = -1;
        for (let l = 0; l < allLayers.length; l++) {
          if (allLayers[l].type === targetType) {
            const d = colorDist(r, g, b, allLayers[l].r, allLayers[l].g, allLayers[l].b);
            if (d < bestDist) {
              bestDist = d;
              bestIdx = l;
            }
          }
        }

        if (bestIdx >= 0) {
          layerMasks[bestIdx][width * y + x] = 1;
        }
      }
    }
  }

  const paths = [];

  // Foliage Base
  console.log("Tracing Foliage Underfill Base...");
  const foliageBaseSvg = await traceMaskToPath(foliageBaseMask, width, height, foliagePalette[0].hex, { turdSize: 2 });
  if (foliageBaseSvg) paths.push(`  <!-- Foliage Underfill Base -->\n  ${foliageBaseSvg}`);

  // Foliage Layers
  for (let l = 0; l < foliagePalette.length; l++) {
    const hex = allLayers[l].hex;
    process.stdout.write(`Tracing Foliage Layer ${l + 1}/${foliagePalette.length} (${hex})... `);
    const dilated = (l < foliagePalette.length - 2) ? dilateMask(layerMasks[l], width, height) : layerMasks[l];
    const svg = await traceMaskToPath(dilated, width, height, hex, { turdSize: 2 });
    if (svg) {
      paths.push(`  <!-- Foliage Layer ${l + 1}: ${hex} -->\n  ${svg}`);
      console.log("OK");
    } else {
      console.log("Empty");
    }
  }

  // Flower Base (warm cream underfill)
  console.log("Tracing Flower Underfill Base...");
  const flowerBaseSvg = await traceMaskToPath(flowerBaseMask, width, height, "#e5ded7", { turdSize: 2 });
  if (flowerBaseSvg) paths.push(`  <!-- Flower Underfill Base -->\n  ${flowerBaseSvg}`);

  // White Rose Layers (shadows up to highlights)
  const flowerStartIndex = foliagePalette.length;
  for (let l = flowerStartIndex; l < allLayers.length; l++) {
    const hex = allLayers[l].hex;
    const layerNum = l - flowerStartIndex + 1;
    process.stdout.write(`Tracing Flower Layer ${layerNum}/${flowerPalette.length} (${hex})... `);
    const dilated = (layerNum > 1 && layerNum < flowerPalette.length - 2) ? dilateMask(layerMasks[l], width, height) : layerMasks[l];
    const svg = await traceMaskToPath(dilated, width, height, hex, { turdSize: 2 });
    if (svg) {
      paths.push(`  <!-- Flower Layer ${layerNum}: ${hex} -->\n  ${svg}`);
      console.log("OK");
    } else {
      console.log("Empty");
    }
  }

  const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${origW}" height="${origH}" viewBox="0 0 ${width} ${height}">
${paths.join("\n")}
</svg>`;

  console.log("Optimizing with SVGO...");
  const optimized = optimize(rawSvg, {
    multipass: true,
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            cleanupNumericValues: { floatPrecision: 2 },
          }
        }
      }
    ]
  });

  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(destPath, optimized.data, "utf8");

  const origSize = fs.statSync(srcPath).size;
  const svgSize = fs.statSync(destPath).size;
  console.log(`SUCCESS! Saved: ${destPath}`);
  console.log(`PNG: ${(origSize / 1024).toFixed(1)} KB -> SVG: ${(svgSize / 1024).toFixed(1)} KB\n`);
}

async function main() {
  const KDO_LIB_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library");

  // Task 1: kdo6/event-flower
  await vectorizeKdo6(
    path.join(KDO_LIB_DIR, "kdo6/event-flower.png"),
    path.join(KDO_LIB_DIR, "svg/kdo6/event-flower.svg")
  );

  // Task 2: kdo21/bride-flower
  await vectorizeKdo21(
    path.join(KDO_LIB_DIR, "kdo21/bride-flower.png"),
    path.join(KDO_LIB_DIR, "svg/kdo21/bride-flower.svg")
  );
}

main().catch(console.error);
