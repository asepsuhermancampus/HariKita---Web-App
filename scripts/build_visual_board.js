const sharp = require('sharp');
const fs = require('fs');

const artifactDir = 'C:/Users/asep.suherman/.gemini/antigravity-ide/brain/0864abd2-810a-440d-9f93-bfaafb312e1a';

// Read raw SVGs
const symbolSvg = fs.readFileSync(artifactDir + '/harikita_symbol_taupe.svg', 'utf8');
const wordmarkSvg = fs.readFileSync(artifactDir + '/harikita_wordmark_charcoal.svg', 'utf8');

// Extract inner path strings from the traced SVGs
const symbolPathMatch = symbolSvg.match(/<path[^>]*d="([^"]+)"/);
const symbolPath = symbolPathMatch ? symbolPathMatch[1] : '';

const wordmarkPathMatch = wordmarkSvg.match(/<path[^>]*d="([^"]+)"/);
const wordmarkPath = wordmarkPathMatch ? wordmarkPathMatch[1] : '';

console.log('Extracted symbol path length:', symbolPath.length);
console.log('Extracted wordmark path length:', wordmarkPath.length);

// 1. Build Favicon SVG (Squircle 512x512)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#88735B"/>
  <g transform="translate(100, 100) scale(0.23)">
    <path d="${symbolPath}" fill="#FAF8F5" fill-rule="evenodd"/>
  </g>
</svg>`;

// 2. Build Symbol Only SVG (Taupe on transparent / Ivory)
const symbolOnlySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="400" viewBox="0 0 1360 800">
  <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
</svg>`;

// 3. Build Horizontal Logo SVG (Navbar version, 700x120)
// Symbol on left (scaled down), "HariKita" wordmark on right
const horizontalLogoLightBg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="120" viewBox="0 0 600 120">
  <!-- Symbol -->
  <g transform="translate(20, 10) scale(0.125)">
    <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
  </g>
  <!-- Wordmark -->
  <g transform="translate(210, 18) scale(0.17)">
    <path d="${wordmarkPath}" fill="#2B2B2B" fill-rule="evenodd"/>
  </g>
  <!-- Subtitle -->
  <text x="215" y="102" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="600" fill="#88735B" letter-spacing="4">WEDDING &amp; EVENTS</text>
</svg>`;

// 4. Build Horizontal Logo for Dark Backgrounds (Navbar on dark/footer, 600x120)
const horizontalLogoDarkBg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="120" viewBox="0 0 600 120">
  <!-- Symbol -->
  <g transform="translate(20, 10) scale(0.125)">
    <path d="${symbolPath}" fill="#C9A88A" fill-rule="evenodd"/>
  </g>
  <!-- Wordmark -->
  <g transform="translate(210, 18) scale(0.17)">
    <path d="${wordmarkPath}" fill="#FAF8F5" fill-rule="evenodd"/>
  </g>
  <!-- Subtitle -->
  <text x="215" y="102" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="600" fill="#E8DED1" letter-spacing="4">WEDDING &amp; EVENTS</text>
</svg>`;

// 5. Build Primary Stacked Logo (500x550)
const stackedLogoLightBg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="550" viewBox="0 0 500 550">
  <rect width="500" height="550" fill="#F8F6F1"/>
  <!-- Symbol (Centered) -->
  <g transform="translate(130, 40) scale(0.175)">
    <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
  </g>
  <!-- Wordmark (Centered) -->
  <g transform="translate(85, 230) scale(0.17)">
    <path d="${wordmarkPath}" fill="#2B2B2B" fill-rule="evenodd"/>
  </g>
  <!-- Subtitle -->
  <text x="250" y="340" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="600" fill="#88735B" letter-spacing="5">WEDDING &amp; EVENTS</text>
  <!-- Hairline divider -->
  <line x1="220" y1="380" x2="280" y2="380" stroke="#88735B" stroke-width="1.2" opacity="0.6"/>
  <!-- Tagline -->
  <text x="250" y="430" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="22" fill="#88735B">Your Day. Our Story</text>
</svg>`;

// 6. Build Stacked Logo Dark Background (500x550)
const stackedLogoDarkBg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="550" viewBox="0 0 500 550">
  <rect width="500" height="550" fill="#2B2B2B"/>
  <!-- Symbol (Centered) -->
  <g transform="translate(130, 40) scale(0.175)">
    <path d="${symbolPath}" fill="#C9A88A" fill-rule="evenodd"/>
  </g>
  <!-- Wordmark (Centered) -->
  <g transform="translate(85, 230) scale(0.17)">
    <path d="${wordmarkPath}" fill="#FAF8F5" fill-rule="evenodd"/>
  </g>
  <!-- Subtitle -->
  <text x="250" y="340" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="600" fill="#C9A88A" letter-spacing="5">WEDDING &amp; EVENTS</text>
  <!-- Hairline divider -->
  <line x1="220" y1="380" x2="280" y2="380" stroke="#C9A88A" stroke-width="1.2" opacity="0.6"/>
  <!-- Tagline -->
  <text x="250" y="430" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="22" fill="#E8DED1">Your Day. Our Story</text>
</svg>`;

async function renderAll() {
  // Save SVG files
  fs.writeFileSync(artifactDir + '/harikita_favicon_vector.svg', faviconSvg);
  fs.writeFileSync(artifactDir + '/harikita_symbol_only_vector.svg', symbolOnlySvg);
  fs.writeFileSync(artifactDir + '/harikita_horizontal_light_vector.svg', horizontalLogoLightBg);
  fs.writeFileSync(artifactDir + '/harikita_horizontal_dark_vector.svg', horizontalLogoDarkBg);
  fs.writeFileSync(artifactDir + '/harikita_stacked_light_vector.svg', stackedLogoLightBg);
  fs.writeFileSync(artifactDir + '/harikita_stacked_dark_vector.svg', stackedLogoDarkBg);

  // Render PNGs for visual inspection
  await sharp(Buffer.from(faviconSvg)).resize(512, 512).png().toFile(artifactDir + '/rendered_favicon_512.png');
  await sharp(Buffer.from(horizontalLogoLightBg)).resize(600, 120).png().toFile(artifactDir + '/rendered_horizontal_light.png');
  await sharp(Buffer.from(horizontalLogoDarkBg)).resize(600, 120).png().toFile(artifactDir + '/rendered_horizontal_dark.png');
  await sharp(Buffer.from(stackedLogoLightBg)).resize(500, 550).png().toFile(artifactDir + '/rendered_stacked_light.png');
  await sharp(Buffer.from(stackedLogoDarkBg)).resize(500, 550).png().toFile(artifactDir + '/rendered_stacked_dark.png');

  console.log('All individual logo assets and rendered previews generated successfully!');
}

renderAll().catch(console.error);
