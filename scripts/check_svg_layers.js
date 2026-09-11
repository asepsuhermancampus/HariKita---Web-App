const fs = require("fs");
const path = require("path");

const svgPath = path.resolve(__dirname, "../references/kadio-assets/kdo-library/svg/kdo4/bride-flower.svg");
const content = fs.readFileSync(svgPath, "utf8");

const pathRegex = /<path[^>]+fill="([^"]+)"[^>]*>/gi;
let m;
const layers = {};
while ((m = pathRegex.exec(content)) !== null) {
  const fill = m[1];
  layers[fill] = (layers[fill] || 0) + 1;
}

console.log("SVG Fill Layers in kdo4/bride-flower.svg:");
for (const fill in layers) {
  console.log(`- Fill: ${fill} -> ${layers[fill]} path(s)`);
}
console.log("Total SVG size:", (content.length / 1024).toFixed(1), "KB");
