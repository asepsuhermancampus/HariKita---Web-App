// deep_classify_svgs.js
// Deep inspection of SVG content to classify visual type by:
// - Dominant colors (fills/strokes)
// - Structure (pure gradient rect vs botanical paths vs filigree lines)
// - Original theme from harvested_manifest.json
// - Dimensions
// Goal: produce a corrected classification table for the brainstorming analysis

const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..', 'public', 'harikita-assets');
const HARVESTED_MANIFEST = path.resolve(__dirname, '..', 'references', 'kadio-assets', 'harvested', 'harvested_manifest.json');
const HARIKITA_MANIFEST = path.resolve(__dirname, '..', 'public', 'harikita-assets', 'harikita_manifest.json');

// Load manifests
const harvestedManifest = JSON.parse(fs.readFileSync(HARVESTED_MANIFEST, 'utf8'));
const harikitaManifest = JSON.parse(fs.readFileSync(HARIKITA_MANIFEST, 'utf8'));

// Build lookup: harikita originalFile -> theme & URL
const origToTheme = {};
harvestedManifest.forEach(item => {
  origToTheme[item.name.toLowerCase()] = { theme: item.theme, url: item.url };
});

// Build harikita originalFile index
const harikitaLookup = {};
harikitaManifest.forEach(item => {
  harikitaLookup[item.id] = item;
});

function getAllSVGs(dir, base) {
  let results = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const rel = path.relative(base, full);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) results = results.concat(getAllSVGs(full, base));
    else if (item.endsWith('.svg')) results.push({ file: item, fullPath: full, folder: path.dirname(rel).replace(/\\/g, '/') });
  }
  return results;
}

const svgs = getAllSVGs(BASE, BASE);

function extractColors(content) {
  const fills = new Set();
  const strokes = new Set();
  
  // Extract inline fill/stroke colors
  const fillMatches = content.matchAll(/fill="(#[0-9a-fA-F]{3,8}|rgb[^"]+|[a-zA-Z]+)"/g);
  for (const m of fillMatches) {
    if (m[1] !== 'none' && m[1] !== 'transparent') fills.add(m[1].toLowerCase());
  }
  const strokeMatches = content.matchAll(/stroke="(#[0-9a-fA-F]{3,8}|rgb[^"]+|[a-zA-Z]+)"/g);
  for (const m of strokeMatches) {
    if (m[1] !== 'none' && m[1] !== 'transparent') strokes.add(m[1].toLowerCase());
  }
  
  // Stop colors in gradients
  const stopMatches = content.matchAll(/stop-color="(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)"/g);
  for (const m of stopMatches) fills.add(m[1].toLowerCase());
  
  return { fills: Array.from(fills).slice(0, 5), strokes: Array.from(strokes).slice(0, 3) };
}

function classifyVisualType(item, content, harikitaEntry) {
  const { w, h, ratio } = item;
  const pathCount = item.pathCount;
  const rectCount = (content.match(/<rect/g) || []).length;
  const hasGradient = content.includes('<linearGradient') || content.includes('<radialGradient');
  const hasClipPath = content.includes('<clipPath');
  const hasGroup = content.includes('<g');
  const fileSize = fs.statSync(item.fullPath).size;

  // Is it a pure background gradient? (very small file, only rects, has gradient, no paths)
  if (pathCount === 0 && rectCount >= 1 && hasGradient && fileSize < 1000) {
    return 'PURE-GRADIENT-BACKGROUND';
  }

  // Is it a very long horizontal banner? (ratio < 0.3)
  if (ratio < 0.3) return 'HORIZONTAL-DIVIDER-OR-BANNER';

  // Is it a near-vertical strip? (ratio > 3)
  if (ratio > 3.0) return 'TALL-VERTICAL-STRIP';

  // Does it have very few paths (1-2) and is large? Likely filigree/frame
  if (pathCount <= 2 && fileSize > 50000 && ratio > 0.8 && ratio < 1.5) {
    return 'FRAME-OR-FILIGREE';
  }

  // Is it small (< 5KB), very small viewBox, likely an icon?
  if (fileSize < 5000 && w < 50 && h < 50) return 'SMALL-ICON';

  // Large file with 5-9 paths - likely a complex floral arrangement
  if (pathCount >= 5 && fileSize > 200000) return 'COMPLEX-BOTANICAL-LARGE';
  if (pathCount >= 3 && fileSize > 50000) return 'BOTANICAL-MEDIUM';

  // 1-2 paths only but large file - likely a single complex botanical trace
  if (pathCount <= 2 && fileSize > 20000 && pathCount > 0) return 'BOTANICAL-SINGLE-ELEMENT';

  // Very small 1-path files - probably icon or simple ornament
  if (pathCount === 1 && fileSize < 30000) return 'SIMPLE-ORNAMENT-OR-ICON';

  return 'BOTANICAL-GENERAL';
}

const report = [];

svgs.forEach(svg => {
  const content = fs.readFileSync(svg.fullPath, 'utf8');
  const vb = content.match(/viewBox="([^"]+)"/);
  let w = 0, h = 0;
  if (vb) {
    const p = vb[1].trim().split(/[\s,]+/);
    w = parseFloat(p[2]) || 0;
    h = parseFloat(p[3]) || 0;
  }
  const ratio = w > 0 ? h / w : 0;
  const pathCount = (content.match(/<path/g) || []).length;
  const sizeKb = (fs.statSync(svg.fullPath).size / 1024).toFixed(1);
  const { fills, strokes } = extractColors(content);

  const harikitaEntry = harikitaLookup[svg.file.replace('.svg', '')];
  const originalFile = harikitaEntry ? harikitaEntry.originalFile : null;
  const themeInfo = originalFile ? origToTheme[originalFile.toLowerCase()] : null;

  const item = { 
    file: svg.file, 
    fullPath: svg.fullPath,
    folder: svg.folder, 
    w: Math.round(w), h: Math.round(h), ratio: parseFloat(ratio.toFixed(2)), 
    pathCount,
    sizeKb
  };
  
  const visualType = classifyVisualType(item, content, harikitaEntry);
  
  // Determine correct category suggestion
  let suggestedCategory = svg.folder;
  let isCorrectlyPlaced = true;
  let placementNote = '';
  
  const curFolder = svg.folder;
  
  if (visualType === 'PURE-GRADIENT-BACKGROUND') {
    suggestedCategory = 'backgrounds/gradients';
    isCorrectlyPlaced = curFolder === 'backgrounds/gradients' || curFolder === 'backgrounds/textures';
    placementNote = 'Plain gradient rectangle - should be in backgrounds';
  } else if (visualType === 'HORIZONTAL-DIVIDER-OR-BANNER') {
    suggestedCategory = curFolder.includes('header') ? 'floral/headers-garlands' : 'frames/dividers-horizontal';
    isCorrectlyPlaced = curFolder === 'frames/dividers-horizontal' || curFolder === 'floral/headers-garlands';
  } else if (visualType === 'TALL-VERTICAL-STRIP') {
    suggestedCategory = 'floral/side-cascades';
    isCorrectlyPlaced = curFolder === 'floral/side-cascades';
    if (!isCorrectlyPlaced) placementNote = 'Tall vertical strip - should be in side-cascades';
  } else if (visualType === 'FRAME-OR-FILIGREE') {
    suggestedCategory = 'frames/filigree-corners';
    isCorrectlyPlaced = curFolder.startsWith('frames/');
    if (!isCorrectlyPlaced) placementNote = 'Frame/filigree pattern - should be in frames/';
  } else if (visualType === 'SMALL-ICON') {
    suggestedCategory = 'icons/events';
    isCorrectlyPlaced = curFolder === 'icons/events';
    if (!isCorrectlyPlaced) placementNote = 'Small icon-size SVG - should be in icons/';
  }
  
  report.push({
    file: svg.file,
    currentFolder: svg.folder,
    visualType,
    suggestedCategory,
    isCorrectlyPlaced,
    placementNote,
    w: item.w,
    h: item.h,
    ratio: item.ratio,
    pathCount,
    sizeKb,
    theme: themeInfo ? themeInfo.theme : 'unknown',
    originalFile,
    dominantColors: fills.slice(0, 3)
  });
});

// === SUMMARY ===
console.log('\n===== DEEP CLASSIFICATION REPORT =====\n');

const byVisualType = {};
report.forEach(r => {
  byVisualType[r.visualType] = (byVisualType[r.visualType] || []);
  byVisualType[r.visualType].push(r);
});

Object.entries(byVisualType).sort().forEach(([type, items]) => {
  console.log('\n--- Visual Type: ' + type + ' (' + items.length + ' files) ---');
  items.slice(0, 5).forEach(i => {
    const wrong = !i.isCorrectlyPlaced ? ' [MISPLACED -> ' + i.suggestedCategory + ']' : '';
    console.log('  ' + i.currentFolder + '/' + i.file + wrong);
    console.log('    ' + i.w + 'x' + i.h + ' ratio:' + i.ratio + ' paths:' + i.pathCount + ' size:' + i.sizeKb + 'KB theme:' + i.theme);
  });
  if (items.length > 5) console.log('  ... +' + (items.length - 5) + ' more');
});

// === MISPLACEMENTS ONLY ===
console.log('\n\n===== MISPLACED FILES =====\n');
const misplaced = report.filter(r => !r.isCorrectlyPlaced);
if (misplaced.length === 0) {
  console.log('No definitive misplacements detected based on automated analysis.');
} else {
  misplaced.forEach(r => {
    console.log('  ' + r.currentFolder + '/' + r.file);
    console.log('    -> Suggested: ' + r.suggestedCategory + ' | Note: ' + r.placementNote);
  });
}

// === PURE GRADIENT BACKGROUNDS (confirm they are placeholders not real vectors) ===
console.log('\n\n===== BACKGROUNDS/GRADIENTS VALIDATION =====');
const pureGrads = report.filter(r => r.visualType === 'PURE-GRADIENT-BACKGROUND');
console.log('Total pure gradient placeholders: ' + pureGrads.length);
console.log('Sample colors found:');
pureGrads.slice(0, 5).forEach(r => {
  console.log('  ' + r.file + ': ' + r.dominantColors.join(', '));
});

// === CENTERPIECES THAT MIGHT BE OTHER THINGS ===
console.log('\n\n===== REVIEWING floral/centerpieces (103 files) =====');
const centerpieces = report.filter(r => r.currentFolder === 'floral/centerpieces');
const cpByType = {};
centerpieces.forEach(r => { cpByType[r.visualType] = (cpByType[r.visualType] || 0) + 1; });
console.log('By visual type:', cpByType);
console.log('Wide-banner centerpieces (may be garlands):');
centerpieces.filter(r => r.ratio < 0.5).forEach(r => {
  console.log('  ' + r.file + ' ' + r.w + 'x' + r.h + ' ratio:' + r.ratio);
});
console.log('Tall-strip centerpieces (may be side-cascades):');
centerpieces.filter(r => r.ratio > 2.5).forEach(r => {
  console.log('  ' + r.file + ' ' + r.w + 'x' + r.h + ' ratio:' + r.ratio);
});

// Save full report
const outPath = path.resolve(__dirname, '..', 'scripts', 'audit_results', 'deep_classification.json');
fs.writeFileSync(outPath, JSON.stringify({ generated: new Date().toISOString(), total: report.length, report }, null, 2));
console.log('\nSaved to: scripts/audit_results/deep_classification.json');
