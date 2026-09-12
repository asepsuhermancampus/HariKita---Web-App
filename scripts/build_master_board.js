const sharp = require('sharp');
const fs = require('fs');

const artifactDir = 'C:/Users/asep.suherman/.gemini/antigravity-ide/brain/0864abd2-810a-440d-9f93-bfaafb312e1a';

async function buildMasterBoard() {
  console.log('Regenerating master visual board with pure vector symbol...');

  const width = 1600;
  const height = 1000;

  // Render individual components to exact dimensions
  const stackedLight = await sharp(artifactDir + '/rendered_stacked_light.png').resize(440, 484).toBuffer();
  const stackedDark = await sharp(artifactDir + '/rendered_stacked_dark.png').resize(440, 484).toBuffer();
  const horizLight = await sharp(artifactDir + '/rendered_horizontal_light.png').resize(540, 108).toBuffer();
  const horizDark = await sharp(artifactDir + '/rendered_horizontal_dark.png').resize(540, 108).toBuffer();
  const favicon = await sharp(artifactDir + '/rendered_favicon_512.png').resize(180, 180).toBuffer();
  
  // Render pure vector symbol only (without any text or border artifacts)
  const symbolOnlyBuffer = await sharp(Buffer.from(fs.readFileSync(artifactDir + '/harikita_symbol_only_vector.svg')))
    .resize(220, 130)
    .png()
    .toBuffer();

  // Create composite SVG background with cards, titles, and color swatches
  const backgroundSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#FAF8F5"/>
    
    <!-- Top Header -->
    <text x="60" y="70" font-family="'Playfair Display', Georgia, serif" font-size="32" font-weight="bold" fill="#2B2B2B">HariKita — Brand Identity System</text>
    <text x="60" y="102" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="500" fill="#88735B" letter-spacing="2">VECTOR SVG RECONSTRUCTION • BERDASARKAN HARIKITA-DESIGN.PNG</text>
    
    <!-- Card 1: Primary Light (Stacked) -->
    <rect x="60" y="130" width="460" height="504" rx="16" fill="#F8F6F1" stroke="#E8DED1" stroke-width="2"/>
    <text x="80" y="165" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#88735B" letter-spacing="2">01. LIGHT VERSION (STACKED)</text>

    <!-- Card 2: Dark Version (Stacked) -->
    <rect x="540" y="130" width="460" height="504" rx="16" fill="#2B2B2B" stroke="#4A2E35" stroke-width="2"/>
    <text x="560" y="165" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#C9A88A" letter-spacing="2">02. DARK VERSION (STACKED)</text>

    <!-- Card 3: Horizontal Logos & Details (Right Column) -->
    <rect x="1020" y="130" width="520" height="236" rx="16" fill="#F8F6F1" stroke="#E8DED1" stroke-width="2"/>
    <text x="1040" y="165" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#88735B" letter-spacing="2">03. HORIZONTAL LOGO (NAVBAR)</text>

    <rect x="1020" y="380" width="520" height="254" rx="16" fill="#2B2B2B" stroke="#4A2E35" stroke-width="2"/>
    <text x="1040" y="415" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#C9A88A" letter-spacing="2">04. HORIZONTAL LOGO (FOOTER / DARK)</text>

    <!-- Bottom Row: Favicon, Symbol, Color Swatches -->
    <!-- Card 4: Favicon & App Icon -->
    <rect x="60" y="660" width="300" height="290" rx="16" fill="#FFFFFF" stroke="#E8DED1" stroke-width="2"/>
    <text x="80" y="695" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#88735B" letter-spacing="2">05. FAVICON / APP ICON</text>
    <text x="80" y="925" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#88735B">Squircle 512px • Crisp at 16/32px</text>

    <!-- Card 5: Symbol Vector Monogram -->
    <rect x="380" y="660" width="340" height="290" rx="16" fill="#F8F6F1" stroke="#E8DED1" stroke-width="2"/>
    <text x="400" y="695" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#88735B" letter-spacing="2">06. MONOGRAM SYMBOL (H + K)</text>
    <text x="400" y="925" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#88735B">Two People • Connection • Shared Story</text>

    <!-- Card 6: Color Palette Tokens -->
    <rect x="740" y="660" width="800" height="290" rx="16" fill="#FFFFFF" stroke="#E8DED1" stroke-width="2"/>
    <text x="770" y="695" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#88735B" letter-spacing="2">07. BRAND COLOR SYSTEM (CSS TOKENS)</text>
    
    <!-- Swatch 1: Charcoal -->
    <circle cx="820" cy="760" r="36" fill="#2B2B2B"/>
    <text x="820" y="820" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B">Charcoal</text>
    <text x="820" y="840" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#666">#2B2B2B</text>

    <!-- Swatch 2: Taupe -->
    <circle cx="960" cy="760" r="36" fill="#88735B"/>
    <text x="960" y="820" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B">Taupe</text>
    <text x="960" y="840" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#666">#88735B</text>

    <!-- Swatch 3: Ivory -->
    <circle cx="1100" cy="760" r="36" fill="#F8F6F1" stroke="#E8DED1" stroke-width="2"/>
    <text x="1100" y="820" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B">Ivory</text>
    <text x="1100" y="840" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#666">#F8F6F1</text>

    <!-- Swatch 4: Champagne -->
    <circle cx="1240" cy="760" r="36" fill="#C9A88A"/>
    <text x="1240" y="820" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B">Champagne</text>
    <text x="1240" y="840" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#666">#C9A88A</text>

    <!-- Swatch 5: Soft Beige -->
    <circle cx="1380" cy="760" r="36" fill="#E8DED1"/>
    <text x="1380" y="820" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B">Soft Beige</text>
    <text x="1380" y="840" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#666">#E8DED1</text>
  </svg>`;

  const bgBuffer = await sharp(Buffer.from(backgroundSvg)).png().toBuffer();

  await sharp(bgBuffer)
    .composite([
      { input: stackedLight, left: 70, top: 140 },
      { input: stackedDark, left: 550, top: 140 },
      { input: horizLight, left: 1010, top: 210 },
      { input: horizDark, left: 1010, top: 460 },
      { input: favicon, left: 120, top: 715 },
      { input: symbolOnlyBuffer, left: 440, top: 740 }
    ])
    .png()
    .toFile(artifactDir + '/harikita_master_visual_review.png');

  console.log('Pristine Master visual review board regenerated successfully!');
}

buildMasterBoard().catch(console.error);
