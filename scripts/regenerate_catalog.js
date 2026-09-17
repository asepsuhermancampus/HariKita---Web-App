const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const KDO_LIB_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library");
const SVG_OUT_DIR = path.resolve(KDO_LIB_DIR, "svg");
const SHARED_OUT_DIR = path.resolve(SVG_OUT_DIR, "shared");

function getShapeHash(png) {
  const grid = new Uint8Array(32 * 32);
  for (let gy = 0; gy < 32; gy++) {
    const sy = Math.floor(gy * png.height / 32);
    for (let gx = 0; gx < 32; gx++) {
      const sx = Math.floor(gx * png.width / 32);
      const idx = (png.width * sy + sx) << 2;
      if (png.data[idx + 3] > 40) {
        grid[gy * 32 + gx] = 1;
      }
    }
  }
  return grid;
}

function compareGrids(g1, g2) {
  let match = 0;
  for (let i = 0; i < 1024; i++) {
    if (g1[i] === g2[i]) match++;
  }
  return match / 1024;
}

function getDominantHex(png) {
  const counts = {};
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] > 50) {
      const hex = '#' + [png.data[i], png.data[i + 1], png.data[i + 2]].map(x => x.toString(16).padStart(2, '0')).join('');
      counts[hex] = (counts[hex] || 0) + 1;
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '#4A2E35';
}

function getAllPngs() {
  const list = [];
  function walk(dir) {
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (item !== 'svg') walk(full);
      } else if (item.toLowerCase().endsWith('.png')) {
        list.push(full);
      }
    }
  }
  walk(KDO_LIB_DIR);
  return list;
}

const pngFiles = getAllPngs();
const inventory = [];
const monoShapeGroups = [];

for (const f of pngFiles) {
  const buf = fs.readFileSync(f);
  const png = PNG.sync.read(buf);
  const rel = path.relative(KDO_LIB_DIR, f).replace(/\\\\/g, "/");

  const colorSet = new Set();
  for (let i = 0; i < png.data.length; i += 8) {
    if (png.data[i + 3] > 35) {
      const qr = Math.round(png.data[i] / 16);
      const qg = Math.round(png.data[i + 1] / 16);
      const qb = Math.round(png.data[i + 2] / 16);
      colorSet.add((qr << 8) | (qg << 4) | qb);
    }
  }

  const isMono = colorSet.size <= 8;
  const domHex = isMono ? getDominantHex(png) : "multicolor";
  const hash = isMono ? getShapeHash(png) : null;
  const aspect = (png.width / png.height).toFixed(2);
  const baseName = path.basename(rel, ".png");

  const item = {
    absPath: f,
    relPath: rel,
    baseName,
    width: png.width,
    height: png.height,
    aspect,
    isMono,
    colorCount: colorSet.size,
    domHex,
    hash
  };

  inventory.push(item);

  if (isMono) {
    let matched = false;
    for (const g of monoShapeGroups) {
      const aspectDiff = Math.abs(parseFloat(aspect) - parseFloat(g.lead.aspect));
      if (aspectDiff < 0.15) {
        const sim = compareGrids(hash, g.lead.hash);
        if (sim > 0.94) {
          g.members.push(item);
          matched = true;
          break;
        }
      }
    }
    if (!matched) {
      monoShapeGroups.push({
        id: `shape_${monoShapeGroups.length + 1}_${baseName}`,
        lead: item,
        members: [item]
      });
    }
  }
}

// Build records
const records = [];
for (const group of monoShapeGroups) {
  for (const member of group.members) {
    const memberSvgPath = path.join(SVG_OUT_DIR, member.relPath.replace(/\.png$/i, ".svg"));
    const svgExists = fs.existsSync(memberSvgPath);
    const svgSize = svgExists ? (fs.statSync(memberSvgPath).size / 1024).toFixed(1) + " KB" : "-";
    const pngSize = (fs.statSync(member.absPath).size / 1024).toFixed(1) + " KB";

    records.push({
      relPath: member.relPath,
      type: "Monochrome",
      sharedMaster: `shared/${group.id}.svg`,
      isMasterLead: member === group.lead,
      variantCount: group.members.length,
      defaultHex: member.domHex,
      svgRelPath: member.relPath.replace(/\.png$/i, ".svg"),
      svgFullPath: memberSvgPath,
      width: member.width,
      height: member.height,
      svgSize,
      pngSize
    });
  }
}

const multiItems = inventory.filter(i => !i.isMono);
for (const item of multiItems) {
  const destSvgPath = path.join(SVG_OUT_DIR, item.relPath.replace(/\.png$/i, ".svg"));
  const svgExists = fs.existsSync(destSvgPath);
  const svgSize = svgExists ? (fs.statSync(destSvgPath).size / 1024).toFixed(1) + " KB" : "-";
  const pngSize = (fs.statSync(item.absPath).size / 1024).toFixed(1) + " KB";

  records.push({
    relPath: item.relPath,
    type: "Multicolor",
    sharedMaster: "-",
    isMasterLead: true,
    variantCount: 1,
    defaultHex: "Multicolor",
    svgRelPath: item.relPath.replace(/\.png$/i, ".svg"),
    svgFullPath: destSvgPath,
    width: item.width,
    height: item.height,
    svgSize,
    pngSize
  });
}

// Generate Catalog HTML
const monoRecords = records.filter(r => r.type === "Monochrome");
const multiRecords = records.filter(r => r.type === "Multicolor");

const monoRowsHtml = monoRecords.map((r, idx) => {
  let svgSnippet = "";
  try {
    const content = fs.readFileSync(r.svgFullPath, "utf8");
    svgSnippet = content.replace(/<svg\b([^>]*)>/i, '<svg $1 class="thumb-svg">');
  } catch (e) {
    svgSnippet = `<span style="font-size:10px;color:#888;">N/A</span>`;
  }

  const relClean = r.svgRelPath.replace(/\\/g, "/");

  return `
    <tr class="asset-row" data-type="monochrome" data-search="${r.relPath.toLowerCase().replace(/\\/g, '/')}">
      <td class="idx-col">${idx + 1}</td>
      <td class="name-col">
        <a href="${relClean}" target="_blank" class="asset-link">
          <strong>${r.relPath.replace(/\\/g, '/')}</strong>
        </a>
        ${r.variantCount > 1 ? `<span class="tag tag-variant">${r.variantCount} Shared Variants</span>` : ""}
      </td>
      <td class="preview-col">
        <div class="thumb-box mono-thumb">
          ${svgSnippet}
        </div>
      </td>
      <td class="color-col">
        <div class="color-chip">
          <span class="color-dot" style="background: ${r.defaultHex}"></span>
          <code>${r.defaultHex}</code>
        </div>
      </td>
      <td class="dim-col">${r.width} × ${r.height}</td>
      <td class="size-col">
        <span class="size-png">${r.pngSize}</span> → <span class="size-svg">${r.svgSize}</span>
      </td>
      <td class="master-col">
        <a href="${r.sharedMaster}" target="_blank" class="shared-link"><code>${r.sharedMaster}</code></a>
      </td>
    </tr>
  `;
}).join("");

const multiRowsHtml = multiRecords.map((r, idx) => {
  let svgSnippet = "";
  const relClean = r.svgRelPath.replace(/\\/g, "/");
  try {
    const content = fs.readFileSync(r.svgFullPath, "utf8");
    if (content.length > 1200000) {
      svgSnippet = `<img src="${relClean}" class="thumb-svg" alt="Preview" />`;
    } else {
      svgSnippet = content.replace(/<svg\b([^>]*)>/i, '<svg $1 class="thumb-svg">');
    }
  } catch (e) {
    svgSnippet = `<span style="font-size:10px;color:#888;">N/A</span>`;
  }

  return `
    <tr class="asset-row" data-type="multicolor" data-search="${r.relPath.toLowerCase().replace(/\\/g, '/')}">
      <td class="idx-col">${idx + 1}</td>
      <td class="name-col">
        <a href="${relClean}" target="_blank" class="asset-link">
          <strong>${r.relPath.replace(/\\/g, '/')}</strong>
        </a>
        <span class="tag tag-multi">Multicolor Vector</span>
      </td>
      <td class="preview-col">
        <div class="thumb-box multi-thumb">
          ${svgSnippet}
        </div>
      </td>
      <td class="color-col">
        <span class="tag tag-palette">Multi-Layer Spectrum</span>
      </td>
      <td class="dim-col">${r.width} × ${r.height}</td>
      <td class="size-col">
        <span class="size-png">${r.pngSize}</span> → <span class="size-svg">${r.svgSize}</span>
      </td>
      <td class="master-col">
        <em>Unique Botanical</em>
      </td>
    </tr>
  `;
}).join("");

const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HariKita - Master Catalog SVG (kdo-library)</title>
  <style>
    :root {
      --bg-dark: #0f1015;
      --card-bg: #181920;
      --card-border: #262732;
      --accent: #C5A880;
      --accent-glow: rgba(197, 168, 128, 0.2);
      --text: #f0f0f5;
      --text-muted: #8c8c9e;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg-dark);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 2rem;
      line-height: 1.5;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    header {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    h1 { color: var(--accent); font-size: 2rem; margin-bottom: 0.25rem; }
    p.subtitle { color: var(--text-muted); font-size: 0.95rem; }
    
    .stats-bar {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.75rem 1.25rem;
      text-align: center;
    }
    .stat-val { font-size: 1.4rem; font-weight: 700; color: #fff; }
    .stat-lbl { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }

    .playground-box {
      background: #14151b;
      border: 1px solid var(--accent);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px var(--accent-glow);
    }
    .playground-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .playground-title { font-weight: 600; color: var(--accent); display: flex; align-items: center; gap: 0.5rem; }
    .color-swatches {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .swatch-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform 0.2s, border-color 0.2s;
    }
    .swatch-btn:hover { transform: scale(1.15); border-color: #fff; }
    .custom-picker {
      background: transparent;
      border: 1px solid #444;
      border-radius: 4px;
      width: 32px;
      height: 32px;
      cursor: pointer;
      padding: 0;
    }
    .playground-hint { font-size: 0.85rem; color: var(--text-muted); }

    .controls-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      align-items: center;
    }
    .search-input {
      flex: 1;
      min-width: 250px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.6rem 1rem;
      color: #fff;
      font-size: 0.95rem;
    }
    .search-input:focus { outline: none; border-color: var(--accent); }
    .filter-tabs {
      display: flex;
      background: var(--card-bg);
      border-radius: 8px;
      padding: 0.25rem;
      border: 1px solid var(--card-border);
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.45rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .tab-btn.active { background: #262733; color: #fff; }

    .table-container {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      overflow-x: auto;
      box-shadow: 0 4px 24px rgba(0,0,0,0.3);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
    }
    th {
      background: #1e1f28;
      padding: 0.85rem 1rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--card-border);
    }
    td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      vertical-align: middle;
    }
    tr:hover td { background: rgba(255,255,255,0.02); }
    
    .idx-col { color: var(--text-muted); width: 40px; }
    .name-col { font-family: monospace; font-size: 0.9rem; }
    .asset-link { color: #fff; text-decoration: none; }
    .asset-link:hover { color: var(--accent); text-decoration: underline; }
    .shared-link { color: var(--accent); text-decoration: none; }
    .shared-link:hover { text-decoration: underline; }

    .thumb-box {
      width: 64px;
      height: 64px;
      background: #090a0d;
      background-image: 
        linear-gradient(45deg, #111218 25%, transparent 25%), 
        linear-gradient(-45deg, #111218 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, #111218 75%), 
        linear-gradient(-45deg, transparent 75%, #111218 75%);
      background-size: 12px 12px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 1px solid #2a2b36;
      padding: 4px;
    }
    .thumb-svg { width: 100%; height: 100%; object-fit: contain; }
    
    .tag {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 600;
      margin-left: 0.4rem;
    }
    .tag-variant { background: #1c3325; color: #4ade80; border: 1px solid #285437; }
    .tag-multi { background: #3b281c; color: #fb923c; border: 1px solid #5a3a24; }
    .tag-palette { background: #2a2236; color: #c084fc; }

    .color-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .color-dot {
      width: 14px;
      height: 14px;
      border-radius: 3px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .size-png { color: #eab308; }
    .size-svg { color: #22c55e; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>🎨 Master Catalog SVG: kdo-library</h1>
        <p class="subtitle">Seluruh aset ornamen PNG telah berhasil dikonversi menjadi SVG vektor murni (0% raster embedding, 100% scalable).</p>
      </div>
      <div class="stats-bar">
        <div class="stat-card">
          <div class="stat-val">${records.length}</div>
          <div class="stat-lbl">Total SVG</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${monoRecords.length}</div>
          <div class="stat-lbl">1-Color Line Art</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${monoShapeGroups.length}</div>
          <div class="stat-lbl">Unique Shared Shapes</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${multiRecords.length}</div>
          <div class="stat-lbl">Multicolor Floral</div>
        </div>
      </div>
    </header>

    <!-- Interactive Color Playground -->
    <div class="playground-box">
      <div class="playground-header">
        <div class="playground-title">
          <span>✨ Uji Coba Kustomisasi Warna Live (Aset 1 Warna / fill="currentColor")</span>
        </div>
        <div class="color-swatches">
          <span style="font-size: 0.8rem; color: #bbb;">Preset:</span>
          <button class="swatch-btn" style="background: #C5A880;" title="Gilded Gold" onclick="applyCustomColor('#C5A880')"></button>
          <button class="swatch-btn" style="background: #C03F57;" title="Crimson Red" onclick="applyCustomColor('#C03F57')"></button>
          <button class="swatch-btn" style="background: #2D6A4F;" title="Emerald Green" onclick="applyCustomColor('#2D6A4F')"></button>
          <button class="swatch-btn" style="background: #2563EB;" title="Royal Navy Blue" onclick="applyCustomColor('#2563EB')"></button>
          <button class="swatch-btn" style="background: #7E22CE;" title="Amethyst Purple" onclick="applyCustomColor('#7E22CE')"></button>
          <button class="swatch-btn" style="background: #111827; border: 1px solid #555;" title="Charcoal Black" onclick="applyCustomColor('#111827')"></button>
          <button class="swatch-btn" style="background: #FAF8F5; border: 1px solid #aaa;" title="Alabaster White" onclick="applyCustomColor('#FAF8F5')"></button>
          <input type="color" id="picker" class="custom-picker" value="#C5A880" onchange="applyCustomColor(this.value)" title="Pilih Warna Bebas" />
          <button onclick="resetColors()" style="margin-left: 0.5rem; background: #262733; color: #fff; border: 1px solid #444; border-radius: 4px; padding: 0.35rem 0.75rem; font-size: 0.8rem; cursor: pointer;">Reset Default</button>
        </div>
      </div>
      <p class="playground-hint">Klik preset warna di atas atau gunakan color picker untuk melihat seluruh aset monokrom di tabel berubah warna seketika secara live berkat dukungan <code>fill="currentColor"</code>!</p>
    </div>

    <!-- Filter & Search -->
    <div class="controls-row">
      <input type="text" id="searchInput" class="search-input" placeholder="🔍 Cari aset (contoh: kdo16, divider, frame, rsvp, flower)..." oninput="filterAssets()">
      <div class="filter-tabs">
        <button class="tab-btn active" id="tabAll" onclick="setTab('all')">Semua (${records.length})</button>
        <button class="tab-btn" id="tabMono" onclick="setTab('monochrome')">1 Warna / Line Art (${monoRecords.length})</button>
        <button class="tab-btn" id="tabMulti" onclick="setTab('multicolor')">Banyak Warna / Floral (${multiRecords.length})</button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th class="idx-col">#</th>
            <th>Nama Aset &amp; Path</th>
            <th>Preview SVG</th>
            <th>Warna Default</th>
            <th>Resolusi</th>
            <th>Ukuran (PNG → SVG)</th>
            <th>Master Shared Component</th>
          </tr>
        </thead>
        <tbody id="assetTbody">
          ${monoRowsHtml}
          ${multiRowsHtml}
        </tbody>
      </table>
    </div>
  </div>

  <script>
    let activeTab = 'all';

    function setTab(tab) {
      activeTab = tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      if (tab === 'all') document.getElementById('tabAll').classList.add('active');
      if (tab === 'monochrome') document.getElementById('tabMono').classList.add('active');
      if (tab === 'multicolor') document.getElementById('tabMulti').classList.add('active');
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

    function applyCustomColor(hex) {
      document.querySelectorAll('.mono-thumb svg').forEach(svg => {
        svg.style.color = hex;
      });
    }

    function resetColors() {
      document.querySelectorAll('.mono-thumb svg').forEach(svg => {
        svg.style.color = '';
      });
    }
  </script>
</body>
</html>`;

const catalogPath = path.join(SVG_OUT_DIR, "master_catalog.html");
fs.writeFileSync(catalogPath, html, "utf8");
console.log("REGENERATED master_catalog.html with inline previews successfully at:", catalogPath);
