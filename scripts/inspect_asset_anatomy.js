const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync('public/harikita-assets/harikita_manifest.json', 'utf8'));

const stats = {
  veryWide: [],    // w/h > 2.0 (Headers, Garlands, Horizontal Dividers)
  veryTall: [],    // h/w > 2.0 (Vertical Side Borders, Cascades, Columns)
  squareish: [],   // 0.75 <= w/h <= 1.35 (Centerpieces, Wreaths, Corner Ornaments)
  portrait: [],    // 1.35 < h/w <= 2.0 (Cards, Full page frames)
  landscape: [],   // 1.35 < w/h <= 2.0 (Wide banners)
};

const misplacedCandidates = [];

for (const m of manifest) {
  const fullPath = path.join('public', 'harikita-assets', m.relativePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const vbMatch = content.match(/viewBox="([^"]+)"/);
  
  if (vbMatch) {
    const parts = vbMatch[1].trim().split(/\s+/).map(Number);
    const w = parts[2];
    const h = parts[3];
    const ratio = w / h;
    const item = {
      id: m.id,
      orig: m.originalFile,
      cat: m.category,
      sub: m.subCategory,
      w,
      h,
      ratio: Number(ratio.toFixed(2))
    };

    if (ratio > 2.0) stats.veryWide.push(item);
    else if (ratio < 0.5) stats.veryTall.push(item);
    else if (ratio >= 0.75 && ratio <= 1.35) stats.squareish.push(item);
    else if (h > w) stats.portrait.push(item);
    else stats.landscape.push(item);

    // Potential misplacement checks
    if (m.category === 'floral' && (m.originalFile.includes('frame') || m.originalFile.includes('border') || m.originalFile.includes('card'))) {
      misplacedCandidates.push({ item, reason: 'Floral contains frame/border keyword' });
    }
    if (m.category === 'frames' && m.originalFile.includes('flower') && !m.originalFile.includes('border') && !m.originalFile.includes('frame')) {
      misplacedCandidates.push({ item, reason: 'Frame contains flower keyword without frame' });
    }
    if (m.subCategory === 'bouquets' && ratio > 3.0) {
      misplacedCandidates.push({ item, reason: 'In bouquets but aspect ratio is extreme garland/header (> 3.0)' });
    }
    if (m.subCategory === 'bouquets' && ratio < 0.35) {
      misplacedCandidates.push({ item, reason: 'In bouquets but aspect ratio is extreme vertical cascade (< 0.35)' });
    }
  }
}

console.log('=== HARIKITA ASSET ANATOMY & SHAPE DISTRIBUTION ===');
console.log(`Total Assets Analyzed: ${manifest.length}`);
console.log(`- Horizontal Headers / Garlands (ratio > 2.0): ${stats.veryWide.length}`);
console.log(`- Vertical Side Cascades / Pillars (ratio < 0.5): ${stats.veryTall.length}`);
console.log(`- Squareish Centerpieces / Wreaths / Corners (0.75 - 1.35): ${stats.squareish.length}`);
console.log(`- Portrait Frames / Cards: ${stats.portrait.length}`);
console.log(`- Landscape Cards: ${stats.landscape.length}`);

console.log(`\nPotential Misplaced Assets Detected: ${misplacedCandidates.length}`);
misplacedCandidates.slice(0, 15).forEach(m => {
  console.log(`- ${m.item.orig} [${m.item.cat}/${m.item.sub}] -> ${m.reason} (w:${m.item.w}, h:${m.item.h}, r:${m.item.ratio})`);
});
