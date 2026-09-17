const fs = require("fs");
const path = require("path");

const HARVESTED_SVG = path.resolve(__dirname, "../references/kadio-assets/harvested/svg");
const KDO_SVG = path.resolve(__dirname, "../references/kadio-assets/kdo-library/svg");

function scanSvgs(dir) {
  let list = [];
  if (!fs.existsSync(dir)) return list;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      list = list.concat(scanSvgs(full));
    } else if (ent.name.endsWith(".svg") && !ent.name.startsWith("test_")) {
      list.push(full);
    }
  }
  return list;
}

function verifyBatch(name, dir) {
  console.log(`\n======================================================`);
  console.log(`VERIFYING BATCH: ${name}`);
  console.log(`Directory: ${dir}`);
  console.log(`======================================================`);

  const files = scanSvgs(dir);
  console.log(`Total SVGs found: ${files.length}`);

  let failRaster = 0;
  let failEmpty = 0;
  let totalPaths = 0;
  let seamlessOverprints = 0;
  let reactiveCurrentColor = 0;

  for (const f of files) {
    const c = fs.readFileSync(f, "utf8");
    const hasImage = /<image/i.test(c);
    const hasBase64 = /base64/i.test(c);
    if (hasImage || hasBase64) failRaster++;

    const pathCount = (c.match(/<path/gi) || []).length;
    const rectCount = (c.match(/<rect/gi) || []).length;
    if (pathCount === 0 && rectCount === 0) failEmpty++;

    totalPaths += pathCount;

    if (c.includes('stroke-width="0.6"') || c.includes('stroke-width="0.5"')) {
      seamlessOverprints++;
    }

    if (c.includes("currentColor")) {
      reactiveCurrentColor++;
    }
  }

  console.log(`1. 100% Pure Vector (0 raster, 0 base64): ${failRaster === 0 ? "PASSED (0 raster)" : `FAILED (${failRaster} files)`}`);
  console.log(`2. Valid Shapes (0 empty files): ${failEmpty === 0 ? "PASSED (all files have paths/rects)" : `FAILED (${failEmpty} files)`}`);
  console.log(`3. Total Vector Paths: ${totalPaths.toLocaleString()}`);
  console.log(`4. Seamless Overprint Dilated (Anti-Seam): ${seamlessOverprints} files`);
  console.log(`5. Reactive Tema (currentColor): ${reactiveCurrentColor} files`);
}

function runAll() {
  console.log("=== COMPREHENSIVE END-TO-END V3 VERIFICATION (HARVESTED & KDO-LIBRARY) ===");
  verifyBatch("1. HARVESTED ASSETS (DEEP CRAWL)", HARVESTED_SVG);
  verifyBatch("2. KDO-LIBRARY MASTER ASSETS (kdo1 to kdo33)", KDO_SVG);
  console.log(`\n======================================================`);
  console.log("ALL VERIFICATIONS COMPLETED!");
  console.log(`======================================================\n`);
}

runAll();
