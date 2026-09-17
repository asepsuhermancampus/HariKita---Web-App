const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const symbolSvg = fs.readFileSync('public/brand/harikita-symbol.svg', 'utf8');
const symbolPath = symbolSvg.match(/<path[^>]*d="([^"]+)"/)[1];

const wordmarkSvg = fs.readFileSync('public/brand/harikita-logo-horizontal.svg', 'utf8');
const wordmarkPath = wordmarkSvg.match(/viewBox="26 36 1898 388"[^>]*>[\s\S]*?<path d="([^"]+)"/)[1];

const sW = 46;
const sH = sW * (678 / 741); // 42.10
const wW = 104; // Let's also check with 104 vs 108
const wH = wW * (388 / 1898); // 21.26
const shoulderY = sH * 0.217; // 9.13

function renderNudgeRow(offsetY, label, wordmarkWidth = 104) {
  const wHeight = wordmarkWidth * (388 / 1898);
  const subtitleSize = 6.8;
  const subtitleTop = shoulderY + wHeight + 2.5 + offsetY;

  return `
    <g transform="translate(0, 0)">
      <text x="0" y="-12" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="bold" fill="#4A2E35">${label}</text>
      <!-- Red guide lines (Shoulder line and Baseline) -->
      <line x1="0" y1="${shoulderY}" x2="360" y2="${shoulderY}" stroke="#E53E3E" stroke-width="1.5"/>
      <line x1="0" y1="${sH}" x2="360" y2="${sH}" stroke="#E53E3E" stroke-width="1.5"/>

      <!-- Symbol -->
      <svg x="10" y="0" width="${sW}" height="${sH}" viewBox="602 13 741 678">
        <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
      </svg>

      <!-- Wordmark -->
      <svg x="${sW + 11}" y="${shoulderY + offsetY}" width="${wordmarkWidth}" height="${wHeight}" viewBox="26 36 1898 388">
        <path d="${wordmarkPath}" fill="#2B2B2B" fill-rule="evenodd"/>
      </svg>

      <!-- Subtitle -->
      <text x="${sW + 12}" y="${subtitleTop + subtitleSize}" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="${subtitleSize}" font-weight="600" fill="#88735B" letter-spacing="3.0">WEDDING &amp; EVENTS</text>
    </g>
  `;
}

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="420" viewBox="0 0 800 420" fill="#FAF8F5">
  <rect width="800" height="420" fill="#FAF8F5"/>
  <text x="30" y="32" font-family="'Playfair Display', Georgia, serif" font-size="18" font-weight="bold" fill="#2B2B2B">Koreksi Posisi Vertikal Teks: Diturunkan Presisi ke Dalam Garis</text>
  <text x="30" y="52" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#6B5E62">Garis merah atas = pundak H&amp;K, garis merah bawah = dasar H&amp;K.</text>

  <!-- Row 1: Current (Offset 0 - still poking above & floating above bottom) -->
  <g transform="translate(40, 85)">
    ${renderNudgeRow(0, 'Kondisi Sekarang (Teks agak terangkat ke atas, mengambang di bawah)')}
  </g>

  <!-- Row 2: Nudged Down +2.5px & Width 104px (Perfect tight fit) -->
  <g transform="translate(40, 190)">
    ${renderNudgeRow(2.5, 'Koreksi Diturunkan +2.5px &amp; Lebar 104px (Presisi menempel rata pada kedua garis) [REKOMENDASI]', 104)}
  </g>

  <!-- Row 3: Nudged Down +3.5px -->
  <g transform="translate(40, 295)">
    ${renderNudgeRow(3.5, 'Koreksi Diturunkan +3.5px &amp; Lebar 104px (Sedikit lebih dalam ke bawah)', 104)}
  </g>
</svg>
`;

const outPath = 'C:/Users/asep.suherman/.gemini/antigravity-ide/brain/0864abd2-810a-440d-9f93-bfaafb312e1a/harikita_downward_nudge_comparison.png';

sharp(Buffer.from(svg))
  .png()
  .toFile(outPath)
  .then(() => console.log('Saved downward nudge comparison to:', outPath))
  .catch(console.error);
