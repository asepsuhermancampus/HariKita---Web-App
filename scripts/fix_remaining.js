// fix_remaining.js
// Fixes the last remaining issues:
// 1. Move frames/dividers-vertical/* -> decorative/stamps-wax/ (with correct existing filenames)
// 2. Fix broken manifest entry for cascade-side-sage-01 (now centerpiece-bouquet-sage-01)

const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..', 'public', 'harikita-assets');
const MANIFEST_PATH = path.join(BASE, 'harikita_manifest.json');
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// 1. Move stamps-wax (the files have their current correct names from previous rename)
ensureDir(path.join(BASE, 'decorative', 'stamps-wax'));

const stampMappings = [
  ['frames/dividers-vertical/divider-vertical-ornament-01.svg', 'decorative/stamps-wax/stamp-ornament-cover-01.svg', 'cover-stamp.svg origin'],
  ['frames/dividers-vertical/divider-vertical-ornament-02.svg', 'decorative/stamps-wax/stamp-ornament-01.svg', 'stamp-1.svg origin'],
  ['frames/dividers-vertical/divider-vertical-ornament-03.svg', 'decorative/stamps-wax/stamp-ornament-02.svg', 'stamp-2.svg origin'],
  ['frames/dividers-vertical/divider-vertical-ornament-04.svg', 'decorative/stamps-wax/stamp-ornament-story-01.svg', 'story-stamp.svg origin'],
];

console.log('\n--- Moving stamps-wax ---');
stampMappings.forEach(([fromRel, toRel, note]) => {
  const from = path.join(BASE, fromRel);
  const to = path.join(BASE, toRel);
  if (fs.existsSync(from)) {
    fs.renameSync(from, to);
    console.log('  ✅ ' + path.basename(fromRel) + ' → ' + toRel + ' (' + note + ')');
    // Update manifest
    const oldNorm = fromRel.replace(/\\/g, '/');
    const newNorm = toRel.replace(/\\/g, '/');
    const idx = manifest.findIndex(m => m.relativePath.replace(/\\/g, '/') === oldNorm);
    if (idx >= 0) {
      const parts = newNorm.split('/');
      manifest[idx].relativePath = newNorm;
      manifest[idx].publicUrl = '/harikita-assets/' + newNorm;
      manifest[idx].category = parts[0];
      manifest[idx].subCategory = parts[1];
      manifest[idx].id = path.basename(newNorm, '.svg');
    }
  } else {
    console.log('  ⚠️  NOT FOUND: ' + fromRel);
  }
});

// Remove empty dividers-vertical dir
const vertDir = path.join(BASE, 'frames', 'dividers-vertical');
if (fs.existsSync(vertDir) && fs.readdirSync(vertDir).length === 0) {
  fs.rmdirSync(vertDir);
  console.log('  🗑️  Removed empty frames/dividers-vertical/');
}

// 2. Fix broken manifest entry: cascade-side-sage-01 should now be centerpiece-bouquet-sage-01
console.log('\n--- Fixing broken manifest entry ---');
const brokenIdx = manifest.findIndex(m => m.id === 'cascade-side-sage-01');
if (brokenIdx >= 0) {
  const newRel = 'floral/centerpieces/centerpiece-bouquet-sage-01.svg';
  manifest[brokenIdx].relativePath = newRel;
  manifest[brokenIdx].publicUrl = '/harikita-assets/' + newRel;
  manifest[brokenIdx].category = 'floral';
  manifest[brokenIdx].subCategory = 'centerpieces';
  manifest[brokenIdx].id = 'centerpiece-bouquet-sage-01';
  console.log('  ✅ Fixed: cascade-side-sage-01 → centerpiece-bouquet-sage-01');
}

// Save manifest
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log('\n✅ Manifest saved: ' + manifest.length + ' items');

// Integrity check
const allRelPaths = new Set(manifest.map(m => m.relativePath.replace(/\\/g, '/')));
let orphans = 0, broken = 0;
function checkOrphans(dir, base) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const rel = path.relative(base, full).replace(/\\/g, '/');
    if (fs.statSync(full).isDirectory()) { if (item !== 'audit_results') checkOrphans(full, base); }
    else if (item.endsWith('.svg')) { if (!allRelPaths.has(rel)) { console.log('  ORPHAN: ' + rel); orphans++; } }
  }
}
manifest.forEach(m => {
  if (!fs.existsSync(path.join(BASE, m.relativePath.replace(/\\/g, '/')))) {
    console.log('  BROKEN: ' + m.relativePath); broken++;
  }
});
checkOrphans(BASE, BASE);
console.log('\nOrphans: ' + orphans + ' | Broken: ' + broken);
if (orphans === 0 && broken === 0) console.log('✅ PERFECT INTEGRITY!');

// Final counts
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
  'frames/dividers-horizontal',
  'frames/filigree-corners', 'frames/full-cards', 'frames/photo-frames',
  'icons/events',
];
let total = 0;
folders.forEach(f => {
  const c = countSVGs(path.join(BASE, f));
  if (c > 0 || fs.existsSync(path.join(BASE, f))) {
    console.log('  ' + f.padEnd(35) + c);
    total += c;
  }
});
console.log('  ' + '-'.repeat(45));
console.log('  TOTAL'.padEnd(36) + total);
