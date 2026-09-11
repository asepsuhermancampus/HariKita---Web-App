const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const potrace = require("potrace");
const { optimize } = require("svgo");

const srcPath = path.resolve(__dirname, "../references/kadio-assets/kdo-library/kdo4/bride-flower.png");
const outSvgPath = path.resolve(__dirname, "../references/kadio-assets/kdo-library/svg/kdo4/bride-flower.svg");

// Read PNG
const data = fs.readFileSync(srcPath);
const png = PNG.sync.read(data);
const { width, height } = png;

console.log(`Original PNG: ${width}x${height}`);

// Define palette clusters based on analyzing bride-flower.png:
// 1. Dark stems / branches: deep brown/olive
// 2. Dark green leaves: forest olive
// 3. Medium sage leaves: eucalyptus green
// 4. Light mint leaves / highlights: pale blue-green
// 5. Golden berries & pistil details: warm ochre/gold
// 6. Cream flower shade / shadows: soft beige/ivory
// 7. White main petals: bright ivory/white

const targetPalette = [
  { name: "stems_and_outlines", hex: "#3A3F2C", r: 58, g: 63, b: 44 },
  { name: "deep_olive_leaves", hex: "#5E6C47", r: 94, g: 108, b: 71 },
  { name: "sage_green_leaves", hex: "#889D78", r: 136, g: 157, b: 120 },
  { name: "mint_eucalyptus", hex: "#B8CEBE", r: 184, g: 206, b: 190 },
  { name: "gold_berries_pistils", hex: "#E2B336", r: 226, g: 179, b: 54 },
  { name: "pale_gold_berries", hex: "#F3D57B", r: 243, g: 213, b: 123 },
  { name: "cream_petal_shadows", hex: "#E6DBC6", r: 230, g: 219, b: 198 },
  { name: "white_petals", hex: "#FAF8F2", r: 250, g: 248, b: 242 },
];

function colorDistance(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  // perceptual weights: 0.3 R, 0.59 G, 0.11 B
  return 0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db;
}

// Assign each pixel to the nearest palette color (if opaque)
const layerPixels = Array.from({ length: targetPalette.length }, () => new Uint8Array(width * height));

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (width * y + x) << 2;
    const a = png.data[idx + 3];

    if (a > 30) {
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];

      let bestDist = Infinity;
      let bestLayer = 0;

      for (let i = 0; i < targetPalette.length; i++) {
        const pal = targetPalette[i];
        const dist = colorDistance(r, g, b, pal.r, pal.g, pal.b);
        if (dist < bestDist) {
          bestDist = dist;
          bestLayer = i;
        }
      }

      layerPixels[bestLayer][width * y + x] = 1;
    }
  }
}

// Function to trace a single mask layer
function traceMaskLayer(mask, colorHex, layerName) {
  return new Promise((resolve) => {
    // Create temporary PNG buffer for this mask
    const maskPng = new PNG({ width, height });
    let count = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const active = mask[width * y + x] === 1;
        if (active) {
          maskPng.data[idx] = 0;     // R (black foreground)
          maskPng.data[idx + 1] = 0; // G
          maskPng.data[idx + 2] = 0; // B
          maskPng.data[idx + 3] = 255; // A
          count++;
        } else {
          maskPng.data[idx] = 255;   // white background
          maskPng.data[idx + 1] = 255;
          maskPng.data[idx + 2] = 255;
          maskPng.data[idx + 3] = 0;
        }
      }
    }

    if (count < 10) {
      return resolve("");
    }

    const pngBuffer = PNG.sync.write(maskPng);

    const params = {
      optCurve: true,
      optTolerance: 0.3,
      turdSize: 2,
      color: colorHex,
    };

    potrace.trace(pngBuffer, params, (err, svg) => {
      if (err || !svg) return resolve("");
      
      // Extract <path ... /> from svg
      const pathMatch = svg.match(/<path[^>]+>/gi);
      if (pathMatch) {
        // Inject fill color directly
        const cleanPaths = pathMatch.map(p => {
          return p.replace(/fill="[^"]*"/, `fill="${colorHex}"`);
        });
        resolve(`<!-- Layer: ${layerName} -->\n  ` + cleanPaths.join("\n  "));
      } else {
        resolve("");
      }
    });
  });
}

async function run() {
  console.log("Tracing all 8 color layers...");
  const svgLayers = [];

  // Background layers first (stems, leaves), then berries, then flower shadows, then white petals on top!
  const layerOrder = [0, 1, 2, 3, 4, 5, 6, 7];

  for (const i of layerOrder) {
    const pal = targetPalette[i];
    process.stdout.write(`  Tracing ${pal.name} (${pal.hex})... `);
    const layerSvg = await traceMaskLayer(layerPixels[i], pal.hex, pal.name);
    if (layerSvg) {
      console.log("OK");
      svgLayers.push(layerSvg);
    } else {
      console.log("EMPTY");
    }
  }

  const rawMasterSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${svgLayers.join("\n")}
</svg>`;

  console.log(`Raw master SVG length: ${rawMasterSvg.length}`);

  // Optimize with SVGO
  const optimized = optimize(rawMasterSvg, {
    multipass: true,
  });

  fs.writeFileSync(outSvgPath, optimized.data, "utf8");
  console.log(`Optimized SVG saved to: ${outSvgPath}`);
  console.log(`File size: ${(optimized.data.length / 1024).toFixed(1)} KB`);
}

run().catch(console.error);
