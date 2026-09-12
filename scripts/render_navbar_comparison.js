const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Paths
const symbolSvg = fs.readFileSync('public/brand/harikita-symbol.svg', 'utf8');
const symbolPath = symbolSvg.match(/<path[^>]*d="([^"]+)"/)[1];

const wordmarkSvg = fs.readFileSync('public/brand/harikita-logo-horizontal.svg', 'utf8');
const wordmarkPath = wordmarkSvg.match(/viewBox="26 36 1898 388"[^>]*>[\s\S]*?<path d="([^"]+)"/)[1];

// Generate an SVG preview comparing Current vs Proposed Adjustments in a simulated Navbar (80px height, #FAF8F5 background)
// In each row:
// We show the Navbar bar with: [Logo] --- [11 Layanan Kebumen] [Tema Undangan (65+)] --- [Akses Portal] [Racik Paket Hari H]

function renderNavbarRow(title, label, sW, sH, wW, wH, gap, textOffset, subtitleSize, subMt) {
  // sW, sH: symbol dimensions
  // wW, wH: wordmark dimensions
  return `
    <g transform="translate(40, ${textOffset})">
      <text x="0" y="-18" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" fill="#4A2E35">${title}</text>
      <text x="320" y="-18" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#88735B">${label}</text>

      <!-- Simulated Navbar Container (Height 80px) -->
      <rect x="0" y="0" width="1040" height="80" rx="8" fill="#FAF8F5" stroke="#C5A880" stroke-width="1" stroke-opacity="0.3"/>
      <!-- Guideline center line (subtle) -->
      <line x1="0" y1="40" x2="1040" y2="40" stroke="#C5A880" stroke-dasharray="4,4" stroke-width="0.8" opacity="0.4"/>

      <!-- Logo Group centered vertically at Y = 40 -->
      <!-- Let's calculate total logo block height and center it at Y=40 -->
      <g transform="translate(32, 0)">
        <!-- Symbol -->
        <g transform="translate(0, ${40 - sH / 2})">
          <svg width="${sW}" height="${sH}" viewBox="602 13 741 678">
            <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
          </svg>
        </g>

        <!-- Wordmark & Subtitle -->
        <!-- Center wordmark block or align optically -->
        <g transform="translate(${sW + gap}, 0)">
          <!-- Wordmark -->
          <g transform="translate(0, ${40 - (wH + 14) / 2})">
            <svg width="${wW}" height="${wH}" viewBox="26 36 1898 388">
              <path d="${wordmarkPath}" fill="#2B2B2B" fill-rule="evenodd"/>
            </svg>
            <text x="1" y="${wH + subMt}" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="${subtitleSize}" font-weight="600" fill="#88735B" letter-spacing="2.8">WEDDING &amp; EVENTS</text>
          </g>
        </g>
      </g>

      <!-- Simulated Nav Items -->
      <g transform="translate(420, 45)">
        <text x="0" y="0" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="500" fill="#6B5E62">◎ 11 Layanan Kebumen</text>
        <text x="180" y="0" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="500" fill="#6B5E62">✉ Tema Undangan (65+)</text>
      </g>

      <!-- Simulated Action Buttons -->
      <g transform="translate(790, 24)">
        <!-- Portal button -->
        <rect x="0" y="0" width="105" height="32" rx="16" fill="none" stroke="#C5A880" stroke-opacity="0.4"/>
        <text x="52" y="20" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="500" fill="#4A2E35">Akses Portal</text>

        <!-- CTA button -->
        <rect x="115" y="0" width="125" height="32" rx="16" fill="#C5A880"/>
        <text x="177" y="20" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="600" fill="#FAF8F5">✨ Racik Paket</text>
      </g>
    </g>
  `;
}

const currentH = 44 * (678 / 741); // ~40.26
const currentW = 148 * (388 / 1898); // ~30.25

// Option 1: Balanced Editorial (Wordmark 120px -> ~24.5px height, Symbol 38px -> 34.7px height)
// Option 2: Sleek & Proportionate (Wordmark 110px -> ~22.5px height, Symbol 35px -> 32px height)
// Option 3: Ultra Refined (Wordmark 100px -> ~20.4px height, Symbol 32px -> 29.3px height)

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="520" viewBox="0 0 1120 520" fill="#F3EDE6">
  <rect width="1120" height="520" fill="#F3EDE6"/>
  <text x="40" y="36" font-family="'Playfair Display', Georgia, serif" font-size="22" font-weight="bold" fill="#2B2B2B">Kalibrasi Presisi &amp; Skala Ukuran Logo HariKita pada Navbar</text>
  <text x="40" y="58" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#6B5E62">Garis putus-putus emas menunjukkan sumbu tengah vertikal tepat (Y = 40px) dari navbar h-80px.</text>

  ${renderNavbarRow('SEKARANG (Current)', 'Wordmark 148px (Terlalu Dominan &amp; sedikit turun karena subtitle)', 44, currentH, 148, currentW, 12, 100, 8.5, 11)}
  ${renderNavbarRow('OPSI A: Balanced Editorial (Rekomendasi)', 'Wordmark 118px (-20%), Symbol 38px, presisi sumbu tengah vertikal simetris', 38, 38 * (678 / 741), 118, 118 * (388 / 1898), 10, 240, 7.5, 9.5)}
  ${renderNavbarRow('OPSI B: Sleek &amp; Intimate Minimalist', 'Wordmark 106px (-28%), Symbol 34px, proporsi sangat ramping dan senada tombol', 34, 34 * (678 / 741), 106, 106 * (388 / 1898), 9, 380, 7, 8.5)}
</svg>`;

const outPath = path.join('C:/Users/asep.suherman/.gemini/antigravity-ide/brain/0864abd2-810a-440d-9f93-bfaafb312e1a', 'harikita_navbar_calibration_comparison.png');

sharp(Buffer.from(svgContent))
  .png()
  .toFile(outPath)
  .then(() => {
    console.log('Saved calibration comparison to:', outPath);
  })
  .catch(console.error);
