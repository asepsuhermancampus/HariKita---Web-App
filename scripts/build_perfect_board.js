const sharp = require('sharp');
const fs = require('fs');

const artifactDir = 'C:/Users/asep.suherman/.gemini/antigravity-ide/brain/0864abd2-810a-440d-9f93-bfaafb312e1a';

// Read raw SVGs
const symbolSvg = fs.readFileSync(artifactDir + '/harikita_symbol_taupe.svg', 'utf8');
const wordmarkSvg = fs.readFileSync(artifactDir + '/harikita_wordmark_charcoal.svg', 'utf8');

const symbolPathMatch = symbolSvg.match(/<path[^>]*d="([^"]+)"/);
const symbolPath = symbolPathMatch ? symbolPathMatch[1] : '';

const wordmarkPathMatch = wordmarkSvg.match(/<path[^>]*d="([^"]+)"/);
const wordmarkPath = wordmarkPathMatch ? wordmarkPathMatch[1] : '';

// 1. Stacked Light Logo (Canvas: 460 x 500, rx=16)
const stackedLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="500" viewBox="0 0 460 500">
  <rect width="460" height="500" rx="16" fill="#F8F6F1"/>
  
  <!-- Symbol: width 150, height = 150 * 678 / 741 = 137.2 -->
  <svg x="155" y="45" width="150" height="137.2" viewBox="602 13 741 678">
    <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
  </svg>

  <!-- Wordmark: width 280, height = 280 * 388 / 1898 = 57.2 -->
  <svg x="90" y="205" width="280" height="57.2" viewBox="26 36 1898 388">
    <path d="${wordmarkPath}" fill="#2B2B2B" fill-rule="evenodd"/>
  </svg>

  <!-- Subtitle: WEDDING & EVENTS -->
  <text x="230" y="300" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="600" fill="#88735B" letter-spacing="5">WEDDING &amp; EVENTS</text>

  <!-- Hairline divider -->
  <line x1="195" y1="340" x2="265" y2="340" stroke="#88735B" stroke-width="1.2" opacity="0.5"/>

  <!-- Tagline: Your Day. Our Story -->
  <text x="230" y="390" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="21" fill="#88735B">Your Day. Our Story</text>
</svg>`;

// 2. Stacked Dark Logo (Canvas: 460 x 500, rx=16)
const stackedDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="500" viewBox="0 0 460 500">
  <rect width="460" height="500" rx="16" fill="#2B2B2B"/>
  
  <!-- Symbol: width 150, height = 137.2, Champagne #C9A88A -->
  <svg x="155" y="45" width="150" height="137.2" viewBox="602 13 741 678">
    <path d="${symbolPath}" fill="#C9A88A" fill-rule="evenodd"/>
  </svg>

  <!-- Wordmark: width 280, height = 57.2, Ivory #FAF8F5 -->
  <svg x="90" y="205" width="280" height="57.2" viewBox="26 36 1898 388">
    <path d="${wordmarkPath}" fill="#FAF8F5" fill-rule="evenodd"/>
  </svg>

  <!-- Subtitle -->
  <text x="230" y="300" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="600" fill="#C9A88A" letter-spacing="5">WEDDING &amp; EVENTS</text>

  <!-- Hairline divider -->
  <line x1="195" y1="340" x2="265" y2="340" stroke="#C9A88A" stroke-width="1.2" opacity="0.5"/>

  <!-- Tagline -->
  <text x="230" y="390" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="21" fill="#E8DED1">Your Day. Our Story</text>
</svg>`;

// 3. Horizontal Logo (Navbar - Light Background, 500x235, rx=16)
const horizontalLightCardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="235" viewBox="0 0 500 235">
  <rect width="500" height="235" rx="16" fill="#F8F6F1" stroke="#E8DED1" stroke-width="2"/>
  <text x="25" y="32" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="700" fill="#88735B" letter-spacing="2">03. HORIZONTAL LOGO (NAVBAR)</text>
  
  <!-- Symbol: width 76, height = 69.5. Centered vertically in content area -->
  <svg x="55" y="88" width="76" height="69.5" viewBox="602 13 741 678">
    <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
  </svg>

  <!-- Wordmark: width 240, height = 49 -->
  <svg x="150" y="88" width="240" height="49" viewBox="26 36 1898 388">
    <path d="${wordmarkPath}" fill="#2B2B2B" fill-rule="evenodd"/>
  </svg>

  <!-- Subtitle: WEDDING & EVENTS -->
  <text x="152" y="156" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10.5" font-weight="600" fill="#88735B" letter-spacing="3.8">WEDDING &amp; EVENTS</text>
</svg>`;

// 4. Horizontal Logo (Footer - Dark Background, 500x235, rx=16)
const horizontalDarkCardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="235" viewBox="0 0 500 235">
  <rect width="500" height="235" rx="16" fill="#2B2B2B" stroke="#4A2E35" stroke-width="2"/>
  <text x="25" y="32" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="700" fill="#C9A88A" letter-spacing="2">04. HORIZONTAL LOGO (FOOTER / DARK)</text>
  
  <!-- Symbol: Champagne #C9A88A -->
  <svg x="55" y="88" width="76" height="69.5" viewBox="602 13 741 678">
    <path d="${symbolPath}" fill="#C9A88A" fill-rule="evenodd"/>
  </svg>

  <!-- Wordmark: Ivory #FAF8F5 -->
  <svg x="150" y="88" width="240" height="49" viewBox="26 36 1898 388">
    <path d="${wordmarkPath}" fill="#FAF8F5" fill-rule="evenodd"/>
  </svg>

  <!-- Subtitle -->
  <text x="152" y="156" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10.5" font-weight="600" fill="#C9A88A" letter-spacing="3.8">WEDDING &amp; EVENTS</text>
</svg>`;

// 5. Favicon Squircle (512x512)
const faviconPerfectSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#88735B"/>
  <svg x="126" y="137" width="260" height="237.9" viewBox="602 13 741 678">
    <path d="${symbolPath}" fill="#FAF8F5" fill-rule="evenodd"/>
  </svg>
</svg>`;

// 6. Monogram Symbol Only (Taupe on Soft Ivory)
const symbolOnlyPerfectSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
  <rect width="300" height="200" rx="16" fill="#F8F6F1"/>
  <svg x="75" y="31.4" width="150" height="137.2" viewBox="602 13 741 678">
    <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
  </svg>
</svg>`;

async function renderPerfectBoard() {
  console.log('Rendering refined perfect aligned logo variants...');

  // Render high-res PNGs
  const pStackedLight = await sharp(Buffer.from(stackedLightSvg)).resize(460, 500).toBuffer();
  const pStackedDark = await sharp(Buffer.from(stackedDarkSvg)).resize(460, 500).toBuffer();
  const pHorizLightCard = await sharp(Buffer.from(horizontalLightCardSvg)).resize(500, 235).toBuffer();
  const pHorizDarkCard = await sharp(Buffer.from(horizontalDarkCardSvg)).resize(500, 235).toBuffer();
  const pFavicon = await sharp(Buffer.from(faviconPerfectSvg)).resize(180, 180).toBuffer();
  const pSymbolOnly = await sharp(Buffer.from(symbolOnlyPerfectSvg)).resize(220, 147).toBuffer();

  // Save individual PNGs for artifacts
  fs.writeFileSync(artifactDir + '/perfect_rendered_stacked_light.png', pStackedLight);
  fs.writeFileSync(artifactDir + '/perfect_rendered_stacked_dark.png', pStackedDark);
  fs.writeFileSync(artifactDir + '/perfect_rendered_horizontal_light.png', pHorizLightCard);
  fs.writeFileSync(artifactDir + '/perfect_rendered_horizontal_dark.png', pHorizDarkCard);
  fs.writeFileSync(artifactDir + '/perfect_rendered_favicon.png', pFavicon);

  // Master board composite (1600 x 1000)
  const masterSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
    <rect width="1600" height="1000" fill="#FAF8F5"/>

    <!-- Header -->
    <text x="60" y="65" font-family="'Playfair Display', Georgia, serif" font-size="32" font-weight="bold" fill="#2B2B2B">HariKita — Brand Identity System</text>
    <text x="60" y="95" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="600" fill="#88735B" letter-spacing="2.5">PERFECT OPTICAL ALIGNMENT • REKONSTRUKSI VEKTOR PRESISI BERDASARKAN HARIKITA-DESIGN.PNG</text>

    <!-- Card 1 Outline border -->
    <rect x="60" y="120" width="460" height="500" rx="16" fill="none" stroke="#E8DED1" stroke-width="2"/>
    <text x="80" y="150" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="700" fill="#88735B" letter-spacing="2">01. LIGHT VERSION (STACKED)</text>

    <!-- Card 2 Outline border -->
    <rect x="550" y="120" width="460" height="500" rx="16" fill="none" stroke="#4A2E35" stroke-width="2"/>
    <text x="570" y="150" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="700" fill="#C9A88A" letter-spacing="2">02. DARK VERSION (STACKED)</text>

    <!-- Bottom Row (y = 655, height 285) -->
    <!-- Card 5: Favicon (300 x 285) at (60, 655) -->
    <rect x="60" y="655" width="300" height="285" rx="16" fill="#FFFFFF" stroke="#E8DED1" stroke-width="2"/>
    <text x="80" y="685" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="700" fill="#88735B" letter-spacing="2">05. FAVICON / APP ICON</text>
    <text x="80" y="915" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#88735B">Squircle 512px • Perfectly Centered</text>

    <!-- Card 6: Monogram Symbol (340 x 285) at (390, 655) -->
    <rect x="390" y="655" width="340" height="285" rx="16" fill="#F8F6F1" stroke="#E8DED1" stroke-width="2"/>
    <text x="410" y="685" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="700" fill="#88735B" letter-spacing="2">06. MONOGRAM SYMBOL (H + K)</text>
    <text x="410" y="915" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#88735B">Two People • Connection • Shared Story</text>

    <!-- Card 7: Color Tokens (780 x 285) at (760, 655) -->
    <rect x="760" y="655" width="780" height="285" rx="16" fill="#FFFFFF" stroke="#E8DED1" stroke-width="2"/>
    <text x="785" y="685" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="700" fill="#88735B" letter-spacing="2">07. BRAND COLOR SYSTEM (CSS TOKENS)</text>
    
    <!-- Swatch 1: Charcoal -->
    <circle cx="840" cy="765" r="35" fill="#2B2B2B"/>
    <text x="840" y="825" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B">Charcoal</text>
    <text x="840" y="845" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#666">#2B2B2B</text>

    <!-- Swatch 2: Taupe -->
    <circle cx="975" cy="765" r="35" fill="#88735B"/>
    <text x="975" y="825" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B">Taupe</text>
    <text x="975" y="845" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#666">#88735B</text>

    <!-- Swatch 3: Ivory -->
    <circle cx="1110" cy="765" r="35" fill="#F8F6F1" stroke="#E8DED1" stroke-width="2"/>
    <text x="1110" y="825" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B">Ivory</text>
    <text x="1110" y="845" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#666">#F8F6F1</text>

    <!-- Swatch 4: Champagne -->
    <circle cx="1245" cy="765" r="35" fill="#C9A88A"/>
    <text x="1245" y="825" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B">Champagne</text>
    <text x="1245" y="845" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#666">#C9A88A</text>

    <!-- Swatch 5: Soft Beige -->
    <circle cx="1380" cy="765" r="35" fill="#E8DED1"/>
    <text x="1380" y="825" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B">Soft Beige</text>
    <text x="1380" y="845" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#666">#E8DED1</text>
  </svg>`;

  const masterBgBuffer = await sharp(Buffer.from(masterSvg)).png().toBuffer();

  await sharp(masterBgBuffer)
    .composite([
      { input: pStackedLight, left: 60, top: 120 },
      { input: pStackedDark, left: 550, top: 120 },
      { input: pHorizLightCard, left: 1040, top: 120 },
      { input: pHorizDarkCard, left: 1040, top: 385 },
      { input: pFavicon, left: 120, top: 710 },
      { input: pSymbolOnly, left: 450, top: 720 }
    ])
    .png()
    .toFile(artifactDir + '/harikita_master_visual_review.png');

  console.log('Successfully regenerated refined master visual review board!');
}

renderPerfectBoard().catch(console.error);
