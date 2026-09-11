const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const potrace = require("potrace");

const HARVESTED_DIR = path.resolve(__dirname, "../references/kadio-assets/harvested");
const SVG_OUT_DIR = path.join(HARVESTED_DIR, "svg");

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

function kMeansClustering(pixels, k = 8, iterations = 6) {
  if (pixels.length === 0) return [];
  k = Math.min(k, pixels.length);
  const sampleSize = Math.min(pixels.length, 6000);
  const sample = [];
  const step = Math.max(1, Math.floor(pixels.length / sampleSize));
  for (let i = 0; i < pixels.length && sample.length < sampleSize; i += step) {
    sample.push(pixels[i]);
  }

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

async function vectorizePng(png, filename = "") {
  const maxDim = Math.max(png.width, png.height);
  let scale = 1.2;
  if (maxDim < 350) scale = 2.0;
  else if (maxDim < 700) scale = 1.5;
  else scale = 1.2;

  const upPng = upscaleBilinear(png, scale);
  const visiblePixels = [];

  // Determine max alpha
  let maxAlpha = 0;
  for (let i = 0; i < upPng.data.length; i += 4) {
    if (upPng.data[i + 3] > maxAlpha) maxAlpha = upPng.data[i + 3];
  }
  const minAlphaThreshold = Math.min(25, Math.floor(maxAlpha * 0.3));

  for (let y = 0; y < upPng.height; y++) {
    for (let x = 0; x < upPng.width; x++) {
      const idx = (upPng.width * y + x) << 2;
      const a = upPng.data[idx + 3];
      if (a >= minAlphaThreshold) {
        const r = upPng.data[idx];
        const g = upPng.data[idx + 1];
        const b = upPng.data[idx + 2];
        visiblePixels.push([r, g, b]);
      }
    }
  }

  if (visiblePixels.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${png.width} ${png.height}"/>`;
  }

  const k = Math.min(8, Math.max(5, Math.floor(Math.sqrt(visiblePixels.length) / 45)));
  const centroids = kMeansClustering(visiblePixels, k, 6);

  centroids.sort((c1, c2) => getLuminance(c1[0], c1[1], c1[2]) - getLuminance(c2[0], c2[1], c2[2]));

  const layerMasks = centroids.map(() => new PNG({ width: upPng.width, height: upPng.height }));
  for (const m of layerMasks) m.data.fill(255);

  for (let y = 0; y < upPng.height; y++) {
    for (let x = 0; x < upPng.width; x++) {
      const idx = (upPng.width * y + x) << 2;
      const a = upPng.data[idx + 3];
      if (a >= minAlphaThreshold) {
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

async function fixAll() {
  console.log("=== FIXING FAKE SVGS & LOW-ALPHA ASSETS TO 100% PURE VECTORS ===");

  // 1. Fix story-center-bg.png
  console.log("\n1. Fixing story-center-bg.png...");
  const storyCenterPng = PNG.sync.read(fs.readFileSync(path.join(HARVESTED_DIR, "story-center-bg.png")));
  const storyCenterSvg = await vectorizePng(storyCenterPng, "story-center-bg.png");
  fs.writeFileSync(path.join(SVG_OUT_DIR, "story-center-bg.svg"), storyCenterSvg, "utf8");
  console.log("story-center-bg.svg fixed! Paths:", (storyCenterSvg.match(/<path/g) || []).length);

  // 2. Fix the 5 fake SVGs with embedded base64
  const fakeSvgs = [
    "kdo46-bg-3.svg",
    "kdo46-bg.svg",
    "story-bottom.svg",
    "story-left.svg",
    "story-right.svg"
  ];

  for (const f of fakeSvgs) {
    const rawPath = path.join(HARVESTED_DIR, f);
    const content = fs.readFileSync(rawPath, "utf8");
    const m = content.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
    if (!m) {
      // Check if there is a matching .png in harvested (e.g., story-left.png, story-right.png)
      const base = path.basename(f, ".svg");
      const pngPath = path.join(HARVESTED_DIR, `${base}.png`);
      if (fs.existsSync(pngPath)) {
        console.log(`\nVectorizing from original PNG for ${f}...`);
        const png = PNG.sync.read(fs.readFileSync(pngPath));
        const cleanSvg = await vectorizePng(png, f);
        fs.writeFileSync(path.join(SVG_OUT_DIR, f), cleanSvg, "utf8");
        console.log(`${f} fixed from PNG! Paths:`, (cleanSvg.match(/<path/g) || []).length);
        continue;
      }
      console.log(`No base64 or PNG found for ${f}`);
      continue;
    }

    console.log(`\nExtracting base64 PNG from ${f} and vectorizing...`);
    const pngBuf = Buffer.from(m[1], "base64");
    const png = PNG.sync.read(pngBuf);
    const cleanSvg = await vectorizePng(png, f);
    fs.writeFileSync(path.join(SVG_OUT_DIR, f), cleanSvg, "utf8");
    console.log(`${f} converted to pure vector! Paths:`, (cleanSvg.match(/<path/g) || []).length);
  }

  console.log("\n=== ALL FAKE SVGS CONVERTED TO 100% PURE VECTOR PATHS! ===");
}

fixAll().catch(console.error);
