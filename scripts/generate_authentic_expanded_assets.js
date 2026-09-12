const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const potrace = require('potrace');

const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara');
const ASSET_DIR = path.join(__dirname, '..', 'public', 'assets', 'harikita');

function traceBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    potrace.trace(
      buffer,
      {
        color: 'currentColor',
        optCurve: true,
        turdSize: 10,
        alphaMax: 1.0,
        ...options,
      },
      (err, svg) => {
        if (err) return reject(err);
        // Normalize SVG to ensure it inherits currentColor properly
        let clean = svg.replace('<svg ', '<svg fill="currentColor" vector-effect="non-scaling-stroke" ');
        resolve(clean);
      }
    );
  });
}

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// 1. EXTRACT 21 LINES FROM "21 asset yang harus dibuat.jpeg"
async function extractLines() {
  console.log('▶ Extracting 21 Lines & Dividers...');
  const outDir = path.join(ASSET_DIR, 'lines');
  await ensureDir(outDir);
  const rawPath = path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '21 asset yang harus dibuat.jpeg');

  const rows = [
    { top: 48, height: 42 },
    { top: 108, height: 40 },
    { top: 165, height: 50 },
    { top: 228, height: 45 },
    { top: 290, height: 42 },
    { top: 352, height: 35 },
    { top: 410, height: 40 },
  ];
  const colWidth = Math.floor(750 / 3);

  let count = 1;
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < 3; c++) {
      if (count > 21) break;
      const left = c * colWidth + 15;
      const width = colWidth - 30;
      const top = rows[r].top;
      const height = rows[r].height;

      const buf = await sharp(rawPath)
        .extract({ left, top, width, height })
        .grayscale()
        .threshold(210)
        .toBuffer();

      const svg = await traceBuffer(buf, { turdSize: 6 });
      const filename = `divider-${String(count).padStart(2, '0')}.svg`;
      fs.writeFileSync(path.join(outDir, filename), svg);
      count++;
    }
  }
  console.log(`✅ Extracted ${count - 1} dividers into ${outDir}`);
}

// 2. EXTRACT FLOWERS (Single Stem 24, Blooms 16, Accents 12)
async function extractFlowers() {
  console.log('▶ Extracting Flowers (Single Stem, Blooms, Accents)...');
  const singleDir = path.join(ASSET_DIR, 'flowers', 'single-stem');
  const bloomsDir = path.join(ASSET_DIR, 'flowers', 'blooms');
  const accentsDir = path.join(ASSET_DIR, 'flowers', 'accents');
  await ensureDir(singleDir);
  await ensureDir(bloomsDir);
  await ensureDir(accentsDir);

  const sheet36 = path.join(RAW_DIR, 'asset-mentah-floral-ilustrations', '36 asset yang harus dibuat.jpeg');
  const sheet15 = path.join(RAW_DIR, 'asset-mentah-floral-ilustrations', '15 asset yang harus dibuat.jpeg');
  const sheet8 = path.join(RAW_DIR, 'asset-mentah-floral-ilustrations', '8 asset yang harus dibuat.jpeg');

  // 2a. Single stem: 18 from sheet36 + 6 from sheet15 = 24
  const cW36 = Math.floor(2048 / 6);
  const cH36 = Math.floor(1680 / 6);

  let singleIdx = 1;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 6; c++) {
      if (singleIdx > 18) break;
      const buf = await sharp(sheet36)
        .extract({
          left: c * cW36 + 20,
          top: r * cH36 + 20,
          width: cW36 - 40,
          height: cH36 - 40,
        })
        .grayscale()
        .threshold(205)
        .toBuffer();
      const svg = await traceBuffer(buf);
      fs.writeFileSync(
        path.join(singleDir, `flower-single-stem-${String(singleIdx).padStart(2, '0')}.svg`),
        svg
      );
      singleIdx++;
    }
  }

  // 6 from sheet15 (2048x640: 5 cols x 3 rows)
  const cW15 = Math.floor(2048 / 5);
  const cH15 = Math.floor(640 / 3);
  for (let i = 0; i < 6; i++) {
    const c = i % 5;
    const r = Math.floor(i / 5);
    const buf = await sharp(sheet15)
      .extract({
        left: c * cW15 + 15,
        top: r * cH15 + 15,
        width: cW15 - 30,
        height: cH15 - 30,
      })
      .grayscale()
      .threshold(205)
      .toBuffer();
    const svg = await traceBuffer(buf);
    fs.writeFileSync(
      path.join(singleDir, `flower-single-stem-${String(singleIdx).padStart(2, '0')}.svg`),
      svg
    );
    singleIdx++;
  }
  console.log(`✅ Extracted 24 single stem flowers`);

  // 2b. Blooms: 10 from sheet36 (rows 3 & 4) + 6 from sheet8 = 16
  let bloomIdx = 1;
  for (let r = 3; r <= 4; r++) {
    for (let c = 0; c < 5; c++) {
      if (bloomIdx > 10) break;
      const buf = await sharp(sheet36)
        .extract({
          left: c * cW36 + 20,
          top: r * cH36 + 20,
          width: cW36 - 40,
          height: cH36 - 40,
        })
        .grayscale()
        .threshold(205)
        .toBuffer();
      const svg = await traceBuffer(buf);
      fs.writeFileSync(
        path.join(bloomsDir, `flower-bloom-${String(bloomIdx).padStart(2, '0')}.svg`),
        svg
      );
      bloomIdx++;
    }
  }

  // 6 from sheet8 (2048x1163: 4 cols x 2 rows)
  const cW8 = Math.floor(2048 / 4);
  const cH8 = Math.floor(1163 / 2);
  for (let i = 0; i < 6; i++) {
    const c = i % 4;
    const r = Math.floor(i / 4);
    const buf = await sharp(sheet8)
      .extract({
        left: c * cW8 + 25,
        top: r * cH8 + 25,
        width: cW8 - 50,
        height: cH8 - 50,
      })
      .grayscale()
      .threshold(205)
      .toBuffer();
    const svg = await traceBuffer(buf);
    fs.writeFileSync(
      path.join(bloomsDir, `flower-bloom-${String(bloomIdx).padStart(2, '0')}.svg`),
      svg
    );
    bloomIdx++;
  }
  console.log(`✅ Extracted 16 flower blooms`);

  // 2c. Accents: 8 from sheet36 row 5 + 4 from sheet8
  let accentIdx = 1;
  for (let c = 0; c < 6; c++) {
    const buf = await sharp(sheet36)
      .extract({
        left: c * cW36 + 30,
        top: 5 * cH36 + 30,
        width: cW36 - 60,
        height: cH36 - 60,
      })
      .grayscale()
      .threshold(205)
      .toBuffer();
    const svg = await traceBuffer(buf);
    fs.writeFileSync(
      path.join(accentsDir, `flower-accent-${String(accentIdx).padStart(2, '0')}.svg`),
      svg
    );
    accentIdx++;
  }
  for (let i = 0; i < 6; i++) {
    const c = i % 4;
    const r = Math.floor(i / 4);
    const buf = await sharp(sheet8)
      .extract({
        left: c * cW8 + 60,
        top: r * cH8 + 60,
        width: Math.floor(cW8 / 2),
        height: Math.floor(cH8 / 2),
      })
      .grayscale()
      .threshold(205)
      .toBuffer();
    const svg = await traceBuffer(buf);
    fs.writeFileSync(
      path.join(accentsDir, `flower-accent-${String(accentIdx).padStart(2, '0')}.svg`),
      svg
    );
    accentIdx++;
  }
  console.log(`✅ Extracted 12 flower accents`);
}

// 3. EXTRACT LEAVES & BRANCHES (Branches 12, Sprigs 16, Stems 10)
async function extractLeaves() {
  console.log('▶ Extracting Leaves (Branches, Sprigs, Stems)...');
  const branchDir = path.join(ASSET_DIR, 'leaves', 'branches');
  const sprigDir = path.join(ASSET_DIR, 'leaves', 'sprigs');
  const stemDir = path.join(ASSET_DIR, 'leaves', 'stems');
  await ensureDir(branchDir);
  await ensureDir(sprigDir);
  await ensureDir(stemDir);

  const sheet6 = path.join(RAW_DIR, 'asset-mentah-leaf-and-branch', '6.jpeg');
  const sheet7 = path.join(RAW_DIR, 'asset-mentah-leaf-and-branch', '7.jpeg');
  const sheet8 = path.join(RAW_DIR, 'asset-mentah-leaf-and-branch', '8.jpeg');
  const sheet9 = path.join(RAW_DIR, 'asset-mentah-leaf-and-branch', '9.jpeg');

  // 3a. Branches: 12 from sheet6 & sheet7 (3x2 on 2048x2048)
  const cellW = Math.floor(2048 / 3);
  const cellH = Math.floor(2048 / 2);

  let bIdx = 1;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const buf = await sharp(sheet6)
        .extract({
          left: c * cellW + 25,
          top: r * cellH + 25,
          width: cellW - 50,
          height: cellH - 50,
        })
        .grayscale()
        .threshold(205)
        .toBuffer();
      const svg = await traceBuffer(buf);
      fs.writeFileSync(path.join(branchDir, `branch-${String(bIdx).padStart(2, '0')}.svg`), svg);
      bIdx++;
    }
  }
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const buf = await sharp(sheet7)
        .extract({
          left: c * cellW + 25,
          top: r * cellH + 25,
          width: cellW - 50,
          height: cellH - 50,
        })
        .grayscale()
        .threshold(205)
        .toBuffer();
      const svg = await traceBuffer(buf);
      fs.writeFileSync(path.join(branchDir, `branch-${String(bIdx).padStart(2, '0')}.svg`), svg);
      bIdx++;
    }
  }
  console.log(`✅ Extracted 12 leafy branches`);

  // 3b. Sprigs: 16 from sheet8 (4x4 on 2048x2048)
  const spW = Math.floor(2048 / 4);
  const spH = Math.floor(2048 / 4);
  let spIdx = 1;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const buf = await sharp(sheet8)
        .extract({
          left: c * spW + 20,
          top: r * spH + 20,
          width: spW - 40,
          height: spH - 40,
        })
        .grayscale()
        .threshold(205)
        .toBuffer();
      const svg = await traceBuffer(buf);
      fs.writeFileSync(path.join(sprigDir, `leaf-sprig-${String(spIdx).padStart(2, '0')}.svg`), svg);
      spIdx++;
    }
  }
  console.log(`✅ Extracted 16 leaf sprigs`);

  // 3c. Stems: 10 vertical stems from sheet9 (1536x2048: 5 cols x 2 rows)
  const stW = Math.floor(1536 / 5);
  const stH = Math.floor(2048 / 2);
  let stIdx = 1;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      const buf = await sharp(sheet9)
        .extract({
          left: c * stW + 15,
          top: r * stH + 15,
          width: stW - 30,
          height: stH - 30,
        })
        .grayscale()
        .threshold(205)
        .toBuffer();
      const svg = await traceBuffer(buf);
      fs.writeFileSync(path.join(stemDir, `stem-${String(stIdx).padStart(2, '0')}.svg`), svg);
      stIdx++;
    }
  }
  console.log(`✅ Extracted 10 vertical leafy stems`);
}

// 4. EXTRACT ORNAMENTS (32 Botanical Wreaths, Cartouches & Frames)
async function extractOrnaments() {
  console.log('▶ Extracting 32 Ornaments (Wreaths, Frames, Crests)...');
  const ornDir = path.join(ASSET_DIR, 'ornaments');
  await ensureDir(ornDir);

  const sheetCircle = path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-lingkaran.jpeg');
  const sheetKotak = path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-kotak.jpeg');
  const sheetUnik = path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '21 asset yang harus dibuat-unik.jpeg');

  let oIdx = 1;

  // 16 Circular Botanical Wreaths (4x4 on 2048x2048)
  const cW = Math.floor(2048 / 4);
  const cH = Math.floor(2048 / 4);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const buf = await sharp(sheetCircle)
        .extract({
          left: c * cW + 20,
          top: r * cH + 20,
          width: cW - 40,
          height: cH - 40,
        })
        .grayscale()
        .threshold(200)
        .toBuffer();
      const svg = await traceBuffer(buf);
      fs.writeFileSync(path.join(ornDir, `botanical-${String(oIdx).padStart(2, '0')}.svg`), svg);
      oIdx++;
    }
  }

  // 8 Vintage Crests & Cartouches from sheetUnik (7 cols x 3 rows)
  const uW = Math.floor(2048 / 7);
  const uH = Math.floor(1365 / 3);
  for (let i = 0; i < 8; i++) {
    const c = i % 7;
    const r = Math.floor(i / 7);
    const buf = await sharp(sheetUnik)
      .extract({
        left: c * uW + 15,
        top: r * uH + 15,
        width: uW - 30,
        height: uH - 30,
      })
      .grayscale()
      .threshold(200)
      .toBuffer();
    const svg = await traceBuffer(buf);
    fs.writeFileSync(path.join(ornDir, `botanical-${String(oIdx).padStart(2, '0')}.svg`), svg);
    oIdx++;
  }

  // 8 Botanical Frames from sheetKotak (8 cols x 2 rows)
  const kW = Math.floor(2048 / 8);
  const kH = Math.floor(630 / 2);
  for (let i = 0; i < 8; i++) {
    const c = i % 8;
    const r = Math.floor(i / 8);
    const buf = await sharp(sheetKotak)
      .extract({
        left: c * kW + 10,
        top: r * kH + 10,
        width: kW - 20,
        height: kH - 20,
      })
      .grayscale()
      .threshold(200)
      .toBuffer();
    const svg = await traceBuffer(buf);
    fs.writeFileSync(path.join(ornDir, `botanical-${String(oIdx).padStart(2, '0')}.svg`), svg);
    oIdx++;
  }

  console.log(`✅ Extracted 32 botanical ornaments`);
}

// 5. EXTRACT 18 CUSTOM ICONS
async function extractIcons() {
  console.log('▶ Extracting 18 Custom Wedding & Event Icons...');
  const iconDir = path.join(ASSET_DIR, 'icons');
  await ensureDir(iconDir);

  const sheet2 = path.join(RAW_DIR, 'asset-mentah-custom-icons', '2.jpeg');
  const sheet1 = path.join(RAW_DIR, 'asset-mentah-custom-icons', '1.jpeg');

  const iconNames = [
    'icon-two-people.svg',
    'icon-love-story.svg',
    'icon-wedding-rings.svg',
    'icon-engagement-ring.svg',
    'icon-bridal-dress.svg',
    'icon-groom-attire.svg',
    'icon-makeup-beauty.svg',
    'icon-seserahan-box.svg',
    'icon-camera-photo.svg',
    'icon-video-cinematic.svg',
    'icon-ceremony-arch.svg',
    'icon-floral-bouquet.svg',
    'icon-catering-plate.svg',
    'icon-tiered-cake.svg',
    'icon-souvenir-candle.svg',
    'icon-digital-invitation.svg',
    'icon-illustrated-map.svg',
    'icon-fitting-calendar.svg',
  ];

  // Grid on 2.jpeg (2048 x 1664: 4 rows x 5 cols = 20 cells)
  const cW = Math.floor(2048 / 5);
  const cH = Math.floor(1664 / 4);

  for (let i = 0; i < iconNames.length; i++) {
    const c = i % 5;
    const r = Math.floor(i / 5);
    const buf = await sharp(sheet2)
      .extract({
        left: c * cW + 20,
        top: r * cH + 20,
        width: cW - 40,
        height: cH - 40,
      })
      .grayscale()
      .threshold(210)
      .toBuffer();

    const svg = await traceBuffer(buf, { turdSize: 8 });
    fs.writeFileSync(path.join(iconDir, iconNames[i]), svg);
  }
  console.log(`✅ Extracted 18 custom concept icons`);
}

// 6. EXTRACT 8 HIGH-RES TEXTURES
async function extractTextures() {
  console.log('▶ Extracting 8 High-Resolution WebP Textures...');
  const texDir = path.join(ASSET_DIR, 'textures');
  await ensureDir(texDir);

  const raw1 = path.join(RAW_DIR, 'asset-mentah-background-pattern-and-texture', '1.jpeg'); // deckle paper
  const raw2 = path.join(RAW_DIR, 'asset-mentah-background-pattern-and-texture', '2.jpeg'); // gold foil
  const raw3 = path.join(RAW_DIR, 'asset-mentah-background-pattern-and-texture', '3.jpeg'); // woven linen

  await sharp(raw1).resize(1600, 1200, { fit: 'cover' }).webp({ quality: 90 }).toFile(path.join(texDir, 'texture-deckle-paper.webp'));
  await sharp(raw2).resize(1500, 1500, { fit: 'cover' }).webp({ quality: 90 }).toFile(path.join(texDir, 'texture-gold-foil.webp'));
  await sharp(raw3).resize(1600, 1600, { fit: 'cover' }).webp({ quality: 90 }).toFile(path.join(texDir, 'texture-canvas-woven.webp'));
  await sharp(raw1).resize(1200, 1200, { fit: 'cover' }).modulate({ brightness: 1.05 }).webp({ quality: 88 }).toFile(path.join(texDir, 'texture-paper-light.webp'));
  await sharp(raw1).resize(1200, 1200, { fit: 'cover' }).modulate({ brightness: 0.35 }).webp({ quality: 88 }).toFile(path.join(texDir, 'texture-paper-dark.webp'));
  await sharp(raw3).resize(1200, 1200, { fit: 'cover' }).modulate({ brightness: 1.08 }).webp({ quality: 88 }).toFile(path.join(texDir, 'texture-linen-light.webp'));
  await sharp(raw3).resize(1200, 1200, { fit: 'cover' }).modulate({ brightness: 0.38 }).webp({ quality: 88 }).toFile(path.join(texDir, 'texture-linen-dark.webp'));
  await sharp(raw1).resize(1200, 1200, { fit: 'cover' }).tint('#E8DED1').webp({ quality: 88 }).toFile(path.join(texDir, 'texture-parchment-antique.webp'));

  console.log(`✅ Generated 8 authentic WebP textures`);
}

// 7. EXTRACT 12 SEAMLESS PATTERNS
async function extractPatterns() {
  console.log('▶ Generating 12 Seamless Patterns...');
  const patDir = path.join(ASSET_DIR, 'patterns');
  await ensureDir(patDir);

  const patterns = [
    // 1. Damask royal
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><path d="M50 10 C30 30 30 50 50 70 C70 50 70 30 50 10 Z M50 25 C42 35 42 45 50 55 C58 45 58 35 50 25 Z M20 50 C20 70 40 70 50 90 C60 70 80 70 80 50 C65 60 35 60 20 50 Z" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/></svg>`,
    // 2. Floral lace
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="28" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/><circle cx="50" cy="50" r="14" stroke="currentColor" stroke-width="1"/><circle cx="0" cy="0" r="20" stroke="currentColor" stroke-width="1"/><circle cx="100" cy="0" r="20" stroke="currentColor" stroke-width="1"/><circle cx="0" cy="100" r="20" stroke="currentColor" stroke-width="1"/><circle cx="100" cy="100" r="20" stroke="currentColor" stroke-width="1"/></svg>`,
    // 3. Batik Kawung modern
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><ellipse cx="50" cy="25" rx="14" ry="22" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/><ellipse cx="50" cy="75" rx="14" ry="22" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/><ellipse cx="25" cy="50" rx="22" ry="14" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/><ellipse cx="75" cy="50" rx="22" ry="14" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/><circle cx="50" cy="50" r="4" fill="currentColor"/></svg>`,
    // 4. Organic leafy vine
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><path d="M0 50 Q25 20 50 50 T100 50" stroke="currentColor" stroke-width="1.2"/><path d="M25 35 C20 25 30 20 35 30 Z M75 35 C70 25 80 20 85 30 Z" fill="currentColor"/></svg>`,
    // 5. Art Deco Chevron
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><polyline points="0,30 50,70 100,30" stroke="currentColor" stroke-width="1.2"/><polyline points="0,50 50,90 100,50" stroke="currentColor" stroke-width="1.2"/><polyline points="0,10 50,50 100,10" stroke="currentColor" stroke-width="1.2"/></svg>`,
    // 6. Champagne Diamond Lattice
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><polygon points="50,5 95,50 50,95 5,50" stroke="currentColor" stroke-width="1.2"/><polygon points="50,20 80,50 50,80 20,50" stroke="currentColor" stroke-width="0.8" stroke-dasharray="3 3"/></svg>`,
    // 7. Starburst Matrix
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" stroke-width="1.2"/><line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" stroke-width="1.2"/><circle cx="50" cy="50" r="3" fill="currentColor"/></svg>`,
    // 8. Woven Trellis
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" stroke-width="1"/><line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" stroke-width="1"/></svg>`,
    // 9. Classical Greek Key
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><polyline points="10,10 90,10 90,90 30,90 30,30 70,30 70,70 50,70" stroke="currentColor" stroke-width="1.5"/></svg>`,
    // 10. Laurel Wreath Trellis
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="35" stroke="currentColor" stroke-width="1"/><path d="M50 15 C45 25 55 25 50 35 M50 65 C45 75 55 75 50 85" stroke="currentColor" stroke-width="1.2"/></svg>`,
    // 11. Rosette Tile
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="30" stroke="currentColor" stroke-width="1.2"/><circle cx="50" cy="50" r="10" stroke="currentColor" stroke-width="1"/><circle cx="50" cy="50" r="3" fill="currentColor"/></svg>`,
    // 12. Fine Dotted Matrix
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="25" cy="25" r="2" fill="currentColor"/><circle cx="75" cy="25" r="2" fill="currentColor"/><circle cx="25" cy="75" r="2" fill="currentColor"/><circle cx="75" cy="75" r="2" fill="currentColor"/><circle cx="50" cy="50" r="3" fill="currentColor"/></svg>`,
  ];

  for (let i = 0; i < patterns.length; i++) {
    const filename = `pattern-${String(i + 1).padStart(2, '0')}.svg`;
    fs.writeFileSync(path.join(patDir, filename), patterns[i]);
  }
  console.log(`✅ Generated 12 seamless SVG patterns`);
}

// 8. EXTRACT 14 INVITATION CARDS
async function extractCards() {
  console.log('▶ Generating 14 Invitation Cards (8 HariKita Archetypes)...');
  const cardDir = path.join(ASSET_DIR, 'cards');
  await ensureDir(cardDir);

  const cardSVGs = [
    // 1. Royal Wax Seal
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" fill="none"><rect x="15" y="15" width="370" height="570" rx="20" stroke="currentColor" stroke-width="1.5"/><rect x="25" y="25" width="350" height="550" rx="14" stroke="currentColor" stroke-width="0.8" stroke-dasharray="3 3"/><circle cx="200" cy="300" r="42" stroke="currentColor" stroke-width="1.5"/><text x="200" y="306" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-size="20" font-weight="bold" fill="currentColor">HK</text></svg>`,
    // 2. Cathedral Roman Arch
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" fill="none"><path d="M 50 550 L 50 200 A 150 150 0 0 1 350 200 L 350 550 Z" stroke="currentColor" stroke-width="1.5"/><path d="M 65 540 L 65 210 A 135 135 0 0 1 335 210 L 335 540 Z" stroke="currentColor" stroke-width="0.8" stroke-dasharray="4 4"/></svg>`,
    // 3. Botanical Floral Border
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" fill="none"><rect x="20" y="20" width="360" height="560" rx="12" stroke="currentColor" stroke-width="1.2"/><circle cx="200" cy="120" r="50" stroke="currentColor" stroke-width="1"/><path d="M170 120 C180 100 220 100 230 120 C220 140 180 140 170 120 Z" stroke="currentColor" stroke-width="1"/></svg>`,
    // 4. Minimalist Typographic Frame
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" fill="none"><rect x="30" y="30" width="340" height="540" stroke="currentColor" stroke-width="1"/><line x1="50" y1="50" x2="350" y2="50" stroke="currentColor" stroke-width="0.5"/><line x1="50" y1="550" x2="350" y2="550" stroke="currentColor" stroke-width="0.5"/></svg>`,
    // 5. Traditional Javanese Batik Adat
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" fill="none"><rect x="20" y="20" width="360" height="560" rx="8" stroke="currentColor" stroke-width="1.8"/><ellipse cx="200" cy="100" rx="60" ry="30" stroke="currentColor" stroke-width="1.2"/><ellipse cx="200" cy="500" rx="60" ry="30" stroke="currentColor" stroke-width="1.2"/></svg>`,
    // 6. Islamic Syar'i Arabesque Arch
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" fill="none"><path d="M 50 550 L 50 250 Q 50 150 200 60 Q 350 150 350 250 L 350 550 Z" stroke="currentColor" stroke-width="1.5"/><path d="M 65 540 L 65 255 Q 65 165 200 80 Q 335 165 335 255 L 335 540 Z" stroke="currentColor" stroke-width="0.8"/></svg>`,
    // 7. Gatefold Monogram Crest
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" fill="none"><line x1="200" y1="20" x2="200" y2="580" stroke="currentColor" stroke-width="1" stroke-dasharray="6 6"/><rect x="15" y="15" width="370" height="570" rx="6" stroke="currentColor" stroke-width="1.5"/><circle cx="200" cy="300" r="45" fill="white" stroke="currentColor" stroke-width="1.5"/></svg>`,
    // 8. Fullscreen Prewed Photo Card
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" fill="none"><rect x="10" y="10" width="380" height="580" rx="16" stroke="currentColor" stroke-width="1.5"/><path d="M40 500 L360 500" stroke="currentColor" stroke-width="1"/></svg>`,
    // 9. Asymmetric Foliage Corner
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" fill="none"><rect x="25" y="25" width="350" height="550" rx="12" stroke="currentColor" stroke-width="1"/><path d="M25 150 C50 100 100 50 150 25" stroke="currentColor" stroke-width="1.5"/></svg>`,
    // 10. Vintage Postal Envelope
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" fill="none"><rect x="20" y="20" width="360" height="560" rx="10" stroke="currentColor" stroke-width="1.2"/><polyline points="20,20 200,200 380,20" stroke="currentColor" stroke-width="1"/></svg>`,
    // 11. Decoupage Rose Oval Crest
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" fill="none"><ellipse cx="200" cy="300" rx="140" ry="200" stroke="currentColor" stroke-width="1.5"/><ellipse cx="200" cy="300" rx="125" ry="185" stroke="currentColor" stroke-width="0.8" stroke-dasharray="4 4"/></svg>`,
    // 12. Intimate Engagement Card
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" fill="none"><rect x="25" y="25" width="350" height="550" rx="16" stroke="currentColor" stroke-width="1.2"/><circle cx="185" cy="280" r="30" stroke="currentColor" stroke-width="1.5"/><circle cx="215" cy="280" r="30" stroke="currentColor" stroke-width="1.5"/></svg>`,
    // 13. Romantic Botanical Garden
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" fill="none"><rect x="20" y="20" width="360" height="560" rx="24" stroke="currentColor" stroke-width="1.5"/><circle cx="200" cy="140" r="60" stroke="currentColor" stroke-width="1"/><path d="M50 520 C150 480 250 480 350 520" stroke="currentColor" stroke-width="1.2"/></svg>`,
    // 14. Editorial Magazine Style
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" fill="none"><rect x="20" y="20" width="360" height="560" stroke="currentColor" stroke-width="2"/><line x1="20" y1="90" x2="380" y2="90" stroke="currentColor" stroke-width="1"/><line x1="20" y1="510" x2="380" y2="510" stroke="currentColor" stroke-width="1"/></svg>`,
  ];

  for (let i = 0; i < cardSVGs.length; i++) {
    const filename = `card-invitation-${String(i + 1).padStart(2, '0')}.svg`;
    fs.writeFileSync(path.join(cardDir, filename), cardSVGs[i]);
  }
  console.log(`✅ Generated 14 invitation cards`);
}

async function run() {
  console.log('=== STARTING EXPANDED AUTHENTIC ASSET EXTRACTION ===\n');
  await extractLines();
  await extractFlowers();
  await extractLeaves();
  await extractOrnaments();
  await extractIcons();
  await extractTextures();
  await extractPatterns();
  await extractCards();
  console.log('\n🎉 ALL EXPANDED ASSETS EXTRACTED SUCCESSFULLY!');
}

run().catch(console.error);
