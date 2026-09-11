const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TARGET_ASSETS_DIR = path.join(ROOT_DIR, 'public', 'harikita-assets');
const MANIFEST_PATH = path.join(TARGET_ASSETS_DIR, 'harikita_manifest.json');

function generateCatalog() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('Manifest not found at:', MANIFEST_PATH);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  console.log(`Building HariKita Public Catalog for ${manifest.length} assets...`);

  const floralCount = manifest.filter(m => m.category === 'floral').length;
  const framesCount = manifest.filter(m => m.category === 'frames').length;
  const bgCount = manifest.filter(m => m.category === 'backgrounds').length;
  const decoCount = manifest.filter(m => m.category === 'decorative').length;
  const iconsCount = manifest.filter(m => m.category === 'icons').length;
  const whitelistCount = manifest.filter(m => m.isWhitelisted).length;

  let cardsHtml = '';
  manifest.forEach((item, idx) => {
    const badgeClass =
      item.category === 'floral'
        ? 'badge-floral'
        : item.category === 'frames'
        ? 'badge-frames'
        : item.category === 'backgrounds'
        ? 'badge-bg'
        : item.category === 'decorative'
        ? 'badge-deco'
        : 'badge-icon';

    const whitelistBadge = item.isWhitelisted
      ? `<span class="badge badge-gold" title="Grade A Whitelist">🔒 Whitelist</span>`
      : '';

    cardsHtml += `
      <div class="asset-card" data-category="${item.category}" data-subcategory="${item.subCategory}" data-search="${item.id.toLowerCase()} ${item.originalFile.toLowerCase()} ${item.category.toLowerCase()} ${item.subCategory.toLowerCase()}">
        <div class="card-preview checker-bg">
          <img src="${item.relativePath}" alt="${item.id}" loading="lazy" class="preview-img">
        </div>
        <div class="card-info">
          <div class="card-tags">
            <span class="badge ${badgeClass}">${item.category} / ${item.subCategory}</span>
            ${whitelistBadge}
          </div>
          <div class="card-name" title="${item.id}">${item.id}.svg</div>
          <div class="card-meta">
            <span class="orig-ref" title="Sumber referensi asal">Ref: ${item.originalFile}</span>
            <span class="size-badge">${item.sizeKb} KB</span>
          </div>
          <div class="card-actions">
            <button class="btn-copy" onclick="copyPath('${item.publicUrl}', this)">📋 Salin Path</button>
            <a href="${item.relativePath}" target="_blank" class="btn-open">Buka ↗</a>
          </div>
        </div>
      </div>
    `;
  });

  const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HariKita Asset Library — Katalog Ilustrasi & Ornamen Resmi</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0d0f17;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 2rem;
      line-height: 1.5;
    }
    .header {
      margin-bottom: 2rem;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 1.5rem;
    }
    .brand-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.8rem;
      font-weight: 700;
      color: #faf8f5;
    }
    .brand-pill {
      background: linear-gradient(135deg, #c5a880 0%, #9e7f57 100%);
      color: #1e1315;
      font-size: 0.75rem;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .brand-desc {
      color: #94a3b8;
      font-size: 0.95rem;
      margin-top: 0.5rem;
      max-width: 900px;
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: #161b26;
      border: 1px solid #283245;
      border-radius: 10px;
      padding: 1rem 1.25rem;
    }
    .stat-num {
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: 0.2rem;
    }
    .stat-lbl {
      color: #64748b;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .controls {
      background: #161b26;
      border: 1px solid #283245;
      border-radius: 10px;
      padding: 1rem 1.25rem;
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .search-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .search-input {
      flex: 1;
      min-width: 280px;
      background: #0d0f17;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 0.6rem 1.1rem;
      color: #fff;
      font-size: 0.95rem;
    }
    .search-input:focus {
      outline: none;
      border-color: #c5a880;
    }
    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .tab-btn {
      background: #1e2638;
      border: 1px solid #334155;
      border-radius: 6px;
      color: #94a3b8;
      padding: 0.45rem 0.85rem;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .tab-btn:hover {
      background: #2b364e;
      color: #fff;
    }
    .tab-btn.active {
      background: #c5a880;
      border-color: #c5a880;
      color: #1e1315;
      font-weight: 700;
    }
    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    .asset-card {
      background: #161b26;
      border: 1px solid #283245;
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .asset-card:hover {
      transform: translateY(-3px);
      border-color: #c5a880;
    }
    .card-preview {
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .checker-bg {
      background: #0f121a;
      background-image: 
        linear-gradient(45deg, #181d2a 25%, transparent 25%), 
        linear-gradient(-45deg, #181d2a 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, #181d2a 75%), 
        linear-gradient(-45deg, transparent 75%, #181d2a 75%);
      background-size: 16px 16px;
      background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
    }
    .preview-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .card-info {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      border-top: 1px solid #283245;
      flex: 1;
    }
    .card-tags {
      display: flex;
      gap: 0.35rem;
      flex-wrap: wrap;
    }
    .badge {
      font-size: 0.7rem;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .badge-floral { background: #4a2e35; color: #fed7aa; }
    .badge-frames { background: #334155; color: #93c5fd; }
    .badge-bg { background: #3b2a45; color: #e9d5ff; }
    .badge-deco { background: #2e384d; color: #fde047; }
    .badge-icon { background: #1e3a3a; color: #6ee7b7; }
    .badge-gold { background: #78350f; color: #fde68a; border: 1px solid #b45309; }
    .card-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: #f8fafc;
      word-break: break-word;
    }
    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: #64748b;
    }
    .orig-ref {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 140px;
    }
    .size-badge {
      color: #4ade80;
      font-weight: 600;
    }
    .card-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: auto;
      padding-top: 0.5rem;
    }
    .btn-copy {
      flex: 1;
      background: #1e2638;
      border: 1px solid #334155;
      color: #cbd5e1;
      padding: 0.4rem;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-copy:hover {
      background: #c5a880;
      color: #1e1315;
      border-color: #c5a880;
      font-weight: 600;
    }
    .btn-copy.copied {
      background: #10b981;
      color: #fff;
      border-color: #10b981;
    }
    .btn-open {
      background: #1e2638;
      border: 1px solid #334155;
      color: #94a3b8;
      padding: 0.4rem 0.65rem;
      border-radius: 6px;
      text-decoration: none;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      transition: all 0.15s ease;
    }
    .btn-open:hover {
      color: #fff;
      border-color: #64748b;
    }
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #10b981;
      color: #fff;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }
    .toast.show {
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-title">
      HariKita Asset Library
      <span class="brand-pill">PRODUCTION READY</span>
    </div>
    <p class="brand-desc">Katalog resmi aset vektor SVG HariKita untuk tema pre-wedding, lamaran, dan pernikahan intim Kebumen. Terorganisir rapi per kategori, siap pakai langsung via URL publik Next.js.</p>
  </div>

  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-num" style="color: #38bdf8;">${manifest.length}</div>
      <div class="stat-lbl">Total Aset Vektor</div>
    </div>
    <div class="stat-card">
      <div class="stat-num" style="color: #fed7aa;">${floralCount}</div>
      <div class="stat-lbl">Floral &amp; Botanikal</div>
    </div>
    <div class="stat-card">
      <div class="stat-num" style="color: #93c5fd;">${framesCount}</div>
      <div class="stat-lbl">Frames &amp; Filigree</div>
    </div>
    <div class="stat-card">
      <div class="stat-num" style="color: #e9d5ff;">${bgCount}</div>
      <div class="stat-lbl">Backgrounds</div>
    </div>
    <div class="stat-card">
      <div class="stat-num" style="color: #fbbf24;">${whitelistCount}</div>
      <div class="stat-lbl">🔒 Grade A Whitelist</div>
    </div>
  </div>

  <div class="controls">
    <div class="search-row">
      <input type="text" id="searchInput" class="search-input" placeholder="🔍 Cari nama aset semantik atau referensi asli (contoh: rose, filigree, gold, 1754648453)..." oninput="filterAssets()">
    </div>
    <div class="filter-tabs">
      <button class="tab-btn active" id="tabAll" onclick="setCategory('all')">Semua (${manifest.length})</button>
      <button class="tab-btn" id="tabFloral" onclick="setCategory('floral')">🌸 Floral (${floralCount})</button>
      <button class="tab-btn" id="tabFrames" onclick="setCategory('frames')">🖼️ Frames &amp; Filigree (${framesCount})</button>
      <button class="tab-btn" id="tabBg" onclick="setCategory('backgrounds')">🎨 Backgrounds (${bgCount})</button>
      <button class="tab-btn" id="tabDeco" onclick="setCategory('decorative')">✨ Decorative (${decoCount})</button>
      <button class="tab-btn" id="tabIcons" onclick="setCategory('icons')">📍 Icons (${iconsCount})</button>
    </div>
  </div>

  <div class="grid-container" id="assetGrid">
    ${cardsHtml}
  </div>

  <div id="toast" class="toast">Path berhasil disalin ke clipboard!</div>

  <script>
    let activeCat = 'all';

    function setCategory(cat) {
      activeCat = cat;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      const idMap = {
        'all': 'tabAll',
        'floral': 'tabFloral',
        'frames': 'tabFrames',
        'backgrounds': 'tabBg',
        'decorative': 'tabDeco',
        'icons': 'tabIcons'
      };
      if (idMap[cat]) document.getElementById(idMap[cat]).classList.add('active');
      filterAssets();
    }

    function filterAssets() {
      const q = document.getElementById('searchInput').value.toLowerCase().trim();
      const cards = document.querySelectorAll('.asset-card');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const search = card.getAttribute('data-search');

        const matchCat = (activeCat === 'all' || cat === activeCat);
        const matchSearch = (!q || search.includes(q));

        card.style.display = (matchCat && matchSearch) ? '' : 'none';
      });
    }

    function copyPath(path, btn) {
      navigator.clipboard.writeText(path).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Tersalin!';
        btn.classList.add('copied');
        showToast('Tersalin: ' + path);
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('copied');
        }, 1500);
      });
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.innerText = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2000);
    }
  </script>
</body>
</html>`;

  const catalogPath = path.join(TARGET_ASSETS_DIR, 'catalog.html');
  fs.writeFileSync(catalogPath, fullHtml, 'utf8');
  console.log(`Saved HariKita Public Catalog at: ${catalogPath} (${(fullHtml.length / 1024).toFixed(1)} KB)`);
}

if (require.main === module) {
  generateCatalog();
}

module.exports = {
  generateCatalog
};
