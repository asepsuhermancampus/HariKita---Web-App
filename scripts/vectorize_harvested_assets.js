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

function getDominantHex(png) {
  const counts = {};
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] > 60) {
      const hex =
        "#" +
        [png.data[i], png.data[i + 1], png.data[i + 2]]
          .map((c) => c.toString(16).padStart(2, "0"))
          .join("");
      counts[hex] = (counts[hex] || 0) + 1;
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "#C5A880";
}

function traceAlphaMask(png, defaultColor) {
  return new Promise((resolve, reject) => {
    const maskPng = new PNG({ width: png.width, height: png.height });
    for (let i = 0; i < png.data.length; i += 4) {
      const alpha = png.data[i + 3];
      const val = alpha > 60 ? 0 : 255;
      maskPng.data[i] = val;
      maskPng.data[i + 1] = val;
      maskPng.data[i + 2] = val;
      maskPng.data[i + 3] = 255;
    }
    const maskBuf = PNG.sync.write(maskPng);
    potrace.trace(
      maskBuf,
      {
        threshold: 128,
        optTolerance: 0.3,
        turdSize: 3,
        color: defaultColor,
      },
      (err, svg) => {
        if (err) return reject(err);
        const cleanSvg = svg.replace(
          new RegExp(`fill="${defaultColor}"`, "g"),
          `fill="currentColor" style="color: var(--ornament-color, ${defaultColor})"`
        );
        resolve(cleanSvg);
      }
    );
  });
}

function traceColorLayer(png, targetR, targetG, targetB, hexColor, tolerance = 35) {
  return new Promise((resolve) => {
    const maskPng = new PNG({ width: png.width, height: png.height });
    let matchCount = 0;
    for (let i = 0; i < png.data.length; i += 4) {
      const a = png.data[i + 3];
      if (a > 40) {
        const dr = png.data[i] - targetR;
        const dg = png.data[i + 1] - targetG;
        const db = png.data[i + 2] - targetB;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);
        if (dist <= tolerance) {
          maskPng.data[i] = 0;
          maskPng.data[i + 1] = 0;
          maskPng.data[i + 2] = 0;
          maskPng.data[i + 3] = 255;
          matchCount++;
          continue;
        }
      }
      maskPng.data[i] = 255;
      maskPng.data[i + 1] = 255;
      maskPng.data[i + 2] = 255;
      maskPng.data[i + 3] = 255;
    }

    if (matchCount < 10) return resolve(null);

    const maskBuf = PNG.sync.write(maskPng);
    potrace.trace(
      maskBuf,
      {
        threshold: 128,
        optTolerance: 0.4,
        turdSize: 4,
        color: hexColor,
      },
      (err, svg) => {
        if (err) return resolve(null);
        const match = svg.match(/d="([^"]+)"/);
        if (match && match[1]) {
          resolve({ color: hexColor, d: match[1] });
        } else {
          resolve(null);
        }
      }
    );
  });
}

async function vectorizeMulticolor(png, numLayers = 10) {
  // Extract dominant color centers
  const colorBuckets = {};
  for (let i = 0; i < png.data.length; i += 16) {
    if (png.data[i + 3] > 40) {
      const qr = Math.round(png.data[i] / 24) * 24;
      const qg = Math.round(png.data[i + 1] / 24) * 24;
      const qb = Math.round(png.data[i + 2] / 24) * 24;
      const key = `${qr},${qg},${qb}`;
      colorBuckets[key] = (colorBuckets[key] || 0) + 1;
    }
  }

  const sorted = Object.entries(colorBuckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, numLayers);

  // Sort by brightness (darker base layers first, lighter highlight layers last)
  sorted.sort((a, b) => {
    const [r1, g1, b1] = a[0].split(",").map(Number);
    const [r2, g2, b2] = b[0].split(",").map(Number);
    const lum1 = 0.299 * r1 + 0.587 * g1 + 0.114 * b1;
    const lum2 = 0.299 * r2 + 0.587 * g2 + 0.114 * b2;
    return lum1 - lum2;
  });

  const layerPromises = sorted.map(([rgbStr]) => {
    const [r, g, b] = rgbStr.split(",").map(Number);
    const hex =
      "#" +
      [r, g, b]
        .map((c) => Math.min(255, Math.max(0, c)).toString(16).padStart(2, "0"))
        .join("");
    return traceColorLayer(png, r, g, b, hex, 30);
  });

  const layers = (await Promise.all(layerPromises)).filter(Boolean);

  if (layers.length === 0) {
    // Fallback to single alpha mask
    const dom = getDominantHex(png);
    return traceAlphaMask(png, dom);
  }

  let pathsHtml = layers
    .map(
      (l) =>
        `  <path d="${l.d}" fill="${l.color}" stroke="none" fill-rule="evenodd"/>`
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${png.width}" height="${png.height}" viewBox="0 0 ${png.width} ${png.height}">
${pathsHtml}
</svg>
`;
}

function makeGradientBackground(png) {
  // Sample 4 corners and center for authentic gradient
  const corners = [
    [0, 0],
    [png.width - 1, 0],
    [Math.floor(png.width / 2), Math.floor(png.height / 2)],
    [0, png.height - 1],
    [png.width - 1, png.height - 1],
  ];
  const hexes = corners.map(([x, y]) => {
    const idx = (y * png.width + x) * 4;
    return (
      "#" +
      [png.data[idx], png.data[idx + 1], png.data[idx + 2]]
        .map((c) => c.toString(16).padStart(2, "0"))
        .join("")
    );
  });

  const c1 = hexes[0];
  const cMid = hexes[2];
  const cEnd = hexes[4];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${png.width} ${png.height}" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="50%" stop-color="${cMid}"/>
      <stop offset="100%" stop-color="${cEnd}"/>
    </linearGradient>
  </defs>
  <rect width="${png.width}" height="${png.height}" fill="url(#bgGrad)"/>
</svg>
`;
}

async function processAll() {
  console.log("=== STARTING VECTORIZATION OF HARVESTED ASSETS ===");
  const files = fs.readdirSync(HARVESTED_DIR);
  const catalogData = [];

  let count = 0;
  const total = files.filter((f) => f.endsWith(".png") || f.endsWith(".svg")).length;

  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    const base = path.basename(f, ext);
    const srcPath = path.join(HARVESTED_DIR, f);
    const outSvgPath = path.join(SVG_OUT_DIR, `${base}.svg`);

    if (ext === ".svg") {
      count++;
      let content = fs.readFileSync(srcPath, "utf8");
      // ensure currentColor on single-color svgs
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
      console.log(`[${count}/${total}] [EXISTING SVG] ${base}.svg`);
      continue;
    }

    if (ext !== ".png") continue;
    count++;

    const png = PNG.sync.read(fs.readFileSync(srcPath));
    const origSizeKb = (fs.statSync(srcPath).size / 1024).toFixed(1);

    let transparent = 0;
    const colorSet = new Set();
    for (let i = 0; i < png.data.length; i += 16) {
      if (png.data[i + 3] < 30) {
        transparent++;
      } else {
        const qr = Math.round(png.data[i] / 16);
        const qg = Math.round(png.data[i + 1] / 16);
        const qb = Math.round(png.data[i + 2] / 16);
        colorSet.add((qr << 8) | (qg << 4) | qb);
      }
    }
    const pctTrans = (transparent / (png.data.length / 16)) * 100;
    const isSolid = pctTrans < 5;
    const isMono = !isSolid && colorSet.size <= 8;

    let svgContent = "";
    let category = "";

    if (isSolid) {
      category = "Background Wallpaper";
      svgContent = makeGradientBackground(png);
    } else if (isMono) {
      category = "Monokrom / Line Art / Divider";
      const domHex = getDominantHex(png);
      svgContent = await traceAlphaMask(png, domHex);
    } else {
      category = "Multicolor Floral";
      const layers = Math.min(12, Math.max(6, Math.floor(colorSet.size / 15)));
      svgContent = await vectorizeMulticolor(png, layers);
    }

    fs.writeFileSync(outSvgPath, svgContent, "utf8");
    const newSizeKb = (svgContent.length / 1024).toFixed(1);

    catalogData.push({
      file: f,
      svgFile: `${base}.svg`,
      type: isSolid ? "solid-bg" : isMono ? "monochrome" : "multicolor",
      category,
      w: png.width,
      h: png.height,
      origSizeKb,
      newSizeKb,
      isMono: isMono,
    });

    console.log(
      `[${count}/${total}] [${category}] ${base}.svg (${png.width}x${png.height}) | ${origSizeKb} KB -> ${newSizeKb} KB`
    );
  }

  fs.writeFileSync(
    path.join(SVG_OUT_DIR, "harvested_catalog_data.json"),
    JSON.stringify(catalogData, null, 2),
    "utf8"
  );
  console.log(`\n=== VECTORIZATION COMPLETE: ${catalogData.length} SVGs Generated! ===`);
}

processAll().catch((err) => {
  console.error("Vectorization error:", err);
  process.exit(1);
});
