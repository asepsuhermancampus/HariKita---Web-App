const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const potrace = require("potrace");
const { optimize } = require("svgo");

function colorDistance(r1, g1, b1, r2, g2, b2) {
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

// Function to extract dominant palette from PNG
function extractDominantPalette(png, numColors = 8) {
  const pixels = [];
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;
      const a = png.data[idx + 3];
      if (a > 35) {
        pixels.push([png.data[idx], png.data[idx + 1], png.data[idx + 2]]);
      }
    }
  }

  // Simple k-means clustering
  if (pixels.length === 0) return [];

  // Seed centroids with spaced out pixels
  const step = Math.max(1, Math.floor(pixels.length / numColors));
  let centroids = [];
  for (let i = 0; i < numColors; i++) {
    const p = pixels[Math.min(pixels.length - 1, i * step)];
    centroids.push([p[0], p[1], p[2]]);
  }

  // Run 6 iterations of K-Means
  for (let iter = 0; iter < 6; iter++) {
    const clusters = Array.from({ length: numColors }, () => []);
    for (const p of pixels) {
      let bestDist = Infinity;
      let bestIdx = 0;
      for (let c = 0; c < centroids.length; c++) {
        const d = colorDistance(p[0], p[1], p[2], centroids[c][0], centroids[c][1], centroids[c][2]);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = c;
        }
      }
      clusters[bestIdx].push(p);
    }

    // Recompute centroids
    for (let c = 0; c < numColors; c++) {
      if (clusters[c].length > 0) {
        const sumR = clusters[c].reduce((a, b) => a + b[0], 0);
        const sumG = clusters[c].reduce((a, b) => a + b[1], 0);
        const sumB = clusters[c].reduce((a, b) => a + b[2], 0);
        centroids[c] = [
          Math.round(sumR / clusters[c].length),
          Math.round(sumG / clusters[c].length),
          Math.round(sumB / clusters[c].length),
        ];
      }
    }
  }

  // Sort centroids by luminance/depth:
  // Darkest elements (branches, deep leaves) first, lightest/flower highlights on top!
  centroids.sort((a, b) => getLuminance(a[0], a[1], a[2]) - getLuminance(b[0], b[1], b[2]));

  return centroids.map(c => ({
    r: c[0],
    g: c[1],
    b: c[2],
    hex: rgbToHex(c[0], c[1], c[2]),
    luminance: getLuminance(c[0], c[1], c[2]),
  }));
}

function traceMask(mask, width, height, colorHex) {
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

    if (count < 8) return resolve("");

    const pngBuffer = PNG.sync.write(maskPng);
    const params = {
      optCurve: true,
      optTolerance: 0.25,
      turdSize: 2,
      color: colorHex,
    };

    potrace.trace(pngBuffer, params, (err, svg) => {
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

async function convertBotanicalPngToSvg(srcPath, destPath, numLayers = 8) {
  const data = fs.readFileSync(srcPath);
  const png = PNG.sync.read(data);
  const { width, height } = png;

  console.log(`\nProcessing ${path.basename(srcPath)} (${width}x${height})...`);
  const palette = extractDominantPalette(png, numLayers);

  console.log(`  Extracted ${palette.length} color layers:`);
  palette.forEach((p, idx) => {
    console.log(`    [Layer ${idx + 1}] ${p.hex} (Luminance: ${Math.round(p.luminance)})`);
  });

  // Assign pixels to closest centroid
  const masks = Array.from({ length: palette.length }, () => new Uint8Array(width * height));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const a = png.data[idx + 3];

      if (a > 35) {
        const r = png.data[idx];
        const g = png.data[idx + 1];
        const b = png.data[idx + 2];

        let bestDist = Infinity;
        let bestLayer = 0;

        for (let l = 0; l < palette.length; l++) {
          const d = colorDistance(r, g, b, palette[l].r, palette[l].g, palette[l].b);
          if (d < bestDist) {
            bestDist = d;
            bestLayer = l;
          }
        }

        masks[bestLayer][width * y + x] = 1;
      }
    }
  }

  // Trace each mask in luminance order (background dark to foreground light petals)
  const paths = [];
  for (let l = 0; l < palette.length; l++) {
    const layerSvg = await traceMask(masks[l], width, height, palette[l].hex);
    if (layerSvg) {
      paths.push(`  <!-- Layer ${l + 1}: ${palette[l].hex} -->\n  ${layerSvg}`);
    }
  }

  const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${paths.join("\n")}
</svg>`;

  const optimized = optimize(rawSvg, {
    multipass: true,
  });

  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(destPath, optimized.data, "utf8");

  const origSize = fs.statSync(srcPath).size;
  const svgSize = fs.statSync(destPath).size;
  console.log(`  => SUCCESS: Saved ${destPath}`);
  console.log(`     PNG: ${(origSize / 1024).toFixed(1)} KB -> SVG: ${(svgSize / 1024).toFixed(1)} KB`);
  return {
    srcPath,
    destPath,
    origSize,
    svgSize,
    palette,
  };
}

async function main() {
  const KDO_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library");

  const tasks = [
    {
      src: path.join(KDO_DIR, "kdo1/rsvp-flower.png"),
      dest: path.join(KDO_DIR, "svg/kdo1/rsvp-flower.svg"),
      layers: 8,
    },
    {
      src: path.join(KDO_DIR, "kdo3/rsvp-flower.png"),
      dest: path.join(KDO_DIR, "svg/kdo3/rsvp-flower.svg"),
      layers: 9,
    },
  ];

  for (const t of tasks) {
    await convertBotanicalPngToSvg(t.src, t.dest, t.layers);
  }
}

main().catch(console.error);
