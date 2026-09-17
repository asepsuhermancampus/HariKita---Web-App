const fs = require("fs");
const path = require("path");

const SVG_DIR = path.resolve(__dirname, "../references/kadio-assets/harvested/svg");
const files = fs.readdirSync(SVG_DIR).filter(f => f.endsWith(".svg") && !f.startsWith("test_"));

console.log("=== COMPREHENSIVE V2 VERIFICATION REPORT (280 HARVESTED ASSETS) ===");
console.log(`Total SVGs in directory: ${files.length}`);

let failRaster = 0;
let failEmpty = 0;
let totalPaths = 0;
let monoCount = 0;
let multiCount = 0;
let bgCount = 0;

for (const f of files) {
  const p = path.join(SVG_DIR, f);
  const content = fs.readFileSync(p, "utf8");

  const hasImage = /<image/i.test(content);
  const hasBase64 = /base64/i.test(content);
  if (hasImage || hasBase64) failRaster++;

  const pathCount = (content.match(/<path/gi) || []).length;
  const rectCount = (content.match(/<rect/gi) || []).length;
  if (pathCount === 0 && rectCount === 0) failEmpty++;

  totalPaths += pathCount;

  if (content.includes("currentColor") || content.includes("--ornament-color")) {
    monoCount++;
  } else if (content.includes("<rect") && content.includes("linearGradient")) {
    bgCount++;
  } else {
    multiCount++;
  }
}

console.log(`\n1. Integrity Checks:`);
console.log(`  - 100% Pure Vector (0 raster, 0 base64): ${failRaster === 0 ? "PASSED (0 raster found)" : `FAILED (${failRaster} files)`}`);
console.log(`  - Valid SVG Shapes (0 empty): ${failEmpty === 0 ? "PASSED (all files have vector paths/rects)" : `FAILED (${failEmpty} files)`}`);
console.log(`  - Total Vector Paths: ${totalPaths.toLocaleString()}`);

console.log(`\n2. Asset Category Distribution:`);
console.log(`  - Multicolor Floral / Illustration: ${multiCount}`);
console.log(`  - Monochrome / Line Art / Dividers: ${monoCount}`);
console.log(`  - Wallpaper / Gradient Backgrounds: ${bgCount}`);

console.log(`\n3. Deep-Check Flagged Assets:`);
const flagged = [
  "1754671596_kdo55-bg-8.svg",
  "1754648453_kdo54-bg-3.svg",
  "bg-bride-flower-3.svg",
  "bg-bride-flower-1.svg",
  "bg-bride-flower-2.svg",
  "rsvp-flower-3.svg"
];

for (const f of flagged) {
  const p = path.join(SVG_DIR, f);
  if (!fs.existsSync(p)) {
    console.log(`  [MISSING] ${f}`);
    continue;
  }
  const content = fs.readFileSync(p, "utf8");
  const pathMatches = content.match(/<path[^>]+>/g) || [];
  const colors = new Set();
  for (const pm of pathMatches) {
    const m = pm.match(/fill="([^"]+)"/);
    if (m) colors.add(m[1]);
  }
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
  const vb = viewBoxMatch ? viewBoxMatch[1] : "none";
  const sizeKb = (content.length / 1024).toFixed(1);

  console.log(`  - [${f}]:`);
  console.log(`      Size: ${sizeKb} KB | ViewBox: ${vb}`);
  console.log(`      Layers: ${pathMatches.length} paths | Colors: ${Array.from(colors).join(", ")}`);
}
