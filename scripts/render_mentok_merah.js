const fs = require('fs');
const sharp = require('sharp');

const symbolSvg = fs.readFileSync('public/brand/harikita-symbol.svg', 'utf8');
const symbolPath = symbolSvg.match(/<path[^>]*d="([^"]+)"/)[1];

const wordmarkSvg = fs.readFileSync('public/brand/harikita-logo-horizontal.svg', 'utf8');
const wordmarkPath = wordmarkSvg.match(/viewBox="26 36 1898 388"[^>]*>[\s\S]*?<path d="([^"]+)"/)[1];

// Current parameters in HariKitaLogo.tsx:
// sWidth = 46, sHeight = 42.1
// translate-y-[2.5px]
// User screenshot media_1789186609549.png shows:
// The red line is at the top of the left stem of H.
// In 741x678 viewBox:
// Top of left stem: Y ~135 (approx 135/678 = 0.199 of sHeight)
// For sHeight = 42.1, red line Y = 42.1 * 0.199 = 8.38px from symbol top.
//
// Current wordmark: wWidth = 104 -> wHeight = 21.26px.
// Bottom of subtitle is at Y = 42.1 + 2.5 = 44.6px (or baseline ~41.5px).
// If subtitle stays at current position, and top of wordmark must reach Y = 8.38px:
// Total height available from red line (8.38) to subtitle baseline (~41.5) is: 41.5 - 8.38 = 33.12px!
// If subtitle (text + mt) takes ~8.0px, then wordmark height must be ~25.1px!
// Wordmark width for 25.1px height = 25.1 * (1898 / 388) = 122.8px (~122px - 124px)!

const sW = 46;
const sH = sW * (678 / 741); // 42.10
const redLineY = sH * 0.199; // 8.38px (top of left stem)

function renderSimulation(wW, mt, label) {
  const wH = wW * (388 / 1898);
  const subSize = 6.8;
  // Subtitle position fixed at bottom
  const botY = sH; 
  // Wordmark top touches redLineY exactly!
  const wordmarkTop = redLineY;
  const subtitleY = wordmarkTop + wH + mt + subSize;

  return `
    <g transform="translate(0, 0)">
      <text x="0" y="-14" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="bold" fill="#4A2E35">${label}</text>
      <!-- Red guide line at stem top -->
      <line x1="0" y1="${redLineY}" x2="380" y2="${redLineY}" stroke="#E53E3E" stroke-width="1.8"/>

      <!-- Symbol -->
      <svg x="10" y="0" width="${sW}" height="${sH}" viewBox="602 13 741 678">
        <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
      </svg>

      <!-- Wordmark touching red line -->
      <svg x="${sW + 11}" y="${wordmarkTop}" width="${wW}" height="${wH}" viewBox="26 36 1898 388">
        <path d="${wordmarkPath}" fill="#2B2B2B" fill-rule="evenodd"/>
      </svg>

      <!-- Subtitle at current position -->
      <text x="${sW + 12}" y="${subtitleY}" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="${subSize}" font-weight="600" fill="#88735B" letter-spacing="3.0">WEDDING &amp; EVENTS</text>
    </g>
  `;
}

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="850" height="460" viewBox="0 0 850 460" fill="#FAF8F5">
  <rect width="850" height="460" fill="#FAF8F5"/>
  <text x="30" y="32" font-family="'Playfair Display', Georgia, serif" font-size="18" font-weight="bold" fill="#2B2B2B">Kalibrasi: Wordmark HariKita Mentok ke Garis Merah</text>
  <text x="30" y="52" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#6B5E62">Posisi Wedding &amp; Events tetap dipertahankan, tinggi HariKita dinaikkan hingga puncak H &amp; K menyentuh garis merah.</text>

  <!-- Current -->
  <g transform="translate(40, 95)">
    <text x="0" y="-14" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="bold" fill="#4A2E35">Saat Ini (wWidth 104px - Ada celah antara puncak HariKita dan garis merah)</text>
    <line x1="0" y1="${redLineY}" x2="380" y2="${redLineY}" stroke="#E53E3E" stroke-width="1.8"/>
    <svg x="10" y="0" width="${sW}" height="${sH}" viewBox="602 13 741 678">
      <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
    </svg>
    <svg x="${sW + 11}" y="${redLineY + 3.8}" width="104" height="${104 * 388 / 1898}" viewBox="26 36 1898 388">
      <path d="${wordmarkPath}" fill="#2B2B2B" fill-rule="evenodd"/>
    </svg>
    <text x="${sW + 12}" y="${redLineY + 3.8 + (104 * 388 / 1898) + 2.5 + 6.8}" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="6.8" font-weight="600" fill="#88735B" letter-spacing="3.0">WEDDING &amp; EVENTS</text>
  </g>

  <!-- Option A: wWidth 122px (Touches red line perfectly, Wedding & Events at exact same bottom) -->
  <g transform="translate(40, 215)">
    ${renderSimulation(122, 2.5, 'Opsi Rekomendasi: wWidth 122px (Puncak HariKita mentok pas di garis merah, Wedding &amp; Events tetap)')}
  </g>

  <!-- Option B: wWidth 125px (Slightly bolder fit) -->
  <g transform="translate(40, 335)">
    ${renderSimulation(125, 2.0, 'Opsi B: wWidth 125px (Lebih tegas menempel rapat ke garis merah)')}
  </g>
</svg>
`;

const outPath = 'C:/Users/asep.suherman/.gemini/antigravity-ide/brain/0864abd2-810a-440d-9f93-bfaafb312e1a/harikita_mentok_garis_merah.png';

sharp(Buffer.from(svg))
  .png()
  .toFile(outPath)
  .then(() => console.log('Generated harikita_mentok_garis_merah.png'))
  .catch(console.error);
