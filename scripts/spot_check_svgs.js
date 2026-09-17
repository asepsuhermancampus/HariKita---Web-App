// spot_check_svgs.js
// Spot check specific SVGs for visual confirmation
const fs = require('fs');
const path = require('path');
const BASE = path.resolve(__dirname, '..', 'public', 'harikita-assets');

function inspect(folder, file, note) {
  const fullPath = path.join(BASE, folder, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  const sizeKb = (fs.statSync(fullPath).size / 1024).toFixed(1);
  const snippet = content.substring(0, 450).replace(/\n/g, ' ');
  const pathCount = (content.match(/<path/g) || []).length;
  const hasImage = content.includes('<image');
  const vbMatch = content.match(/viewBox="([^"]+)"/);
  const vb = vbMatch ? vbMatch[1] : 'no-viewBox';
  console.log('\n=== [' + note + '] ' + folder + '/' + file + ' ===');
  console.log('  viewBox: ' + vb + ' | paths: ' + pathCount + ' | size: ' + sizeKb + 'KB | hasImage: ' + hasImage);
  console.log('  SVG: ' + snippet);
}

// PORTRAIT dividers (should these be vertical ornaments, not horizontal dividers?)
inspect('frames/dividers-horizontal', 'divider-flourish-gold-02.svg', 'PORTRAIT 179x242');
inspect('frames/dividers-horizontal', 'divider-flourish-gold-15.svg', 'PORTRAIT 146x287');
inspect('frames/dividers-horizontal', 'divider-flourish-gold-16.svg', 'TALL 107x287 ratio:2.68');
inspect('frames/dividers-horizontal', 'divider-flourish-gold-17.svg', 'PORTRAIT 170x243');

// Micro icons stuck in floral/single-stems
inspect('floral/single-stems', 'stem-botanical-terracotta-05.svg', 'MICRO-ICON 24x24');
inspect('floral/single-stems', 'stem-botanical-terracotta-06.svg', 'MICRO-ICON 18x14');
inspect('floral/single-stems', 'stem-botanical-terracotta-07.svg', 'MICRO-ICON 18x14');

// centerpieces that are really gradient placeholders
inspect('floral/centerpieces', 'centerpiece-bouquet-blush-60.svg', 'GRADIENT in centerpieces');
inspect('floral/centerpieces', 'centerpiece-bouquet-terracotta-31.svg', 'GRADIENT in centerpieces');

// cascade-side-sage-35 (labeled as cascade but might be gradient)
inspect('floral/side-cascades', 'cascade-side-sage-35.svg', 'GRADIENT in cascades');

// rose-corner-corner-04 (very tall 245x967 - cascade?)
inspect('floral/corners', 'rose-corner-corner-04.svg', 'TALL CORNER 245x967');

// Check garland-header-blush-08 and 13 (giant 1000KB files)
inspect('floral/headers-garlands', 'garland-header-blush-08.svg', 'GIANT 1000KB garland');
inspect('floral/headers-garlands', 'garland-header-blush-13.svg', 'GIANT 811KB garland');

// Check cascade-side-sage-37 (3788KB - the extreme outlier!)
inspect('floral/side-cascades', 'cascade-side-sage-37.svg', 'EXTREME 3788KB cascade');

// Check centrepiece-bouquet-terracotta-84 (571KB, 1 path, wide 1469x826)
inspect('floral/centerpieces', 'centerpiece-bouquet-terracotta-84.svg', 'WIDE 1469x826, 1 path, 571KB');

console.log('\n\nDone!');
