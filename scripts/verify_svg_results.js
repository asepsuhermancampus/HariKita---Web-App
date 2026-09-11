const fs = require("fs");
const path = require("path");

const files = [
  "references/kadio-assets/kdo-library/svg/kdo1/rsvp-flower.svg",
  "references/kadio-assets/kdo-library/svg/kdo3/rsvp-flower.svg",
  "references/kadio-assets/kdo-library/svg/kdo4/bride-flower.svg"
];

files.forEach(f => {
  const abs = path.resolve(__dirname, "..", f);
  const content = fs.readFileSync(abs, "utf8");
  const hasImage = /<image/i.test(content);
  const hasBase64 = /base64/i.test(content);
  const pathCount = (content.match(/<path/gi) || []).length;
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "none";
  console.log(`\n[${f}]`);
  console.log(`  - Pure Vector Validation: ${!hasImage && !hasBase64 ? "PASS (0% raster)" : "FAIL"}`);
  console.log(`  - Total Vector Paths: ${pathCount}`);
  console.log(`  - ViewBox: ${viewBox}`);
  console.log(`  - Optimized SVG Size: ${(content.length / 1024).toFixed(1)} KB`);
});
