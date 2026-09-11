const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const potrace = require("potrace");

const KDO_LIB_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library");

const targets = [
  "kdo17/divider.png",
  "kdo17/frame-bride.png",
  "kdo16/divider.png",
  "kdo4/bride-flower.png",
  "kdo10/frame.png"
];

for (const t of targets) {
  const filePath = path.join(KDO_LIB_DIR, t);
  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);
  
  // Collect unique colors (excluding alpha = 0)
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

      if (a < 20) {
        transparentPixels++;
      } else {
        opaquePixels++;
        // Quantize slightly to 5 bits per channel to find dominant color clusters
        const qr = Math.round(r / 8) * 8;
        const qg = Math.round(g / 8) * 8;
        const qb = Math.round(b / 8) * 8;
        const key = `rgb(${qr},${qg},${qb})`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }
    }
  }

  const sortedColors = Array.from(colorMap.entries()).sort((a,b) => b[1] - a[1]);
  console.log(`\n=== [${t}] (Dimensions: ${png.width}x${png.height}) ===`);
  console.log(`Opaque pixels: ${opaquePixels}, Transparent: ${transparentPixels}`);
  console.log(`Unique color clusters: ${colorMap.size}`);
  console.log("Top 10 dominant colors:");
  sortedColors.slice(0, 10).forEach(([c, count]) => {
    const pct = ((count / opaquePixels) * 100).toFixed(1);
    console.log(`  ${c}: ${count} px (${pct}%)`);
  });
}
