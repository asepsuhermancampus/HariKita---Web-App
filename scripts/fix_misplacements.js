// fix_misplacements.js
// Fixes all misplaced SVGs identified by deep visual audit:
// 1. Gradient-only rects stuck in floral folders → backgrounds/gradients
// 2. Frame/filigree shapes in centerpieces → frames/filigree-corners
// 3. Tall cascade labeled as corner → floral/side-cascades
// 4. Micro UI icons in single-stems → icons/events
// 5. Portrait ornaments labeled as horizontal dividers → frames/dividers-vertical (NEW)
// 6. Updates harikita_manifest.json with corrected paths

const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..', 'public', 'harikita-assets');
const MANIFEST_PATH = path.join(BASE, 'harikita_manifest.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Load manifest
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

const log = [];
const errors = [];
let movedCount = 0;

function moveFile(fromRel, toRel, reason) {
  const from = path.join(BASE, fromRel);
  const to = path.join(BASE, toRel);
  
  if (!fs.existsSync(from)) {
    const msg = 'SKIP (not found): ' + fromRel;
    errors.push(msg);
    console.log('  ⚠️  ' + msg);
    return false;
  }
  
  ensureDir(path.dirname(to));
  
  try {
    fs.renameSync(from, to);
    movedCount++;
    const msg = '✅ MOVED: ' + fromRel + ' → ' + toRel + ' (' + reason + ')';
    log.push(msg);
    console.log('  ' + msg);
    return true;
  } catch(e) {
    const msg = '❌ ERROR moving ' + fromRel + ': ' + e.message;
    errors.push(msg);
    console.log('  ' + msg);
    return false;
  }
}

function updateManifest(oldRelPath, newRelPath) {
  const item = manifest.find(m => m.relativePath === oldRelPath || m.relativePath.replace(/\\/g, '/') === oldRelPath);
  if (item) {
    const oldCategory = item.category;
    const oldSubCategory = item.subCategory;
    
    // Parse new category/subCategory from new path
    const parts = newRelPath.split('/');
    item.relativePath = newRelPath;
    item.publicUrl = '/harikita-assets/' + newRelPath;
    item.category = parts[0];
    item.subCategory = parts[1];
    
    // Update ID if it reflects old path
    const oldId = item.id;
    
    console.log('    📝 Manifest updated: ' + oldRelPath + ' → ' + newRelPath + ' (cat: ' + oldCategory + '/' + oldSubCategory + ' → ' + item.category + '/' + item.subCategory + ')');
    return true;
  } else {
    console.log('    ⚠️  Manifest entry not found for: ' + oldRelPath);
    return false;
  }
}

console.log('\n====== FIXING MISPLACEMENTS ======\n');

// ============================================================
// GROUP 1: Pure gradient rects stuck in floral/centerpieces
// ============================================================
console.log('\n--- Group 1: Gradient Placeholders in Floral Folders ---');

const gradientMoves = [
  ['floral/centerpieces/centerpiece-bouquet-blush-60.svg', 'backgrounds/gradients/bg-card-gradient-blush-01.svg', 'Pure gradient rect (blush-pink colors), not a flower'],
  ['floral/centerpieces/centerpiece-bouquet-terracotta-31.svg', 'backgrounds/gradients/bg-card-gradient-dark-01.svg', 'Pure gradient rect (dark navy-grey), not a flower'],
  ['floral/side-cascades/cascade-side-sage-35.svg', 'backgrounds/gradients/bg-card-gradient-blue-01.svg', 'Pure gradient rect (steel blue-grey), not a cascade'],
];

gradientMoves.forEach(([from, to, reason]) => {
  if (moveFile(from, to, reason)) {
    updateManifest(from, to);
  }
});

// ============================================================
// GROUP 2: Frame/filigree patterns mislabeled as centerpieces
// ============================================================
console.log('\n--- Group 2: Frame/Filigree in Centerpieces ---');

// Need to inspect these two and give them proper semantic names
// centerpiece-bouquet-terracotta-53: 937x1135 - complex ornament, 1 path
// centerpiece-bouquet-terracotta-54: 527x536 - square ornament, 1 path
const frameMoves = [
  ['floral/centerpieces/centerpiece-bouquet-terracotta-53.svg', 'frames/filigree-corners/filigree-ornament-floral-01.svg', 'Large filigree ornament (1 path, 937x1135), not a bouquet'],
  ['floral/centerpieces/centerpiece-bouquet-terracotta-54.svg', 'frames/filigree-corners/filigree-ornament-floral-02.svg', 'Square filigree ornament (1 path, 527x536), not a bouquet'],
];

frameMoves.forEach(([from, to, reason]) => {
  if (moveFile(from, to, reason)) {
    updateManifest(from, to);
  }
});

// ============================================================
// GROUP 3: Very tall floral strip labeled as "corner"
// ============================================================
console.log('\n--- Group 3: Tall Cascade Mislabeled as Corner ---');

// rose-corner-corner-04: 245x967 ratio:3.95, 8 paths - this is a tall side cascade, not a corner ornament
const cornerMoves = [
  ['floral/corners/rose-corner-corner-04.svg', 'floral/side-cascades/cascade-side-rose-01.svg', 'Tall strip 245x967 ratio:3.95 - visually a side cascade, not a corner'],
];

cornerMoves.forEach(([from, to, reason]) => {
  if (moveFile(from, to, reason)) {
    updateManifest(from, to);
  }
});

// ============================================================
// GROUP 4: Micro UI icons stuck in floral/single-stems
// ============================================================
console.log('\n--- Group 4: Micro UI Icons in Single-Stems ---');

const iconMoves = [
  ['floral/single-stems/stem-botanical-terracotta-05.svg', 'icons/events/icon-flower-sm-01.svg', '24x24 Material Design flower icon - not a botanical illustration'],
  ['floral/single-stems/stem-botanical-terracotta-06.svg', 'icons/events/icon-leaf-sm-01.svg', '18x14 Adobe Illustrator leaf icon - not a botanical illustration'],
  ['floral/single-stems/stem-botanical-terracotta-07.svg', 'icons/events/icon-leaf-sm-02.svg', '18x14 currentColor leaf icon - UI icon, not botanical'],
  ['floral/single-stems/stem-botanical-terracotta-08.svg', 'icons/events/icon-leaf-sm-03.svg', '19x21 micro icon - too small to be botanical illustration'],
];

iconMoves.forEach(([from, to, reason]) => {
  if (moveFile(from, to, reason)) {
    updateManifest(from, to);
  }
});

// ============================================================
// GROUP 5: Portrait/tall ornaments in frames/dividers-horizontal
// ============================================================
console.log('\n--- Group 5: Vertical Ornaments in Horizontal Dividers ---');

// Create new dividers-vertical folder and move portrait ornaments there
const verticalDividerMoves = [
  ['frames/dividers-horizontal/divider-flourish-gold-02.svg', 'frames/dividers-vertical/divider-vertical-ornament-01.svg', 'Portrait 179x242 ratio:1.35 - vertical ornament, not horizontal divider'],
  ['frames/dividers-horizontal/divider-flourish-gold-15.svg', 'frames/dividers-vertical/divider-vertical-ornament-02.svg', 'Portrait 146x287 ratio:1.97 - vertical ornament, not horizontal divider'],
  ['frames/dividers-horizontal/divider-flourish-gold-16.svg', 'frames/dividers-vertical/divider-vertical-ornament-03.svg', 'Tall 107x287 ratio:2.68 - tall vertical ornament'],
  ['frames/dividers-horizontal/divider-flourish-gold-17.svg', 'frames/dividers-vertical/divider-vertical-ornament-04.svg', 'Portrait 170x243 ratio:1.43 - vertical ornament, not horizontal'],
];

verticalDividerMoves.forEach(([from, to, reason]) => {
  if (moveFile(from, to, reason)) {
    updateManifest(from, to);
  }
});

// ============================================================
// UPDATE MANIFEST SUBCATEGORIES & IDs
// ============================================================
console.log('\n--- Updating manifest IDs and subcategories ---');

// Also update any manifest items that still have wrong subCategory after moves
manifest.forEach(item => {
  const rel = item.relativePath.replace(/\\/g, '/');
  const parts = rel.split('/');
  if (parts.length >= 2) {
    const expectedCat = parts[0];
    const expectedSub = parts[1];
    if (item.category !== expectedCat || item.subCategory !== expectedSub) {
      console.log('  Fixing category: ' + item.id + ' -> ' + expectedCat + '/' + expectedSub);
      item.category = expectedCat;
      item.subCategory = expectedSub;
    }
  }
});

// ============================================================
// SAVE UPDATED MANIFEST
// ============================================================
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log('\n✅ Manifest saved: ' + manifest.length + ' items');

// ============================================================
// SUMMARY REPORT
// ============================================================
console.log('\n====== FIX SUMMARY ======');
console.log('Files moved:    ' + movedCount);
console.log('Errors:         ' + errors.length);
console.log('\nAll moves:');
log.forEach(l => console.log('  ' + l));
if (errors.length > 0) {
  console.log('\nErrors:');
  errors.forEach(e => console.log('  ' + e));
}

// Verify new folder structure
console.log('\n====== NEW FOLDER COUNTS ======');
function countSVGs(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) count += countSVGs(full);
    else if (item.endsWith('.svg')) count++;
  }
  return count;
}

const folders = [
  'backgrounds/gradients',
  'backgrounds/textures',
  'decorative/stars-sparkles',
  'floral/centerpieces',
  'floral/corners',
  'floral/headers-garlands',
  'floral/side-cascades',
  'floral/single-stems',
  'frames/dividers-horizontal',
  'frames/dividers-vertical',
  'frames/filigree-corners',
  'frames/full-cards',
  'frames/photo-frames',
  'icons/events',
];

folders.forEach(f => {
  const dir = path.join(BASE, f);
  const count = countSVGs(dir);
  if (count > 0 || fs.existsSync(dir)) {
    console.log('  ' + f.padEnd(35) + count + ' SVGs');
  }
});
