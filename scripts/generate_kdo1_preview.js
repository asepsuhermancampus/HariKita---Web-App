const fs = require("fs");
const path = require("path");

const KDO1_PNG_PATH = path.resolve(__dirname, "../references/kadio-assets/kdo-library/kdo1/rsvp-flower.png");
const KDO1_SVG_PATH = path.resolve(__dirname, "../references/kadio-assets/kdo-library/svg/kdo1/rsvp-flower.svg");

const pngBase64 = fs.readFileSync(KDO1_PNG_PATH).toString("base64");
const svgContent = fs.readFileSync(KDO1_SVG_PATH, "utf8");

const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Inspeksi Detail kdo1/rsvp-flower - Ultra High-Fidelity Vector</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0f0f12;
      color: #e6e6f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 2rem;
    }
    header {
      text-align: center;
      margin-bottom: 2rem;
    }
    h1 { color: #C5A880; font-size: 2rem; margin-bottom: 0.5rem; }
    p { color: #999; font-size: 1rem; }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .panel {
      background: #18181f;
      border: 1px solid #2a2a38;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
    }
    .panel h2 {
      font-size: 1.15rem;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      color: #fff;
    }
    .badge {
      font-size: 0.8rem;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .badge-png { background: #3f3215; color: #ffca3a; }
    .badge-svg { background: #153f28; color: #2ecc71; }
    .canvas-box {
      width: 100%;
      height: 480px;
      background: #0a0a0d;
      background-image: 
        linear-gradient(45deg, #13131a 25%, transparent 25%), 
        linear-gradient(-45deg, #13131a 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, #13131a 75%), 
        linear-gradient(-45deg, transparent 75%, #13131a 75%);
      background-size: 24px 24px;
      background-position: 0 0, 0 12px, 12px -12px, -12px 0px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 1.5rem;
    }
    .canvas-box img, .canvas-box svg {
      width: 360px;
      height: 330px;
      object-fit: contain;
      filter: drop-shadow(0 8px 24px rgba(0,0,0,0.7));
    }
    .info {
      margin-top: 1rem;
      font-size: 0.9rem;
      color: #bbb;
      line-height: 1.5;
    }
    .feature-list {
      margin-top: 0.5rem;
      padding-left: 1.2rem;
      color: #aaa;
    }
    .feature-list li { margin-bottom: 0.25rem; }
  </style>
</head>
<body>
  <header>
    <h1>🔍 Inspeksi Detail: kdo1/rsvp-flower</h1>
    <p>Perbandingan Langsung antara PNG Asli (200x184 px) vs Ultra High-Fidelity 21-Layer Vector</p>
  </header>

  <div class="grid">
    <div class="panel">
      <h2>
        <span>1. PNG Original (Raster)</span>
        <span class="badge badge-png">55.6 KB</span>
      </h2>
      <div class="canvas-box">
        <img src="data:image/png;base64,${pngBase64}" alt="Original PNG" />
      </div>
      <div class="info">
        <p><strong>Sumber Asli:</strong></p>
        <ul class="feature-list">
          <li>Resolusi: 200 × 184 px</li>
          <li>Format: Piksel Raster (Pixelated saat diperbesar)</li>
          <li>Kelopak bergradasi cat air halus</li>
        </ul>
      </div>
    </div>

    <div class="panel">
      <h2>
        <span>2. Hasil Baru (21-Layer High-Fidelity Vector)</span>
        <span class="badge badge-svg">663.7 KB</span>
      </h2>
      <div class="canvas-box">
        ${svgContent}
      </div>
      <div class="info">
        <p><strong>Penyempurnaan Utama:</strong></p>
        <ul class="feature-list">
          <li><strong>Bilinear Sub-pixel Super-sampling:</strong> Kurva kelopak & daun menjadi silky smooth tanpa patahan tangga piksel.</li>
          <li><strong>Dual Underfill Base:</strong> Dilapisi base siluet daun & kelopak padat; 100% bebas retak / terputus-putus.</li>
          <li><strong>6 Layer Daun:</strong> Mengembalikan urat daun, bayangan gelap, dan gradasi daun muda.</li>
          <li><strong>12 Layer Bunga:</strong> Gradasi mawar dari kontur tua hingga highlight putih.</li>
          <li><strong>3 Layer Putik Sari:</strong> Aksen bintik kuning emas tajam dan presisi.</li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>`;

const outPath = path.resolve(__dirname, "../references/kadio-assets/kdo-library/svg/kdo1/preview_kdo1.html");
fs.writeFileSync(outPath, html, "utf8");
console.log("Dedicated KDO1 preview created at:", outPath);
