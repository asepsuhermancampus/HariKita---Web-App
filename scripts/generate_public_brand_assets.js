const fs = require('fs');
const path = require('path');

const brandDir = path.join(__dirname, '..', 'public', 'brand');
if (!fs.existsSync(brandDir)) {
  fs.mkdirSync(brandDir, { recursive: true });
}

// Read verified normalized SVGs from artifact directory
const artifactDir = 'C:/Users/asep.suherman/.gemini/antigravity-ide/brain/0864abd2-810a-440d-9f93-bfaafb312e1a';
const symbolSvg = fs.readFileSync(path.join(artifactDir, 'harikita_symbol_taupe.svg'), 'utf8');
const wordmarkSvg = fs.readFileSync(path.join(artifactDir, 'harikita_wordmark_charcoal.svg'), 'utf8');

const symbolPath = symbolSvg.match(/<path[^>]*d="([^"]+)"/)[1];
const wordmarkPath = wordmarkSvg.match(/<path[^>]*d="([^"]+)"/)[1];

// 1. Symbol Only SVG (taupe + currentColor compatible)
const symbolFile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="602 13 741 678" width="741" height="678" fill="currentColor">
  <path d="${symbolPath}" fill-rule="evenodd"/>
</svg>`;
fs.writeFileSync(path.join(brandDir, 'harikita-symbol.svg'), symbolFile);

// 2. Horizontal Logo SVG (Light Background - Navbar) - Bounded Monogram Body Lockup
const horizontalFile = `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="130" viewBox="0 0 460 130" fill="none">
  <!-- Symbol: Taupe #88735B (Height 69.5, shoulder at Y=45.1, baseline at Y=99.5) -->
  <svg x="20" y="30" width="76" height="69.5" viewBox="602 13 741 678">
    <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
  </svg>
  <!-- Wordmark: Charcoal #2B2B2B (Top locked at shoulder Y=45) -->
  <svg x="108" y="45" width="178" height="36.4" viewBox="26 36 1898 388">
    <path d="${wordmarkPath}" fill="#2B2B2B" fill-rule="evenodd"/>
  </svg>
  <!-- Subtitle: WEDDING & EVENTS (Bottom locked at baseline Y=98) -->
  <text x="110" y="98" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11.5" font-weight="600" fill="#88735B" letter-spacing="3.8">WEDDING &amp; EVENTS</text>
</svg>`;
fs.writeFileSync(path.join(brandDir, 'harikita-logo-horizontal.svg'), horizontalFile);

// 3. Stacked Logo SVG (Light Background)
const stackedFile = `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="500" viewBox="0 0 460 500" fill="none">
  <!-- Symbol -->
  <svg x="155" y="45" width="150" height="137.2" viewBox="602 13 741 678">
    <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
  </svg>
  <!-- Wordmark -->
  <svg x="90" y="205" width="280" height="57.2" viewBox="26 36 1898 388">
    <path d="${wordmarkPath}" fill="#2B2B2B" fill-rule="evenodd"/>
  </svg>
  <!-- Subtitle -->
  <text x="230" y="300" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="600" fill="#88735B" letter-spacing="5">WEDDING &amp; EVENTS</text>
  <!-- Hairline divider -->
  <line x1="195" y1="340" x2="265" y2="340" stroke="#88735B" stroke-width="1.2" opacity="0.5"/>
  <!-- Tagline -->
  <text x="230" y="390" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="21" fill="#88735B">Your Day. Our Story</text>
</svg>`;
fs.writeFileSync(path.join(brandDir, 'harikita-logo-stacked.svg'), stackedFile);

// 4. Favicon SVG (Squircle 512x512)
const faviconFile = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#88735B"/>
  <svg x="126" y="137" width="260" height="237.9" viewBox="602 13 741 678">
    <path d="${symbolPath}" fill="#FAF8F5" fill-rule="evenodd"/>
  </svg>
</svg>`;
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), faviconFile);

console.log('Successfully generated public SVG brand assets!');
