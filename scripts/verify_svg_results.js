const fs = require("fs");
const path = require("path");

const filesToInspect = [
  "references/kadio-assets/kdo-library/svg/kdo1/rsvp-flower.svg",
  "references/kadio-assets/kdo-library/svg/kdo6/event-flower.svg",
  "references/kadio-assets/kdo-library/svg/kdo21/bride-flower.svg",
  "references/kadio-assets/kdo-library/svg/kdo12/message.svg",
  "references/kadio-assets/kdo-library/svg/kdo15/event-bg.svg",
  "references/kadio-assets/kdo-library/svg/kdo15/gift.svg",
  "references/kadio-assets/kdo-library/svg/kdo15/map.svg",
  "references/kadio-assets/kdo-library/svg/kdo15/message.svg",
  "references/kadio-assets/kdo-library/svg/kdo16/frame.svg",
  "references/kadio-assets/kdo-library/svg/kdo16/event-bg.svg"
];

console.log("=== 1. VERIFIKASI ASET SPESIFIK (FLORAL & HASIL PERBAIKAN ANOMALI) ===");
filesToInspect.forEach(f => {
  const abs = path.resolve(__dirname, "..", f);
  if (!fs.existsSync(abs)) {
    console.log(`\n[${f}] -> FILE NOT FOUND!`);
    return;
  }
  const content = fs.readFileSync(abs, "utf8");
  const hasImage = /<image/i.test(content);
  const hasBase64 = /base64/i.test(content);
  const pathCount = (content.match(/<path/gi) || []).length;
  const rectCount = (content.match(/<rect/gi) || []).length;
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "none";
  const hasCurrentColor = /currentColor/i.test(content);

  console.log(`\n[${f}]`);
  console.log(`  - Pure Vector Validation: ${!hasImage && !hasBase64 ? "PASS (0% raster)" : "FAIL"}`);
  console.log(`  - Elements: ${pathCount} paths, ${rectCount} rects`);
  console.log(`  - ViewBox: ${viewBox}`);
  console.log(`  - Reaktif Tema (currentColor): ${hasCurrentColor ? "YES" : "N/A (Multicolor/Grad)"}`);
  console.log(`  - File Size: ${(content.length / 1024).toFixed(1)} KB`);
});

console.log("\n=== 2. GLOBAL AUDIT KELAYAKAN SELURUH SVG DI KDO-LIBRARY ===");
const SVG_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library/svg");
let totalSvgs = 0;
let rasterCount = 0;
let emptyCount = 0;

function checkDir(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      checkDir(full);
    } else if (item.endsWith(".svg")) {
      totalSvgs++;
      const content = fs.readFileSync(full, "utf8");
      if (/<image/i.test(content) || /base64/i.test(content)) rasterCount++;
      const hasShape = /<path|<rect|<circle|<polygon/i.test(content);
      if (!hasShape) emptyCount++;
    }
  }
}

checkDir(SVG_DIR);
console.log(`Total SVG Files: ${totalSvgs}`);
console.log(`Raster Artifacts (<image>/base64): ${rasterCount} (Expected: 0)`);
console.log(`Empty SVGs (no shapes): ${emptyCount} (Expected: 0)`);
console.log(`\nStatus Akhir: ${rasterCount === 0 && emptyCount === 0 ? "SEMUA 100% VALID DAN LOLOS UJI PURE VECTOR!" : "DITEMUKAN ISU!"}`);
