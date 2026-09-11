const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_SVG_DIR = path.join(ROOT_DIR, 'references', 'kadio-assets', 'harvested', 'svg');

const files = fs.readdirSync(SOURCE_SVG_DIR)
  .filter(f => f.endsWith('.svg') && !f.startsWith('proto_') && !f.startsWith('elevated_') && !f.startsWith('test-'));

function classifyGranular(filename, svgContent = '') {
  const f = filename.toLowerCase();

  // Extract ViewBox dimensions
  let w = 500, h = 500, ratio = 1.0;
  const vbMatch = svgContent.match(/viewBox="([^"]+)"/);
  if (vbMatch) {
    const parts = vbMatch[1].trim().split(/\s+/).map(Number);
    if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
      w = parts[2];
      h = parts[3];
      ratio = w / h;
    }
  }

  // Detect dominant color
  let color = '';
  if (svgContent.includes('#cfb66e') || svgContent.includes('#c5a880') || svgContent.includes('#d4bb70') || svgContent.includes('#a65d00')) color = 'gold';
  else if (svgContent.includes('#eef3fb') || svgContent.includes('#ffffff') || svgContent.includes('#c6dcfc')) color = 'iceblue';
  else if (svgContent.includes('#2d5a43') || svgContent.includes('#3a4428') || svgContent.includes('#6b705c') || svgContent.includes('#a3c3c1')) color = 'sage';
  else if (svgContent.includes('#e9d8fd') || svgContent.includes('#d7cefe') || svgContent.includes('#50468b') || svgContent.includes('#dfd7fe')) color = 'lilac';
  else if (svgContent.includes('#c86d7a') || svgContent.includes('#e0a4ad') || svgContent.includes('#f6bdcd')) color = 'blush';
  else if (svgContent.includes('#faf5ea') || svgContent.includes('#f7f2ea')) color = 'ivory';

  // 1. ICONS
  const isIcon = (f.includes('icon') || f.includes('gift') || f.includes('map') || f.includes('calendar') || f.includes('ring')) && !f.includes('frame');
  if (isIcon) {
    let desc = 'wedding-icon';
    if (f.includes('gift')) desc = 'gift';
    else if (f.includes('map')) desc = 'map';
    else if (f.includes('message')) desc = 'message';
    return { category: 'icons', subCategory: 'events', descriptor: desc, color };
  }

  // 2. BACKGROUNDS
  const isGradient = (svgContent.includes('<linearGradient') || svgContent.includes('<radialGradient')) && svgContent.includes('<rect');
  const isBackgroundName = f.includes('bg-') || f.includes('_bg') || f.includes('-bg') || f.includes('paper-') || f.includes('wallpaper');
  if (isGradient && isBackgroundName && !f.includes('flower')) {
    const isPaper = f.includes('paper');
    return {
      category: 'backgrounds',
      subCategory: isPaper ? 'textures' : 'gradients',
      descriptor: isPaper ? 'paper-texture' : 'card-gradient',
      color: color || 'champagne'
    };
  }

  // 3. DECORATIVE (Stars, Sparkles, Ribbons)
  if (f.includes('vector') || f.includes('star') || f.includes('sparkle') || f.includes('glow')) {
    return { category: 'decorative', subCategory: 'stars-sparkles', descriptor: 'star-sparkle', color: color || 'gold' };
  }
  if (f.includes('ribbon') || f.includes('banner') || f.includes('badge')) {
    return { category: 'decorative', subCategory: 'ribbons-badges', descriptor: 'ribbon-badge', color: color || 'gold' };
  }

  // 4. FRAMES & DIVIDERS
  const isDivider = f.includes('divider') || f.includes('border-1') || f.includes('border-2') || f.includes('stamp') || f.includes('wave') || f.includes('line');
  if (isDivider) {
    return { category: 'frames', subCategory: 'dividers-horizontal', descriptor: 'divider-flourish', color: color || 'gold' };
  }

  const isFiligreeCorner = (f.includes('top-left') || f.includes('top-right') || f.includes('bottom-left') || f.includes('bottom-right')) && !f.includes('flower');
  if (isFiligreeCorner) {
    return { category: 'frames', subCategory: 'filigree-corners', descriptor: 'filigree-corner', color: color || 'iceblue' };
  }

  const isFullCardFrame = f.includes('frame-1') || f.includes('frame-2') || f.includes('frame-3') || f.includes('frame-cover') || f.includes('cover-frame') || f.includes('bride-frame');
  if (isFullCardFrame) {
    return { category: 'frames', subCategory: 'full-cards', descriptor: 'full-card-border', color: color || 'gold' };
  }

  const isPhotoFrame = f.includes('frame-card') || f.includes('frame-countdown') || f.includes('story-frame') || f.includes('frame-small') || f.includes('frame-index');
  if (isPhotoFrame) {
    return { category: 'frames', subCategory: 'photo-frames', descriptor: 'photo-card-frame', color: color || 'gold' };
  }

  // 5. FLORAL TAXONOMY (Based on visual anatomy & aspect ratio)
  const isFloralCorner = f.includes('corner') || f.includes('bg-3') || f.includes('flower-3') || 
    (f.includes('flower') && (f.includes('top-left') || f.includes('bottom-right') || f.includes('bottom-left') || f.includes('top-right')));
  if (isFloralCorner) {
    let desc = 'rose-corner';
    if (f.includes('1754648453_kdo54-bg-3') || f.includes('rose')) desc = 'rose-ivory-english';
    else if (f.includes('bride')) desc = 'bride-floral-corner';
    return { category: 'floral', subCategory: 'corners', descriptor: desc, color: color || 'ivory' };
  }

  // Wreath (circular or ring floral)
  if (f.includes('wreath') || f.includes('ring') || f.includes('circle')) {
    return { category: 'floral', subCategory: 'wreaths', descriptor: 'floral-wreath', color: color || 'sage' };
  }

  // Pure Leaves & Foliage
  const isLeaf = f.includes('leaf') || f.includes('leaves') || f.includes('foliage') || f.includes('sprig') || f.includes('eucalyptus');
  if (isLeaf) {
    return { category: 'floral', subCategory: 'leaves-foliage', descriptor: 'botanical-leaf', color: color || 'sage' };
  }

  // Horizontal Header / Garland (Wide: ratio >= 2.0)
  if (ratio >= 2.0 || f.includes('top-flower') || f.includes('top-bg') || f.includes('header')) {
    return { category: 'floral', subCategory: 'headers-garlands', descriptor: 'floral-header-garland', color: color || 'blush' };
  }

  // Vertical Side Cascade / Creepers (Tall: ratio <= 0.55)
  if (ratio <= 0.55 || f.includes('left') || f.includes('right') || f.includes('center-bg')) {
    return { category: 'floral', subCategory: 'side-cascades', descriptor: 'floral-side-cascade', color: color || 'sage' };
  }

  // Single Stems (small path count and vertical slender)
  const pathMatches = svgContent.match(/<path/g) || [];
  if (pathMatches.length <= 2 && (w < 200 || h < 200)) {
    return { category: 'floral', subCategory: 'single-stems', descriptor: 'floral-single-stem', color: color || 'terracotta' };
  }

  // Default: Centerpieces / Bouquets
  return { category: 'floral', subCategory: 'centerpieces', descriptor: 'floral-centerpiece-bouquet', color: color || 'terracotta' };
}

// Test distribution across all 273 files
const counts = {};
for (const file of files) {
  const content = fs.readFileSync(path.join(SOURCE_SVG_DIR, file), 'utf8');
  const res = classifyGranular(file, content);
  const key = `${res.category}/${res.subCategory}`;
  counts[key] = (counts[key] || 0) + 1;
}

console.log('=== GRANULAR ANATOMY CLASSIFICATION RESULTS ===');
Object.keys(counts).sort().forEach(k => {
  console.log(`📁 ${k}: ${counts[k]} assets`);
});
