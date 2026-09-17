const fs = require("fs");
const path = require("path");
const jpeg = require("jpeg-js");

const files = ["bg-index.jpg", "index-bg.jpg"];
const dir = path.resolve(__dirname, "../references/kadio-assets/harvested");
const svgDir = path.resolve(__dirname, "../references/kadio-assets/harvested/svg");

for (const f of files) {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) continue;
  const base = path.basename(f, path.extname(f));
  const rawData = fs.readFileSync(p);
  const decoded = jpeg.decode(rawData);

  const topIdx = 0;
  const midIdx = Math.floor(decoded.height / 2) * decoded.width * 4;
  const botIdx = (decoded.height - 1) * decoded.width * 4;

  const cTop =
    "#" +
    [decoded.data[topIdx], decoded.data[topIdx + 1], decoded.data[topIdx + 2]]
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("");
  const cMid =
    "#" +
    [decoded.data[midIdx], decoded.data[midIdx + 1], decoded.data[midIdx + 2]]
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("");
  const cBot =
    "#" +
    [decoded.data[botIdx], decoded.data[botIdx + 1], decoded.data[botIdx + 2]]
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${decoded.width} ${decoded.height}" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${cTop}"/>
      <stop offset="50%" stop-color="${cMid}"/>
      <stop offset="100%" stop-color="${cBot}"/>
    </linearGradient>
  </defs>
  <rect width="${decoded.width}" height="${decoded.height}" fill="url(#bgGrad)"/>
</svg>
`;

  fs.writeFileSync(path.join(svgDir, `${base}.svg`), svg, "utf8");
  console.log("Converted", f, "to SVG gradient ->", `${base}.svg`);
}
