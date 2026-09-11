const potrace = require("potrace");
console.log("Potrace exports:", Object.keys(potrace));
console.log("Potrace constructor:", typeof potrace.Potrace);
console.log("Potrace.trace function:", typeof potrace.trace);

// Let's test feeding a buffer directly to Potrace
const fs = require("fs");
const path = require("path");
const testFile = path.resolve(__dirname, "../references/kadio-assets/kdo-library/kdo17/divider.png");
console.log("Reading testFile:", testFile, "exists?", fs.existsSync(testFile));
const buf = fs.readFileSync(testFile);
console.log("Buffer length:", buf.length);

const p = new potrace.Potrace();
p.loadImage(buf, (err) => {
  if (err) {
    console.error("loadImage error:", err);
    return;
  }
  console.log("Image loaded successfully!");
  const svg = p.getSVG();
  console.log("getSVG() length:", svg.length);
  console.log("getSVG() preview:\n", svg.slice(0, 300));
});
