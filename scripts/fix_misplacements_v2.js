// fix_misplacements_v2.js
// Second round of validated fixes based on deep content + original filename inspection
//
// Fixes:
// 1. floral/centerpieces: 6 non-floral files -> appropriate folders
// 2. floral/corners: 4 very-tall strips -> floral/side-cascades
// 3. floral/single-stems: 5 misidentified files -> correct folders
// 4. frames/dividers-vertical: rename to decorative/stamps-wax + rename files
// 5. floral/side-cascades: 2 square-shaped bouquets -> floral/centerpieces
// 6. Update harikita_manifest.json

const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..', 'public', 'harikita-assets');
const MANIFEST_PATH = path.join(BASE, 'harikita_manifest.json');
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const moved = [];
const errors = [];

function moveAndRename(fromRel, toRel, reason) {
  const from = path.join(BASE, fromRel);
  const to = path.join(BASE, toRel);

  if (!fs.existsSync(from)) {
    errors.push('NOT FOUND: ' + fromRel);
    console.log('  ⚠️  NOT FOUND: ' + fromRel);
    return false;
  }

  ensureDir(path.dirname(to));

  try {
    fs.renameSync(from, to);
    moved.push({ from: fromRel, to: toRel, reason });
    console.log('  ✅ ' + path.basename(fromRel) + ' → ' + toRel);
    return true;
  } catch(e) {
    errors.push('ERROR: ' + fromRel + ': ' + e.message);
    console.log('  ❌ ERROR: ' + e.message);
    return false;
  }
}

function updateManifestEntry(oldRel, newRel) {
  const oldNorm = oldRel.replace(/\\/g, '/');
  const newNorm = newRel.replace(/\\/g, '/');
  const idx = manifest.findIndex(m => m.relativePath.replace(/\\/g, '/') === oldNorm);
  if (idx === -1) {
    // Try matching by basename
    const basename = path.basename(oldNorm, '.svg');
    const idx2 = manifest.findIndex(m => m.id === basename || m.relativePath.includes(path.basename(oldNorm)));
    if (idx2 === -1) {
      console.log('    ⚠️  Manifest entry not found for: ' + oldNorm);
      return;
    }
    const parts = newNorm.split('/');
    manifest[idx2].relativePath = newNorm;
    manifest[idx2].publicUrl = '/harikita-assets/' + newNorm;
    manifest[idx2].category = parts[0];
    manifest[idx2].subCategory = parts[1];
    manifest[idx2].id = path.basename(newNorm, '.svg');
    return;
  }
  const parts = newNorm.split('/');
  manifest[idx].relativePath = newNorm;
  manifest[idx].publicUrl = '/harikita-assets/' + newNorm;
  manifest[idx].category = parts[0];
  manifest[idx].subCategory = parts[1];
  manifest[idx].id = path.basename(newNorm, '.svg');
}

// ===== GROUP 1: Non-floral files in floral/centerpieces =====
console.log('\n--- GROUP 1: Non-floral files in floral/centerpieces ---');

const cp_fixes = [
  // terracotta-20: kdo53-bg1.svg, currentcolor 1-path, background ornament
  ['floral/centerpieces/centerpiece-bouquet-terracotta-20.svg', 'backgrounds/textures/bg-texture-ornament-01.svg', 'background ornament (kdo53-bg1, currentcolor, not a bouquet)'],
  // terracotta-52: cd-bg-1.svg, 632x324 landscape, background card divider
  ['floral/centerpieces/centerpiece-bouquet-terracotta-52.svg', 'frames/dividers-horizontal/divider-flourish-gold-21.svg', 'landscape divider (cd-bg-1.svg, 632x324)'],
  // terracotta-82: message-frame.svg, tall portrait with gold border
  ['floral/centerpieces/centerpiece-bouquet-terracotta-82.svg', 'frames/full-cards/frame-full-card-message-01.svg', 'message frame (message-frame.svg, gold border #b9994e)'],
  // terracotta-83: paper-1.svg, 480x355 landscape with currentcolor path
  ['floral/centerpieces/centerpiece-bouquet-terracotta-83.svg', 'backgrounds/textures/bg-paper-overlay-01.svg', 'paper overlay texture (paper-1.svg, currentcolor)'],
  // terracotta-84: wide 1469x826 1-path background
  ['floral/centerpieces/centerpiece-bouquet-terracotta-84.svg', 'backgrounds/textures/bg-wide-overlay-01.svg', 'wide background overlay (1469x826, 1 path)'],
  // terracotta-88: sidebar-2.svg, 462x705 panel background
  ['floral/centerpieces/centerpiece-bouquet-terracotta-88.svg', 'backgrounds/textures/bg-sidebar-panel-01.svg', 'sidebar panel background (sidebar-2.svg, 462x705)'],
];

cp_fixes.forEach(([from, to, reason]) => {
  if (moveAndRename(from, to, reason)) updateManifestEntry(from, to);
});

// ===== GROUP 2: Very-tall strips in floral/corners → side-cascades =====
console.log('\n--- GROUP 2: Tall strips mislabeled as corners → side-cascades ---');

const corner_fixes = [
  ['floral/corners/rose-corner-corner-02.svg', 'floral/side-cascades/cascade-side-rose-02.svg', 'tall vertical 329x735 ratio:2.23 - cascade, not corner'],
  ['floral/corners/rose-corner-corner-09.svg', 'floral/side-cascades/cascade-side-rose-03.svg', 'tall vertical 216x578 ratio:2.68 - cascade, not corner'],
  ['floral/corners/rose-corner-corner-13.svg', 'floral/side-cascades/cascade-side-rose-04.svg', 'tall vertical 212x544 ratio:2.57 - cascade, not corner'],
  ['floral/corners/rose-lilac-corner-01.svg', 'floral/side-cascades/cascade-side-lilac-01.svg', 'tall vertical 246x561 ratio:2.28 - lilac cascade, not corner'],
];

corner_fixes.forEach(([from, to, reason]) => {
  if (moveAndRename(from, to, reason)) updateManifestEntry(from, to);
});

// ===== GROUP 3: Misidentified files in floral/single-stems =====
console.log('\n--- GROUP 3: Misidentified files in floral/single-stems ---');

const stem_fixes = [
  // bg-bottom.svg and bg-top.svg are actually decorative corner elements
  ['floral/single-stems/stem-botanical-terracotta-01.svg', 'frames/filigree-corners/filigree-corner-teal-top.svg', 'background corner ornament (bg-top.svg, #717c7d teal)'],
  ['floral/single-stems/stem-botanical-terracotta-02.svg', 'frames/filigree-corners/filigree-corner-teal-bottom.svg', 'background corner ornament (bg-bottom.svg, #717c7d teal)'],
  // bride-bulat shapes are circular icon ornaments
  ['floral/single-stems/stem-botanical-terracotta-03.svg', 'icons/events/icon-circle-ornament-01.svg', 'circular badge shape (bride-bulat-1.svg, currentcolor)'],
  ['floral/single-stems/stem-botanical-terracotta-04.svg', 'icons/events/icon-circle-ornament-02.svg', 'circular gold badge (bride-bulat-2.svg, #aa9410)'],
  // particle is a decorative sparkle/dust particle
  ['floral/single-stems/stem-botanical-terracotta-09.svg', 'decorative/stars-sparkles/sparkle-particle-01.svg', 'decorative particle (particle3.svg, #e0d7cb)'],
];

stem_fixes.forEach(([from, to, reason]) => {
  if (moveAndRename(from, to, reason)) updateManifestEntry(from, to);
});

// ===== GROUP 4: stamps-wax folder (from dividers-vertical) =====
console.log('\n--- GROUP 4: Move stamp ornaments → decorative/stamps-wax ---');

const stamp_fixes = [
  ['frames/dividers-vertical/divider-flourish-gold-02.svg', 'decorative/stamps-wax/stamp-ornament-cover-01.svg', 'cover stamp ornament (cover-stamp.svg, paper-letter theme)'],
  ['frames/dividers-vertical/divider-flourish-gold-15.svg', 'decorative/stamps-wax/stamp-ornament-01.svg', 'stamp ornament (stamp-1.svg, paper-letter theme)'],
  ['frames/dividers-vertical/divider-flourish-gold-16.svg', 'decorative/stamps-wax/stamp-ornament-02.svg', 'stamp ornament (stamp-2.svg, paper-letter theme)'],
  ['frames/dividers-vertical/divider-flourish-gold-17.svg', 'decorative/stamps-wax/stamp-ornament-story-01.svg', 'story stamp ornament (story-stamp.svg, paper-letter theme)'],
];

stamp_fixes.forEach(([from, to, reason]) => {
  if (moveAndRename(from, to, reason)) updateManifestEntry(from, to);
});

// Remove empty dividers-vertical dir if now empty
const vertDir = path.join(BASE, 'frames', 'dividers-vertical');
if (fs.existsSync(vertDir) && fs.readdirSync(vertDir).length === 0) {
  fs.rmdirSync(vertDir);
  console.log('\n  🗑️  Removed empty frames/dividers-vertical/ directory');
}

// ===== GROUP 5: Square-shaped "cascades" that are actually centerpieces =====
console.log('\n--- GROUP 5: Square bouquets mislabeled as side-cascades → centerpieces ---');

// cascade-side-sage-01 (567x695 ratio:1.22) and cascade-side-sage-18 (794x968 ratio:1.22)
// Both are roughly square with multi-path botanical content → should be centerpieces
const cascade_fixes = [
  ['floral/side-cascades/cascade-side-sage-01.svg', 'floral/centerpieces/centerpiece-bouquet-sage-01.svg', 'square 567x695 ratio:1.22 botanical bouquet - not a cascade'],
  ['floral/side-cascades/cascade-side-sage-18.svg', 'floral/centerpieces/centerpiece-bouquet-sage-02.svg', 'square 794x968 ratio:1.22 botanical bouquet - not a cascade'],
];

cascade_fixes.forEach(([from, to, reason]) => {
  if (moveAndRename(from, to, reason)) updateManifestEntry(from, to);
});

// ===== SYNC MANIFEST SUBCATEGORIES =====
console.log('\n--- Syncing all manifest category/subCategory fields ---');
let synced = 0;
manifest.forEach(item => {
  const rel = item.relativePath.replace(/\\/g, '/');
  const parts = rel.split('/');
  if (parts.length >= 2) {
    const newCat = parts[0];
    const newSub = parts[1];
    if (item.category !== newCat || item.subCategory !== newSub) {
      item.category = newCat;
      item.subCategory = newSub;
      synced++;
    }
  }
});
console.log('  Synced ' + synced + ' entries');

// ===== SAVE MANIFEST =====
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log('\n✅ Manifest saved: ' + manifest.length + ' items');

// ===== SUMMARY =====
console.log('\n====== MOVE SUMMARY ======');
console.log('Total files moved: ' + moved.length);
console.log('Errors: ' + errors.length);
moved.forEach(m => console.log('  ✅ ' + m.from + ' → ' + m.to));
if (errors.length > 0) errors.forEach(e => console.log('  ❌ ' + e));

// ===== VERIFY FINAL STRUCTURE =====
console.log('\n====== FINAL FOLDER COUNTS ======');
function countSVGs(dir) {
  if (!fs.existsSync(dir)) return 0;
  let c = 0;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) c += countSVGs(full);
    else if (item.endsWith('.svg')) c++;
  }
  return c;
}

const folders = [
  'backgrounds/gradients', 'backgrounds/textures',
  'decorative/stars-sparkles', 'decorative/stamps-wax',
  'floral/centerpieces', 'floral/corners', 'floral/headers-garlands',
  'floral/side-cascades', 'floral/single-stems',
  'frames/dividers-horizontal', 'frames/dividers-vertical',
  'frames/filigree-corners', 'frames/full-cards', 'frames/photo-frames',
  'icons/events',
];

let totalSVG = 0;
folders.forEach(f => {
  const dir = path.join(BASE, f);
  const count = countSVGs(dir);
  if (count > 0 || fs.existsSync(dir)) {
    console.log('  ' + f.padEnd(35) + count + ' SVGs');
    totalSVG += count;
  }
});
console.log('  ' + '='.repeat(45));
console.log('  ' + 'TOTAL'.padEnd(35) + totalSVG + ' SVGs');

// ===== INTEGRITY CHECK =====
console.log('\n====== INTEGRITY CHECK ======');
const allRelPaths = new Set(manifest.map(m => m.relativePath.replace(/\\/g, '/')));
let orphans = 0;
function checkOrphans(dir, base) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const rel = path.relative(base, full).replace(/\\/g, '/');
    if (fs.statSync(full).isDirectory()) { if (item !== 'audit_results') checkOrphans(full, base); }
    else if (item.endsWith('.svg')) {
      if (!allRelPaths.has(rel)) { console.log('  ORPHAN: ' + rel); orphans++; }
    }
  }
}
checkOrphans(BASE, BASE);
let broken = 0;
manifest.forEach(m => {
  if (!fs.existsSync(path.join(BASE, m.relativePath.replace(/\\/g, '/')))) {
    console.log('  BROKEN: ' + m.relativePath); broken++;
  }
});
console.log('Orphan SVGs: ' + orphans);
console.log('Broken manifest paths: ' + broken);
if (orphans === 0 && broken === 0) console.log('✅ Perfect integrity!');
