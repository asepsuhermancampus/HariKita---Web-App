const fs = require('fs');
const path = require('path');

// 1. Granular Visual Anatomy Classifier
function classifyAsset(filename, svgContent = '') {
  const f = filename.toLowerCase();

  // Extract ViewBox & Dimensions
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

  // Dominant Color Heuristic
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

  // 5. FLORAL TAXONOMY (Granular visual anatomy & aspect ratio)
  const isFloralCorner = f.includes('corner') || f.includes('bg-3') || f.includes('flower-3') || 
    (f.includes('flower') && (f.includes('top-left') || f.includes('bottom-right') || f.includes('bottom-left') || f.includes('top-right')));
  if (isFloralCorner) {
    let desc = 'rose-corner';
    if (f.includes('1754648453_kdo54-bg-3') || f.includes('rose')) desc = 'rose-ivory-english';
    else if (f.includes('bride')) desc = 'bride-floral-corner';
    return { category: 'floral', subCategory: 'corners', descriptor: desc, color: color || 'ivory' };
  }

  // Horizontal Header / Garland (Wide: ratio >= 2.0)
  if (ratio >= 2.0 || f.includes('top-flower') || f.includes('top-bg') || f.includes('header')) {
    return { category: 'floral', subCategory: 'headers-garlands', descriptor: 'floral-header-garland', color: color || 'blush' };
  }

  // Vertical Side Cascade / Creepers (Tall: ratio <= 0.55)
  if (ratio <= 0.55 || f.includes('left') || f.includes('right') || f.includes('center-bg')) {
    return { category: 'floral', subCategory: 'side-cascades', descriptor: 'floral-side-cascade', color: color || 'sage' };
  }

  // Single Stems (small path count and slender)
  const pathMatches = svgContent.match(/<path/g) || [];
  if (pathMatches.length <= 2 && (w < 200 || h < 200)) {
    return { category: 'floral', subCategory: 'single-stems', descriptor: 'floral-single-stem', color: color || 'terracotta' };
  }

  // Default: Compact Centerpiece Bouquets
  return { category: 'floral', subCategory: 'centerpieces', descriptor: 'floral-centerpiece', color: color || 'terracotta' };
}

// 2. Semantic Name Generator
function generateSemanticName(classification, index = 1) {
  const { category, subCategory, descriptor, color } = classification;
  const idxStr = String(index).padStart(2, '0');
  
  let name = '';
  if (category === 'floral') {
    if (subCategory === 'corners') {
      name = `${descriptor}-corner-${idxStr}.svg`;
    } else if (subCategory === 'headers-garlands') {
      name = color ? `garland-header-${color}-${idxStr}.svg` : `garland-header-${idxStr}.svg`;
    } else if (subCategory === 'side-cascades') {
      name = color ? `cascade-side-${color}-${idxStr}.svg` : `cascade-side-${idxStr}.svg`;
    } else if (subCategory === 'single-stems') {
      name = color ? `stem-botanical-${color}-${idxStr}.svg` : `stem-botanical-${idxStr}.svg`;
    } else {
      name = color ? `centerpiece-bouquet-${color}-${idxStr}.svg` : `centerpiece-bouquet-${idxStr}.svg`;
    }
  } else if (category === 'frames') {
    if (subCategory === 'full-cards') {
      name = color ? `frame-full-card-${color}-${idxStr}.svg` : `frame-full-card-${idxStr}.svg`;
    } else if (subCategory === 'photo-frames') {
      name = color ? `frame-photo-card-${color}-${idxStr}.svg` : `frame-photo-card-${idxStr}.svg`;
    } else if (subCategory === 'filigree-corners') {
      name = color ? `filigree-corner-${color}-${idxStr}.svg` : `filigree-corner-${idxStr}.svg`;
    } else {
      name = color ? `divider-flourish-${color}-${idxStr}.svg` : `divider-flourish-${idxStr}.svg`;
    }
  } else if (category === 'backgrounds') {
    name = color ? `bg-${descriptor}-${color}-${idxStr}.svg` : `bg-${descriptor}-${idxStr}.svg`;
  } else if (category === 'decorative') {
    name = color ? `${descriptor}-${color}-${idxStr}.svg` : `${descriptor}-${idxStr}.svg`;
  } else if (category === 'icons') {
    name = `icon-${descriptor}-${idxStr}.svg`;
  } else {
    name = `${descriptor}-${idxStr}.svg`;
  }

  return name;
}

// 3. Batch Migration Routine
async function runMigration() {
  console.log('=== STARTING HARIKITA GRANULAR ASSET MIGRATION ===\n');

  const ROOT_DIR = path.resolve(__dirname, '..');
  const SOURCE_SVG_DIR = path.join(ROOT_DIR, 'references', 'kadio-assets', 'harvested', 'svg');
  const TARGET_ASSETS_DIR = path.join(ROOT_DIR, 'public', 'harikita-assets');
  const WHITELIST_PATH = path.join(__dirname, 'whitelist_registry.json');

  const whitelist = new Set(
    fs.existsSync(WHITELIST_PATH) ? JSON.parse(fs.readFileSync(WHITELIST_PATH, 'utf8')) : []
  );

  // Clean old destination directories
  if (fs.existsSync(TARGET_ASSETS_DIR)) {
    const existingDirs = ['floral', 'frames', 'backgrounds', 'decorative', 'icons'];
    for (const d of existingDirs) {
      const p = path.join(TARGET_ASSETS_DIR, d);
      if (fs.existsSync(p)) {
        fs.rmSync(p, { recursive: true, force: true });
      }
    }
  }

  // Define Granular Visual Anatomy Hierarchy
  const subDirs = [
    'floral/corners',
    'floral/headers-garlands',
    'floral/side-cascades',
    'floral/centerpieces',
    'floral/single-stems',
    'frames/full-cards',
    'frames/filigree-corners',
    'frames/dividers-horizontal',
    'frames/photo-frames',
    'backgrounds/gradients',
    'backgrounds/textures',
    'decorative/stars-sparkles',
    'icons/events',
  ];

  // Create target directories
  for (const sd of subDirs) {
    const fullPath = path.join(TARGET_ASSETS_DIR, sd);
    fs.mkdirSync(fullPath, { recursive: true });
  }
  console.log(`✅ Created clean granular folder hierarchy (${subDirs.length} sub-directories)\n`);

  const files = fs.readdirSync(SOURCE_SVG_DIR)
    .filter(f => f.endsWith('.svg') && !f.startsWith('proto_') && !f.startsWith('elevated_') && !f.startsWith('test-'));

  console.log(`Found ${files.length} production SVG files to migrate.`);

  // Tracking indexes per subcategory to ensure sequential collision-free names
  const indexCounters = {};
  const manifest = [];

  // Special Priority Mapping for Whitelisted Grade A assets
  const priorityWhitelistMap = {
    '1754648453_kdo54-bg-3.svg': {
      category: 'floral',
      subCategory: 'corners',
      descriptor: 'rose-ivory-english',
      color: 'ivory',
      customName: 'rose-ivory-english-corner-01.svg'
    },
    'vector-2.svg': {
      category: 'decorative',
      subCategory: 'stars-sparkles',
      descriptor: 'star-sparkle',
      color: 'gold',
      customName: 'star-sparkle-gold-01.svg'
    },
    'event-bottom-right.svg': {
      category: 'frames',
      subCategory: 'filigree-corners',
      descriptor: 'filigree-corner',
      color: 'iceblue',
      customName: 'filigree-corner-iceblue-bottom-right.svg'
    },
    'event-top-left.svg': {
      category: 'frames',
      subCategory: 'filigree-corners',
      descriptor: 'filigree-corner',
      color: 'iceblue',
      customName: 'filigree-corner-iceblue-top-left.svg'
    },
    'event-top-right.svg': {
      category: 'frames',
      subCategory: 'filigree-corners',
      descriptor: 'filigree-corner',
      color: 'iceblue',
      customName: 'filigree-corner-iceblue-top-right.svg'
    },
    'event-bottom-left.svg': {
      category: 'frames',
      subCategory: 'filigree-corners',
      descriptor: 'filigree-corner',
      color: 'iceblue',
      customName: 'filigree-corner-iceblue-bottom-left.svg'
    },
    'bride-flower-3.svg': {
      category: 'floral',
      subCategory: 'corners',
      descriptor: 'rose-lilac',
      color: 'lilac',
      customName: 'rose-lilac-corner-01.svg'
    },
    'bg-flower-3.svg': {
      category: 'floral',
      subCategory: 'side-cascades',
      descriptor: 'cascade-side-sage',
      color: 'sage',
      customName: 'cascade-side-sage-01.svg'
    },
    '1754403915_kdo56-flower-1.svg': {
      category: 'floral',
      subCategory: 'side-cascades',
      descriptor: 'cascade-side-terracotta',
      color: 'terracotta',
      customName: 'cascade-side-terracotta-01.svg'
    }
  };

  let migratedCount = 0;

  for (const file of files) {
    const srcPath = path.join(SOURCE_SVG_DIR, file);
    const content = fs.readFileSync(srcPath, 'utf8');

    let classification;
    let semanticFilename;

    if (priorityWhitelistMap[file]) {
      const p = priorityWhitelistMap[file];
      classification = {
        category: p.category,
        subCategory: p.subCategory,
        descriptor: p.descriptor,
        color: p.color
      };
      semanticFilename = p.customName;
    } else {
      classification = classifyAsset(file, content);
      const key = `${classification.category}/${classification.subCategory}`;
      indexCounters[key] = (indexCounters[key] || 0) + 1;
      semanticFilename = generateSemanticName(classification, indexCounters[key]);
    }

    const targetSubPath = path.join(classification.category, classification.subCategory, semanticFilename);
    const targetFullPath = path.join(TARGET_ASSETS_DIR, targetSubPath);

    // Copy SVG content
    fs.writeFileSync(targetFullPath, content, 'utf8');
    migratedCount++;

    const pathMatches = content.match(/<path/g) || [];
    const stats = fs.statSync(targetFullPath);

    manifest.push({
      id: semanticFilename.replace('.svg', ''),
      originalFile: file,
      relativePath: targetSubPath.replace(/\\/g, '/'),
      publicUrl: `/harikita-assets/${targetSubPath.replace(/\\/g, '/')}`,
      category: classification.category,
      subCategory: classification.subCategory,
      pathCount: pathMatches.length,
      isWhitelisted: whitelist.has(file),
      isV4Elevated: pathMatches.length >= 4 || whitelist.has(file),
      sizeKb: (stats.size / 1024).toFixed(1)
    });
  }

  // Sort manifest: Whitelisted first, then by category, then subCategory, then relativePath
  manifest.sort((a, b) => {
    if (a.isWhitelisted && !b.isWhitelisted) return -1;
    if (!a.isWhitelisted && b.isWhitelisted) return 1;
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    if (a.subCategory !== b.subCategory) return a.subCategory.localeCompare(b.subCategory);
    return a.relativePath.localeCompare(b.relativePath);
  });

  const manifestPath = path.join(TARGET_ASSETS_DIR, 'harikita_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`\n=== GRANULAR MIGRATION COMPLETE ===`);
  console.log(`Total Assets Migrated: ${migratedCount}`);
  console.log(`Hierarchy: ${subDirs.length} specialized subdirectories`);
  console.log(`Manifest Registry Saved at: ${manifestPath} (${(fs.statSync(manifestPath).size / 1024).toFixed(1)} KB)`);
}

if (require.main === module) {
  runMigration();
}

module.exports = {
  classifyAsset,
  generateSemanticName,
  runMigration,
};
