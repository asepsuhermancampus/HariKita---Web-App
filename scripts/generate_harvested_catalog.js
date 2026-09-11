const fs = require("fs");
const path = require("path");

const SVG_DIR = path.resolve(__dirname, "../references/kadio-assets/harvested/svg");
const HARVESTED_DIR = path.resolve(__dirname, "../references/kadio-assets/harvested");
const DATA_PATH = path.join(SVG_DIR, "harvested_catalog_data.json");

function generateCatalog() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error("harvested_catalog_data.json not found!");
    return;
  }

  const records = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  console.log(`Building high-performance catalog for ${records.length} assets...`);

  const monoCount = records.filter(r => r.type === "monochrome").length;
  const multiCount = records.filter(r => r.type === "multicolor").length;
  const bgCount = records.filter(r => r.type === "solid-bg").length;
  const svgCount = records.filter(r => r.type === "existing-svg").length;

  let rowsHtml = "";
  records.forEach((r, idx) => {
    const svgPath = path.join(SVG_DIR, r.svgFile);
    let svgContent = "";
    
    // For monochrome SVGs: embed inline so currentColor responds to the live palette switcher
    // For multicolor/large SVGs: use <img src="..." loading="lazy"> for blistering fast HTML load
    if (r.isMono && fs.existsSync(svgPath) && fs.statSync(svgPath).size < 80000) {
      svgContent = fs.readFileSync(svgPath, "utf8");
    } else {
      svgContent = `<img src="${r.svgFile}" alt="${r.svgFile}" class="thumb-img" loading="lazy">`;
    }

    const pngPath = path.join(HARVESTED_DIR, r.file);
    let pngPreview = "";
    if (r.file.endsWith(".png") || r.file.endsWith(".jpg")) {
      pngPreview = `<img src="../${r.file}" alt="${r.file}" class="thumb-img" loading="lazy">`;
    } else {
      pngPreview = `<span style="color:#718096; font-size:0.8rem;">Vector Asli</span>`;
    }

    const badgeClass =
      r.type === "monochrome"
        ? "badge-mono"
        : r.type === "multicolor"
        ? "badge-multi"
        : r.type === "solid-bg"
        ? "badge-solid"
        : "badge-svg";

    rowsHtml += `
      <tr class="asset-row" data-type="${r.type}" data-search="${r.file.toLowerCase()} ${r.category.toLowerCase()}">
        <td class="idx-col">${idx + 1}</td>
        <td>
          <div class="name-box">
            <a href="${r.svgFile}" target="_blank" class="file-name" title="Klik untuk membuka SVG di tab baru">${r.file}</a>
            <span class="badge ${badgeClass}">${r.category}</span>
          </div>
        </td>
        <td>
          <div class="checker-box">
            ${pngPreview}
          </div>
        </td>
        <td>
          <div class="checker-box svg-box ${r.isMono ? 'mono-svg-box' : ''}">
            ${svgContent}
          </div>
        </td>
        <td class="dim-col">${r.w ? `${r.w}×${r.h}` : "Vector"}</td>
        <td class="size-col">
          <div class="size-box">
            ${r.origSizeKb ? `<span class="old-size">${r.origSizeKb} KB</span> → ` : ""}
            <span class="new-size">${r.newSizeKb || r.sizeKb} KB</span>
          </div>
        </td>
        <td class="action-col">
          <a href="${r.svgFile}" target="_blank" class="view-btn">Lihat SVG ↗</a>
        </td>
      </tr>
    `;
  });

  const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Master Catalog Aset Baru Kadio.id (277 Aset Hasil Deep Crawl) | HariKita</title>
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
      max-width: 1400px;
      margin: 0 auto 1.5rem auto;
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
    .stats-bar {
      max-width: 1400px;
      margin: 0 auto 1.5rem auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .stat-card {
      background: #181a24;
      border: 1px solid #2d3748;
      border-radius: 8px;
      padding: 1rem 1.25rem;
    }
    .stat-val {
      font-size: 1.75rem;
      font-weight: 700;
      color: #fff;
    }
    .stat-lbl {
      font-size: 0.8rem;
      color: #a0aec0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 0.2rem;
    }
    .controls {
      max-width: 1400px;
      margin: 0 auto 1.5rem auto;
      background: #181a24;
      border: 1px solid #2d3748;
      border-radius: 8px;
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .controls-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .search-input {
      background: #0d0e12;
      border: 1px solid #3b4252;
      color: #fff;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      width: 340px;
      font-size: 0.9rem;
    }
    .search-input:focus {
      outline: none;
      border-color: #C5A880;
    }
    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .tab-btn {
      background: #232733;
      border: 1px solid #3b4252;
      color: #cbd5e0;
      padding: 0.4rem 0.85rem;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn.active, .tab-btn:hover {
      background: #C5A880;
      color: #1a202c;
      border-color: #C5A880;
      font-weight: 600;
    }
    .palette-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      border-top: 1px solid #2d3748;
      padding-top: 0.75rem;
    }
    .palette-lbl {
      font-size: 0.85rem;
      color: #a0aec0;
      font-weight: 600;
    }
    .color-presets {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .swatch {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid #4a5568;
      cursor: pointer;
      transition: transform 0.15s;
    }
    .swatch:hover {
      transform: scale(1.2);
    }
    .table-wrap {
      max-width: 1400px;
      margin: 0 auto;
      background: #181a24;
      border: 1px solid #2d3748;
      border-radius: 8px;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    th {
      background: #1e2230;
      color: #a0aec0;
      text-align: left;
      padding: 0.75rem 1rem;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #2d3748;
    }
    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #232733;
      vertical-align: middle;
    }
    tr:hover td {
      background: #1d212f;
    }
    .idx-col { width: 45px; color: #718096; font-family: monospace; }
    .name-box { display: flex; flex-direction: column; gap: 0.25rem; }
    .file-name { font-weight: 600; color: #fff; font-family: monospace; font-size: 0.85rem; text-decoration: none; }
    .file-name:hover { color: #C5A880; text-decoration: underline; }
    .badge {
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
      display: inline-block;
      width: fit-content;
    }
    .badge-mono { background: #2c2b18; color: #ecc94b; border: 1px solid #574d15; }
    .badge-multi { background: #163625; color: #48bb78; border: 1px solid #22543d; }
    .badge-solid { background: #26213b; color: #b794f4; border: 1px solid #44337a; }
    .badge-svg { background: #1a334a; color: #63b3ed; border: 1px solid #2b6cb0; }
    .checker-box {
      width: 150px;
      height: 110px;
      border-radius: 6px;
      background-color: #0d0e12;
      background-image:
        linear-gradient(45deg, #161822 25%, transparent 25%),
        linear-gradient(-45deg, #161822 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #161822 75%),
        linear-gradient(-45deg, transparent 75%, #161822 75%);
      background-size: 14px 14px;
      background-position: 0 0, 0 7px, 7px -7px, -7px 0px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 1px solid #282c3c;
      padding: 4px;
    }
    .thumb-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .svg-box svg {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      display: block;
      margin: auto;
    }
    .dim-col { color: #a0aec0; font-size: 0.8rem; font-family: monospace; white-space: nowrap; }
    .size-box { font-size: 0.8rem; font-family: monospace; white-space: nowrap; }
    .old-size { color: #718096; }
    .new-size { color: #48bb78; font-weight: 600; }
    .action-col { width: 110px; }
    .view-btn {
      display: inline-block;
      padding: 0.35rem 0.65rem;
      background: #232733;
      color: #C5A880;
      text-decoration: none;
      border: 1px solid #3b4252;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .view-btn:hover {
      background: #C5A880;
      color: #1a202c;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Katalog Seluruh Aset Baru Kadio.id (Hasil Deep Crawl CSS &amp; HTML)</h1>
      <p class="subtitle">Sebanyak <strong>${records.length} aset baru</strong> (bunga, daun, divider, frame, stamp, border &amp; background) yang sebelumnya tersembunyi di CSS template kini telah berhasil diekstrak dan dikonversi menjadi 100% Pure Vector SVG.</p>
    </div>
  </div>

  <div class="stats-bar">
    <div class="stat-card">
      <div class="stat-val" style="color: #C5A880;">${records.length}</div>
      <div class="stat-lbl">Total Aset Baru Dikonversi</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color: #48bb78;">${multiCount}</div>
      <div class="stat-lbl">Floral &amp; Bouquet (Multicolor)</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color: #ecc94b;">${monoCount}</div>
      <div class="stat-lbl">Divider, Frame &amp; Line Art</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color: #b794f4;">${bgCount}</div>
      <div class="stat-lbl">Wallpaper SVG Ringan (&lt; 2 KB)</div>
    </div>
  </div>

  <div class="controls">
    <div class="controls-row">
      <input type="text" id="searchInput" class="search-input" placeholder="🔍 Cari nama aset (contoh: flower, divider, cover)..." oninput="filterAssets()">
      <div class="filter-tabs">
        <button class="tab-btn active" id="tabAll" onclick="setTab('all')">Semua (${records.length})</button>
        <button class="tab-btn" id="tabMulti" onclick="setTab('multicolor')">Floral / Bouquet (${multiCount})</button>
        <button class="tab-btn" id="tabMono" onclick="setTab('monochrome')">Monokrom / Line Art (${monoCount})</button>
        <button class="tab-btn" id="tabSolid" onclick="setTab('solid-bg')">Background / Texture (${bgCount})</button>
      </div>
    </div>

    <div class="palette-row">
      <span class="palette-lbl">🎨 Live Color Palette (Ubah warna aset monokrom seketika):</span>
      <div class="color-presets">
        <div class="swatch" style="background: #C5A880;" title="Gilded Gold" onclick="setColor('#C5A880')"></div>
        <div class="swatch" style="background: #4A2E35;" title="Deep Plum" onclick="setColor('#4A2E35')"></div>
        <div class="swatch" style="background: #7998c7;" title="Periwinkle" onclick="setColor('#7998c7')"></div>
        <div class="swatch" style="background: #2D5A43;" title="Emerald Olive" onclick="setColor('#2D5A43')"></div>
        <div class="swatch" style="background: #C86D7A;" title="Rose Glamour" onclick="setColor('#C86D7A')"></div>
        <div class="swatch" style="background: #ffffff;" title="Crisp White" onclick="setColor('#ffffff')"></div>
      </div>
      <input type="color" id="customColor" value="#C5A880" onchange="setColor(this.value)" style="cursor:pointer; background:transparent; border:none; width:28px; height:28px;">
      <button onclick="resetColor()" style="background:#232733; color:#a0aec0; border:1px solid #4a5568; border-radius:4px; padding:0.25rem 0.6rem; font-size:0.75rem; cursor:pointer;">Reset Default</button>
    </div>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th class="idx-col">#</th>
          <th>Nama Berkas &amp; Kategori</th>
          <th>PNG Asli (Acuan)</th>
          <th>Hasil Generate SVG (Vector)</th>
          <th>Resolusi</th>
          <th>Ukuran Berkas</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody id="assetTbody">
        ${rowsHtml}
      </tbody>
    </table>
  </div>

  <script>
    let activeTab = 'all';

    function setTab(tab) {
      activeTab = tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      if (tab === 'all') document.getElementById('tabAll').classList.add('active');
      if (tab === 'multicolor') document.getElementById('tabMulti').classList.add('active');
      if (tab === 'monochrome') document.getElementById('tabMono').classList.add('active');
      if (tab === 'solid-bg') document.getElementById('tabSolid').classList.add('active');
      filterAssets();
    }

    function filterAssets() {
      const q = document.getElementById('searchInput').value.toLowerCase().trim();
      const rows = document.querySelectorAll('.asset-row');
      rows.forEach(r => {
        const type = r.getAttribute('data-type');
        const search = r.getAttribute('data-search');
        const matchTab = activeTab === 'all' || type === activeTab;
        const matchSearch = !q || search.includes(q);
        r.style.display = matchTab && matchSearch ? '' : 'none';
      });
    }

    function setColor(hex) {
      document.querySelectorAll('.mono-svg-box svg').forEach(svg => {
        svg.style.color = hex;
      });
    }

    function resetColor() {
      document.querySelectorAll('.mono-svg-box svg').forEach(svg => {
        svg.style.color = '';
      });
    }
  </script>
</body>
</html>`;

  const catPath = path.join(SVG_DIR, "harvested_catalog.html");
  fs.writeFileSync(catPath, fullHtml, "utf8");
  console.log(`Saved optimized harvested_catalog.html successfully at: ${catPath} (Size: ${(fullHtml.length / 1024).toFixed(1)} KB)`);
}

generateCatalog();
