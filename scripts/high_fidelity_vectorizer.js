const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const potrace = require("potrace");
const { optimize } = require("svgo");

// Bilinear interpolation upscale (3.0x for sub-pixel hairline micro-details)
function upscalePng(srcPng, scale = 3.0) {
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

// 33-Layer Semantic Palette Extraction
function extractSemanticPalettes33(png) {
  const greenPixels = [];
  const yellowPixels = [];
  const flowerPixels = [];

  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;
      const a = png.data[idx + 3];
      if (a > 30) {
        const r = png.data[idx];
        const g = png.data[idx + 1];
        const b = png.data[idx + 2];

        // Foliage: Green is dominant or olive tone
        if (g > b && g > r * 0.80 && g > 35 && r < 195 && b < 130) {
          greenPixels.push([r, g, b]);
        }
        // Stamen / yellow pistil dots
        else if (r > 185 && g > 140 && b < 125) {
          yellowPixels.push([r, g, b]);
        }
        // Flowers & thin contour crevices
        else {
          flowerPixels.push([r, g, b]);
        }
      }
    }
  }

  function kMeans(pixels, k, iterations = 10) {
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

  // 1. Foliage: 9 distinct layers (from deep central leaf vein to bright sunlight rim)
  const greenPalette = kMeans(greenPixels, 9);
  greenPalette.sort((a, b) => a.luminance - b.luminance);

  // 2. Flower: 19 distinct layers (including micro-contour lines, watercolor washes, and top highlights)
  const flowerPalette = kMeans(flowerPixels, 19);
  flowerPalette.sort((a, b) => a.luminance - b.luminance);

  // 3. Stamen: 5 distinct layers (anther shadows, amber, bright cadmium gold, lemon tips)
  const yellowPalette = kMeans(yellowPixels, 5);
  yellowPalette.sort((a, b) => a.luminance - b.luminance);

  return {
    foliage: greenPalette,
    flower: flowerPalette,
    stamen: yellowPalette
  };
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

    if (count < 3) return resolve("");

    const pngBuffer = PNG.sync.write(maskPng);
    const traceParams = {
      optCurve: true,
      alphamax: 1.15,
      optTolerance: 0.12,
      turdSize: 1,
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

async function vectorizeKdo1Master33(srcPath, destPath) {
  const origData = fs.readFileSync(srcPath);
  const origPng = PNG.sync.read(origData);
  const origW = origPng.width;
  const origH = origPng.height;

  console.log(`\n======================================================`);
  console.log(`  MASTER HIGH-FIDELITY VECTORIZATION: 33 LAYERS`);
  console.log(`  Target: ${path.basename(srcPath)}`);
  console.log(`======================================================`);

  // Step 1: 3.0x sub-pixel super-sampling
  const scale = 3.0;
  const upPng = upscalePng(origPng, scale);
  const { width, height } = upPng;
  console.log(`Super-sampling: ${origW}x${origH} -> ${width}x${height} (3.0x precision)`);

  // Step 2: 33-Layer Semantic Palettes
  const palettes = extractSemanticPalettes33(upPng);
  const allLayers = [
    ...palettes.foliage.map(p => ({ ...p, type: 'foliage' })),
    ...palettes.flower.map(p => ({ ...p, type: 'flower' })),
    ...palettes.stamen.map(p => ({ ...p, type: 'stamen' }))
  ];

  console.log(`Extracted total ${allLayers.length} Layers:`);
  console.log(`  🌿 Foliage (Daun & Batang): ${palettes.foliage.length} layers`);
  console.log(`  🌸 Flowers & Crevices: ${palettes.flower.length} layers`);
  console.log(`  ✨ Stamen (Putik Sari): ${palettes.stamen.length} layers`);

  // Step 3: Base masks for dual-underfill
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
        if (g > b && g > r * 0.80 && g > 35 && r < 195 && b < 130) {
          targetType = 'foliage';
          foliageBaseMask[width * y + x] = 1;
        } else if (r > 185 && g > 140 && b < 125) {
          targetType = 'stamen';
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

  // 1. Foliage Underfill Base (Deepest Forest Olive)
  console.log("Tracing Foliage Underfill Base...");
  const foliageBaseSvg = await traceMaskToPath(foliageBaseMask, width, height, palettes.foliage[0].hex, { turdSize: 2 });
  if (foliageBaseSvg) {
    paths.push(`  <!-- Foliage Underfill Base -->\n  ${foliageBaseSvg}`);
  }

  // 2. Foliage Layers (9 Layers)
  for (let l = 0; l < palettes.foliage.length; l++) {
    const hex = allLayers[l].hex;
    process.stdout.write(`Tracing Foliage Layer ${l + 1}/${palettes.foliage.length} (${hex})... `);
    const dilated = (l < palettes.foliage.length - 2) ? dilateMask(layerMasks[l], width, height) : layerMasks[l];
    const svg = await traceMaskToPath(dilated, width, height, hex, { turdSize: 1, optTolerance: 0.12 });
    if (svg) {
      paths.push(`  <!-- Foliage Layer ${l + 1}: ${hex} -->\n  ${svg}`);
      console.log("OK");
    } else {
      console.log("Empty");
    }
  }

  // 3. Flower Underfill Base (Soft Petal Blush)
  console.log("Tracing Flower Underfill Base...");
  const flowerBaseSvg = await traceMaskToPath(flowerBaseMask, width, height, "#fed1dc", { turdSize: 2 });
  if (flowerBaseSvg) {
    paths.push(`  <!-- Flower Underfill Base -->\n  ${flowerBaseSvg}`);
  }

  // 4. Flower & Thin Crevice Layers (19 Layers)
  const flowerStartIndex = palettes.foliage.length;
  const flowerEndIndex = flowerStartIndex + palettes.flower.length;
  for (let l = flowerStartIndex; l < flowerEndIndex; l++) {
    const hex = allLayers[l].hex;
    const flowerLayerNum = l - flowerStartIndex + 1;
    process.stdout.write(`Tracing Flower Layer ${flowerLayerNum}/${palettes.flower.length} (${hex})... `);
    // Dilate lower & mid layers to prevent any seams; keep finest top highlights & micro lines undilated for razor sharpness
    const isLineOrHighlight = flowerLayerNum <= 3 || flowerLayerNum >= 17;
    const mask = isLineOrHighlight ? layerMasks[l] : dilateMask(layerMasks[l], width, height);

    const svg = await traceMaskToPath(mask, width, height, hex, {
      turdSize: 1, // Turd size 1 captures micro-lines & dots
      optTolerance: 0.12
    });

    if (svg) {
      paths.push(`  <!-- Flower Layer ${flowerLayerNum}: ${hex} -->\n  ${svg}`);
      console.log("OK");
    } else {
      console.log("Empty");
    }
  }

  // 5. Stamen / Pistil Micro-Dots (5 Layers)
  for (let l = flowerEndIndex; l < allLayers.length; l++) {
    const hex = allLayers[l].hex;
    const stamenLayerNum = l - flowerEndIndex + 1;
    process.stdout.write(`Tracing Stamen Layer ${stamenLayerNum}/${palettes.stamen.length} (${hex})... `);
    const svg = await traceMaskToPath(layerMasks[l], width, height, hex, {
      turdSize: 1,
      optTolerance: 0.10
    });
    if (svg) {
      paths.push(`  <!-- Stamen Layer ${stamenLayerNum}: ${hex} -->\n  ${svg}`);
      console.log("OK");
    } else {
      console.log("Empty");
    }
  }

  const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${origW}" height="${origH}" viewBox="0 0 ${width} ${height}">
${paths.join("\n")}
</svg>`;

  console.log("Optimizing SVG via SVGO (Precision 2)...");
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

  fs.writeFileSync(destPath, optimized.data, "utf8");
  const origSize = fs.statSync(srcPath).size;
  const svgSize = fs.statSync(destPath).size;
  console.log(`\n🎉 MASTER HIGH-FIDELITY VECTORIZATION SUCCESSFUL!`);
  console.log(`Output: ${destPath}`);
  console.log(`PNG: ${(origSize / 1024).toFixed(1)} KB -> 33-Layer SVG: ${(svgSize / 1024).toFixed(1)} KB`);
}

async function main() {
  const KDO_LIB_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library");
  const src = path.join(KDO_LIB_DIR, "kdo1/rsvp-flower.png");
  const dest = path.join(KDO_LIB_DIR, "svg/kdo1/rsvp-flower.svg");
  await vectorizeKdo1Master33(src, dest);
}

main().catch(console.error);
