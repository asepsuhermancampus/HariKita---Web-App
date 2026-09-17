const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const KDO_LIB_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library");
const subdirs = fs.readdirSync(KDO_LIB_DIR).filter(d => d.startsWith("kdo") && fs.statSync(path.join(KDO_LIB_DIR, d)).isDirectory() && d !== "svg");

subdirs.sort((a, b) => {
  const numA = parseInt(a.replace("kdo", "")) || 0;
  const numB = parseInt(b.replace("kdo", "")) || 0;
  return numA - numB;
});

const anomalies = [];
const allAssets = [];

for (const d of subdirs) {
  const dirPath = path.join(KDO_LIB_DIR, d);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".png"));
  for (const f of files) {
    const filePath = path.join(dirPath, f);
    const png = PNG.sync.read(fs.readFileSync(filePath));
    const base = path.basename(f, ".png");
    const rel = path.join(d, f).replace(/\\\\/g, "/");

    let transparent = 0;
    for (let i = 3; i < png.data.length; i += 4) {
      if (png.data[i] < 30) transparent++;
    }
    const pctTrans = ((transparent / (png.width * png.height)) * 100).toFixed(1);

    const isMicroIcon = (png.width < 100 || png.height < 100) && 
      (base === "gift" || base === "map" || base === "message" || base === "unlock" || base.includes("hover"));
    const isBg = base.includes("bg");

    const svgP = path.join(KDO_LIB_DIR, "svg", d, f.replace(".png", ".svg"));
    const svgSizeKb = fs.existsSync(svgP) ? (fs.statSync(svgP).size / 1024).toFixed(1) : "N/A";

    const item = {
      d,
      f,
      rel,
      base,
      w: png.width,
      h: png.height,
      pctTrans,
      svgSizeKb,
      isMicroIcon,
      isBg
    };

    allAssets.push(item);

    if (isMicroIcon) {
      anomalies.push({ ...item, category: "Micro-Icon (Low-Res Warped)" });
    } else if (isBg) {
      anomalies.push({ ...item, category: "Background Texture / Lace" });
    }
  }
}

console.log(`Total Assets Checked: ${allAssets.length}`);
console.log(`Flagged Anomalies: ${anomalies.length}\n`);

console.log("=== 1. MICRO-ICONS (Affected by Low-Res Warping) ===");
anomalies.filter(a => a.category === "Micro-Icon (Low-Res Warped)").forEach(a => {
  console.log(`  - [${a.rel}] ${a.w}x${a.h} | SVG: ${a.svgSizeKb} KB`);
});

console.log("\n=== 2. BACKGROUND TEXTURES & LACE ===");
anomalies.filter(a => a.category === "Background Texture / Lace").forEach(a => {
  console.log(`  - [${a.rel}] ${a.w}x${a.h} | Trans: ${a.pctTrans}% | SVG: ${a.svgSizeKb} KB`);
});
