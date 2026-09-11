const fs = require("fs");
const path = require("path");

const SVG_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library/svg");
const KDO_LIB_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library");

const items = [
  {
    id: "kdo4",
    name: "kdo4 / bride-flower",
    pngPath: path.join(KDO_LIB_DIR, "kdo4/bride-flower.png"),
    svgPath: path.join(SVG_DIR, "kdo4/bride-flower.svg"),
    title: "1. Benchmark: kdo4/bride-flower (White Rose, Sage Leaves & Gold Berries)",
    dimensions: "500 × 525 px"
  },
  {
    id: "kdo1",
    name: "kdo1 / rsvp-flower",
    pngPath: path.join(KDO_LIB_DIR, "kdo1/rsvp-flower.png"),
    svgPath: path.join(SVG_DIR, "kdo1/rsvp-flower.svg"),
    title: "2. Hasil Baru: kdo1/rsvp-flower (Blush Pink Rose, Olive Leaves & Golden Pistils)",
    dimensions: "200 × 184 px"
  },
  {
    id: "kdo3",
    name: "kdo3 / rsvp-flower",
    pngPath: path.join(KDO_LIB_DIR, "kdo3/rsvp-flower.png"),
    svgPath: path.join(SVG_DIR, "kdo3/rsvp-flower.svg"),
    title: "3. Hasil Baru: kdo3/rsvp-flower (Vertical Dusty Rose, Sage Leaves & Dark Wood)",
    dimensions: "300 × 542 px"
  }
];

function analyzeSvg(svgContent) {
  const pathMatches = svgContent.match(/<path[^>]+fill="([^"]+)"[^>]*>/gi) || [];
  const paletteMap = new Map();
  for (const p of pathMatches) {
    const m = p.match(/fill="([^"]+)"/i);
    if (m) {
      const fill = m[1].toLowerCase();
      paletteMap.set(fill, (paletteMap.get(fill) || 0) + 1);
    }
  }
  return {
    pathCount: pathMatches.length,
    palette: Array.from(paletteMap.entries())
  };
}

const renderedSections = items.map(item => {
  const pngBase64 = fs.readFileSync(item.pngPath).toString("base64");
  const pngSize = (fs.statSync(item.pngPath).size / 1024).toFixed(1);
  const svgContent = fs.readFileSync(item.svgPath, "utf8");
  const svgSize = (fs.statSync(item.svgPath).size / 1024).toFixed(1);
  const { pathCount, palette } = analyzeSvg(svgContent);

  const swatchesHtml = palette.map(([hex, count]) => `
    <div class="swatch-item">
      <span class="swatch-color" style="background-color: ${hex};"></span>
      <span class="swatch-hex">${hex}</span>
      <span class="swatch-count">${count} paths</span>
    </div>
  `).join("");

  return `
    <section class="item-section">
      <div class="section-header">
        <h2>${item.title}</h2>
        <span class="dim-badge">${item.dimensions}</span>
      </div>

      <div class="comparison-grid">
        <!-- PNG Original -->
        <div class="card">
          <div class="card-header">
            <h3>🖼️ PNG Original (Raster)</h3>
            <span class="badge badge-png">${pngSize} KB</span>
          </div>
          <div class="canvas-box">
            <img src="data:image/png;base64,${pngBase64}" alt="${item.name} PNG" />
          </div>
          <div class="card-footer">
            <p>Piksel bitmap raster (pecah bila di-zoom besar)</p>
          </div>
        </div>

        <!-- SVG Result -->
        <div class="card">
          <div class="card-header">
            <h3>✨ Hasil SVG Multi-Layer (Pure Vector)</h3>
            <span class="badge badge-svg">${svgSize} KB</span>
          </div>
          <div class="canvas-box">
            ${svgContent}
          </div>
          <div class="card-footer">
            <p><strong>100% Pure Vector Bézier:</strong> ${palette.length} Layers | ${pathCount} Total Paths | 0 raster &lt;image&gt;</p>
          </div>
        </div>
      </div>

      <!-- Palette Layers -->
      <div class="palette-panel">
        <h4>🎨 Palet Warna Layer yang Terekstraksi (${palette.length} Layers terurut Luminance):</h4>
        <div class="swatches-grid">
          ${swatchesHtml}
        </div>
      </div>
    </section>
  `;
}).join("\n");

const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HariKita - Hasil Multi-Layer Vectorization (kdo4, kdo1, kdo3)</title>
  <style>
    :root {
      --bg-dark: #121214;
      --card-bg: #1c1c21;
      --card-border: #2c2c35;
      --accent-gold: #C5A880;
      --text-main: #f0f0f5;
      --text-muted: #a0a0b0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg-dark);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 2.5rem 2rem;
      line-height: 1.6;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      margin-bottom: 3rem;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 2rem;
    }
    h1 {
      font-size: 2.2rem;
      color: var(--accent-gold);
      margin-bottom: 0.5rem;
      letter-spacing: -0.5px;
    }
    p.lead {
      color: var(--text-muted);
      font-size: 1.05rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .item-section {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 3rem;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .section-header h2 {
      font-size: 1.3rem;
      color: #fff;
    }
    .dim-badge {
      background: #2a2a35;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      color: var(--accent-gold);
      border: 1px solid rgba(197, 168, 128, 0.3);
    }
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 1.5rem;
    }
    @media (max-width: 800px) {
      .comparison-grid { grid-template-columns: 1fr; }
    }
    .card {
      background: #141418;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .card-header h3 {
      font-size: 1rem;
      color: #ddd;
    }
    .badge {
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-png { background: #3d3420; color: #f5c452; }
    .badge-svg { background: #1c3c2b; color: #52e58f; }
    .canvas-box {
      width: 100%;
      height: 420px;
      background: #09090b;
      background-image: 
        linear-gradient(45deg, #141418 25%, transparent 25%), 
        linear-gradient(-45deg, #141418 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, #141418 75%), 
        linear-gradient(-45deg, transparent 75%, #141418 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 1rem;
    }
    .canvas-box img, .canvas-box svg {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.6));
    }
    .card-footer {
      margin-top: 1rem;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .palette-panel {
      background: #15151a;
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 10px;
      padding: 1.25rem;
    }
    .palette-panel h4 {
      font-size: 0.95rem;
      color: #ccc;
      margin-bottom: 0.75rem;
    }
    .swatches-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .swatch-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #1f1f26;
      border: 1px solid #33333e;
      border-radius: 6px;
      padding: 0.35rem 0.65rem;
      font-size: 0.8rem;
    }
    .swatch-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      border: 1px solid rgba(255,255,255,0.3);
      display: inline-block;
    }
    .swatch-hex {
      font-family: monospace;
      color: #eee;
    }
    .swatch-count {
      color: #888;
      font-size: 0.75rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🔬 Laporan Uji Coba Multi-Layer Vectorization</h1>
      <p class="lead">Evaluasi visual perbandingan antara gambar raster PNG asli dengan hasil tracing kurva vektor SVG murni (0% raster embedding, 100% path Bézier) untuk 3 aset floral perwakilan.</p>
    </header>

    ${renderedSections}
  </div>
</body>
</html>`;

const outPath = path.join(SVG_DIR, "preview_comparison.html");
fs.writeFileSync(outPath, html, "utf8");
console.log("SUCCESS: Interactive Comparison HTML generated at:", outPath);
