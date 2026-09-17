const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT_DIR = path.join(__dirname, '..');
const ASSET_BASE = path.join(ROOT_DIR, 'public', 'assets', 'harikita');
const RAW_DIR = path.join(ROOT_DIR, 'public', 'refactor_dir_sementara');

// Helper to ensure dir exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Helper to write SVG file
function writeSvg(subPath, svgContent) {
  const fullPath = path.join(ASSET_BASE, subPath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, svgContent.trim());
}

async function buildAssets() {
  console.log('=== BUILDING ALL 136 HARIKITA VISUAL ASSETS ===\n');

  // Load official symbol path from public/brand/harikita-symbol.svg
  const symbolSvg = fs.readFileSync(path.join(ROOT_DIR, 'public', 'brand', 'harikita-symbol.svg'), 'utf8');
  const symbolPathMatch = symbolSvg.match(/<path[^>]*d="([^"]+)"/);
  const symbolPath = symbolPathMatch ? symbolPathMatch[1] : '';

  // -------------------------------------------------------------
  // 1. Ornaments (12 SVGs)
  // -------------------------------------------------------------
  console.log('Generating Ornaments (12)...');
  const ornamentPaths = [
    // 01: Symmetrical top crest with delicate flower and leaves
    `<path d="M50 85 C50 50 35 30 15 25 C25 20 40 25 50 35 C60 25 75 20 85 25 C65 30 50 50 50 85 Z" fill="none" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/><circle cx="50" cy="22" r="4" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M50 26 C42 16 30 15 22 18 C30 22 38 22 46 25" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"/><path d="M50 26 C58 16 70 15 78 18 C70 22 62 22 54 25" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"/>`,
    // 02: Vertical floral sprig flourish
    `<path d="M50 90 L50 20" fill="none" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/><path d="M50 70 C40 65 35 55 38 48 C45 50 48 60 50 70" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"/><path d="M50 55 C60 50 65 40 62 33 C55 35 52 45 50 55" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"/><path d="M50 38 C42 32 38 24 40 18 C46 20 48 28 50 38" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"/><circle cx="50" cy="16" r="3" fill="none" stroke="currentColor" stroke-width="1.2"/>`,
    // 03: Curved garland flourish
    `<path d="M10 50 C25 35 75 35 90 50 C75 65 25 65 10 50 Z" fill="none" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/><circle cx="50" cy="50" r="3" fill="none" stroke="currentColor" stroke-width="1"/>`,
    // 04: Laurel branch flourish
    `<path d="M20 80 C35 75 45 60 50 30 C55 60 65 75 80 80" fill="none" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/><circle cx="50" cy="22" r="4" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M42 45 C35 40 30 45 35 50 C40 48 42 45 42 45" fill="none" stroke="currentColor" stroke-width="1"/><path d="M58 45 C65 40 70 45 65 50 C60 48 58 45 58 45" fill="none" stroke="currentColor" stroke-width="1"/>`,
    // 05: Symmetrical vine scroll
    `<path d="M15 60 C25 40 40 40 50 55 C60 40 75 40 85 60" fill="none" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/><path d="M50 55 C45 70 30 75 20 65" fill="none" stroke="currentColor" stroke-width="1"/><path d="M50 55 C55 70 70 75 80 65" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="50" cy="38" r="2.5" fill="none" stroke="currentColor" stroke-width="1"/>`,
    // 06: Delicate botanical spray
    `<path d="M50 92 Q50 40 48 18" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/><path d="M49 70 C38 65 30 52 36 46 C42 48 47 58 49 70" stroke="currentColor" stroke-width="1"/><path d="M49 52 C60 46 68 35 62 28 C56 30 51 40 49 52" stroke="currentColor" stroke-width="1"/><circle cx="48" cy="14" r="3.5" stroke="currentColor" stroke-width="1.2"/>`,
    // 07: Horizontal floral header accent
    `<path d="M10 50 L40 50 M60 50 L90 50" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/><circle cx="50" cy="50" r="5" stroke="currentColor" stroke-width="1.2"/><path d="M46 46 L54 54 M54 46 L46 54" stroke="currentColor" stroke-width="0.8"/>`,
    // 08: Arch foliage ornament
    `<path d="M25 80 C25 35 75 35 75 80" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/><path d="M35 55 C30 50 32 42 38 45" stroke="currentColor" stroke-width="1"/><path d="M65 55 C70 50 68 42 62 45" stroke="currentColor" stroke-width="1"/><circle cx="50" cy="32" r="3" stroke="currentColor" stroke-width="1"/>`,
    // 09: Delicate leaf rosette
    `<circle cx="50" cy="50" r="12" stroke="currentColor" stroke-width="1.2"/><circle cx="50" cy="50" r="4" stroke="currentColor" stroke-width="1"/><path d="M50 38 C42 25 58 25 50 38 M62 50 C75 42 75 58 62 50 M50 62 C58 75 42 75 50 62 M38 50 C25 58 25 42 38 50" stroke="currentColor" stroke-width="1"/>`,
    // 10: Botanical crest with berries
    `<path d="M30 75 C30 45 45 35 50 25 C55 35 70 45 70 75" stroke="currentColor" stroke-width="1.2"/><circle cx="50" cy="20" r="3" stroke="currentColor" stroke-width="1.2"/><circle cx="38" cy="50" r="2" stroke="currentColor" stroke-width="1"/><circle cx="62" cy="50" r="2" stroke="currentColor" stroke-width="1"/>`,
    // 11: Twin leafy stem
    `<path d="M45 85 C42 50 30 35 25 25 M55 85 C58 50 70 35 75 25" stroke="currentColor" stroke-width="1.2"/><circle cx="50" cy="55" r="2.5" stroke="currentColor" stroke-width="1"/>`,
    // 12: Elegant floral tail
    `<path d="M20 30 C40 30 45 70 50 70 C55 70 60 30 80 30" stroke="currentColor" stroke-width="1.2"/><circle cx="50" cy="76" r="3" stroke="currentColor" stroke-width="1.2"/>`
  ];

  ornamentPaths.forEach((body, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    writeSvg(`ornaments/botanical-${num}.svg`, `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        ${body}
      </svg>
    `);
  });

  // -------------------------------------------------------------
  // 2. Lines & Dividers (12 SVGs)
  // -------------------------------------------------------------
  console.log('Generating Lines & Dividers (12)...');
  const lineTemplates = [
    // 01: Line with center diamond
    `<line x1="5" y1="20" x2="90" y2="20" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"/><polygon points="100,15 106,20 100,25 94,20" fill="none" stroke="currentColor" stroke-width="1.2"/><line x1="110" y1="20" x2="195" y2="20" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"/>`,
    // 02: Dotted line with center diamond
    `<line x1="5" y1="20" x2="90" y2="20" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" vector-effect="non-scaling-stroke"/><polygon points="100,14 107,20 100,26 93,20" fill="none" stroke="currentColor" stroke-width="1.2"/><line x1="110" y1="20" x2="195" y2="20" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" vector-effect="non-scaling-stroke"/>`,
    // 03: Infinity loop knot in center
    `<line x1="5" y1="20" x2="85" y2="20" stroke="currentColor" stroke-width="1"/><path d="M85 20 C90 12 100 28 105 20 C110 12 115 28 120 20" stroke="currentColor" stroke-width="1.2" fill="none"/><line x1="120" y1="20" x2="195" y2="20" stroke="currentColor" stroke-width="1"/>`,
    // 04: Symmetrical flourish scroll divider
    `<path d="M10 20 C40 20 60 10 90 20 C95 22 98 18 100 15 C102 18 105 22 110 20 C140 10 160 20 190 20" stroke="currentColor" stroke-width="1" fill="none"/>`,
    // 05: Minimal line with three dots
    `<line x1="10" y1="20" x2="88" y2="20" stroke="currentColor" stroke-width="1"/><circle cx="94" cy="20" r="1.5" fill="currentColor"/><circle cx="100" cy="20" r="2.5" fill="currentColor"/><circle cx="106" cy="20" r="1.5" fill="currentColor"/><line x1="112" y1="20" x2="190" y2="20" stroke="currentColor" stroke-width="1"/>`,
    // 06: Arch curve divider
    `<path d="M10 30 C60 10 140 10 190 30" stroke="currentColor" stroke-width="1.2" fill="none"/>`,
    // 07: Double wave ribbon line
    `<path d="M10 18 Q50 26 100 18 T190 18" stroke="currentColor" stroke-width="1" fill="none"/><path d="M10 22 Q50 14 100 22 T190 22" stroke="currentColor" stroke-width="0.8" fill="none"/>`,
    // 08: Botanical sprig center divider
    `<line x1="10" y1="20" x2="80" y2="20" stroke="currentColor" stroke-width="1"/><path d="M85 20 C95 10 105 10 115 20" stroke="currentColor" stroke-width="1.2" fill="none"/><circle cx="100" cy="14" r="2" stroke="currentColor" stroke-width="1"/><line x1="120" y1="20" x2="190" y2="20" stroke="currentColor" stroke-width="1"/>`,
    // 09: Tapered fine line
    `<line x1="10" y1="20" x2="190" y2="20" stroke="currentColor" stroke-width="1.2"/><line x1="40" y1="22" x2="160" y2="22" stroke="currentColor" stroke-width="0.6"/>`,
    // 10: Center 4-point sparkle divider
    `<line x1="10" y1="20" x2="90" y2="20" stroke="currentColor" stroke-width="1"/><path d="M100 12 Q100 20 108 20 Q100 20 100 28 Q100 20 92 20 Q100 20 100 12 Z" stroke="currentColor" stroke-width="1" fill="none"/><line x1="110" y1="20" x2="190" y2="20" stroke="currentColor" stroke-width="1"/>`,
    // 11: Gentle dip center line
    `<path d="M10 18 L80 18 Q100 30 120 18 L190 18" stroke="currentColor" stroke-width="1" fill="none"/>`,
    // 12: Heart flourish divider
    `<line x1="10" y1="20" x2="85" y2="20" stroke="currentColor" stroke-width="1"/><path d="M92 20 C92 14 100 14 100 18 C100 14 108 14 108 20 C108 24 100 28 100 28 C100 28 92 24 92 20 Z" stroke="currentColor" stroke-width="1.2" fill="none"/><line x1="115" y1="20" x2="190" y2="20" stroke="currentColor" stroke-width="1"/>`
  ];

  lineTemplates.forEach((body, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    writeSvg(`lines/divider-${num}.svg`, `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40" fill="none">
        ${body}
      </svg>
    `);
  });

  // -------------------------------------------------------------
  // 3. Corner Elements (8 SVGs)
  // -------------------------------------------------------------
  console.log('Generating Corners (8)...');
  const cornerTemplates = [
    // 01: Top-Left floral flourish corner
    `<path d="M5 80 L5 25 C5 14 14 5 25 5 L80 5" stroke="currentColor" stroke-width="1.2"/><path d="M12 28 C12 19 19 12 28 12" stroke="currentColor" stroke-width="0.8"/><circle cx="28" cy="28" r="3" stroke="currentColor" stroke-width="1"/>`,
    // 02: Leaf sprig corner
    `<path d="M10 70 L10 20 C10 14 14 10 20 10 L70 10" stroke="currentColor" stroke-width="1.2"/><path d="M20 20 C15 30 30 35 25 45 C35 35 45 40 40 25" stroke="currentColor" stroke-width="1"/>`,
    // 03: Classic frame corner with loop
    `<path d="M8 80 L8 18 C8 12 12 8 18 8 L80 8" stroke="currentColor" stroke-width="1.2"/><path d="M18 8 C14 14 24 24 18 18" stroke="currentColor" stroke-width="1"/>`,
    // 04: Botanical blossom corner
    `<path d="M12 75 L12 22 C12 16 16 12 22 12 L75 12" stroke="currentColor" stroke-width="1"/><circle cx="25" cy="25" r="5" stroke="currentColor" stroke-width="1.2"/><path d="M22 25 C18 20 28 20 25 25 M28 25 C32 28 28 32 25 28" stroke="currentColor" stroke-width="0.8"/>`,
    // 05: Minimalist geometric bracket corner
    `<path d="M10 60 L10 10 L60 10" stroke="currentColor" stroke-width="1.2"/><polygon points="10,10 16,10 10,16" fill="currentColor"/>`,
    // 06: Delicate vine corner
    `<path d="M15 70 C15 40 20 20 45 15 C60 15 70 15 70 15" stroke="currentColor" stroke-width="1.2"/><path d="M25 35 C20 30 25 25 30 30" stroke="currentColor" stroke-width="1"/>`,
    // 07: Double line arch corner
    `<path d="M10 80 L10 25 C10 16 16 10 25 10 L80 10" stroke="currentColor" stroke-width="1.2"/><path d="M16 80 L16 28 C16 21 21 16 28 16 L80 16" stroke="currentColor" stroke-width="0.8"/>`,
    // 08: Elegant laurel spray corner
    `<path d="M12 65 C12 25 25 12 65 12" stroke="currentColor" stroke-width="1.2"/><circle cx="22" cy="22" r="3" stroke="currentColor" stroke-width="1"/>`
  ];

  cornerTemplates.forEach((body, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    writeSvg(`corners/corner-${num}.svg`, `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        ${body}
      </svg>
    `);
  });

  // -------------------------------------------------------------
  // 4. Abstract Symbols (10 SVGs)
  // -------------------------------------------------------------
  console.log('Generating Abstract Symbols (10)...');
  const symbolTemplates = [
    // 01: 4-point sparkle star
    `<path d="M50 15 Q50 50 85 50 Q50 50 50 85 Q50 50 15 50 Q50 50 50 15 Z" stroke="currentColor" stroke-width="1.2" fill="none"/>`,
    // 02: 8-point sunburst sparkle
    `<path d="M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M22 78 L78 22" stroke="currentColor" stroke-width="1"/><circle cx="50" cy="50" r="3" fill="currentColor"/>`,
    // 03: Infinity loop
    `<path d="M25 50 C25 40 38 40 50 50 C62 60 75 60 75 50 C75 40 62 40 50 50 C38 60 25 60 25 50 Z" stroke="currentColor" stroke-width="1.2" fill="none"/>`,
    // 04: Organic soft curve
    `<path d="M15 75 C30 25 70 25 85 75" stroke="currentColor" stroke-width="1.2" fill="none"/>`,
    // 05: Half sun rays
    `<path d="M20 70 A30 30 0 0 1 80 70" stroke="currentColor" stroke-width="1.2" fill="none"/><line x1="50" y1="35" x2="50" y2="20" stroke="currentColor" stroke-width="1"/><line x1="32" y1="42" x2="22" y2="32" stroke="currentColor" stroke-width="1"/><line x1="68" y1="42" x2="78" y2="32" stroke="currentColor" stroke-width="1"/><line x1="20" y1="70" x2="80" y2="70" stroke="currentColor" stroke-width="1"/>`,
    // 06: Twin dots with swirl
    `<circle cx="35" cy="50" r="3" fill="currentColor"/><circle cx="65" cy="50" r="3" fill="currentColor"/><path d="M35 50 Q50 30 65 50" stroke="currentColor" stroke-width="1" fill="none"/>`,
    // 07: Crescent moon with small star
    `<path d="M55 25 A25 25 0 0 1 55 75 A30 30 0 1 0 55 25 Z" stroke="currentColor" stroke-width="1.2" fill="none"/><circle cx="65" cy="40" r="2.5" fill="currentColor"/>`,
    // 08: Double arch symbol
    `<path d="M30 80 C30 40 70 40 70 80 M38 80 C38 50 62 50 62 80" stroke="currentColor" stroke-width="1.2" fill="none"/>`,
    // 09: Radiant diamond star
    `<polygon points="50,18 58,42 82,50 58,58 50,82 42,58 18,50 42,42" stroke="currentColor" stroke-width="1.2" fill="none"/>`,
    // 10: Flourish flourish ribbon
    `<path d="M20 50 C40 30 60 70 80 50 C70 40 50 60 40 50" stroke="currentColor" stroke-width="1.2" fill="none"/>`
  ];

  symbolTemplates.forEach((body, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    writeSvg(`abstract/symbol-${num}.svg`, `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        ${body}
      </svg>
    `);
  });

  // -------------------------------------------------------------
  // 5. Flowers: Single Stem (12 SVGs)
  // -------------------------------------------------------------
  console.log('Generating Flowers Single-Stem (12)...');
  for (let i = 1; i <= 12; i++) {
    const num = String(i).padStart(2, '0');
    const curvature = (i % 2 === 0) ? 'Q48 50 50 90' : 'Q52 50 50 90';
    const petalCount = 4 + (i % 5);
    let petalElements = '';
    for (let p = 0; p < petalCount; p++) {
      const angle = (p * (360 / petalCount));
      petalElements += `<ellipse cx="50" cy="30" rx="6" ry="12" transform="rotate(${angle} 50 30)" stroke="currentColor" stroke-width="1" fill="none"/>`;
    }

    writeSvg(`flowers/single-stem/flower-single-stem-${num}.svg`, `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <path d="M50 30 ${curvature}" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/>
        <path d="M50 55 C40 50 35 40 42 35 C48 38 49 48 50 55" stroke="currentColor" stroke-width="1"/>
        <path d="M50 68 C60 62 65 52 58 47 C52 50 51 60 50 68" stroke="currentColor" stroke-width="1"/>
        ${petalElements}
        <circle cx="50" cy="30" r="3" fill="none" stroke="currentColor" stroke-width="1"/>
      </svg>
    `);
  }

  // -------------------------------------------------------------
  // 6. Flowers: Blooms (6 SVGs)
  // -------------------------------------------------------------
  console.log('Generating Flower Blooms (6)...');
  for (let i = 1; i <= 6; i++) {
    const num = String(i).padStart(2, '0');
    const petals = 6 + i;
    let petalsSvg = '';
    for (let p = 0; p < petals; p++) {
      const angle = p * (360 / petals);
      petalsSvg += `<path d="M50 50 C40 30 60 30 50 50" transform="rotate(${angle} 50 50)" stroke="currentColor" stroke-width="1.2" fill="none"/>`;
    }
    writeSvg(`flowers/blooms/flower-bloom-${num}.svg`, `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        ${petalsSvg}
        <circle cx="50" cy="50" r="5" stroke="currentColor" stroke-width="1.2"/>
        <circle cx="50" cy="50" r="2" fill="currentColor"/>
      </svg>
    `);
  }

  // -------------------------------------------------------------
  // 7. Flowers: Accents (6 SVGs)
  // -------------------------------------------------------------
  console.log('Generating Flower Accents (6)...');
  for (let i = 1; i <= 6; i++) {
    const num = String(i).padStart(2, '0');
    writeSvg(`flowers/accents/flower-accent-${num}.svg`, `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="3" stroke="currentColor" stroke-width="1"/>
        <circle cx="20" cy="12" r="2.5" stroke="currentColor" stroke-width="0.8"/>
        <circle cx="26" cy="16" r="2.5" stroke="currentColor" stroke-width="0.8"/>
        <circle cx="26" cy="24" r="2.5" stroke="currentColor" stroke-width="0.8"/>
        <circle cx="20" cy="28" r="2.5" stroke="currentColor" stroke-width="0.8"/>
        <circle cx="14" cy="24" r="2.5" stroke="currentColor" stroke-width="0.8"/>
        <circle cx="14" cy="16" r="2.5" stroke="currentColor" stroke-width="0.8"/>
      </svg>
    `);
  }

  // -------------------------------------------------------------
  // 8. Leaves: Sprigs (8), Branches (4), Stems (4)
  // -------------------------------------------------------------
  console.log('Generating Leaves & Branches (16)...');
  // Sprigs (8)
  for (let i = 1; i <= 8; i++) {
    const num = String(i).padStart(2, '0');
    writeSvg(`leaves/sprigs/leaf-sprig-${num}.svg`, `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100" fill="none">
        <path d="M30 90 Q${28 + i} 50 30 15" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke"/>
        <path d="M30 70 C20 65 15 55 22 50 C28 52 30 62 30 70" stroke="currentColor" stroke-width="1"/>
        <path d="M30 55 C40 50 45 40 38 35 C32 37 30 47 30 55" stroke="currentColor" stroke-width="1"/>
        <path d="M30 40 C20 35 15 25 22 20 C28 22 30 32 30 40" stroke="currentColor" stroke-width="1"/>
        <path d="M30 25 C40 20 45 10 38 5 C32 7 30 17 30 25" stroke="currentColor" stroke-width="1"/>
      </svg>
    `);
  }

  // Branches (4)
  for (let i = 1; i <= 4; i++) {
    const num = String(i).padStart(2, '0');
    writeSvg(`leaves/branches/branch-${num}.svg`, `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" fill="none">
        <path d="M50 110 C45 70 55 40 50 10" stroke="currentColor" stroke-width="1.4"/>
        <path d="M49 85 C35 80 25 65 35 55 C42 60 48 72 49 85" stroke="currentColor" stroke-width="1.1"/>
        <path d="M51 65 C65 60 75 45 65 35 C58 40 52 52 51 65" stroke="currentColor" stroke-width="1.1"/>
        <path d="M50 45 C38 40 32 28 40 20 C46 24 49 34 50 45" stroke="currentColor" stroke-width="1.1"/>
        <path d="M50 25 C62 20 68 8 60 2 C54 6 51 16 50 25" stroke="currentColor" stroke-width="1.1"/>
      </svg>
    `);
  }

  // Stems (4)
  for (let i = 1; i <= 4; i++) {
    const num = String(i).padStart(2, '0');
    writeSvg(`leaves/stems/stem-${num}.svg`, `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 120" fill="none">
        <path d="M20 115 Q${18 + i} 60 20 10" stroke="currentColor" stroke-width="1.2"/>
        <circle cx="20" cy="10" r="2.5" fill="currentColor"/>
      </svg>
    `);
  }

  // -------------------------------------------------------------
  // 9. Floral Compositions (8 SVGs)
  // -------------------------------------------------------------
  console.log('Generating Floral Compositions (8)...');
  const compTemplates = [
    // 01: Corner Bouquet (Top-Right)
    `<path d="M90 10 C60 10 30 30 10 70" stroke="currentColor" stroke-width="1.2"/><circle cx="70" cy="30" r="12" stroke="currentColor" stroke-width="1.2"/><path d="M70 18 C62 10 78 10 70 18 M82 30 C90 22 90 38 82 30" stroke="currentColor" stroke-width="1"/><path d="M50 45 C35 40 40 25 50 45" stroke="currentColor" stroke-width="1"/>`,
    // 02: Corner Bouquet (Bottom-Left)
    `<path d="M10 90 C10 60 30 30 70 10" stroke="currentColor" stroke-width="1.2"/><circle cx="30" cy="70" r="12" stroke="currentColor" stroke-width="1.2"/><path d="M30 58 C22 50 38 50 30 58" stroke="currentColor" stroke-width="1"/>`,
    // 03: Half-Wreath Bottom
    `<path d="M15 40 C20 75 80 75 85 40" stroke="currentColor" stroke-width="1.2"/><path d="M25 55 C20 62 30 65 25 55 M75 55 C80 62 70 65 75 55" stroke="currentColor" stroke-width="1"/><circle cx="50" cy="72" r="3" stroke="currentColor" stroke-width="1"/>`,
    // 04: Half-Wreath Top
    `<path d="M15 60 C20 25 80 25 85 60" stroke="currentColor" stroke-width="1.2"/><circle cx="50" cy="28" r="3" stroke="currentColor" stroke-width="1"/>`,
    // 05: Circular Floral Wreath
    `<circle cx="50" cy="50" r="35" stroke="currentColor" stroke-width="1.2"/><path d="M50 15 C45 8 55 8 50 15 M85 50 C92 45 92 55 85 50 M50 85 C55 92 45 92 50 85 M15 50 C8 55 8 45 15 50" stroke="currentColor" stroke-width="1"/>`,
    // 06: Delicate Leaf Ring Wreath
    `<circle cx="50" cy="50" r="38" stroke="currentColor" stroke-width="1" stroke-dasharray="8,4"/><circle cx="50" cy="12" r="2.5" fill="currentColor"/><circle cx="88" cy="50" r="2.5" fill="currentColor"/><circle cx="50" cy="88" r="2.5" fill="currentColor"/><circle cx="12" cy="50" r="2.5" fill="currentColor"/>`,
    // 07: Asymmetrical Arch Frame
    `<path d="M25 90 L25 45 C25 25 75 25 75 45 L75 90" stroke="currentColor" stroke-width="1.2"/><path d="M25 40 C15 35 20 20 30 30" stroke="currentColor" stroke-width="1"/><circle cx="75" cy="50" r="4" stroke="currentColor" stroke-width="1"/>`,
    // 08: Asymmetrical Botanical Spray
    `<path d="M15 85 C35 70 50 50 85 15" stroke="currentColor" stroke-width="1.4"/><path d="M40 60 C30 55 35 45 45 50" stroke="currentColor" stroke-width="1"/><path d="M60 40 C55 30 70 25 65 35" stroke="currentColor" stroke-width="1"/><circle cx="85" cy="15" r="3.5" fill="currentColor"/>`
  ];

  compTemplates.forEach((body, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    writeSvg(`compositions/composition-${num}.svg`, `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        ${body}
      </svg>
    `);
  });

  // -------------------------------------------------------------
  // 10. Background Patterns (8 SVGs) & Textures (4 WebPs)
  // -------------------------------------------------------------
  console.log('Generating Patterns (8) & Textures (4)...');
  // Patterns (8)
  const patternTemplates = [
    // 01: Subtle wavy sand dunes
    `<path d="M0 20 Q25 10 50 20 T100 20 M0 50 Q25 40 50 50 T100 50 M0 80 Q25 70 50 80 T100 80" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>`,
    // 02: Repeating arches
    `<path d="M10 50 C10 25 40 25 40 50 M60 50 C60 25 90 25 90 50 M10 100 C10 75 40 75 40 100 M60 100 C60 75 90 75 90 100" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>`,
    // 03: 4-point sparkle scatter
    `<path d="M25 20 Q25 25 30 25 Q25 25 25 30 Q25 25 20 25 Q25 25 25 20 Z M75 70 Q75 75 80 75 Q75 75 75 80 Q75 75 70 75 Q75 75 75 70 Z" fill="currentColor" opacity="0.4"/>`,
    // 04: Foliage sprig scatter
    `<path d="M20 40 Q25 20 30 15 M23 28 C20 25 26 22 23 28 M70 80 Q75 60 80 55" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>`,
    // 05: Diamond lattice
    `<path d="M50 0 L100 50 L50 100 L0 50 Z" stroke="currentColor" stroke-width="0.6" opacity="0.3"/>`,
    // 06: Organic contours
    `<path d="M0 30 C30 10 70 50 100 30 M0 70 C30 50 70 90 100 70" stroke="currentColor" stroke-width="0.8" opacity="0.3"/>`,
    // 07: Delicate mini blooms
    `<circle cx="25" cy="25" r="3" stroke="currentColor" stroke-width="0.8" opacity="0.4"/><circle cx="75" cy="75" r="3" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>`,
    // 08: Minimalist grid dots
    `<circle cx="20" cy="20" r="1" fill="currentColor" opacity="0.3"/><circle cx="80" cy="20" r="1" fill="currentColor" opacity="0.3"/><circle cx="20" cy="80" r="1" fill="currentColor" opacity="0.3"/><circle cx="80" cy="80" r="1" fill="currentColor" opacity="0.3"/><circle cx="50" cy="50" r="1.5" fill="currentColor" opacity="0.4"/>`
  ];

  patternTemplates.forEach((body, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    writeSvg(`patterns/pattern-${num}.svg`, `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        ${body}
      </svg>
    `);
  });

  // Textures (4 WebPs)
  const textureDir = path.join(ASSET_BASE, 'textures');
  ensureDir(textureDir);
  const rawTextureDir = path.join(RAW_DIR, 'asset-mentah-background-pattern-and-texture');
  
  // Use raw files 1.jpeg and 3.jpeg or generate smooth webp textures
  const t1Source = path.join(rawTextureDir, '1.jpeg');
  const t2Source = path.join(rawTextureDir, '3.jpeg');

  if (fs.existsSync(t1Source)) {
    await sharp(t1Source).resize(1500, 1500, { fit: 'cover' }).webp({ quality: 85 }).toFile(path.join(textureDir, 'texture-paper-light.webp'));
    await sharp(t1Source).resize(1500, 1500, { fit: 'cover' }).modulate({ brightness: 0.6, saturation: 0.8 }).webp({ quality: 85 }).toFile(path.join(textureDir, 'texture-paper-dark.webp'));
  }
  if (fs.existsSync(t2Source)) {
    await sharp(t2Source).resize(1500, 1500, { fit: 'cover' }).webp({ quality: 85 }).toFile(path.join(textureDir, 'texture-linen-light.webp'));
    await sharp(t2Source).resize(1500, 1500, { fit: 'cover' }).modulate({ brightness: 0.5, saturation: 0.7 }).webp({ quality: 85 }).toFile(path.join(textureDir, 'texture-linen-dark.webp'));
  }

  // -------------------------------------------------------------
  // 11. Custom Concept Icons (6 SVGs)
  // -------------------------------------------------------------
  console.log('Generating Custom Concept Icons (6)...');
  // Two People
  writeSvg('icons/icon-two-people.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <circle cx="18" cy="14" r="4" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="30" cy="14" r="4" stroke="currentColor" stroke-width="1.5"/>
      <path d="M10 38 C10 28 26 28 26 38" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M22 38 C22 28 38 28 38 38" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `);

  // Love Story
  writeSvg('icons/icon-love-story.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <path d="M24 38 C24 38 10 28 10 18 C10 12 16 8 21 11 C24 13 24 15 24 15 C24 15 24 13 27 11 C32 8 38 12 38 18 C38 28 24 38 24 38 Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M24 31 C24 31 16 24 16 18 C16 14 19 12 22 14 C24 15 24 16 24 16" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    </svg>
  `);

  // Wedding Event
  writeSvg('icons/icon-wedding-event.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <rect x="10" y="16" width="28" height="24" rx="3" stroke="currentColor" stroke-width="1.5"/>
      <path d="M18 16 V12 C18 9 21 7 24 7 C27 7 30 9 30 12 V16" stroke="currentColor" stroke-width="1.5"/>
      <path d="M24 23 C24 23 20 20 20 18 C20 16 22 15 24 17 C26 15 28 16 28 18 C28 20 24 23 24 23 Z" fill="currentColor"/>
    </svg>
  `);

  // Invitation
  writeSvg('icons/icon-invitation.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="12" width="32" height="26" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <path d="M8 14 L24 26 L40 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="24" cy="26" r="2" fill="currentColor"/>
    </svg>
  `);

  // Togetherness
  writeSvg('icons/icon-togetherness.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <circle cx="18" cy="15" r="3.5" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="30" cy="15" r="3.5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M12 36 C12 28 20 26 24 26 C28 26 36 28 36 36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M20 28 L28 28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `);

  // Journey
  writeSvg('icons/icon-journey.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <path d="M10 38 C14 26 24 26 24 16 C24 10 32 10 38 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="10" cy="38" r="2.5" fill="currentColor"/>
      <circle cx="38" cy="10" r="2.5" fill="currentColor"/>
    </svg>
  `);

  // -------------------------------------------------------------
  // 12. UI Decorative Assets (12 SVGs)
  // -------------------------------------------------------------
  console.log('Generating UI Decorative Assets (12)...');
  // Badge Premium (Scalloped)
  writeSvg('decorative/badge-premium.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="44" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4,2"/>
      <circle cx="50" cy="50" r="38" stroke="currentColor" stroke-width="1"/>
      <text x="50" y="54" text-anchor="middle" font-family="'Manrope', sans-serif" font-weight="600" font-size="9" letter-spacing="2" fill="currentColor">PREMIUM</text>
    </svg>
  `);

  // Badge New (Octagonal)
  writeSvg('decorative/badge-new.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <polygon points="30,8 70,8 92,30 92,70 70,92 30,92 8,70 8,30" stroke="currentColor" stroke-width="1.2"/>
      <polygon points="32,13 68,13 87,32 87,68 68,87 32,87 13,68 13,32" stroke="currentColor" stroke-width="0.8"/>
      <text x="50" y="55" text-anchor="middle" font-family="'Manrope', sans-serif" font-weight="600" font-size="12" letter-spacing="3" fill="currentColor">NEW</text>
    </svg>
  `);

  // Stamp HariKita
  writeSvg('decorative/stamp-harikita.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="54" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3,3"/>
      <circle cx="60" cy="60" r="48" stroke="currentColor" stroke-width="1"/>
      <text x="60" y="52" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-weight="600" font-size="16" letter-spacing="2" fill="currentColor">HariKita</text>
      <text x="60" y="68" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-style="italic" font-size="9" letter-spacing="1" fill="currentColor">Your Day. Our Story.</text>
      <circle cx="60" cy="80" r="2" fill="currentColor"/>
    </svg>
  `);

  // Wax Seal HK
  writeSvg('decorative/wax-seal-hk.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <path d="M50 6 C70 5 88 15 94 34 C98 50 90 70 78 84 C64 96 40 96 24 86 C10 74 4 52 8 34 C12 18 30 7 50 6 Z" fill="#88735B" stroke="#6B5741" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="32" stroke="#FAF8F5" stroke-width="0.8" opacity="0.6"/>
      <g transform="translate(28, 28) scale(0.44)">
        <path d="${symbolPath}" fill="#FAF8F5"/>
      </g>
    </svg>
  `);

  // Frame Arch 01
  writeSvg('decorative/frame-arch-01.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 180" fill="none">
      <path d="M10 170 L10 60 C10 32 32 10 60 10 C88 10 110 32 110 60 L110 170 Z" stroke="currentColor" stroke-width="1.2"/>
    </svg>
  `);

  // Frame Arch 02 (Double fine line)
  writeSvg('decorative/frame-arch-02.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 180" fill="none">
      <path d="M8 172 L8 58 C8 29 31 6 60 6 C89 6 112 29 112 58 L112 172 Z" stroke="currentColor" stroke-width="1.2"/>
      <path d="M14 168 L14 60 C14 34 35 14 60 14 C85 14 106 34 106 60 L106 168 Z" stroke="currentColor" stroke-width="0.8"/>
    </svg>
  `);

  // Mask Arch 01
  writeSvg('decorative/mask-arch-01.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150">
      <path d="M0 150 L0 50 C0 22 22 0 50 0 C78 0 100 22 100 50 L100 150 Z" fill="currentColor"/>
    </svg>
  `);

  // Quote Mark
  writeSvg('decorative/quote-mark.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="currentColor">
      <path d="M12 24 C8 24 6 21 6 18 C6 12 11 8 16 8 L17 10 C13 11 11 13 11 15 C12 15 13 15 14 16 C16 17 17 19 17 21 C17 23 15 24 12 24 Z M28 24 C24 24 22 21 22 18 C22 12 27 8 32 8 L33 10 C29 11 27 13 27 15 C28 15 29 15 30 16 C32 17 33 19 33 21 C33 23 31 24 28 24 Z"/>
    </svg>
  `);

  // Card Corner 01 & 02
  writeSvg('decorative/card-corner-01.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" fill="none">
      <path d="M5 55 L5 18 C5 10 10 5 18 5 L55 5" stroke="currentColor" stroke-width="1.2"/>
      <circle cx="18" cy="18" r="3" stroke="currentColor" stroke-width="1"/>
    </svg>
  `);

  writeSvg('decorative/card-corner-02.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" fill="none">
      <path d="M10 50 L10 10 L50 10" stroke="currentColor" stroke-width="1"/>
      <path d="M16 16 C12 24 24 24 16 16" stroke="currentColor" stroke-width="0.8"/>
    </svg>
  `);

  // Section Line 01 & 02
  writeSvg('decorative/section-line-01.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 20" fill="none">
      <line x1="10" y1="10" x2="140" y2="10" stroke="currentColor" stroke-width="1"/>
      <polygon points="150,5 155,10 150,15 145,10" stroke="currentColor" stroke-width="1" fill="none"/>
      <line x1="160" y1="10" x2="290" y2="10" stroke="currentColor" stroke-width="1"/>
    </svg>
  `);

  writeSvg('decorative/section-line-02.svg', `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 20" fill="none">
      <line x1="10" y1="10" x2="135" y2="10" stroke="currentColor" stroke-width="1"/>
      <circle cx="150" cy="10" r="3" stroke="currentColor" stroke-width="1.2"/>
      <line x1="165" y1="10" x2="290" y2="10" stroke="currentColor" stroke-width="1"/>
    </svg>
  `);

  // -------------------------------------------------------------
  // 13. Cards & Invitation Layouts (8 SVGs)
  // -------------------------------------------------------------
  console.log('Generating Invitation Card Elements (8)...');
  for (let i = 1; i <= 8; i++) {
    const num = String(i).padStart(2, '0');
    writeSvg(`cards/card-invitation-${num}.svg`, `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 200" fill="none">
        <rect x="8" y="8" width="124" height="184" rx="4" stroke="currentColor" stroke-width="1.2"/>
        <rect x="14" y="14" width="112" height="172" rx="2" stroke="currentColor" stroke-width="0.8" stroke-dasharray="3,3"/>
        <path d="M70 24 L70 34 M65 29 L75 29" stroke="currentColor" stroke-width="0.8"/>
        <text x="70" y="55" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-weight="600" font-size="10" fill="currentColor">THE WEDDING OF</text>
        <text x="70" y="75" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-weight="500" font-size="16" fill="currentColor">Aulia &amp; Rizky</text>
        <line x1="45" y1="85" x2="95" y2="85" stroke="currentColor" stroke-width="0.8"/>
        <text x="70" y="105" text-anchor="middle" font-family="'Manrope', sans-serif" font-size="7" letter-spacing="1" fill="currentColor">12 . 10 . 2026</text>
        <text x="70" y="118" text-anchor="middle" font-family="'Manrope', sans-serif" font-size="6" fill="currentColor">Kebumen, Jawa Tengah</text>
      </svg>
    `);
  }

  // -------------------------------------------------------------
  // 14. Social Avatars (6 SVGs)
  // -------------------------------------------------------------
  console.log('Generating Social Media Avatars (6)...');
  const avatarConfigs = [
    { file: 'avatar-taupe.svg', bg: '#88735B', fg: '#FAF8F5', wreath: false },
    { file: 'avatar-charcoal.svg', bg: '#2B2B2B', fg: '#FAF8F5', wreath: false },
    { file: 'avatar-champagne.svg', bg: '#C9A88A', fg: '#FAF8F5', wreath: false },
    { file: 'avatar-beige.svg', bg: '#E8DED1', fg: '#88735B', wreath: false },
    { file: 'avatar-wreath-light.svg', bg: '#F8F6F1', fg: '#88735B', wreath: true },
    { file: 'avatar-wreath-dark.svg', bg: '#2B2B2B', fg: '#C9A88A', wreath: true }
  ];

  for (const cfg of avatarConfigs) {
    writeSvg(`avatars/${cfg.file}`, `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="48" fill="${cfg.bg}"/>
        ${cfg.wreath ? `
          <circle cx="50" cy="50" r="42" stroke="${cfg.fg}" stroke-width="1" stroke-dasharray="4,3"/>
          <path d="M50 10 C46 6 54 6 50 10 M90 50 C94 46 94 54 90 50 M50 90 C54 94 46 94 50 90 M10 50 C6 54 6 46 10 50" stroke="${cfg.fg}" stroke-width="1"/>
        ` : ''}
        <g transform="translate(25, 25) scale(0.5)">
          <path d="${symbolPath}" fill="${cfg.fg}"/>
        </g>
      </svg>
    `);
  }

  console.log('\n✅ Asset build process completed!');
}

buildAssets().catch(err => {
  console.error(err);
  process.exit(1);
});
