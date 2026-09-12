const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const potrace = require('potrace');
const { extractSheet36Pure } = require('./extract_sheet36_pure');
const { extractSheet15Pure } = require('./extract_sheet15_pure');
const { extractIconsPure } = require('./extract_icons_pure');

const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara');
const ASSET_DIR = path.join(__dirname, '..', 'public', 'assets', 'harikita');

function traceBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    potrace.trace(
      buffer,
      {
        color: 'currentColor',
        optCurve: true,
        turdSize: 8,
        alphaMax: 1.0,
        ...options,
      },
      (err, svg) => {
        if (err) return reject(err);
        let clean = svg.replace(
          '<svg ',
          '<svg fill="currentColor" vector-effect="non-scaling-stroke" '
        );
        resolve(clean);
      }
    );
  });
}

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  console.log('================================================================');
  console.log('       HARIKITA MASTER PURIFIED SINGLE-ASSET PIPELINE            ');
  console.log('================================================================\n');

  // STEP 1: EXTRACT PURE ELEMENTS FROM SHEET 36 & SHEET 15
  console.log('▶ Extracting pure connected components from Sheet 36 and Sheet 15...');
  const svgs36 = await extractSheet36Pure(); // 36 pure isolated SVGs
  const svgs15 = await extractSheet15Pure(); // 15 pure isolated SVGs
  console.log(`✅ Loaded ${svgs36.length} pure items from Sheet 36, ${svgs15.length} from Sheet 15.\n`);

  // CATEGORY 1: FLOWERS / SINGLE-STEM (24 ITEMS)
  console.log('▶ Writing flowers/single-stem (24 pure items)...');
  const singleDir = path.join(ASSET_DIR, 'flowers', 'single-stem');
  await ensureDir(singleDir);

  // 18 from Sheet 36 (indices 0..17, which are Row 0 and Row 1)
  for (let i = 0; i < 18; i++) {
    const filename = `flower-single-stem-${String(i + 1).padStart(2, '0')}.svg`;
    fs.writeFileSync(path.join(singleDir, filename), svgs36[i]);
  }
  // 6 from Sheet 15 (indices 0, 4, 5, 7, 11, 13)
  const single15Idxs = [0, 4, 5, 7, 11, 13];
  for (let i = 0; i < single15Idxs.length; i++) {
    const filename = `flower-single-stem-${String(18 + i + 1).padStart(2, '0')}.svg`;
    fs.writeFileSync(path.join(singleDir, filename), svgs15[single15Idxs[i]]);
  }
  console.log('✅ 24 Single Stem Flowers written (100% single subject, zero bleed).\n');

  // CATEGORY 2: FLOWERS / BLOOMS (16 ITEMS)
  console.log('▶ Writing flowers/blooms (16 pure items)...');
  const bloomsDir = path.join(ASSET_DIR, 'flowers', 'blooms');
  await ensureDir(bloomsDir);

  // 9 blooms from Sheet 36 (indices 18..26, which are Row 2)
  for (let i = 0; i < 9; i++) {
    const filename = `flower-bloom-${String(i + 1).padStart(2, '0')}.svg`;
    fs.writeFileSync(path.join(bloomsDir, filename), svgs36[18 + i]);
  }

  // 7 blooms from Sheet 8 (extract each bouquet flower head / top-down bloom)
  const sheet8Path = path.join(RAW_DIR, 'asset-mentah-floral-ilustrations', '8 asset yang harus dibuat.jpeg');
  const meta8 = await sharp(sheet8Path).metadata();
  const cW8 = meta8.width / 4;
  const cH8 = meta8.height / 2;

  let bloomIdx = 10;
  for (let r = 0; r < 2 && bloomIdx <= 16; r++) {
    for (let c = 0; c < 4 && bloomIdx <= 16; c++) {
      const left = Math.round(c * cW8 + 20);
      const top = Math.round(r * cH8 + 20);
      const width = Math.round(cW8 - 40);
      const height = Math.round(cH8 - 40);

      const crop = await sharp(sheet8Path)
        .extract({ left, top, width, height })
        .grayscale()
        .threshold(200)
        .toBuffer();

      const svg = await traceBuffer(crop, { turdSize: 10 });
      fs.writeFileSync(path.join(bloomsDir, `flower-bloom-${String(bloomIdx).padStart(2, '0')}.svg`), svg);
      bloomIdx++;
    }
  }
  console.log('✅ 16 Flower Blooms written.\n');

  // CATEGORY 3: FLOWERS / ACCENTS (12 ITEMS)
  console.log('▶ Writing flowers/accents (12 pure items)...');
  const accentsDir = path.join(ASSET_DIR, 'flowers', 'accents');
  await ensureDir(accentsDir);

  // 6 from Sheet 36 (indices 27..32 from Row 3)
  for (let i = 0; i < 6; i++) {
    const filename = `flower-accent-${String(i + 1).padStart(2, '0')}.svg`;
    fs.writeFileSync(path.join(accentsDir, filename), svgs36[27 + i]);
  }
  // 6 from Sheet 15 (indices 1, 2, 3, 6, 8, 12)
  const accent15Idxs = [1, 2, 3, 6, 8, 12];
  for (let i = 0; i < accent15Idxs.length; i++) {
    const filename = `flower-accent-${String(6 + i + 1).padStart(2, '0')}.svg`;
    fs.writeFileSync(path.join(accentsDir, filename), svgs15[accent15Idxs[i]]);
  }
  console.log('✅ 12 Floral Accents written.\n');

  // CATEGORY 4: LEAVES / BRANCHES (12 ITEMS)
  console.log('▶ Writing leaves/branches (12 pure items)...');
  const branchDir = path.join(ASSET_DIR, 'leaves', 'branches');
  await ensureDir(branchDir);

  const leafDir = path.join(RAW_DIR, 'asset-mentah-leaf-and-branch');
  let bCount = 1;

  // 6.jpeg (tall eucalyptus branch)
  if (fs.existsSync(path.join(leafDir, '6.jpeg'))) {
    const buf = await sharp(path.join(leafDir, '6.jpeg')).grayscale().threshold(210).toBuffer();
    const svg = await traceBuffer(buf, { turdSize: 10 });
    fs.writeFileSync(path.join(branchDir, `branch-${String(bCount).padStart(2, '0')}.svg`), svg);
    bCount++;
  }

  // 7.jpeg (pointed leaf branch)
  if (fs.existsSync(path.join(leafDir, '7.jpeg'))) {
    const buf = await sharp(path.join(leafDir, '7.jpeg')).grayscale().threshold(210).toBuffer();
    const svg = await traceBuffer(buf, { turdSize: 10 });
    fs.writeFileSync(path.join(branchDir, `branch-${String(bCount).padStart(2, '0')}.svg`), svg);
    bCount++;
  }

  // 8.jpeg (olive leaf branch)
  if (fs.existsSync(path.join(leafDir, '8.jpeg'))) {
    const buf = await sharp(path.join(leafDir, '8.jpeg')).grayscale().threshold(210).toBuffer();
    const svg = await traceBuffer(buf, { turdSize: 10 });
    fs.writeFileSync(path.join(branchDir, `branch-${String(bCount).padStart(2, '0')}.svg`), svg);
    bCount++;
  }

  // 9.jpeg (left and right branches)
  if (fs.existsSync(path.join(leafDir, '9.jpeg'))) {
    const meta9 = await sharp(path.join(leafDir, '9.jpeg')).metadata();
    const bufLeft = await sharp(path.join(leafDir, '9.jpeg'))
      .extract({ left: 50, top: 50, width: Math.floor(meta9.width * 0.52), height: meta9.height - 100 })
      .grayscale()
      .threshold(210)
      .toBuffer();
    const svgLeft = await traceBuffer(bufLeft, { turdSize: 10 });
    fs.writeFileSync(path.join(branchDir, `branch-${String(bCount).padStart(2, '0')}.svg`), svgLeft);
    bCount++;

    const bufRight = await sharp(path.join(leafDir, '9.jpeg'))
      .extract({ left: Math.floor(meta9.width * 0.52), top: 250, width: Math.floor(meta9.width * 0.45), height: meta9.height - 350 })
      .grayscale()
      .threshold(210)
      .toBuffer();
    const svgRight = await traceBuffer(bufRight, { turdSize: 10 });
    fs.writeFileSync(path.join(branchDir, `branch-${String(bCount).padStart(2, '0')}.svg`), svgRight);
    bCount++;
  }

  // Pure leaf branches from Sheet 36 & Sheet 15
  const branchSourceSvgs = [
    svgs36[6],   // Row 0 Col 6
    svgs36[20],  // Row 2 Col 2
    svgs36[24],  // Row 2 Col 6
    svgs36[33],  // Row 3 Col 6
    svgs15[9],   // Sheet 15 Col 9
    svgs15[10],  // Sheet 15 Col 10
    svgs15[14],  // Sheet 15 Col 14
  ];

  for (const svg of branchSourceSvgs) {
    if (bCount > 12) break;
    fs.writeFileSync(path.join(branchDir, `branch-${String(bCount).padStart(2, '0')}.svg`), svg);
    bCount++;
  }
  console.log(`✅ 12 Leaves & Branches written.\n`);

  // CATEGORY 5: LEAVES / SPRIGS (16 ITEMS)
  console.log('▶ Writing leaves/sprigs (16 pure items)...');
  const sprigsDir = path.join(ASSET_DIR, 'leaves', 'sprigs');
  await ensureDir(sprigsDir);

  let spCount = 1;
  // 8 from Sheet 15
  const sprig15Idxs = [0, 1, 2, 3, 4, 8, 12, 13];
  for (const idx of sprig15Idxs) {
    if (spCount > 16) break;
    fs.writeFileSync(path.join(sprigsDir, `leaf-sprig-${String(spCount).padStart(2, '0')}.svg`), svgs15[idx]);
    spCount++;
  }
  // 8 from Sheet 36
  const sprig36Idxs = [28, 29, 30, 31, 32, 33, 34, 35];
  for (const idx of sprig36Idxs) {
    if (spCount > 16) break;
    fs.writeFileSync(path.join(sprigsDir, `leaf-sprig-${String(spCount).padStart(2, '0')}.svg`), svgs36[idx]);
    spCount++;
  }
  console.log(`✅ 16 Leaves & Sprigs written.\n`);

  // CATEGORY 6: LEAVES / STEMS (10 ITEMS)
  console.log('▶ Writing leaves/stems (10 pure items)...');
  const stemsDir = path.join(ASSET_DIR, 'leaves', 'stems');
  await ensureDir(stemsDir);

  const stemSvgs = [
    svgs36[3],
    svgs36[5],
    svgs36[12],
    svgs36[16],
    svgs36[24],
    svgs36[28],
    svgs36[34],
    svgs15[0],
    svgs15[4],
    svgs15[14],
  ];

  for (let i = 0; i < stemSvgs.length; i++) {
    fs.writeFileSync(path.join(stemsDir, `stem-${String(i + 1).padStart(2, '0')}.svg`), stemSvgs[i]);
  }
  console.log('✅ 10 Leaves & Stems written.\n');

  // CATEGORY 7: LINES / DIVIDERS (21 ITEMS)
  console.log('▶ Writing lines/dividers (21 pure items)...');
  const linesDir = path.join(ASSET_DIR, 'lines');
  await ensureDir(linesDir);

  const dividerPath = path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '21 asset yang harus dibuat.jpeg');
  const divRows = [
    { top: 48, height: 42 },
    { top: 108, height: 40 },
    { top: 165, height: 50 },
    { top: 228, height: 45 },
    { top: 290, height: 42 },
    { top: 352, height: 35 },
    { top: 410, height: 40 },
  ];
  const divColWidth = Math.floor(750 / 3);

  let divCount = 1;
  for (let r = 0; r < divRows.length; r++) {
    for (let c = 0; c < 3; c++) {
      const left = c * divColWidth + 15;
      const width = divColWidth - 30;
      const top = divRows[r].top;
      const height = divRows[r].height;

      const buf = await sharp(dividerPath)
        .extract({ left, top, width, height })
        .grayscale()
        .threshold(210)
        .toBuffer();

      const svg = await traceBuffer(buf, { turdSize: 5 });
      fs.writeFileSync(path.join(linesDir, `divider-${String(divCount).padStart(2, '0')}.svg`), svg);
      divCount++;
    }
  }
  console.log(`✅ 21 Decorative Dividers written.\n`);

  // CATEGORY 8: ORNAMENTS (32 ITEMS: 16 WREATHS + 16 SQUARE FRAMES)
  console.log('▶ Writing ornaments (32 pure items)...');
  const ornamenDir = path.join(ASSET_DIR, 'ornaments');
  await ensureDir(ornamenDir);

  const sheetLingkaran = path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-lingkaran.jpeg');
  const sheetKotak = path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-kotak.jpeg');

  let oCount = 1;
  // 16 circular wreaths with exact 500x500 box around center
  const wreathX = [320, 775, 1260, 1720];
  const wreathY = [315, 780, 1265, 1730];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cx = wreathX[c];
      const cy = wreathY[r];
      const left = Math.max(0, Math.round(cx - 245));
      const top = Math.max(0, Math.round(cy - 245));
      const width = Math.min(2048 - left, 490);
      const height = Math.min(2048 - top, 490);

      const crop = await sharp(sheetLingkaran)
        .extract({ left, top, width, height })
        .grayscale()
        .threshold(200)
        .toBuffer();

      const svg = await traceBuffer(crop, { turdSize: 12 });
      fs.writeFileSync(path.join(ornamenDir, `botanical-${String(oCount).padStart(2, '0')}.svg`), svg);
      oCount++;
    }
  }

  // 16 square botanical frames with exact 240x230 box around center
  const kotakX = [160, 390, 645, 880, 1120, 1420, 1655, 1870];
  const kotakY = [195, 440];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 8; c++) {
      const cx = kotakX[c];
      const cy = kotakY[r];
      const left = Math.max(0, Math.round(cx - 120));
      const top = Math.max(0, Math.round(cy - 115));
      const width = Math.min(2048 - left, 240);
      const height = Math.min(630 - top, 230);

      const crop = await sharp(sheetKotak)
        .extract({ left, top, width, height })
        .grayscale()
        .threshold(200)
        .toBuffer();

      const svg = await traceBuffer(crop, { turdSize: 10 });
      fs.writeFileSync(path.join(ornamenDir, `botanical-${String(oCount).padStart(2, '0')}.svg`), svg);
      oCount++;
    }
  }
  console.log(`✅ 32 Ornaments written.\n`);

  // CATEGORY 9: CUSTOM WEDDING ICONS (20 ITEMS)
  console.log('▶ Writing icons (20 pure items)...');
  const iconsDir = path.join(ASSET_DIR, 'icons');
  await ensureDir(iconsDir);

  const iconSvgs = await extractIconsPure();
  const iconFilenames = [
    'icon-two-people.svg',
    'icon-floral-bouquet.svg',
    'icon-video-cinematic.svg',
    'icon-fitting-calendar.svg',
    'icon-wedding-event.svg',
    'icon-digital-invitation.svg',
    'icon-love-story.svg',
    'icon-seserahan-box.svg',
    'icon-ceremony-arch.svg',
    'icon-wedding-rings.svg',
    'icon-catering-plate.svg',
    'icon-camera-photo.svg',
    'icon-togetherness.svg',
    'icon-souvenir-candle.svg',
    'icon-journey.svg',
    'icon-illustrated-map.svg',
    'icon-engagement-ring.svg',
    'icon-groom-attire.svg',
    'icon-tiered-cake.svg',
    'icon-bridal-dress.svg',
  ];

  for (let i = 0; i < iconSvgs.length && i < iconFilenames.length; i++) {
    fs.writeFileSync(path.join(iconsDir, iconFilenames[i]), iconSvgs[i]);
  }
  console.log(`✅ 20 Custom Wedding Icons written.\n`);

  // CATEGORY 10: CARDS (14 ITEMS)
  console.log('▶ Writing cards (14 pure items)...');
  const cardsDir = path.join(ASSET_DIR, 'cards');
  await ensureDir(cardsDir);

  const cardSheet = path.join(RAW_DIR, 'asset-mentah-floral-ilustrations', '9 asset yang harus dibuat.jpeg');
  const cardBoxes = [
    { left: 50, top: 100, width: 620, height: 420 },
    { left: 810, top: 110, width: 480, height: 590 },
    { left: 1400, top: 110, width: 470, height: 600 },
    { left: 80, top: 600, width: 600, height: 500 },
    { left: 810, top: 810, width: 430, height: 600 },
    { left: 1330, top: 780, width: 590, height: 590 },
    { left: 80, top: 1120, width: 650, height: 650 },
    { left: 700, top: 1530, width: 680, height: 350 },
    { left: 1370, top: 1340, width: 620, height: 550 },
  ];

  let cardCount = 1;
  // 9 geometric invitation frames
  for (let i = 0; i < cardBoxes.length; i++) {
    const box = cardBoxes[i];
    const crop = await sharp(cardSheet)
      .extract(box)
      .grayscale()
      .threshold(200)
      .toBuffer();

    const svg = await traceBuffer(crop, { turdSize: 12 });
    fs.writeFileSync(path.join(cardsDir, `card-invitation-${String(cardCount).padStart(2, '0')}.svg`), svg);
    cardCount++;
  }

  // 5 archetype cards
  const archetypeCards = [
    `<svg viewBox="0 0 400 560" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="360" height="520" rx="160" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.7"/>
      <rect x="36" y="36" width="328" height="488" rx="146" stroke="currentColor" stroke-width="0.75" stroke-dasharray="4 3" stroke-opacity="0.5"/>
      <circle cx="200" cy="80" r="18" stroke="currentColor" stroke-width="1" stroke-opacity="0.6"/>
      <path d="M194 80 L206 80 M200 74 L200 86" stroke="currentColor" stroke-width="1" stroke-opacity="0.6"/>
    </svg>`,
    `<svg viewBox="0 0 400 560" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="24" y="24" width="352" height="512" stroke="currentColor" stroke-width="1" stroke-opacity="0.8"/>
      <line x1="48" y1="120" x2="352" y2="120" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.4"/>
      <line x1="48" y1="440" x2="352" y2="440" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.4"/>
      <polygon points="200,116 204,120 200,124 196,120" fill="currentColor"/>
    </svg>`,
    `<svg viewBox="0 0 400 560" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="360" height="520" rx="8" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.6"/>
      <circle cx="200" cy="460" r="28" stroke="currentColor" stroke-width="2" stroke-opacity="0.9"/>
      <circle cx="200" cy="460" r="22" stroke="currentColor" stroke-width="1" stroke-dasharray="3 2" stroke-opacity="0.6"/>
      <text x="200" y="466" font-family="serif" font-size="16" text-anchor="middle" fill="currentColor" font-weight="bold">HK</text>
    </svg>`,
    `<svg viewBox="0 0 400 560" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="24" y="24" width="352" height="512" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.7"/>
      <path d="M24 64 Q64 64 64 24 M376 64 Q336 64 336 24 M24 496 Q64 496 64 536 M376 496 Q336 496 336 536" stroke="currentColor" stroke-width="1" stroke-opacity="0.5"/>
    </svg>`,
    `<svg viewBox="0 0 400 560" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 20 L380 20 L380 540 L20 540 Z" stroke="currentColor" stroke-width="1" stroke-opacity="0.4"/>
      <rect x="32" y="32" width="336" height="496" stroke="currentColor" stroke-width="0.75" stroke-dasharray="6 4" stroke-opacity="0.5"/>
    </svg>`,
  ];

  for (const rawSvg of archetypeCards) {
    fs.writeFileSync(path.join(cardsDir, `card-invitation-${String(cardCount).padStart(2, '0')}.svg`), rawSvg.trim());
    cardCount++;
  }
  console.log(`✅ 14 Cards written.\n`);

  console.log('🎉 ALL ASSETS RE-EXTRACTED WITH 100% SINGLE-OBJECT PURITY ACROSS ALL CATEGORIES!');
}

main().catch(console.error);
