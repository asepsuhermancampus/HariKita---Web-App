const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const symbolSvg = fs.readFileSync('public/brand/harikita-symbol.svg', 'utf8');
const symbolPath = symbolSvg.match(/<path[^>]*d="([^"]+)"/)[1];

const wordmarkSvg = fs.readFileSync('public/brand/harikita-logo-horizontal.svg', 'utf8');
const wordmarkPath = wordmarkSvg.match(/viewBox="26 36 1898 388"[^>]*>[\s\S]*?<path d="([^"]+)"/)[1];

// Let's compute exact pixel alignment:
// Symbol: viewBox="602 13 741 678"
// In 741x678:
// The dots are from Y = 13 to Y = ~150 (about 20% of 678)
// The shoulder/crossbar starts at Y = 145-150 in the 678 viewBox
// Ratio of shoulder: 147 / 678 = 0.217

function renderBoundedLockup(sW, wW, showGuides = true) {
  const sH = sW * (678 / 741);
  const shoulderY = sH * 0.217; // Top red line
  const botY = sH; // Bottom red line
  const availableH = botY - shoulderY; // Target text block height

  // Wordmark width and height
  const wH = wW * (388 / 1898);
  const subSize = 7.5 * (sW / 44);
  const gap = 11;
  const subMt = 3.5;
  const subH = subSize * 0.8;
  const totalTextH = wH + subMt + subSize;

  // Let's position the wordmark so its top aligns with shoulderY
  const wordmarkY = shoulderY;
  const subtitleY = wordmarkY + wH + subMt + subSize;

  return `
    <g transform="translate(40, 20)">
      <!-- Red Guide Lines if requested -->
      ${showGuides ? `
        <!-- Top Guide Line (Shoulder of H&K) -->
        <line x1="0" y1="${shoulderY}" x2="420" y2="${shoulderY}" stroke="#E53E3E" stroke-width="2"/>
        <!-- Bottom Guide Line (Baseline of H&K) -->
        <line x1="0" y1="${botY}" x2="420" y2="${botY}" stroke="#E53E3E" stroke-width="2"/>
      ` : ''}

      <!-- Symbol: Taupe -->
      <svg x="10" y="0" width="${sW}" height="${sH}" viewBox="602 13 741 678">
        <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
      </svg>

      <!-- Wordmark: Top aligns with shoulderY -->
      <svg x="${sW + gap + 10}" y="${wordmarkY}" width="${wW}" height="${wH}" viewBox="26 36 1898 388">
        <path d="${wordmarkPath}" fill="#2B2B2B" fill-rule="evenodd"/>
      </svg>

      <!-- Subtitle: Bottom aligns with botY -->
      <text x="${sW + gap + 11}" y="${subtitleY}" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="${subSize}" font-weight="600" fill="#88735B" letter-spacing="3.2">WEDDING &amp; EVENTS</text>
    </g>
  `;
}

// Let's create comparison boards:
// 1. With User's Red Guidelines overlay
// 2. Clean view in Navbar context

const sWidthProposed = 46;
const sHeightProposed = sWidthProposed * (678 / 741); // ~42.1px
const shoulderY = sHeightProposed * 0.217; // ~9.1px
const availableTextHeight = sHeightProposed - shoulderY; // ~33.0px
// If total text height = 33px, with subtitle ~8px and gap ~3px -> wordmark height ~22px
// 22px * (1898 / 388) = 107.6px (~108px)
const wWidthProposed = 108;
const wHeightProposed = wWidthProposed * (388 / 1898); // ~22.1px

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="520" viewBox="0 0 960 520" fill="#FAF8F5">
  <rect width="960" height="520" fill="#FAF8F5"/>

  <!-- Header -->
  <text x="40" y="40" font-family="'Playfair Display', Georgia, serif" font-size="20" font-weight="bold" fill="#2B2B2B">Kalibrasi Presisi: Simbol H&amp;K Lebih Besar &amp; Teks Terkunci di Dalam Garis Batas</text>
  <text x="40" y="64" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#6B5E62">Garis merah batas atas = pundak/crossbar H&amp;K (titik kepala/lingkaran anggun di atas garis). Garis merah bawah = batas dasar H&amp;K.</text>

  <!-- Panel 1: With Red Guides (Demonstrating exact fit) -->
  <g transform="translate(0, 70)">
    <rect x="30" y="0" width="900" height="150" rx="8" fill="#F8F6F1" stroke="#C5A880" stroke-width="1" stroke-opacity="0.3"/>
    <text x="50" y="24" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="bold" fill="#4A2E35">1. DENGAN GARIS PANDUAN MERAH (Sesuai Sketsa Anda)</text>
    <g transform="translate(10, 20)">
      ${renderBoundedLockup(sWidthProposed, wWidthProposed, true)}
    </g>
    <text x="440" y="70" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#2B2B2B">✓ Simbol H&amp;K diperbesar: <tspan font-weight="bold">46px</tspan> (tinggi 42px)</text>
    <text x="440" y="90" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#2B2B2B">✓ Wordmark HariKita dikecilkan: <tspan font-weight="bold">108px</tspan> (tinggi 22px, pas di bawah garis atas)</text>
    <text x="440" y="110" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#2B2B2B">✓ Wedding &amp; Events: pas menempel di atas garis batas bawah</text>
  </g>

  <!-- Panel 2: In Simulated Navbar (Height 80px) -->
  <g transform="translate(0, 260)">
    <rect x="30" y="0" width="900" height="110" rx="8" fill="#F8F6F1" stroke="#C5A880" stroke-width="1" stroke-opacity="0.3"/>
    <text x="50" y="22" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="bold" fill="#4A2E35">2. SIMULASI HASIL AKHIR PADA NAVBAR (Clean &amp; Presisi)</text>
    
    <!-- Simulated 80px bar inside -->
    <g transform="translate(50, 30)">
      <rect x="0" y="0" width="860" height="70" rx="6" fill="#FAF8F5" stroke="#C5A880" stroke-width="1" stroke-opacity="0.4"/>
      <line x1="0" y1="35" x2="860" y2="35" stroke="#C5A880" stroke-dasharray="3,3" stroke-width="0.8" opacity="0.3"/>

      <!-- Logo lockup centered at Y=35 -->
      <g transform="translate(20, ${35 - sHeightProposed / 2})">
        <!-- Symbol -->
        <svg x="0" y="0" width="${sWidthProposed}" height="${sHeightProposed}" viewBox="602 13 741 678">
          <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
        </svg>
        <!-- Wordmark -->
        <svg x="${sWidthProposed + 11}" y="${shoulderY}" width="${wWidthProposed}" height="${wHeightProposed}" viewBox="26 36 1898 388">
          <path d="${wordmarkPath}" fill="#2B2B2B" fill-rule="evenodd"/>
        </svg>
        <!-- Subtitle -->
        <text x="${sWidthProposed + 12}" y="${sHeightProposed}" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="7.5" font-weight="600" fill="#88735B" letter-spacing="3.2">WEDDING &amp; EVENTS</text>
      </g>

      <!-- Nav Items -->
      <g transform="translate(380, 39)">
        <text x="0" y="0" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="500" fill="#6B5E62">◎ 11 Layanan Kebumen</text>
        <text x="170" y="0" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="500" fill="#6B5E62">✉ Tema Undangan (65+)</text>
      </g>

      <!-- Buttons -->
      <g transform="translate(680, 20)">
        <rect x="0" y="0" width="85" height="30" rx="15" fill="none" stroke="#C5A880" stroke-opacity="0.4"/>
        <text x="42" y="19" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="500" fill="#4A2E35">Akses Portal</text>

        <rect x="95" y="0" width="75" height="30" rx="15" fill="#C5A880"/>
        <text x="132" y="19" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#FAF8F5">✨ Racik</text>
      </g>
    </g>
  </g>

  <!-- Summary note -->
  <text x="40" y="495" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#88735B">Proporsi ini memberikan hierarki visual yang sempurna: Monogram H&amp;K menonjol sebagai identitas utama, sementara nama brand terbaca elegan tanpa melebihi batas.</text>
</svg>
`;

const outPath = 'C:/Users/asep.suherman/.gemini/antigravity-ide/brain/0864abd2-810a-440d-9f93-bfaafb312e1a/harikita_red_lines_calibration.png';

sharp(Buffer.from(svg))
  .png()
  .toFile(outPath)
  .then(() => console.log('Successfully generated harikita_red_lines_calibration.png'))
  .catch(console.error);
