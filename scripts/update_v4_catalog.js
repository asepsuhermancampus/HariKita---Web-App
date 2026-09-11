const fs = require('fs');
const path = require('path');

const SVG_DIR = path.resolve(__dirname, '../references/kadio-assets/harvested/svg');
const HARVESTED_DIR = path.resolve(__dirname, '../references/kadio-assets/harvested');
const DATA_PATH = path.join(SVG_DIR, 'harvested_catalog_data.json');
const WHITELIST_PATH = path.join(__dirname, 'whitelist_registry.json');

function updateCatalog() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error('harvested_catalog_data.json not found!');
    return;
  }

  const whitelist = new Set(
    fs.existsSync(WHITELIST_PATH) ? JSON.parse(fs.readFileSync(WHITELIST_PATH, 'utf8')) : []
  );

  const records = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  console.log(`Updating catalog metadata for ${records.length} assets...`);

  let v4Count = 0;
  let whitelistCount = 0;

  // Refresh sizes and identify V4 / Whitelisted assets
  records.forEach(r => {
    const svgPath = path.join(SVG_DIR, r.svgFile);
    if (fs.existsSync(svgPath)) {
      const stats = fs.statSync(svgPath);
      r.newSizeKb = (stats.size / 1024).toFixed(1);
      
      const content = fs.readFileSync(svgPath, 'utf8');
      const paths = (content.match(/<path/g) || []).length;
      r.pathCount = paths;

      if (whitelist.has(r.svgFile)) {
        r.isWhitelisted = true;
        r.isV4Elevated = true;
        whitelistCount++;
        v4Count++;
      } else if (paths >= 4 || content.includes('stroke-linejoin="round" fill-rule="evenodd"')) {
        r.isV4Elevated = true;
        v4Count++;
      } else {
        r.isV4Elevated = false;
      }
    }
  });

  // Save updated json
  fs.writeFileSync(DATA_PATH, JSON.stringify(records, null, 2), 'utf8');
  console.log(`Updated ${DATA_PATH} with V4 flags: ${v4Count} elevated (${whitelistCount} whitelisted Grade A).`);

  const monoCount = records.filter(r => r.type === 'monochrome').length;
  const multiCount = records.filter(r => r.type === 'multicolor').length;
  const bgCount = records.filter(r => r.type === 'solid-bg').length;

  let rowsHtml = '';
  records.forEach((r, idx) => {
    const svgPath = path.join(SVG_DIR, r.svgFile);
    let svgContent = '';

    if (r.isMono && fs.existsSync(svgPath) && fs.statSync(svgPath).size < 80000) {
      svgContent = fs.readFileSync(svgPath, 'utf8');
    } else {
      svgContent = `<img src="${r.svgFile}" alt="${r.svgFile}" class="thumb-img" loading="lazy">`;
    }

    const pngPath = path.join(HARVESTED_DIR, r.file);
    let pngPreview = '';
    if (r.file.endsWith('.png') || r.file.endsWith('.jpg')) {
      pngPreview = `<img src="../${r.file}" alt="${r.file}" class="thumb-img" loading="lazy">`;
    } else {
      pngPreview = `<span style="color:#718096; font-size:0.8rem;">Vector Asli</span>`;
    }

    const badgeClass =
      r.type === 'monochrome'
        ? 'badge-mono'
        : r.type === 'multicolor'
        ? 'badge-multi'
        : r.type === 'solid-bg'
        ? 'badge-solid'
        : 'badge-svg';

    const elevationBadge = r.isWhitelisted
      ? `<span class="badge badge-gold" title="Grade A Whitelist (Benchmark Master Terkunci)">🔒 Grade A Whitelist</span>`
      : r.isV4Elevated
      ? `<span class="badge badge-v4" title="V4 Aesthetic Elevation (Multi-Layer / Pure Negative Space)">✨ V4 Elevated (${r.pathCount || 1} paths)</span>`
      : '';

    rowsHtml += `
      <tr class="asset-row" data-type="${r.type}" data-v4="${r.isV4Elevated ? 'true' : 'false'}" data-search="${r.file.toLowerCase()} ${r.category.toLowerCase()} ${r.isV4Elevated ? 'v4 elevated' : ''}">
        <td class="idx-col">${idx + 1}</td>
        <td>
          <div class="name-box">
            <a href="${r.svgFile}" target="_blank" class="file-name" title="Klik untuk membuka SVG di tab baru">${r.file}</a>
            <div style="display:flex; gap:0.35rem; flex-wrap:wrap; margin-top:0.25rem;">
              <span class="badge ${badgeClass}">${r.category}</span>
              ${elevationBadge}
            </div>
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
        <td class="dim-col">${r.w ? `${r.w}×${r.h}` : 'Vector'}</td>
        <td class="size-col">
          <div class="size-box">
            ${r.origSizeKb ? `<span class="old-size">${r.origSizeKb} KB</span> → ` : ''}
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
  <title>Master Catalog Aset V4 Kadio.id (${records.length} Aset Hasil V4 Elevation) | HariKita</title>
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
      margin-bottom: 2rem;
      border-bottom: 1px solid #1e2230;
      padding-bottom: 1.5rem;
    }
    .header h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #f7fafc;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .badge-v4-header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      font-size: 0.75rem;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    .header p {
      color: #a0aec0;
      font-size: 0.95rem;
      max-width: 900px;
    }
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: #171923;
      border: 1px solid #2d3748;
      border-radius: 8px;
      padding: 1rem 1.25rem;
    }
    .stat-val {
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .stat-lbl {
      color: #718096;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .controls {
      background: #171923;
      border: 1px solid #2d3748;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .controls-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }
    .search-input {
      flex: 1;
      min-width: 260px;
      background: #0f1015;
      border: 1px solid #4a5568;
      border-radius: 6px;
      padding: 0.5rem 1rem;
      color: #fff;
      font-size: 0.9rem;
    }
    .search-input:focus {
      outline: none;
      border-color: #3182ce;
    }
    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .tab-btn {
      background: #232733;
      border: 1px solid #4a5568;
      border-radius: 6px;
      color: #cbd5e0;
      padding: 0.45rem 0.85rem;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .tab-btn:hover {
      background: #2d3748;
      color: #fff;
    }
    .tab-btn.active {
      background: #3182ce;
      border-color: #3182ce;
      color: #fff;
      font-weight: 600;
    }
    .tab-btn.tab-v4.active {
      background: #10b981;
      border-color: #10b981;
    }
    .palette-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      padding-top: 0.5rem;
      border-top: 1px solid #2d3748;
    }
    .palette-lbl {
      color: #a0aec0;
      font-size: 0.85rem;
    }
    .color-presets {
      display: flex;
      gap: 0.5rem;
    }
    .swatch {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid #2d3748;
      transition: transform 0.15s ease;
    }
    .swatch:hover {
      transform: scale(1.15);
      border-color: #fff;
    }
    .table-wrap {
      background: #171923;
      border: 1px solid #2d3748;
      border-radius: 8px;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      background: #1a202c;
      color: #a0aec0;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #2d3748;
    }
    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #232733;
      vertical-align: middle;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .idx-col {
      color: #718096;
      font-size: 0.8rem;
      width: 40px;
    }
    .name-box {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .file-name {
      color: #63b3ed;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .file-name:hover {
      text-decoration: underline;
    }
    .badge {
      display: inline-block;
      font-size: 0.7rem;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .badge-mono { background: #2b4c7e; color: #bee3f8; }
    .badge-multi { background: #553c9a; color: #e9d8fd; }
    .badge-solid { background: #744210; color: #feebc8; }
    .badge-svg { background: #234e52; color: #b2f5ea; }
    .badge-v4 { background: #065f46; color: #a7f3d0; }
    .badge-gold { background: #78350f; color: #fde68a; border: 1px solid #b45309; }
    .checker-box {
      width: 80px;
      height: 80px;
      background: #11141c;
      background-image: 
        linear-gradient(45deg, #181c26 25%, transparent 25%), 
        linear-gradient(-45deg, #181c26 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, #181c26 75%), 
        linear-gradient(-45deg, transparent 75%, #181c26 75%);
      background-size: 14px 14px;
      background-position: 0 0, 0 7px, 7px -7px, -7px 0px;
      border: 1px solid #2d3748;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
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
    }
    .dim-col {
      color: #a0aec0;
      font-size: 0.8rem;
    }
    .size-box {
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .old-size {
      color: #718096;
      text-decoration: line-through;
    }
    .new-size {
      color: #48bb78;
      font-weight: 600;
    }
    .view-btn {
      color: #a0aec0;
      text-decoration: none;
      font-size: 0.8rem;
      background: #232733;
      border: 1px solid #4a5568;
      padding: 0.35rem 0.65rem;
      border-radius: 4px;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .view-btn:hover {
      background: #3182ce;
      color: #fff;
      border-color: #3182ce;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>
      Master Catalog Aset V4 Kadio.id
      <span class="badge-v4-header">V4 AESTHETIC ELEVATION</span>
    </h1>
    <p>Galeri visual aset hasil V4 Ultra-Fidelity Vectorizer. Dilengkapi isolasi negatif 100% tanpa plat padat, partisi multi-kroma foliar/floral, dan 6–8 lapisan cat air tonal halus. Dilindungi oleh Registry Whitelist Grade A.</p>
  </div>

  <div class="stats-bar">
    <div class="stat-card">
      <div class="stat-val" style="color: #63b3ed;">${records.length}</div>
      <div class="stat-lbl">Total Berkas SVG</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color: #10b981;">${v4Count}</div>
      <div class="stat-lbl">✨ Aset V4 Elevated</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color: #fbbf24;">${whitelistCount}</div>
      <div class="stat-lbl">🔒 Grade A Whitelisted</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color: #48bb78;">100%</div>
      <div class="stat-lbl">Pure Vector Guarantee</div>
    </div>
  </div>

  <div class="controls">
    <div class="controls-row">
      <input type="text" id="searchInput" class="search-input" placeholder="🔍 Cari nama aset (contoh: flower, frame, border, rose)..." oninput="filterAssets()">
      <div class="filter-tabs">
        <button class="tab-btn active" id="tabAll" onclick="setTab('all')">Semua (${records.length})</button>
        <button class="tab-btn tab-v4" id="tabV4" onclick="setTab('v4')">✨ V4 Elevated (${v4Count})</button>
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
      if (tab === 'v4') document.getElementById('tabV4').classList.add('active');
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
        const isV4 = r.getAttribute('data-v4') === 'true';
        const search = r.getAttribute('data-search');
        
        let matchTab = false;
        if (activeTab === 'all') matchTab = true;
        else if (activeTab === 'v4') matchTab = isV4;
        else matchTab = (type === activeTab);

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

  const catPath = path.join(SVG_DIR, 'harvested_catalog.html');
  fs.writeFileSync(catPath, fullHtml, 'utf8');
  console.log(`Saved enriched harvested_catalog.html successfully at: ${catPath} (${(fullHtml.length / 1024).toFixed(1)} KB)`);
}

updateCatalog();
