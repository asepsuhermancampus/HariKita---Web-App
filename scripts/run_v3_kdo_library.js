const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const { vectorizeV3, rgbToHex } = require("./ultra_fidelity_vectorizer_v3");

const KDO_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library");
const KDO_SVG_DIR = path.join(KDO_DIR, "svg");

function scanPngs(dir) {
  let list = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.name === "svg") continue; // skip the output svg dir
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      list = list.concat(scanPngs(full));
    } else if (ent.name.endsWith(".png")) {
      list.push(full);
    }
  }
  return list;
}

async function runKdoLibraryV3() {
  console.log("=== TASK 4: BATCH RE-VECTORIZATION OF KDO-LIBRARY (kdo1 to kdo33) WITH V3 ENGINE ===");
  const pngFiles = scanPngs(KDO_DIR);
  console.log(`Found ${pngFiles.length} original PNGs across kdo-library to re-vectorize with V3.\n`);

  let count = 0;
  for (const p of pngFiles) {
    count++;
    const rel = path.relative(KDO_DIR, p);
    const kdoFolder = path.dirname(rel); // e.g. kdo1
    const filename = path.basename(p);   // e.g. rsvp-flower.png
    const base = path.basename(filename, ".png");

    const targetDir = path.join(KDO_SVG_DIR, kdoFolder);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const targetSvgPath = path.join(targetDir, `${base}.svg`);

    const png = PNG.sync.read(fs.readFileSync(p));

    let transparent = 0;
    for (let i = 0; i < png.data.length; i += 16) {
      if (png.data[i + 3] < 30) transparent++;
    }
    const pctTrans = (transparent / (png.data.length / 16)) * 100;
    const isSolid = pctTrans < 5;

    let svgContent = "";
    if (isSolid) {
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
    } else {
      svgContent = await vectorizeV3(png, filename);
    }

    fs.writeFileSync(targetSvgPath, svgContent, "utf8");
    const sizeKb = (svgContent.length / 1024).toFixed(1);
    const hasCurrentColor = svgContent.includes("currentColor");
    console.log(`[${count}/${pngFiles.length}] [${kdoFolder}] ${base}.svg (${png.width}x${png.height}) -> ${sizeKb} KB ${hasCurrentColor ? "[REAKTIF TEMA]" : "[MULTICOLOR]"}`);
  }

  console.log(`\n=== TASK 4 COMPLETE: ALL ${pngFiles.length} KDO-LIBRARY ASSETS RE-VECTORIZED WITH V3! ===`);
}

runKdoLibraryV3().catch((err) => {
  console.error("kdo-library V3 error:", err);
  process.exit(1);
});
