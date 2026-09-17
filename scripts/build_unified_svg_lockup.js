const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Load paths
const symbolSvg = fs.readFileSync('public/brand/harikita-symbol.svg', 'utf8');
const symbolPath = symbolSvg.match(/<path[^>]*d="([^"]+)"/)[1];

const wordmarkSvg = fs.readFileSync('public/brand/harikita-logo-horizontal.svg', 'utf8');
const wordmarkPath = wordmarkSvg.match(/viewBox="26 36 1898 388"[^>]*>[\s\S]*?<path d="([^"]+)"/)[1];

// Let's analyze the symbol viewBox: 602 13 741 678
// We want to construct a unified coordinate space, for example:
// Total Height = 100
// Symbol:
// Aspect ratio of symbol: 741 / 678 = 1.09292
// For Symbol Height = 100:
// Symbol Width = 100 * (741 / 678) = 109.29
//
// In symbol viewBox="602 13 741 678":
// Let's find the exact Y coordinate of the shoulder (top of the H stem) in that 678 height!
// Earlier in scratch_check_bounds, we know:
// In 678 height, the shoulder is at Y = 135-145 (around 20-21% of 678).
// So on a 100-height scale:
// - Top of symbol (heads) = Y: 0
// - Shoulder of H&K = Y: 20.5 (THIS IS THE EXACT TOP RED LINE)
// - Baseline of symbol = Y: 100.0 (THIS IS THE EXACT BOTTOM RED LINE)
//
// Therefore:
// The total vertical space between Top Red Line (20.5) and Bottom Red Line (100.0) is:
// Delta Y = 100.0 - 20.5 = 79.5!
//
// Inside this 79.5 space:
// - Wordmark "HariKita" begins at Y: 20.5 (EXACTLY on the shoulder line!).
// - Subtitle "WEDDING & EVENTS" ends at Y: 100.0 (EXACTLY on the baseline!).
//
// Let's divide the 79.5 height:
// - Wordmark height: 58.0
// - Gap between Wordmark and Subtitle: 5.5
// - Subtitle font-size: 16.0 (cap-height ~11.5, descent ~4.5) -> baseline sits at Y = 98.5, touching 100.0!
//
// And for Wordmark width:
// In wordmark viewBox="26 36 1898 388", aspect ratio = 1898 / 388 = 4.89175
// Wordmark width for 58.0 height = 58.0 * (1898 / 388) = 283.72
//
// Total SVG Width:
// Symbol width: 109.3
// Gap between symbol and wordmark: 26.0
// Wordmark width: 283.7
// Right padding: 5.0
// Total Width = 109.3 + 26.0 + 283.7 + 5.0 = 424.0
//
// Total ViewBox = "0 0 424 100" (Height 100)

function buildUnifiedSvg(showGuides = false, symbolColor = '#88735B', wordmarkColor = '#2B2B2B', subtitleColor = '#88735B') {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 424 100" width="424" height="100" fill="none">
    ${showGuides ? `
      <!-- Red Guide Lines -->
      <line x1="0" y1="20.5" x2="424" y2="20.5" stroke="#E53E3E" stroke-width="2"/>
      <line x1="0" y1="100" x2="424" y2="100" stroke="#E53E3E" stroke-width="2"/>
    ` : ''}

    <!-- 1. Monogram Symbol H&K (Height 100) -->
    <svg x="0" y="0" width="109.3" height="100" viewBox="602 13 741 678">
      <path d="${symbolPath}" fill="${symbolColor}" fill-rule="evenodd"/>
    </svg>

    <!-- 2. Wordmark HariKita (Top locked flush at Y=20.5, Height 58.0) -->
    <svg x="135" y="20.5" width="283.7" height="58.0" viewBox="26 36 1898 388">
      <path d="${wordmarkPath}" fill="${wordmarkColor}" fill-rule="evenodd"/>
    </svg>

    <!-- 3. Subtitle WEDDING & EVENTS (Baseline locked flush at bottom) -->
    <text x="138" y="98" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="17" font-weight="600" fill="${subtitleColor}" letter-spacing="4.8">WEDDING &amp; EVENTS</text>
  </svg>
  `;
}

// Generate test image to verify with Sharp
const testSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="380" viewBox="0 0 900 380" fill="#FAF8F5">
  <rect width="900" height="380" fill="#FAF8F5"/>
  <text x="30" y="32" font-family="'Playfair Display', Georgia, serif" font-size="18" font-weight="bold" fill="#2B2B2B">Desain Single-SVG Lockup (Satu Sistem Koordinat Vektor Absolut)</text>
  <text x="30" y="52" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#6B5E62">Tidak ada lagi flexbox HTML, tidak ada lagi translate-y. Seluruh elemen terkunci matematis di dalam satu SVG viewBox tunggal.</text>

  <!-- Panel 1: With Red Guides -->
  <g transform="translate(30, 80)">
    <text x="0" y="-10" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="bold" fill="#4A2E35">1. DENGAN GARIS PANDUAN MERAH (Puncak HariKita mentok di 20.5, dasar mentok di 100)</text>
    <g transform="scale(0.85)">
      ${buildUnifiedSvg(true)}
    </g>
  </g>

  <!-- Panel 2: In Navbar Context (Clean) -->
  <g transform="translate(30, 220)">
    <text x="0" y="-10" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="bold" fill="#4A2E35">2. HASIL PADA NAVBAR (Tinggi 40px pada navbar 80px, presisi 100%)</text>
    <rect x="0" y="0" width="840" height="70" rx="8" fill="#FAF8F5" stroke="#C5A880" stroke-opacity="0.3"/>
    <!-- Center line -->
    <line x1="0" y1="35" x2="840" y2="35" stroke="#C5A880" stroke-dasharray="3,3" stroke-width="0.8" opacity="0.4"/>
    
    <!-- Unified SVG logo scaled to height 40px -->
    <g transform="translate(30, 15)">
      <svg width="${40 * (424 / 100)}" height="40" viewBox="0 0 424 100">
        ${buildUnifiedSvg(false).replace(/<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')}
      </svg>
    </g>

    <!-- Nav Items -->
    <g transform="translate(420, 39)">
      <text x="0" y="0" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="500" fill="#6B5E62">◎ 11 Layanan Kebumen</text>
      <text x="180" y="0" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="500" fill="#6B5E62">✉ Tema Undangan (65+)</text>
    </g>

    <!-- Buttons -->
    <g transform="translate(680, 20)">
      <rect x="0" y="0" width="85" height="30" rx="15" fill="none" stroke="#C5A880" stroke-opacity="0.4"/>
      <text x="42" y="19" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="500" fill="#4A2E35">Akses Portal</text>

      <rect x="95" y="0" width="75" height="30" rx="15" fill="#C5A880"/>
      <text x="132" y="19" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#FAF8F5">✨ Racik</text>
    </g>
  </g>
</svg>
`;

const outPath = 'C:/Users/asep.suherman/.gemini/antigravity-ide/brain/0864abd2-810a-440d-9f93-bfaafb312e1a/harikita_unified_svg_calibration.png';

sharp(Buffer.from(testSvg))
  .png()
  .toFile(outPath)
  .then(() => console.log('Successfully generated unified SVG calibration preview:', outPath))
  .catch(console.error);
