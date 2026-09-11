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
  console.log(`Building HariKita Granular Public Catalog for ${manifest.length} assets...`);

  // Subcategory Counts
  const counts = {};
  manifest.forEach(m => {
    const key = `${m.category}/${m.subCategory}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  const floralCorners = counts['floral/corners'] || 0;
  const floralHeaders = counts['floral/headers-garlands'] || 0;
  const floralCascades = counts['floral/side-cascades'] || 0;
  const floralCenterpieces = counts['floral/centerpieces'] || 0;
  const floralStems = counts['floral/single-stems'] || 0;

  const framesCards = counts['frames/full-cards'] || 0;
  const framesFiligree = counts['frames/filigree-corners'] || 0;
  const framesDividers = counts['frames/dividers-horizontal'] || 0;
  const framesPhoto = counts['frames/photo-frames'] || 0;

  const bgGradients = counts['backgrounds/gradients'] || 0;
  const bgTextures = counts['backgrounds/textures'] || 0;
  const starsCount = counts['decorative/stars-sparkles'] || 0;
  const iconsCount = counts['icons/events'] || 0;

  let cardsHtml = '';
  manifest.forEach((item) => {
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
      <div class="asset-card" 
        data-category="${item.category}" 
        data-subcategory="${item.subCategory}" 
        data-cat-sub="${item.category}/${item.subCategory}"
        data-search="${item.id.toLowerCase()} ${item.originalFile.toLowerCase()} ${item.category.toLowerCase()} ${item.subCategory.toLowerCase()}">
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
  <title>HariKita Asset Library — Katalog Anatomi Visual & Tata Letak Undangan</title>
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
      max-width: 950px;
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: #161b26;
      border: 1px solid #283245;
      border-radius: 10px;
      padding: 0.85rem 1rem;
    }
    .stat-num {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.15rem;
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
      padding: 1.25rem;
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
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
      padding: 0.65rem 1.1rem;
      color: #fff;
      font-size: 0.95rem;
    }
    .search-input:focus {
      outline: none;
      border-color: #c5a880;
    }
    .filter-group-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-bottom: 0.4rem;
      font-weight: 700;
    }
    .filter-tabs {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .tab-btn {
      background: #1e2638;
      border: 1px solid #334155;
      border-radius: 6px;
      color: #94a3b8;
      padding: 0.4rem 0.75rem;
      font-size: 0.8rem;
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
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
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
      height: 190px;
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
      font-size: 0.88rem;
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
      <span class="brand-pill">VISUAL ANATOMY EDITION</span>
    </div>
    <p class="brand-desc">Katalog resmi aset vektor HariKita yang dikelompokkan secara mendalam berdasarkan <strong>anatomi bentuk &amp; posisi tata letak undangan</strong> (Sudut Bunga L-Shape, Mahkota Garlands Horizontal, Rangkaian Menjuntai Sisi Kiri/Kanan, Buket Tengah, Pemisah Section, dan Bingkai Kartu).</p>
  </div>

  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-num" style="color: #38bdf8;">${manifest.length}</div>
      <div class="stat-lbl">Total Aset</div>
    </div>
    <div class="stat-card">
      <div class="stat-num" style="color: #fed7aa;">${floralCorners}</div>
      <div class="stat-lbl">🌸 Sudut L-Shape</div>
    </div>
    <div class="stat-card">
      <div class="stat-num" style="color: #fbcfe8;">${floralHeaders}</div>
      <div class="stat-lbl">👑 Garlands Atas</div>
    </div>
    <div class="stat-card">
      <div class="stat-num" style="color: #a7f3d0;">${floralCascades}</div>
      <div class="stat-lbl">🌿 Samping Ponsel</div>
    </div>
    <div class="stat-card">
      <div class="stat-num" style="color: #fca5a5;">${floralCenterpieces}</div>
      <div class="stat-lbl">💐 Buket Tengah</div>
    </div>
    <div class="stat-card">
      <div class="stat-num" style="color: #93c5fd;">${framesFiligree}</div>
      <div class="stat-lbl">✨ Renda Sudut</div>
    </div>
    <div class="stat-card">
      <div class="stat-num" style="color: #fde047;">${framesDividers}</div>
      <div class="stat-lbl">📏 Garis Pemisah</div>
    </div>
  </div>

  <div class="controls">
    <div class="search-row">
      <input type="text" id="searchInput" class="search-input" placeholder="🔍 Cari nama aset, posisi (contoh: corner, cascade, garland, centerpiece, divider)..." oninput="filterAssets()">
    </div>

    <div>
      <div class="filter-group-title">🎯 Filter Posisi &amp; Anatomi Tata Letak:</div>
      <div class="filter-tabs">
        <button class="tab-btn active" onclick="setFilter('all', this)">Semua (${manifest.length})</button>
        <button class="tab-btn" onclick="setFilter('floral/corners', this)">🌸 Sudut L-Shape (${floralCorners})</button>
        <button class="tab-btn" onclick="setFilter('floral/headers-garlands', this)">👑 Garlands Atas/Bawah (${floralHeaders})</button>
        <button class="tab-btn" onclick="setFilter('floral/side-cascades', this)">🌿 Samping Ponsel (${floralCascades})</button>
        <button class="tab-btn" onclick="setFilter('floral/centerpieces', this)">💐 Buket Tengah (${floralCenterpieces})</button>
        <button class="tab-btn" onclick="setFilter('floral/single-stems', this)">🌱 Tangkai Tunggal (${floralStems})</button>
        <button class="tab-btn" onclick="setFilter('frames/filigree-corners', this)">✨ Renda Sudut Filigree (${framesFiligree})</button>
        <button class="tab-btn" onclick="setFilter('frames/dividers-horizontal', this)">📏 Garis Pemisah (${framesDividers})</button>
        <button class="tab-btn" onclick="setFilter('frames/full-cards', this)">🖼️ Bingkai 1 Halaman (${framesCards})</button>
        <button class="tab-btn" onclick="setFilter('frames/photo-frames', this)">📷 Bingkai Foto (${framesPhoto})</button>
        <button class="tab-btn" onclick="setFilter('backgrounds/gradients', this)">🎨 Gradasi Latar (${bgGradients})</button>
        <button class="tab-btn" onclick="setFilter('backgrounds/textures', this)">📜 Tekstur Kertas (${bgTextures})</button>
        <button class="tab-btn" onclick="setFilter('decorative/stars-sparkles', this)">⭐ Bintang/Kilau (${starsCount})</button>
        <button class="tab-btn" onclick="setFilter('icons/events', this)">📍 Ikon Agenda (${iconsCount})</button>
      </div>
    </div>
  </div>

  <div class="grid-container" id="assetGrid">
    ${cardsHtml}
  </div>

  <div id="toast" class="toast">Path berhasil disalin ke clipboard!</div>

  <script>
    let activeFilter = 'all';

    function setFilter(filterVal, btn) {
      activeFilter = filterVal;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterAssets();
    }

    function filterAssets() {
      const q = document.getElementById('searchInput').value.toLowerCase().trim();
      const cards = document.querySelectorAll('.asset-card');

      cards.forEach(card => {
        const catSub = card.getAttribute('data-cat-sub');
        const category = card.getAttribute('data-category');
        const search = card.getAttribute('data-search');

        let matchFilter = false;
        if (activeFilter === 'all') matchFilter = true;
        else matchFilter = (catSub === activeFilter || category === activeFilter);

        const matchSearch = (!q || search.includes(q));

        card.style.display = (matchFilter && matchSearch) ? '' : 'none';
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
  console.log(`Saved Enhanced Visual Anatomy Catalog at: ${catalogPath} (${(fullHtml.length / 1024).toFixed(1)} KB)`);
}

if (require.main === module) {
  generateCatalog();
}

module.exports = {
  generateCatalog
};
