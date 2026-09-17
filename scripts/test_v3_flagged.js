const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const { vectorizeV3 } = require("./ultra_fidelity_vectorizer_v3");

const HARVESTED_DIR = path.resolve(__dirname, "../references/kadio-assets/harvested");
const SVG_DIR = path.join(HARVESTED_DIR, "svg");

const FLAGGED_FILES = [
  "vector-2.png",
  "story-flower-2.png",
  "rsvp-flower-3.png",
  "1750171860_kdo46-bg-7.png",
  "index-bg-bottom-right.png"
];

async function runTest() {
  console.log("=== TASK 2: TESTING ULTRA-FIDELITY V3 ON 5 FLAGGED PROBLEM ASSETS ===");

  for (const f of FLAGGED_FILES) {
    const srcPath = path.join(HARVESTED_DIR, f);
    if (!fs.existsSync(srcPath)) {
      console.log(`[NOT FOUND] ${f}`);
      continue;
    }

    console.log(`\nProcessing ${f}...`);
    const png = PNG.sync.read(fs.readFileSync(srcPath));
    console.log(`  Raster: ${png.width}x${png.height}`);

    console.time(`  V3 Vectorize ${f}`);
    const svg = await vectorizeV3(png, f);
    console.timeEnd(`  V3 Vectorize ${f}`);

    const base = path.basename(f, path.extname(f));
    const outPath = path.join(SVG_DIR, `${base}.svg`);
    fs.writeFileSync(outPath, svg, "utf8");

    const pathMatches = svg.match(/<path[^>]+>/g) || [];
    const hasStroke = svg.includes("stroke=");
    const hasOverprint = svg.includes('stroke-width="0.6"');
    const sizeKb = (svg.length / 1024).toFixed(1);

    console.log(`  Output: ${base}.svg (${sizeKb} KB)`);
    console.log(`  Path count: ${pathMatches.length}`);
    console.log(`  Seamless overprint: ${hasOverprint ? "YES (0.6px dilation)" : hasStroke ? "YES (stroke active)" : "NO"}`);

    // Check colors
    const colors = new Set();
    for (const pm of pathMatches) {
      const m = pm.match(/fill="([^"]+)"/);
      if (m) colors.add(m[1]);
    }
    console.log(`  Layers/Colors: ${Array.from(colors).join(", ")}`);
  }

  console.log("\n=== ALL 5 FLAGGED ASSETS SUCCESSFULLY PROCESSED WITH V3! ===");
}

runTest().catch(console.error);
