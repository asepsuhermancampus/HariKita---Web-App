const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const harvestedSvgDir = path.join('references', 'kadio-assets', 'harvested', 'svg');
const harvestedPngDir = path.join('references', 'kadio-assets', 'harvested');

async function audit() {
  const files = fs.readdirSync(harvestedSvgDir).filter(f => f.endsWith('.svg') && !f.startsWith('proto_') && !f.startsWith('elevated_') && !f.startsWith('test-'));
  console.log(`Total harvested SVG assets to audit: ${files.length}`);

  const whitelist = new Set([
    'vector-2.svg',
    'event-bottom-right.svg',
    'event-top-left.svg',
    'event-top-right.svg',
    'event-bottom-left.svg',
    'bride-flower-3.svg',
    'bg-flower-3.svg',
    '1754648453_kdo54-bg-3.svg',
    '1754403915_kdo56-flower-1.svg'
  ]);

  const stats = {
    whitelisted: 0,
    dividers: 0,
    filigreeLace: 0,
    botanicalFlorals: 0,
    needingElevation: []
  };

  for (const file of files) {
    if (whitelist.has(file)) {
      stats.whitelisted++;
      continue;
    }

    const baseName = file.replace('.svg', '');
    const pngPath = path.join(harvestedPngDir, baseName + '.png');
    const svgPath = path.join(harvestedSvgDir, file);

    if (!fs.existsSync(pngPath)) {
      continue;
    }

    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const pathCount = (svgContent.match(/<path/g) || []).length;
    const fills = svgContent.match(/fill="([^"]+)"/g) || [];

    // Check if it's a divider / line
    if (file.includes('divider') || file.includes('line') || file.includes('wave') || file.includes('stamp')) {
      stats.dividers++;
      continue;
    }

    // Check if it's a corner / filigree / frame that might have blocked loops
    if (file.includes('frame') || file.includes('border') || file.includes('corner') || file.includes('top-left') || file.includes('bottom-right')) {
      stats.filigreeLace++;
      stats.needingElevation.push({ file, type: 'filigree', pathCount, fillsCount: fills.length });
      continue;
    }

    // Check florals that have only 3 paths (suspected sketched floral posterization)
    if (pathCount <= 3 && (file.includes('flower') || file.includes('bg-') || file.includes('leaf'))) {
      stats.needingElevation.push({ file, type: 'flattened-floral', pathCount, fillsCount: fills.length });
      continue;
    }

    stats.botanicalFlorals++;
  }

  console.log(`\nAudit Results:`);
  console.log(`- Whitelisted & Locked: ${stats.whitelisted}`);
  console.log(`- Clean Dividers / Lines: ${stats.dividers}`);
  console.log(`- Good Botanical Florals: ${stats.botanicalFlorals}`);
  console.log(`- Needing Elevation / Re-vectorization: ${stats.needingElevation.length}`);
  console.log(`\nList of Assets Needing Elevation (${stats.needingElevation.length}):`);
  console.log(stats.needingElevation);
}

audit();
