const fs = require("fs");
const path = require("path");

const svgPath = path.resolve(__dirname, "../references/kadio-assets/kdo-library/svg/kdo4/bride-flower.svg");
const svgContent = fs.readFileSync(svgPath, "utf8");

const pngRelPath = "../../kdo4/bride-flower.png";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Preview Comparison - kdo4/bride-flower</title>
  <style>
    body {
      background: #1e1e1e;
      color: #fff;
      font-family: sans-serif;
      padding: 2rem;
    }
    .grid {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .card {
      background: #2a2a2a;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .canvas-box {
      width: 450px;
      height: 450px;
      background: #111;
      background-image: 
        linear-gradient(45deg, #181818 25%, transparent 25%), 
        linear-gradient(-45deg, #181818 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, #181818 75%), 
        linear-gradient(-45deg, transparent 75%, #181818 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      overflow: hidden;
      margin: 1rem 0;
    }
    img, svg {
      max-width: 100%;
      max-height: 100%;
    }
    h2 { font-size: 1.1rem; color: #C5A880; }
  </style>
</head>
<body>
  <h1>🔍 Perbandingan Kualitas: PNG Asli vs SVG Multicolor Vektor</h1>
  <div class="grid">
    <div class="card">
      <h2>1. PNG Original (Raster)</h2>
      <div class="canvas-box">
        <img src="${pngRelPath}" alt="Original PNG" />
      </div>
      <p>Resolusi: 500x525 | File Size: 41.6 KB</p>
    </div>
    <div class="card">
      <h2>2. Hasil SVG Baru (8-Layer Color Vector)</h2>
      <div class="canvas-box">
        ${svgContent}
      </div>
      <p>Vektor Murni (<path />) | 8 Warna Autentik | File Size: 151.9 KB</p>
    </div>
  </div>
</body>
</html>`;

const outPath = path.resolve(__dirname, "../references/kadio-assets/kdo-library/svg/kdo4/preview_comparison.html");
fs.writeFileSync(outPath, html, "utf8");
console.log("Comparison HTML created at:", outPath);
