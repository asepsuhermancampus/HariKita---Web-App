// sample_svg_by_folder.js
// Reads 3 random/strategic SVG samples per folder and shows their fill colors,
// first path descriptor, path counts and sizes to allow manual classification check.

const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..', 'public', 'harikita-assets');
const MANIFEST_PATH = path.join(BASE, 'harikita_manifest.json');
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

function getFiles(folder) {
  return manifest.filter(m => (m.category + '/' + m.subCategory) === folder);
}

function analyzeOne(relPath) {
  const fullPath = path.join(BASE, relPath.replace(/\\/g, '/'));
  if (!fs.existsSync(fullPath)) return null;
  const content = fs.readFileSync(fullPath, 'utf8');
  const sizeKb = (fs.statSync(fullPath).size / 1024).toFixed(1);
  const vb = content.match(/viewBox="([^"]+)"/);
  let w = 0, h = 0;
  if (vb) { const p = vb[1].trim().split(/[\s,]+/); w = parseFloat(p[2]); h = parseFloat(p[3]); }
  const pathCount = (content.match(/<path/g) || []).length;
  
  // Get ALL fill colors
  const fills = new Set();
  for (const m of content.matchAll(/fill="(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)"/g)) {
    if (m[1] !== 'none' && m[1] !== 'inherit' && !m[1].startsWith('url')) fills.add(m[1].toLowerCase());
  }
  for (const m of content.matchAll(/stop-color="(#[0-9a-fA-F]{3,8})"/g)) fills.add(m[1].toLowerCase());
  
  // Extract first 80 chars of first path to see if organic
  const firstPath = content.match(/d="([^"]{1,80})/);
  const fp = firstPath ? firstPath[1].replace(/\s+/g, ' ') : '(no path)';
  
  // Check if it's a gradient placeholder
  const isGrad = pathCount === 0 && content.includes('<linearGradient');
  
  // Look for clip-path, masks - indicator of complex layered design
  const hasClip = content.includes('<clipPath');
  const hasMask = content.includes('<mask');
  
  return {
    w: Math.round(w), h: Math.round(h), 
    ratio: w > 0 ? (h/w).toFixed(2) : '?',
    pathCount, sizeKb, isGrad, hasClip, hasMask,
    fills: Array.from(fills).slice(0, 6),
    fp: fp.substring(0, 80)
  };
}

// Focus on the most problematic/uncertain folders
const foldersToCheck = [
  'floral/centerpieces',
  'floral/side-cascades', 
  'floral/corners',
  'floral/single-stems',
  'floral/headers-garlands',
  'frames/dividers-horizontal',
  'frames/dividers-vertical',
  'frames/filigree-corners',
];

foldersToCheck.forEach(folder => {
  const items = getFiles(folder);
  console.log('\n========== ' + folder + ' (' + items.length + ' total) ==========');
  
  // Take strategic samples: first 2, middle 2, last 2
  const indices = [0, 1, Math.floor(items.length/2), Math.floor(items.length/2)+1, items.length-2, items.length-1]
    .filter((v, i, a) => v >= 0 && v < items.length && a.indexOf(v) === i);
  
  indices.forEach(idx => {
    const item = items[idx];
    const a = analyzeOne(item.relativePath);
    if (!a) return;
    
    const typeStr = a.isGrad ? '🎨GRADIENT' : (a.pathCount === 1 ? '1️⃣SINGLE-PATH' : a.pathCount + '📐paths');
    const sizeStr = parseFloat(a.sizeKb) > 500 ? '⚠️' + a.sizeKb + 'KB' : a.sizeKb + 'KB';
    const colorStr = a.fills.length > 0 ? 'fills:[' + a.fills.join(',') + ']' : 'no-color';
    
    console.log('');
    console.log('  [' + idx + '] ' + item.id + '.svg');
    console.log('    size:' + sizeStr + ' | ' + a.w + 'x' + a.h + ' r:' + a.ratio + ' | ' + typeStr);
    console.log('    ' + colorStr);
    console.log('    orig: ' + (item.originalFile || 'N/A'));
    console.log('    path[0]: ' + a.fp);
  });
});

// Special focus: centerpieces that look geometric
console.log('\n\n===== CENTERPIECES: GEOMETRIC CHECK (paths <= 2, small files) =====');
getFiles('floral/centerpieces').filter(item => {
  const a = analyzeOne(item.relativePath);
  return a && a.pathCount <= 2 && parseFloat(a.sizeKb) < 25;
}).forEach(item => {
  const a = analyzeOne(item.relativePath);
  console.log('  ' + item.id + ' | ' + a.w + 'x' + a.h + ' | paths:' + a.pathCount + ' | ' + a.sizeKb + 'KB | orig:' + item.originalFile);
  console.log('    fills:' + a.fills.join(','));
  console.log('    path[0]: ' + a.fp);
});

// Special focus: single stems  
console.log('\n\n===== SINGLE-STEMS: DETAILED CHECK =====');
getFiles('floral/single-stems').forEach(item => {
  const a = analyzeOne(item.relativePath);
  if (!a) return;
  console.log('  ' + item.id + ' | ' + a.w + 'x' + a.h + ' | paths:' + a.pathCount + ' | ' + a.sizeKb + 'KB | orig:' + item.originalFile);
  console.log('    fills:' + a.fills.join(','));
  console.log('    path[0]: ' + a.fp);
});

// Special focus: corners that are tall-vertical shaped
console.log('\n\n===== CORNERS: SHAPE DETAILS =====');
getFiles('floral/corners').forEach(item => {
  const a = analyzeOne(item.relativePath);
  if (!a) return;
  const r = parseFloat(a.ratio);
  const shapeFlag = r > 2 ? '⚠️VERY-TALL' : (r < 0.7 ? '⚠️WIDE' : '✅ok-shape');
  console.log('  ' + shapeFlag + ' ' + item.id + ' | ' + a.w + 'x' + a.h + ' ratio:' + a.ratio + ' | paths:' + a.pathCount + ' | ' + a.sizeKb + 'KB');
});
