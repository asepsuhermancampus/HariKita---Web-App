const potrace = require("potrace");
const { optimize } = require("svgo");
const fs = require("fs");
const path = require("path");

const KDO_LIB_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library");
const SVG_OUT_BASE = path.join(KDO_LIB_DIR, "svg");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(SVG_OUT_BASE);

const testTargets = [
  { kdo: "kdo17", file: "divider.png", desc: "Line-art Horizontal Divider" },
  { kdo: "kdo17", file: "frame-bride.png", desc: "Arch Oval Bride Frame" },
  { kdo: "kdo16", file: "divider.png", desc: "Long Regal Keraton Divider" },
  { kdo: "kdo4", file: "bride-flower.png", desc: "Corner Botanical Flower" },
  { kdo: "kdo10", file: "frame.png", desc: "Ornate Card Frame (High-Res)" },
];

function traceAndOptimize(srcPath, destPath, customParams = {}) {
  return new Promise((resolve, reject) => {
    const defaultParams = {
      optCurve: true,
      optTolerance: 0.2,
      turdSize: 2,
      color: "currentColor",
      ...customParams,
    };

    potrace.trace(srcPath, defaultParams, (err, rawSvg) => {
      if (err) return reject(err);

      // Optimize with SVGO
      const result = optimize(rawSvg, {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
        ],
      });

      ensureDir(path.dirname(destPath));
      // Ensure SVG has fill="none" and uses viewBox with currentColor
      let finalSvg = result.data;
      fs.writeFileSync(destPath, finalSvg, "utf8");

      const origStat = fs.statSync(srcPath);
      const svgStat = fs.statSync(destPath);
      resolve({
        srcSize: origStat.size,
        svgSize: svgStat.size,
        reduction: ((1 - svgStat.size / origStat.size) * 100).toFixed(1) + "%",
      });
    });
  });
}

async function run() {
  console.log("=== EXECUTING PHASE 1: 5 REPRESENTATIVE ASSET CONVERSIONS ===");
  const results = [];

  for (const t of testTargets) {
    const srcPath = path.join(KDO_LIB_DIR, t.kdo, t.file);
    const destName = t.file.replace(/\.png$/i, ".svg");
    const destPath = path.join(SVG_OUT_BASE, t.kdo, destName);

    if (!fs.existsSync(srcPath)) {
      console.error(`[!] Missing: ${srcPath}`);
      continue;
    }

    process.stdout.write(`Converting [${t.kdo}] ${t.file} (${t.desc})... `);
    try {
      const res = await traceAndOptimize(srcPath, destPath);
      console.log(`SUCCESS!`);
      console.log(`   PNG: ${(res.srcSize / 1024).toFixed(1)} KB -> SVG: ${(res.svgSize / 1024).toFixed(1)} KB (Optimization: ${res.reduction})`);
      results.push({
        source: `${t.kdo}/${t.file}`,
        output: `svg/${t.kdo}/${destName}`,
        status: "SUCCESS",
        originalSize: (res.srcSize / 1024).toFixed(1) + " KB",
        svgSize: (res.svgSize / 1024).toFixed(1) + " KB",
        optimization: res.reduction,
        destPath,
      });
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      results.push({
        source: `${t.kdo}/${t.file}`,
        output: "-",
        status: "FAILED: " + err.message,
      });
    }
  }

  // Validate results
  console.log("\n=== VALIDATION CHECKS ===");
  for (const r of results) {
    if (r.status === "SUCCESS") {
      const content = fs.readFileSync(r.destPath, "utf8");
      const hasViewBox = content.includes("viewBox");
      const hasRaster = content.includes("<image") || content.includes("base64");
      const hasPaths = content.includes("<path");
      const hasCurrentColor = content.includes("currentColor");

      console.log(`Validation for ${r.output}:`);
      console.log(`  - Valid viewBox: ${hasViewBox ? "PASS" : "FAIL"}`);
      console.log(`  - Pure vector (no raster/base64): ${!hasRaster ? "PASS" : "FAIL"}`);
      console.log(`  - Contains vector paths: ${hasPaths ? "PASS" : "FAIL"}`);
      console.log(`  - Color customizable (currentColor): ${hasCurrentColor ? "PASS" : "FAIL"}`);
    }
  }

  console.log("\n=== PHASE 1 TEST SUMMARY TABLE ===");
  console.table(results.map(r => ({
    Source: r.source,
    Output: r.output,
    Status: r.status,
    "Original Size": r.originalSize,
    "SVG Size": r.svgSize,
    Optimization: r.optimization,
  })));
}

run().catch(console.error);
