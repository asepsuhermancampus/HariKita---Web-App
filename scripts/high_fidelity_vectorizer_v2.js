const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const potrace = require("potrace");

const HARVESTED_DIR = path.resolve(__dirname, "../references/kadio-assets/harvested");
const SVG_OUT_DIR = path.join(HARVESTED_DIR, "svg");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(SVG_OUT_DIR);

// 1. Adaptive Bilinear Interpolation Upscaler
// Interpolates sub-pixel edges so Potrace traces silky smooth Bezier splines
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

function getLuminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0"))
      .join("")
  );
}

// 2. High-speed, high-accuracy K-Means Clustering on sampled pixels
function kMeansClustering(pixels, k = 8, iterations = 6) {
  if (pixels.length === 0) return [];
  k = Math.min(k, pixels.length);

  // Sample up to 6,000 pixels for fast, accurate color centers
  const sampleSize = Math.min(pixels.length, 6000);
  const sample = [];
  const step = Math.max(1, Math.floor(pixels.length / sampleSize));
  for (let i = 0; i < pixels.length && sample.length < sampleSize; i += step) {
    sample.push(pixels[i]);
  }

  // Initialize centroids with k-means++ style spread
  const centroids = [];
  centroids.push(sample[0].slice());

  while (centroids.length < k) {
    let bestDist = -1;
    let bestP = sample[0];
    for (let s = 0; s < 25; s++) {
      const p = sample[Math.floor(Math.random() * sample.length)];
      let minDist = Infinity;
      for (const c of centroids) {
        const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
        if (d < minDist) minDist = d;
      }
      if (minDist > bestDist) {
        bestDist = minDist;
        bestP = p;
      }
    }
    centroids.push(bestP.slice());
  }

  // Iterative refinement
  for (let iter = 0; iter < iterations; iter++) {
    const sums = centroids.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < sample.length; i++) {
      const p = sample[i];
      let minDist = Infinity;
      let bestC = 0;
      for (let c = 0; c < centroids.length; c++) {
        const cent = centroids[c];
        const d =
          0.3 * (p[0] - cent[0]) ** 2 +
          0.59 * (p[1] - cent[1]) ** 2 +
          0.11 * (p[2] - cent[2]) ** 2;
        if (d < minDist) {
          minDist = d;
          bestC = c;
        }
      }
      sums[bestC][0] += p[0];
      sums[bestC][1] += p[1];
      sums[bestC][2] += p[2];
      sums[bestC][3]++;
    }

    for (let c = 0; c < centroids.length; c++) {
      if (sums[c][3] > 0) {
        centroids[c][0] = Math.round(sums[c][0] / sums[c][3]);
        centroids[c][1] = Math.round(sums[c][1] / sums[c][3]);
        centroids[c][2] = Math.round(sums[c][2] / sums[c][3]);
      }
    }
  }

  return centroids;
}

function traceMaskBuffer(maskPng, color, optTolerance = 0.2, turdSize = 2) {
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

// 3. Multi-Layer Floral & Botanical Vectorizer V2
async function vectorizeHighFidelityV2(origPng, filename = "") {
  const maxDim = Math.max(origPng.width, origPng.height);
  let scale = 1.2;
  if (maxDim < 350) scale = 2.0;
  else if (maxDim < 700) scale = 1.5;
  else scale = 1.2;

  const upPng = upscaleBilinear(origPng, scale);
  const visiblePixels = [];

  for (let y = 0; y < upPng.height; y++) {
    for (let x = 0; x < upPng.width; x++) {
      const idx = (upPng.width * y + x) << 2;
      const a = upPng.data[idx + 3];
      if (a > 35) {
        const r = upPng.data[idx];
        const g = upPng.data[idx + 1];
        const b = upPng.data[idx + 2];
        visiblePixels.push([r, g, b]);
      }
    }
  }

  if (visiblePixels.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${origPng.width} ${origPng.height}"/>`;
  }

  // Optimal layer count: 5 to 8 layers for rich depth without bloat
  const k = Math.min(8, Math.max(5, Math.floor(Math.sqrt(visiblePixels.length) / 45)));
  const centroids = kMeansClustering(visiblePixels, k, 6);

  // Sort: Darkest base contour first -> midtones -> bright highlights
  centroids.sort((c1, c2) => getLuminance(c1[0], c1[1], c1[2]) - getLuminance(c2[0], c2[1], c2[2]));

  const layerMasks = centroids.map(() => new PNG({ width: upPng.width, height: upPng.height }));
  for (const m of layerMasks) m.data.fill(255);

  for (let y = 0; y < upPng.height; y++) {
    for (let x = 0; x < upPng.width; x++) {
      const idx = (upPng.width * y + x) << 2;
      const a = upPng.data[idx + 3];
      if (a > 35) {
        const r = upPng.data[idx];
        const g = upPng.data[idx + 1];
        const b = upPng.data[idx + 2];

        let bestDist = Infinity;
        let bestC = 0;
        for (let c = 0; c < centroids.length; c++) {
          const cent = centroids[c];
          const d =
            0.3 * (r - cent[0]) ** 2 +
            0.59 * (g - cent[1]) ** 2 +
            0.11 * (b - cent[2]) ** 2;
          if (d < bestDist) {
            bestDist = d;
            bestC = c;
          }
        }

        layerMasks[bestC].data[idx] = 0;
        layerMasks[bestC].data[idx + 1] = 0;
        layerMasks[bestC].data[idx + 2] = 0;
        layerMasks[bestC].data[idx + 3] = 255;
      }
    }
  }

  const tracePromises = centroids.map((c, i) => {
    const hex = rgbToHex(c[0], c[1], c[2]);
    const isDarkContour = i === 0 || getLuminance(c[0], c[1], c[2]) < 85;
    const optTol = isDarkContour ? 0.15 : 0.22;
    const turd = isDarkContour ? 1 : 2;
    return traceMaskBuffer(layerMasks[i], hex, optTol, turd);
  });

  const layers = (await Promise.all(tracePromises)).filter(Boolean);

  let pathsHtml = layers
    .map((l) => `  <path d="${l.d}" fill="${l.color}" stroke="none" fill-rule="evenodd"/>`)
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}" width="100%" height="100%">
${pathsHtml}
</svg>
`;
}

// 4. Line Art Tracer V2 (turdSize: 1, optTolerance: 0.15)
async function traceLineArtV2(origPng, defaultColor) {
  const scale = origPng.width < 400 ? 1.5 : 1.2;
  const upPng = upscaleBilinear(origPng, scale);
  const mask = new PNG({ width: upPng.width, height: upPng.height });
  mask.data.fill(255);

  for (let y = 0; y < upPng.height; y++) {
    for (let x = 0; x < upPng.width; x++) {
      const idx = (upPng.width * y + x) << 2;
      const a = upPng.data[idx + 3];
      if (a > 45) {
        mask.data[idx] = 0;
        mask.data[idx + 1] = 0;
        mask.data[idx + 2] = 0;
        mask.data[idx + 3] = 255;
      }
    }
  }

  const res = await traceMaskBuffer(mask, defaultColor, 0.15, 1);
  if (!res) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${origPng.width} ${origPng.height}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}" width="100%" height="100%">
  <path d="${res.d}" fill="currentColor" style="color: var(--ornament-color, ${defaultColor})" fill-rule="evenodd"/>
</svg>
`;
}

function getDominantColor(png) {
  const counts = {};
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] > 60) {
      const hex = rgbToHex(png.data[i], png.data[i + 1], png.data[i + 2]);
      counts[hex] = (counts[hex] || 0) + 1;
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "#C5A880";
}

async function runHighFidelityV2() {
  console.log("=== EXECUTING HIGH-FIDELITY VECTORIZER V2 (ALL 280 ASSETS) ===");
  const files = fs.readdirSync(HARVESTED_DIR);
  const catalogData = [];

  const targetFiles = files.filter(
    (f) =>
      (f.endsWith(".png") || f.endsWith(".svg") || f.endsWith(".jpg") || f.endsWith(".jpeg")) &&
      !f.startsWith("test_")
  );
  console.log(`Processing ${targetFiles.length} total harvested assets with optimized V2 engine...\n`);

  let count = 0;
  for (const f of targetFiles) {
    count++;
    const ext = path.extname(f).toLowerCase();
    const base = path.basename(f, ext);
    const srcPath = path.join(HARVESTED_DIR, f);
    const outSvgPath = path.join(SVG_OUT_DIR, `${base}.svg`);

    // Existing SVGs
    if (ext === ".svg") {
      let content = fs.readFileSync(srcPath, "utf8");
      if (!content.includes("currentColor") && !content.includes("linearGradient")) {
        content = content.replace(/fill="[^"]*"/, 'fill="currentColor"');
      }
      fs.writeFileSync(outSvgPath, content, "utf8");
      catalogData.push({
        file: f,
        svgFile: `${base}.svg`,
        type: "existing-svg",
        category: "Vector Asli",
        sizeKb: (content.length / 1024).toFixed(1),
        isMono: true,
      });
      console.log(`[${count}/${targetFiles.length}] [EXISTING SVG] ${base}.svg`);
      continue;
    }

    // JPG files (backgrounds)
    if (ext === ".jpg" || ext === ".jpeg") {
      if (fs.existsSync(outSvgPath)) {
        const svgContent = fs.readFileSync(outSvgPath, "utf8");
        catalogData.push({
          file: f,
          svgFile: `${base}.svg`,
          type: "solid-bg",
          category: "Background Wallpaper",
          origSizeKb: (fs.statSync(srcPath).size / 1024).toFixed(1),
          newSizeKb: (svgContent.length / 1024).toFixed(1),
          isMono: false,
        });
        console.log(`[${count}/${targetFiles.length}] [WALLPAPER GRADIENT] ${base}.svg`);
      }
      continue;
    }

    // PNG files
    const png = PNG.sync.read(fs.readFileSync(srcPath));
    const origSizeKb = (fs.statSync(srcPath).size / 1024).toFixed(1);

    let transparent = 0;
    const pxSample = [];
    for (let i = 0; i < png.data.length; i += 16) {
      if (png.data[i + 3] < 30) {
        transparent++;
      } else {
        pxSample.push([png.data[i], png.data[i + 1], png.data[i + 2]]);
      }
    }

    const pctTrans = (transparent / (png.data.length / 16)) * 100;
    const isSolid = pctTrans < 5;

    // Accurate calculation of color span & luminance variation
    let minLum = 255, maxLum = 0;
    const colorSet = new Set();
    for (const px of pxSample) {
      const lum = 0.299 * px[0] + 0.587 * px[1] + 0.114 * px[2];
      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;
      const qr = Math.round(px[0] / 16);
      const qg = Math.round(px[1] / 16);
      const qb = Math.round(px[2] / 16);
      colorSet.add((qr << 8) | (qg << 4) | qb);
    }
    const lumSpan = maxLum - minLum;

    // True line art test:
    // Explicit divider / frame / stamp / wave, or flat single-hue line art with minimal luminance variation (< 12)
    const isExplicitLineArt =
      f.includes("divider") ||
      f.includes("frame") ||
      f.includes("stamp") ||
      f.includes("wave") ||
      f.includes("border") ||
      f.includes("ornament-line");

    const isFlatMonochrome = !isSolid && lumSpan < 12 && colorSet.size <= 4;
    const isLineArt = !isSolid && (isExplicitLineArt || isFlatMonochrome) && !f.includes("flower") && !f.includes("leaf");

    let svgContent = "";
    let category = "";

    if (isSolid) {
      category = "Background Wallpaper";
      const cTop = rgbToHex(png.data[0], png.data[1], png.data[2]);
      const midIdx = Math.floor(png.height / 2) * png.width * 4;
      const cMid = rgbToHex(png.data[midIdx], png.data[midIdx + 1], png.data[midIdx + 2]);
      const botIdx = (png.height - 1) * png.width * 4;
      const cBot = rgbToHex(png.data[botIdx], png.data[botIdx + 1], png.data[botIdx + 2]);

      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${png.width} ${png.height}" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${cTop}"/>
      <stop offset="50%" stop-color="${cMid}"/>
      <stop offset="100%" stop-color="${cBot}"/>
    </linearGradient>
  </defs>
  <rect width="${png.width}" height="${png.height}" fill="url(#bgGrad)"/>
</svg>
`;
    } else if (isLineArt) {
      category = "Monokrom / Line Art / Divider";
      const dom = getDominantColor(png);
      svgContent = await traceLineArtV2(png, dom);
    } else {
      category = "Multicolor Floral & Botanical";
      svgContent = await vectorizeHighFidelityV2(png, f);
    }

    fs.writeFileSync(outSvgPath, svgContent, "utf8");
    const newSizeKb = (svgContent.length / 1024).toFixed(1);

    catalogData.push({
      file: f,
      svgFile: `${base}.svg`,
      type: isSolid ? "solid-bg" : isLineArt ? "monochrome" : "multicolor",
      category,
      w: png.width,
      h: png.height,
      origSizeKb,
      newSizeKb,
      isMono: isLineArt,
    });

    console.log(
      `[${count}/${targetFiles.length}] [${category}] ${base}.svg (${png.width}x${png.height}) -> ${newSizeKb} KB`
    );
  }

  fs.writeFileSync(
    path.join(SVG_OUT_DIR, "harvested_catalog_data.json"),
    JSON.stringify(catalogData, null, 2),
    "utf8"
  );
  console.log(`\n=== V2 RE-VECTORIZATION COMPLETE FOR ALL ${catalogData.length} ASSETS! ===`);
}

runHighFidelityV2().catch((err) => {
  console.error("V2 Vectorization error:", err);
  process.exit(1);
});
