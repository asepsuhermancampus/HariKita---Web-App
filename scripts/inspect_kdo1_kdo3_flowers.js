const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const KDO_LIB_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library");

const targets = [
  "kdo1/rsvp-flower.png",
  "kdo3/rsvp-flower.png",
];

for (const t of targets) {
  const filePath = path.join(KDO_LIB_DIR, t);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing: ${filePath}`);
    continue;
  }
  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);
  
  const colorMap = new Map();
  let opaquePixels = 0;
  let transparentPixels = 0;

  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const a = png.data[idx + 3];

      if (a < 25) {
        transparentPixels++;
      } else {
        opaquePixels++;
        // Cluster to 4 bits
        const qr = Math.round(r / 12) * 12;
        const qg = Math.round(g / 12) * 12;
        const qb = Math.round(b / 12) * 12;
        const key = `rgb(${qr},${qg},${qb})`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }
    }
  }

  const sortedColors = Array.from(colorMap.entries()).sort((a,b) => b[1] - a[1]);
  console.log(`\n=== [${t}] (Dimensions: ${png.width}x${png.height}) ===`);
  console.log(`Opaque pixels: ${opaquePixels}, Transparent: ${transparentPixels}`);
  console.log(`Total color clusters: ${colorMap.size}`);
  console.log("Top 12 dominant colors:");
  sortedColors.slice(0, 12).forEach(([c, count]) => {
    const pct = ((count / opaquePixels) * 100).toFixed(1);
    console.log(`  ${c}: ${count} px (${pct}%)`);
  });
}
