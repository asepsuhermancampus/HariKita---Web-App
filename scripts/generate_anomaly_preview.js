const fs = require("fs");
const path = require("path");

const SVG_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library/svg");
const KDO_LIB_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library");

const items = [
  {
    title: "kdo12 / message.svg",
    desc: "Amplop surat cinta dengan segel hati & lipatan kertas presisi sempurna (menggantikan tracing lopsided/bengkok dari thumbnail 69px)",
    relSvg: "kdo12/message.svg",
    relPng: "kdo12/message.png",
    defaultColor: "#a76300",
    isIcon: true
  },
  {
    title: "kdo15 / event-bg.svg",
    desc: "Bordir renda bunga periwinkle horizontal (menggantikan bercak warna muddy 18-layer dengan 1-layer floral lace vector tajam)",
    relSvg: "kdo15/event-bg.svg",
    relPng: "kdo15/event-bg.png",
    defaultColor: "#7998c7",
    isIcon: false,
    isLace: true
  },
  {
    title: "kdo15 / gift.svg",
    desc: "Kotak kado ornamen pita simetris presisi (menggantikan bentuk blob/kotak sampah meleleh dari thumbnail 27px)",
    relSvg: "kdo15/gift.svg",
    relPng: "kdo15/gift.png",
    defaultColor: "#4679c7",
    isIcon: true
  },
  {
    title: "kdo15 / map.svg",
    desc: "Pin lokasi peta elegan dengan aksen siluet hati di tengah (menggantikan lingkaran bergelombang/benjol dari thumbnail 21px)",
    relSvg: "kdo15/map.svg",
    relPng: "kdo15/map.png",
    defaultColor: "#4679c7",
    isIcon: true
  },
  {
    title: "kdo15 / message.svg",
    desc: "Amplop surat cinta berlipat rapi dengan lambang hati melayang (menggantikan amplop miring berlubang aneh dari thumbnail 28px)",
    relSvg: "kdo15/message.svg",
    relPng: "kdo15/message.png",
    defaultColor: "#4679c7",
    isIcon: true
  },
  {
    title: "kdo16 / frame.svg",
    desc: "Bingkai foto mempelai putih berornamen mewah (memperbaiki berkas yang sebelumnya kosong 0.1 KB tanpa path)",
    relSvg: "kdo16/frame.svg",
    relPng: "kdo16/frame.png",
    defaultColor: "#ffffff",
    isIcon: false
  },
  {
    title: "kdo16 / event-bg.svg",
    desc: "Background tekstur gradasi dusty rose watercolor (menggantikan polygon noise 11.6 MB menjadi berkas SVG super ringan < 1 KB)",
    relSvg: "kdo16/event-bg.svg",
    relPng: "kdo16/event-bg.png",
    defaultColor: "#ddc1c0",
    isBg: true
  },
  {
    title: "kdo33 / event-bg.svg",
    desc: "Background tekstur gradasi champagne gold (menggantikan polygon noise 13.3 MB menjadi berkas SVG super ringan < 1 KB)",
    relSvg: "kdo33/event-bg.svg",
    relPng: "kdo33/event-bg.png",
    defaultColor: "#fbe8ae",
    isBg: true
  }
];

let cardsHtml = "";

for (const item of items) {
  const svgPath = path.join(SVG_DIR, item.relSvg);
  const pngPath = path.join(KDO_LIB_DIR, item.relPng);

  let svgContent = fs.existsSync(svgPath) ? fs.readFileSync(svgPath, "utf8") : "<p>SVG not found</p>";
  const svgSizeKb = fs.existsSync(svgPath) ? (fs.statSync(svgPath).size / 1024).toFixed(1) : "0";
  const pngSizeKb = fs.existsSync(pngPath) ? (fs.statSync(pngPath).size / 1024).toFixed(1) : "0";

  // Data URI for PNG preview
  let pngDataUri = "";
  if (fs.existsSync(pngPath)) {
    pngDataUri = `data:image/png;base64,${fs.readFileSync(pngPath).toString("base64")}`;
  }

  cardsHtml += `
    <div class="card">
      <div class="card-header">
        <div>
          <h3>${item.title}</h3>
          <p class="desc">${item.desc}</p>
        </div>
        <div class="sizes">
          <span class="badge png-badge">PNG: ${pngSizeKb} KB</span>
          <span class="badge svg-badge">SVG Baru: ${svgSizeKb} KB</span>
        </div>
      </div>
      <div class="card-body">
        <div class="preview-box">
          <div class="box-label">Original PNG (Raster Acuan)</div>
          <div class="canvas-checker">
            <img src="${pngDataUri}" alt="${item.title}" class="${item.isIcon ? 'icon-img' : (item.isLace ? 'lace-img' : 'general-img')}">
          </div>
        </div>
        <div class="preview-box">
          <div class="box-label">SVG Hasil Perbaikan (Vector Crisp &amp; Reusable)</div>
          <div class="canvas-checker">
            <div class="svg-wrapper ${item.isIcon ? 'icon-svg' : (item.isLace ? 'lace-svg' : 'general-svg')}">
              ${svgContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifikasi Perbaikan Anomali SVG (kdo1 - kdo33) | HariKita</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0f1015;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 2rem;
      line-height: 1.5;
    }
    .header {
      max-width: 1200px;
      margin: 0 auto 2rem auto;
      border-bottom: 1px solid #2d3748;
      padding-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
    }
    h1 {
      color: #C5A880;
      font-size: 1.75rem;
      margin-bottom: 0.35rem;
    }
    .subtitle {
      color: #a0aec0;
      font-size: 0.95rem;
    }
    .nav-links {
      display: flex;
      gap: 0.75rem;
    }
    .nav-btn {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: #232733;
      color: #C5A880;
      text-decoration: none;
      border: 1px solid #3b4252;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .nav-btn:hover {
      background: #C5A880;
      color: #1a202c;
    }
    .controls {
      max-width: 1200px;
      margin: 0 auto 2rem auto;
      background: #181a24;
      border: 1px solid #2d3748;
      border-radius: 8px;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .palette-label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #cbd5e0;
    }
    .color-presets {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .color-swatch {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid #4a5568;
      cursor: pointer;
      transition: transform 0.15s, border-color 0.15s;
    }
    .color-swatch:hover {
      transform: scale(1.15);
      border-color: #fff;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .card {
      background: #181a24;
      border: 1px solid #2d3748;
      border-radius: 12px;
      overflow: hidden;
    }
    .card-header {
      padding: 1rem 1.5rem;
      background: #1e2230;
      border-bottom: 1px solid #2d3748;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .card-header h3 {
      font-size: 1.15rem;
      color: #fff;
      font-family: monospace;
    }
    .desc {
      font-size: 0.85rem;
      color: #a0aec0;
      margin-top: 0.2rem;
    }
    .badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      font-weight: 600;
      display: inline-block;
    }
    .png-badge { background: #3b2f15; color: #ecc94b; border: 1px solid #634f19; }
    .svg-badge { background: #183d29; color: #48bb78; border: 1px solid #22543d; }
    .card-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      padding: 1.5rem;
    }
    @media (max-width: 768px) {
      .card-body { grid-template-columns: 1fr; }
    }
    .preview-box {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .box-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .canvas-checker {
      height: 240px;
      border-radius: 8px;
      background-color: #0d0e12;
      background-image:
        linear-gradient(45deg, #151720 25%, transparent 25%),
        linear-gradient(-45deg, #151720 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #151720 75%),
        linear-gradient(-45deg, transparent 75%, #151720 75%);
      background-size: 16px 16px;
      background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      overflow: hidden;
      border: 1px solid #232733;
    }
    .icon-img {
      max-width: 80px;
      max-height: 80px;
      image-rendering: pixelated;
    }
    .icon-svg {
      width: 80px;
      height: 80px;
    }
    .lace-img {
      max-width: 100%;
      max-height: 120px;
      object-fit: contain;
    }
    .lace-svg {
      width: 100%;
      max-height: 120px;
    }
    .general-img, .general-svg {
      max-width: 100%;
      max-height: 200px;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Laporan Verifikasi Perbaikan Anomali SVG (kdo1 - kdo33)</h1>
      <p class="subtitle">Inspeksi komparasi side-by-side aset anomali yang telah diperbaiki menjadi 100% vector murni, razor-sharp &amp; reaktif terhadap warna tema.</p>
    </div>
    <div class="nav-links">
      <a href="master_catalog.html" class="nav-btn">← Kembali ke Master Catalog (89 Aset)</a>
    </div>
  </div>

  <div class="controls">
    <span class="palette-label">🎨 Live Color Palette Switcher (Mengubah Warna Seluruh Ikon &amp; Renda Seketika):</span>
    <div class="color-presets">
      <div class="color-swatch" style="background: #C5A880;" title="Gilded Gold (#C5A880)" onclick="setColor('#C5A880')"></div>
      <div class="color-swatch" style="background: #4A2E35;" title="Deep Plum (#4A2E35)" onclick="setColor('#4A2E35')"></div>
      <div class="color-swatch" style="background: #7998c7;" title="Periwinkle Blue (#7998c7)" onclick="setColor('#7998c7')"></div>
      <div class="color-swatch" style="background: #a76300;" title="Honey Gold (#a76300)" onclick="setColor('#a76300')"></div>
      <div class="color-swatch" style="background: #2D5A43;" title="Emerald Olive (#2D5A43)" onclick="setColor('#2D5A43')"></div>
      <div class="color-swatch" style="background: #C86D7A;" title="Rose Glamour (#C86D7A)" onclick="setColor('#C86D7A')"></div>
      <div class="color-swatch" style="background: #ffffff;" title="Crisp White (#ffffff)" onclick="setColor('#ffffff')"></div>
    </div>
    <input type="color" id="customColor" value="#C5A880" onchange="setColor(this.value)" style="cursor: pointer; background: transparent; border: none; width: 32px; height: 32px;">
    <button onclick="resetColor()" style="background: #262936; color: #a0aec0; border: 1px solid #4a5568; border-radius: 4px; padding: 0.35rem 0.75rem; font-size: 0.8rem; cursor: pointer;">Reset Warna Asli</button>
  </div>

  <div class="container">
    ${cardsHtml}
  </div>

  <script>
    function setColor(hex) {
      document.querySelectorAll('.svg-wrapper svg').forEach(svg => {
        svg.style.color = hex;
      });
    }

    function resetColor() {
      document.querySelectorAll('.svg-wrapper svg').forEach(svg => {
        svg.style.color = '';
      });
    }
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(SVG_DIR, "anomaly_fixes_preview.html"), fullHtml, "utf8");
console.log("anomaly_fixes_preview.html created successfully at:", path.join(SVG_DIR, "anomaly_fixes_preview.html"));
