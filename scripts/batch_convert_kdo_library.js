const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const potrace = require("potrace");
const { optimize } = require("svgo");

const KDO_LIB_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library");
const SVG_OUT_DIR = path.resolve(KDO_LIB_DIR, "svg");
const SHARED_OUT_DIR = path.resolve(SVG_OUT_DIR, "shared");

[SVG_OUT_DIR, SHARED_OUT_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Helper math
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

// Bilinear upscale for small images
function upscalePng(srcPng, scale = 2.0) {
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

function traceMonochrome(pngBuffer, defaultHex) {
  return new Promise((resolve) => {
    const traceParams = {
      optCurve: true,
      alphamax: 1.0,
      optTolerance: 0.2,
      turdSize: 2,
      color: "currentColor"
    };

    potrace.trace(pngBuffer, traceParams, (err, svg) => {
      if (err || !svg) return resolve(null);
      const viewBoxMatch = svg.match(/viewBox="([^"]+)"/i);
      const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 100 100";
      const pathMatch = svg.match(/<path[^>]+>/gi);
      if (!pathMatch) return resolve(null);

      const cleanPaths = pathMatch.map(p => {
        return p.replace(/fill="[^"]*"/, 'fill="currentColor"');
      });

      const raw = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor" style="color: var(--ornament-color, ${defaultHex})">
  ${cleanPaths.join("\n  ")}
</svg>`;

      const optimized = optimize(raw, {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                cleanupNumericValues: { floatPrecision: 2 }
              }
            }
          }
        ]
      });

      resolve(optimized.data);
    });
  });
}

// Shape hash to detect identical shapes
function getShapeHash(png) {
  const grid = new Uint8Array(32 * 32);
  for (let gy = 0; gy < 32; gy++) {
    const sy = Math.floor(gy * png.height / 32);
    for (let gx = 0; gx < 32; gx++) {
      const sx = Math.floor(gx * png.width / 32);
      const idx = (png.width * sy + sx) << 2;
      if (png.data[idx + 3] > 40) {
        grid[gy * 32 + gx] = 1;
      }
    }
  }
  return grid;
}

function compareGrids(g1, g2) {
  let match = 0;
  for (let i = 0; i < 1024; i++) {
    if (g1[i] === g2[i]) match++;
  }
  return match / 1024;
}

function getDominantHex(png) {
  const counts = {};
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] > 50) {
      const hex = '#' + [png.data[i], png.data[i + 1], png.data[i + 2]].map(x => x.toString(16).padStart(2, '0')).join('');
      counts[hex] = (counts[hex] || 0) + 1;
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '#4A2E35';
}

// Discover all PNGs
function getAllPngs() {
  const list = [];
  function walk(dir) {
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (item !== 'svg') walk(full);
      } else if (item.toLowerCase().endsWith('.png')) {
        list.push(full);
      }
    }
  }
  walk(KDO_LIB_DIR);
  return list;
}

// K-Means clustering for multi-layer vectorization
function runKMeans(pixels, k, iterations = 8) {
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

// Convert multicolor floral
async function convertMulticolorAsset(srcPath, destPath) {
  const origData = fs.readFileSync(srcPath);
  const origPng = PNG.sync.read(origData);
  const { width: origW, height: origH } = origPng;

  // Adaptive scale: small images get upscaled, large images stay 1.0x-1.25x
  const scale = origW < 350 ? 2.2 : (origW < 700 ? 1.5 : 1.0);
  const upPng = scale > 1.0 ? upscalePng(origPng, scale) : origPng;
  const { width, height } = upPng;

  // Extract non-transparent pixels
  const pixels = [];
  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const a = upPng.data[idx + 3];
      if (a > 35) {
        pixels.push([upPng.data[idx], upPng.data[idx + 1], upPng.data[idx + 2]]);
        mask[width * y + x] = 1;
      }
    }
  }

  if (pixels.length < 10) return null;

  // Determine layer count (10-18 layers)
  const numLayers = Math.min(18, Math.max(10, Math.floor(pixels.length / 4000)));
  const centroids = runKMeans(pixels, numLayers);
  centroids.sort((a, b) => a.luminance - b.luminance);

  // Assign pixels
  const layerMasks = Array.from({ length: centroids.length }, () => new Uint8Array(width * height));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const a = upPng.data[idx + 3];
      if (a > 35) {
        const r = upPng.data[idx];
        const g = upPng.data[idx + 1];
        const b = upPng.data[idx + 2];

        let bestDist = Infinity;
        let bestIdx = 0;
        for (let l = 0; l < centroids.length; l++) {
          const d = colorDist(r, g, b, centroids[l].r, centroids[l].g, centroids[l].b);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = l;
          }
        }
        layerMasks[bestIdx][width * y + x] = 1;
      }
    }
  }

  const paths = [];

  // Underfill base: midtone centroid
  const baseColor = centroids[Math.floor(centroids.length / 2)].hex;
  const baseSvg = await traceMaskToPath(mask, width, height, baseColor, { turdSize: 3 });
  if (baseSvg) paths.push(`  <!-- Underfill Base Silhouette -->\n  ${baseSvg}`);

  // Trace layers (dilate lower layers to avoid seams)
  for (let l = 0; l < centroids.length; l++) {
    const isUpper = l >= centroids.length - 2;
    const m = isUpper ? layerMasks[l] : dilateMask(layerMasks[l], width, height);
    const pSvg = await traceMaskToPath(m, width, height, centroids[l].hex, {
      turdSize: 2,
      optTolerance: 0.16
    });
    if (pSvg) {
      paths.push(`  <!-- Layer ${l + 1}: ${centroids[l].hex} -->\n  ${pSvg}`);
    }
  }

  const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${origW}" height="${origH}" viewBox="0 0 ${width} ${height}">
${paths.join("\n")}
</svg>`;

  const optimized = optimize(rawSvg, {
    multipass: true,
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            cleanupNumericValues: { floatPrecision: 2 }
          }
        }
      }
    ]
  });

  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(destPath, optimized.data, "utf8");

  return {
    layers: centroids.length,
    palette: centroids.map(c => c.hex),
    size: fs.statSync(destPath).size
  };
}

async function main() {
  console.log("=================================================================");
  console.log("  BATCH CONVERSION PIPELINE: KDO-LIBRARY");
  console.log("=================================================================");

  const pngFiles = getAllPngs();
  console.log(`Found ${pngFiles.length} PNG assets to process.\n`);

  const inventory = [];
  const monoShapeGroups = [];

  // Phase 1: Classification & Shape Hashing
  console.log("Phase 1: Classifying & computing shape hashes...");
  for (const f of pngFiles) {
    const buf = fs.readFileSync(f);
    const png = PNG.sync.read(buf);
    const rel = path.relative(KDO_LIB_DIR, f).replace(/\\\\/g, "/");

    const colorSet = new Set();
    for (let i = 0; i < png.data.length; i += 8) {
      if (png.data[i + 3] > 35) {
        const qr = Math.round(png.data[i] / 16);
        const qg = Math.round(png.data[i + 1] / 16);
        const qb = Math.round(png.data[i + 2] / 16);
        colorSet.add((qr << 8) | (qg << 4) | qb);
      }
    }

    const isMono = colorSet.size <= 8;
    const domHex = isMono ? getDominantHex(png) : "multicolor";
    const hash = isMono ? getShapeHash(png) : null;
    const aspect = (png.width / png.height).toFixed(2);
    const baseName = path.basename(rel, ".png");

    const item = {
      absPath: f,
      relPath: rel,
      baseName,
      width: png.width,
      height: png.height,
      aspect,
      isMono,
      colorCount: colorSet.size,
      domHex,
      hash
    };

    inventory.push(item);

    // Group mono shapes
    if (isMono) {
      let matched = false;
      for (const g of monoShapeGroups) {
        const aspectDiff = Math.abs(parseFloat(aspect) - parseFloat(g.lead.aspect));
        if (aspectDiff < 0.15) {
          const sim = compareGrids(hash, g.lead.hash);
          if (sim > 0.94) {
            g.members.push(item);
            matched = true;
            break;
          }
        }
      }
      if (!matched) {
        monoShapeGroups.push({
          id: `shape_${monoShapeGroups.length + 1}_${baseName}`,
          lead: item,
          members: [item]
        });
      }
    }
  }

  console.log(`Classified: ${inventory.filter(i => i.isMono).length} Monochrome vs ${inventory.filter(i => !i.isMono).length} Multicolor.`);
  console.log(`Identified ${monoShapeGroups.length} unique shapes among monochrome assets (Deduplicated from ${inventory.filter(i => i.isMono).length}).\n`);

  // Phase 2: Convert Monochrome Assets & Shared Master Assets
  console.log("Phase 2: Converting Monochrome Assets & Shared Masters...");
  const conversionRecords = [];

  for (const group of monoShapeGroups) {
    const lead = group.lead;
    const leadBuf = fs.readFileSync(lead.absPath);

    // Trace lead shape with fill="currentColor"
    const masterSvgData = await traceMonochrome(leadBuf, lead.domHex);
    if (!masterSvgData) continue;

    // Save to shared master
    const sharedFileName = `${group.id}.svg`;
    const sharedPath = path.join(SHARED_OUT_DIR, sharedFileName);
    fs.writeFileSync(sharedPath, masterSvgData, "utf8");

    // For each member, write theme-specific SVG retaining their authentic default color
    for (const member of group.members) {
      const memberSvgPath = path.join(SVG_OUT_DIR, member.relPath.replace(/\.png$/i, ".svg"));
      const memberDir = path.dirname(memberSvgPath);
      if (!fs.existsSync(memberDir)) fs.mkdirSync(memberDir, { recursive: true });

      // Substitute member's default color
      const customSvg = masterSvgData.replace(/style="color: var\(--ornament-color, [^)]+\)"/, `style="color: var(--ornament-color, ${member.domHex})"`);
      fs.writeFileSync(memberSvgPath, customSvg, "utf8");

      conversionRecords.push({
        relPath: member.relPath,
        type: "Monochrome",
        sharedMaster: `shared/${sharedFileName}`,
        isMasterLead: member === lead,
        variantCount: group.members.length,
        defaultHex: member.domHex,
        svgPath: path.relative(KDO_LIB_DIR, memberSvgPath).replace(/\\\\/g, "/"),
        width: member.width,
        height: member.height,
        svgSize: (fs.statSync(memberSvgPath).size / 1024).toFixed(1) + " KB",
        pngSize: (fs.statSync(member.absPath).size / 1024).toFixed(1) + " KB"
      });
    }
  }

  // Phase 3: Convert Multicolor Assets
  console.log("\nPhase 3: Converting Multicolor Floral Assets...");
  const multiItems = inventory.filter(i => !i.isMono);
  let processedMulti = 0;

  for (const item of multiItems) {
    processedMulti++;
    const destSvgPath = path.join(SVG_OUT_DIR, item.relPath.replace(/\.png$/i, ".svg"));
    process.stdout.write(`[${processedMulti}/${multiItems.length}] ${item.relPath} (${item.width}x${item.height})... `);

    // If already converted with special high-fidelity (kdo1, kdo3, kdo4, kdo6, kdo21), keep existing
    const existingSpecial = ["kdo1/rsvp-flower.png", "kdo3/rsvp-flower.png", "kdo4/bride-flower.png", "kdo6/event-flower.png", "kdo21/bride-flower.png"];
    if (existingSpecial.includes(item.relPath.replace(/\\\\/g, "/")) && fs.existsSync(destSvgPath)) {
      console.log("Already High-Fidelity (Preserved)");
      conversionRecords.push({
        relPath: item.relPath,
        type: "Multicolor",
        sharedMaster: "-",
        isMasterLead: true,
        variantCount: 1,
        defaultHex: "Multicolor",
        svgPath: path.relative(KDO_LIB_DIR, destSvgPath).replace(/\\\\/g, "/"),
        width: item.width,
        height: item.height,
        svgSize: (fs.statSync(destSvgPath).size / 1024).toFixed(1) + " KB",
        pngSize: (fs.statSync(item.absPath).size / 1024).toFixed(1) + " KB"
      });
      continue;
    }

    try {
      const res = await convertMulticolorAsset(item.absPath, destSvgPath);
      if (res) {
        console.log(`OK (${res.layers} layers, ${(res.size / 1024).toFixed(1)} KB)`);
        conversionRecords.push({
          relPath: item.relPath,
          type: "Multicolor",
          sharedMaster: "-",
          isMasterLead: true,
          variantCount: 1,
          defaultHex: "Multicolor",
          svgPath: path.relative(KDO_LIB_DIR, destSvgPath).replace(/\\\\/g, "/"),
          width: item.width,
          height: item.height,
          svgSize: (res.size / 1024).toFixed(1) + " KB",
          pngSize: (fs.statSync(item.absPath).size / 1024).toFixed(1) + " KB"
        });
      } else {
        console.log("Skipped (Empty/Failed)");
      }
    } catch (err) {
      console.log("Error:", err.message);
    }
  }

  console.log(`\nConversion finished! Total SVGs created/cataloged: ${conversionRecords.length}`);

  // Phase 4: Generate Interactive Master Catalog HTML
  console.log("\nPhase 4: Generating Master Catalog HTML...");
  generateMasterCatalogHtml(conversionRecords, monoShapeGroups);
}

function generateMasterCatalogHtml(records, monoShapeGroups) {
  const monoRecords = records.filter(r => r.type === "Monochrome");
  const multiRecords = records.filter(r => r.type === "Multicolor");

  // Generate rows for table
  const monoRowsHtml = monoRecords.map((r, idx) => {
    const fullSvgPath = path.join(SVG_OUT_DIR, r.relPath.replace(/\.png$/i, ".svg"));
    let svgSnippet = "";
    try {
      const content = fs.readFileSync(fullSvgPath, "utf8");
      // Clean snippet for thumbnail
      svgSnippet = content.replace(/<svg\b([^>]*)>/i, '<svg $1 class="thumb-svg">');
    } catch(e) {
      svgSnippet = `<span style="font-size:10px;color:#888;">Error</span>`;
    }

    const relToCatalog = r.relPath.replace(/\.png$/i, ".svg").replace(/\\/g, "/");

    return `
    <tr class="asset-row" data-type="monochrome" data-search="${r.relPath.toLowerCase().replace(/\\/g, '/')}">
      <td class="idx-col">${idx + 1}</td>
      <td class="name-col">
        <a href="${relToCatalog}" target="_blank" class="asset-link">
          <strong>${r.relPath.replace(/\\/g, '/')}</strong>
        </a>
        ${r.variantCount > 1 ? `<span class="tag tag-variant">${r.variantCount} Shared Variants</span>` : ""}
      </td>
      <td class="preview-col">
        <div class="thumb-box mono-thumb">
          ${svgSnippet}
        </div>
      </td>
      <td class="color-col">
        <div class="color-chip">
          <span class="color-dot" style="background: ${r.defaultHex}"></span>
          <code>${r.defaultHex}</code>
        </div>
      </td>
      <td class="dim-col">${r.width} × ${r.height}</td>
      <td class="size-col">
        <span class="size-png">${r.pngSize}</span> → <span class="size-svg">${r.svgSize}</span>
      </td>
      <td class="master-col">
        <a href="${r.sharedMaster}" target="_blank" class="shared-link"><code>${r.sharedMaster}</code></a>
      </td>
    </tr>
  `;
  }).join("");

  const multiRowsHtml = multiRecords.map((r, idx) => {
    const fullSvgPath = path.join(SVG_OUT_DIR, r.relPath.replace(/\.png$/i, ".svg"));
    let svgSnippet = "";
    try {
      const content = fs.readFileSync(fullSvgPath, "utf8");
      // If content is very large (> 2MB), use an img tag with relative path to keep catalog fast
      if (content.length > 1500000) {
        const relPathClean = r.relPath.replace(/\.png$/i, ".svg").replace(/\\/g, "/");
        svgSnippet = `<img src="${relPathClean}" class="thumb-svg" alt="SVG Preview" />`;
      } else {
        svgSnippet = content.replace(/<svg\b([^>]*)>/i, '<svg $1 class="thumb-svg">');
      }
    } catch(e) {
      svgSnippet = `<span style="font-size:10px;color:#888;">Error</span>`;
    }

    const relToCatalog = r.relPath.replace(/\.png$/i, ".svg").replace(/\\/g, "/");

    return `
    <tr class="asset-row" data-type="multicolor" data-search="${r.relPath.toLowerCase().replace(/\\/g, '/')}">
      <td class="idx-col">${idx + 1}</td>
      <td class="name-col">
        <a href="${relToCatalog}" target="_blank" class="asset-link">
          <strong>${r.relPath.replace(/\\/g, '/')}</strong>
        </a>
        <span class="tag tag-multi">Multicolor Vector</span>
      </td>
      <td class="preview-col">
        <div class="thumb-box multi-thumb">
          ${svgSnippet}
        </div>
      </td>
      <td class="color-col">
        <span class="tag tag-palette">Multi-Layer Spectrum</span>
      </td>
      <td class="dim-col">${r.width} × ${r.height}</td>
      <td class="size-col">
        <span class="size-png">${r.pngSize}</span> → <span class="size-svg">${r.svgSize}</span>
      </td>
      <td class="master-col">
        <em>Unique Botanical</em>
      </td>
    </tr>
  `;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HariKita - Master Catalog SVG (kdo-library)</title>
  <style>
    :root {
      --bg-dark: #0f1015;
      --card-bg: #181920;
      --card-border: #262732;
      --accent: #C5A880;
      --accent-glow: rgba(197, 168, 128, 0.2);
      --text: #f0f0f5;
      --text-muted: #8c8c9e;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg-dark);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 2rem;
      line-height: 1.5;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    header {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    h1 { color: var(--accent); font-size: 2rem; margin-bottom: 0.25rem; }
    p.subtitle { color: var(--text-muted); font-size: 0.95rem; }
    
    .stats-bar {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.75rem 1.25rem;
      text-align: center;
    }
    .stat-val { font-size: 1.4rem; font-weight: 700; color: #fff; }
    .stat-lbl { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }

    /* Interactive Color Playground */
    .playground-box {
      background: #14151b;
      border: 1px solid var(--accent);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px var(--accent-glow);
    }
    .playground-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .playground-title { font-weight: 600; color: var(--accent); display: flex; align-items: center; gap: 0.5rem; }
    .color-swatches {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .swatch-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform 0.2s, border-color 0.2s;
    }
    .swatch-btn:hover { transform: scale(1.15); border-color: #fff; }
    .custom-picker {
      background: transparent;
      border: 1px solid #444;
      border-radius: 4px;
      width: 32px;
      height: 32px;
      cursor: pointer;
      padding: 0;
    }
    .playground-hint { font-size: 0.85rem; color: var(--text-muted); }

    /* Filter & Search */
    .controls-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      align-items: center;
    }
    .search-input {
      flex: 1;
      min-width: 250px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.6rem 1rem;
      color: #fff;
      font-size: 0.95rem;
    }
    .search-input:focus { outline: none; border-color: var(--accent); }
    .filter-tabs {
      display: flex;
      background: var(--card-bg);
      border-radius: 8px;
      padding: 0.25rem;
      border: 1px solid var(--card-border);
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.45rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .tab-btn.active { background: #262733; color: #fff; }

    /* Table */
    .table-container {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      overflow-x: auto;
      box-shadow: 0 4px 24px rgba(0,0,0,0.3);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
    }
    th {
      background: #1e1f28;
      padding: 0.85rem 1rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--card-border);
    }
    td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      vertical-align: middle;
    }
    tr:hover td { background: rgba(255,255,255,0.02); }
    
    .idx-col { color: var(--text-muted); width: 40px; }
    .name-col { font-family: monospace; font-size: 0.9rem; }
    .thumb-box {
      width: 64px;
      height: 64px;
      background: #090a0d;
      background-image: 
        linear-gradient(45deg, #111218 25%, transparent 25%), 
        linear-gradient(-45deg, #111218 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, #111218 75%), 
        linear-gradient(-45deg, transparent 75%, #111218 75%);
      background-size: 12px 12px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 1px solid #2a2b36;
      padding: 4px;
    }
    .thumb-svg { width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
    
    .tag {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 600;
      margin-left: 0.4rem;
    }
    .tag-variant { background: #1c3325; color: #4ade80; border: 1px solid #285437; }
    .tag-multi { background: #3b281c; color: #fb923c; border: 1px solid #5a3a24; }
    .tag-palette { background: #2a2236; color: #c084fc; }

    .color-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .color-dot {
      width: 14px;
      height: 14px;
      border-radius: 3px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .size-png { color: #eab308; }
    .size-svg { color: #22c55e; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>🎨 Master Catalog SVG: kdo-library</h1>
        <p class="subtitle">Seluruh aset ornamen PNG telah berhasil dikonversi menjadi SVG vektor murni (0% raster embedding, 100% scalable).</p>
      </div>
      <div class="stats-bar">
        <div class="stat-card">
          <div class="stat-val">${records.length}</div>
          <div class="stat-lbl">Total SVG</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${monoRecords.length}</div>
          <div class="stat-lbl">1-Color Line Art</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${monoShapeGroups.length}</div>
          <div class="stat-lbl">Unique Shared Shapes</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${multiRecords.length}</div>
          <div class="stat-lbl">Multicolor Floral</div>
        </div>
      </div>
    </header>

    <!-- Interactive Color Playground for 1-Color Assets -->
    <div class="playground-box">
      <div class="playground-header">
        <div class="playground-title">
          <span>✨ Uji Coba Kustomisasi Warna Live (Untuk Aset 1 Warna / fill="currentColor")</span>
        </div>
        <div class="color-swatches">
          <span style="font-size: 0.8rem; color: #bbb;">Preset:</span>
          <button class="swatch-btn" style="background: #C5A880;" title="Gilded Gold" onclick="applyCustomColor('#C5A880')"></button>
          <button class="swatch-btn" style="background: #C03F57;" title="Crimson Red" onclick="applyCustomColor('#C03F57')"></button>
          <button class="swatch-btn" style="background: #2D6A4F;" title="Emerald Green" onclick="applyCustomColor('#2D6A4F')"></button>
          <button class="swatch-btn" style="background: #2563EB;" title="Royal Navy Blue" onclick="applyCustomColor('#2563EB')"></button>
          <button class="swatch-btn" style="background: #7E22CE;" title="Amethyst Purple" onclick="applyCustomColor('#7E22CE')"></button>
          <button class="swatch-btn" style="background: #111827; border: 1px solid #555;" title="Charcoal Black" onclick="applyCustomColor('#111827')"></button>
          <button class="swatch-btn" style="background: #F3EDE6;" title="Alabaster White" onclick="applyCustomColor('#F3EDE6')"></button>
          <input type="color" id="picker" class="custom-picker" value="#C5A880" onchange="applyCustomColor(this.value)" title="Pilih Warna Bebas" />
          <button onclick="resetColors()" style="margin-left: 0.5rem; background: #262733; color: #fff; border: 1px solid #444; border-radius: 4px; padding: 0.3rem 0.6rem; font-size: 0.75rem; cursor: pointer;">Reset Default</button>
        </div>
      </div>
      <p class="playground-hint">Klik preset warna di atas untuk melihat seluruh aset monokrom di tabel bawah berubah warna seketika secara live berkat dukungan <code>fill="currentColor"</code>!</p>
    </div>

    <!-- Controls -->
    <div class="controls-row">
      <input type="text" id="searchInput" class="search-input" placeholder="🔍 Cari aset berdasarkan nama atau tema (contoh: kdo16, divider, frame, rsvp)..." oninput="filterAssets()">
      <div class="filter-tabs">
        <button class="tab-btn active" id="tabAll" onclick="setTab('all')">Semua (${records.length})</button>
        <button class="tab-btn" id="tabMono" onclick="setTab('monochrome')">1 Warna / Line Art (${monoRecords.length})</button>
        <button class="tab-btn" id="tabMulti" onclick="setTab('multicolor')">Banyak Warna / Floral (${multiRecords.length})</button>
      </div>
    </div>

    <!-- Catalog Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th class="idx-col">#</th>
            <th>Nama Aset &amp; Path</th>
            <th>Preview SVG</th>
            <th>Warna Default</th>
            <th>Resolusi</th>
            <th>Ukuran (PNG → SVG)</th>
            <th>Master Shared Component</th>
          </tr>
        </thead>
        <tbody id="assetTbody">
          ${monoRowsHtml}
          ${multiRowsHtml}
        </tbody>
      </table>
    </div>
  </div>

  <script>
    let activeTab = 'all';

    function setTab(tab) {
      activeTab = tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      if (tab === 'all') document.getElementById('tabAll').classList.add('active');
      if (tab === 'monochrome') document.getElementById('tabMono').classList.add('active');
      if (tab === 'multicolor') document.getElementById('tabMulti').classList.add('active');
      filterAssets();
    }

    function filterAssets() {
      const q = document.getElementById('searchInput').value.toLowerCase().trim();
      const rows = document.querySelectorAll('.asset-row');
      rows.forEach(r => {
        const type = r.getAttribute('data-type');
        const search = r.getAttribute('data-search');
        const matchTab = activeTab === 'all' || type === activeTab;
        const matchSearch = !q || search.includes(q);
        r.style.display = matchTab && matchSearch ? '' : 'none';
      });
    }

    function applyCustomColor(hex) {
      document.querySelectorAll('.mono-thumb svg').forEach(svg => {
        svg.style.color = hex;
      });
    }

    function resetColors() {
      document.querySelectorAll('.mono-thumb svg').forEach(svg => {
        svg.style.color = '';
      });
    }
  </script>
</body>
</html>`;

  const catalogPath = path.join(SVG_OUT_DIR, "master_catalog.html");
  fs.writeFileSync(catalogPath, html, "utf8");
  console.log(`SUCCESS: Master Catalog HTML generated at: ${catalogPath}`);
}

main().catch(console.error);
