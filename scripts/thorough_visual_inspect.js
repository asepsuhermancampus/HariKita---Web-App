// thorough_visual_inspect.js
// Deeply inspects EVERY SVG by reading actual SVG path content patterns,
// fill colors, bounding structure, and cross-references manifest.json
// to produce a comprehensive visual classification report.

const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..', 'public', 'harikita-assets');
const MANIFEST_PATH = path.join(BASE, 'harikita_manifest.json');
const HARVESTED_MANIFEST = path.resolve(__dirname, '..', 'references', 'kadio-assets', 'harvested', 'harvested_manifest.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const harvestedManifest = JSON.parse(fs.readFileSync(HARVESTED_MANIFEST, 'utf8'));

// Build theme lookup by original filename
const themeByFile = {};
harvestedManifest.forEach(item => {
  themeByFile[item.name.toLowerCase()] = { theme: item.theme, url: item.url };
});

function getTheme(originalFile) {
  if (!originalFile) return 'unknown';
  return themeByFile[originalFile.toLowerCase()] ? themeByFile[originalFile.toLowerCase()].theme : 'unknown';
}

// Analyze SVG content deeply
function analyzeSVG(content, filePath) {
  const sizeKb = (fs.statSync(filePath).size / 1024).toFixed(1);
  
  // Dimensions
  const vbMatch = content.match(/viewBox="([^"]+)"/);
  let w = 0, h = 0;
  if (vbMatch) {
    const p = vbMatch[1].trim().split(/[\s,]+/);
    w = parseFloat(p[2]) || 0;
    h = parseFloat(p[3]) || 0;
  }
  const ratio = w > 0 ? h / w : 0;

  // Element counts
  const pathCount = (content.match(/<path/g) || []).length;
  const rectCount = (content.match(/<rect/g) || []).length;
  const circleCount = (content.match(/<circle/g) || []).length;
  const ellipseCount = (content.match(/<ellipse/g) || []).length;
  const polygonCount = (content.match(/<polygon/g) || []).length;
  const groupCount = (content.match(/<g[ >]/g) || []).length;
  const useCount = (content.match(/<use/g) || []).length;
  const defsCount = (content.match(/<defs/g) || []).length;
  const gradientCount = (content.match(/<linearGradient|<radialGradient/g) || []).length;
  const clipPathCount = (content.match(/<clipPath/g) || []).length;
  const maskCount = (content.match(/<mask/g) || []).length;
  
  const hasImage = content.includes('<image');
  const hasBase64 = content.includes('base64');
  const hasFill = content.includes('fill=');
  const hasStroke = content.includes('stroke=');
  
  // Extract all fill colors
  const fillColors = [];
  const fillMatches = content.matchAll(/fill="(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)"/g);
  for (const m of fillMatches) {
    if (!['none', 'transparent', 'inherit', 'currentColor', 'url(#'].some(x => m[1].startsWith(x))) {
      fillColors.push(m[1].toLowerCase());
    }
  }
  const stopColors = [];
  const stopMatches = content.matchAll(/stop-color="(#[0-9a-fA-F]{3,8})"/g);
  for (const m of stopMatches) stopColors.push(m[1].toLowerCase());
  
  // Analyze path data characteristics
  // Check first path's data for organic vs geometric patterns
  const firstPathMatch = content.match(/d="([^"]{0,200})"/);
  const firstPathData = firstPathMatch ? firstPathMatch[1] : '';
  
  // Organic/botanical: lots of C (cubic bezier), Q (quadratic), S (smooth)
  const organicCurveCount = (firstPathData.match(/[CQScqs]/g) || []).length;
  // Geometric: mostly L (line), H (horizontal), V (vertical), Z (close)
  const geometricCount = (firstPathData.match(/[LHVZ]/g) || []).length;
  const isOrganic = organicCurveCount > geometricCount * 0.5;
  
  // Is it just a solid background (rect + gradient, no paths)?
  const isPureGradient = pathCount === 0 && rectCount >= 1 && gradientCount >= 1 && parseFloat(sizeKb) < 2;
  
  // Shape classification
  let shapeClass;
  if (ratio < 0.3) shapeClass = 'WIDE-BANNER';
  else if (ratio < 0.7) shapeClass = 'landscape';
  else if (ratio > 3.0) shapeClass = 'TALL-STRIP';
  else if (ratio > 2.0) shapeClass = 'tall-vertical';
  else if (ratio > 1.3) shapeClass = 'portrait';
  else shapeClass = 'square';
  
  // Visual type inference
  let visualType = 'botanical';
  if (isPureGradient) visualType = 'gradient-placeholder';
  else if (pathCount === 0 && rectCount > 0 && parseFloat(sizeKb) < 2) visualType = 'gradient-placeholder';
  else if (w < 50 && h < 50 && parseFloat(sizeKb) < 5) visualType = 'micro-icon';
  else if (pathCount <= 2 && !isOrganic && groupCount <= 1) visualType = 'geometric-frame';
  else if (shapeClass === 'WIDE-BANNER') visualType = 'horizontal-strip';
  else if (shapeClass === 'TALL-STRIP') visualType = 'vertical-strip';
  else if (isOrganic && pathCount >= 3) visualType = 'botanical-complex';
  else if (isOrganic && pathCount >= 1) visualType = 'botanical-simple';
  else visualType = 'ornament';
  
  return {
    w: Math.round(w), h: Math.round(h), ratio: parseFloat(ratio.toFixed(2)), shapeClass,
    pathCount, rectCount, gradientCount, groupCount,
    isOrganic, isPureGradient, hasImage, hasBase64,
    fillColors: fillColors.slice(0, 5), stopColors: stopColors.slice(0, 3),
    firstPath50: firstPathData.substring(0, 50),
    organicCurveCount, geometricCount,
    visualType, sizeKb
  };
}

// Process all folders
const folderReports = {};
const allIssues = [];

manifest.forEach(item => {
  const relPath = item.relativePath.replace(/\\/g, '/');
  const fullPath = path.join(BASE, relPath);
  const folder = item.category + '/' + item.subCategory;
  
  if (!fs.existsSync(fullPath)) return;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const analysis = analyzeSVG(content, fullPath);
  const theme = getTheme(item.originalFile);
  
  const record = {
    id: item.id,
    file: path.basename(relPath),
    folder,
    originalFile: item.originalFile,
    theme,
    ...analysis
  };
  
  if (!folderReports[folder]) folderReports[folder] = [];
  folderReports[folder].push(record);
  
  // Flag issues
  const issues = [];
  
  if (analysis.isPureGradient && !folder.startsWith('backgrounds/')) {
    issues.push('GRADIENT_IN_WRONG_FOLDER: should be backgrounds/gradients');
  }
  if (analysis.visualType === 'micro-icon' && !folder.startsWith('icons/')) {
    issues.push('MICRO_ICON_IN_WRONG_FOLDER: should be icons/');
  }
  if (analysis.shapeClass === 'WIDE-BANNER' && folder === 'floral/centerpieces') {
    issues.push('WIDE_BANNER_IN_CENTERPIECES: possibly a garland/header');
  }
  if (analysis.shapeClass === 'WIDE-BANNER' && folder === 'floral/corners') {
    issues.push('WIDE_BANNER_IN_CORNERS: not corner-shaped');
  }
  if ((analysis.shapeClass === 'TALL-STRIP' || analysis.shapeClass === 'tall-vertical') && folder === 'floral/centerpieces') {
    issues.push('TALL_IN_CENTERPIECES: possibly a cascade or single stem');
  }
  if ((analysis.shapeClass === 'WIDE-BANNER' || analysis.shapeClass === 'landscape') && folder === 'floral/side-cascades') {
    issues.push('WIDE_IN_CASCADES: possibly a garland or divider');
  }
  if (analysis.visualType === 'gradient-placeholder' && folder !== 'backgrounds/gradients' && folder !== 'backgrounds/textures') {
    issues.push('GRADIENT_PLACEHOLDER_MISLABELED');
  }
  if (!analysis.isOrganic && analysis.pathCount >= 1 && folder.startsWith('floral/') && analysis.pathCount <= 3) {
    issues.push('GEOMETRIC_IN_FLORAL: path data looks geometric, not botanical');
  }
  
  if (issues.length > 0) {
    allIssues.push({ ...record, issues });
  }
});

// === PRINT REPORT ===
console.log('\n====== COMPREHENSIVE SVG VISUAL AUDIT ======\n');
console.log('Total assets: ' + manifest.length);
console.log('Folders: ' + Object.keys(folderReports).length + '\n');

Object.entries(folderReports).sort().forEach(([folder, items]) => {
  const visualTypes = {};
  const shapeClasses = {};
  items.forEach(i => {
    visualTypes[i.visualType] = (visualTypes[i.visualType] || 0) + 1;
    shapeClasses[i.shapeClass] = (shapeClasses[i.shapeClass] || 0) + 1;
  });
  
  console.log('\n=== ' + folder + ' (' + items.length + ' files) ===');
  console.log('  Visual types: ' + JSON.stringify(visualTypes));
  console.log('  Shapes: ' + JSON.stringify(shapeClasses));
  
  // Show sample with theme context
  console.log('  Sample (first 6):');
  items.slice(0, 6).forEach(i => {
    const themeStr = i.theme !== 'unknown' ? ' [' + i.theme + ']' : '';
    const organicStr = i.isOrganic ? '✿organic' : '▢geometric';
    console.log('    ' + i.file);
    console.log('      ' + i.w + 'x' + i.h + ' ' + i.shapeClass + ' | ' + i.visualType + ' | paths:' + i.pathCount + ' | ' + i.sizeKb + 'KB | ' + organicStr + themeStr);
    if (i.fillColors.length > 0) console.log('      fills: ' + i.fillColors.slice(0, 3).join(', '));
  });
  if (items.length > 6) console.log('  ...+' + (items.length - 6) + ' more');
});

// === ISSUES REPORT ===
console.log('\n\n====== FLAGS & ISSUES (' + allIssues.length + ' total) ======\n');
if (allIssues.length === 0) {
  console.log('✅ No classification issues detected!');
} else {
  const issueGroups = {};
  allIssues.forEach(i => {
    i.issues.forEach(issue => {
      if (!issueGroups[issue]) issueGroups[issue] = [];
      issueGroups[issue].push(i);
    });
  });
  
  Object.entries(issueGroups).forEach(([issue, items]) => {
    console.log('\n[' + issue + '] (' + items.length + ' files):');
    items.forEach(i => {
      console.log('  ' + i.folder + '/' + i.file + ' ' + i.w + 'x' + i.h + ' ' + i.shapeClass + ' paths:' + i.pathCount + ' ' + i.sizeKb + 'KB');
    });
  });
}

// === STILL-PROBLEMATIC GRADIENTS ===
console.log('\n\n====== BACKGROUNDS/GRADIENTS FULL LIST ======');
(folderReports['backgrounds/gradients'] || []).forEach(i => {
  const typeStr = i.isPureGradient ? '[PURE-GRADIENT-RECT]' : '[HAS-PATHS]';
  console.log('  ' + typeStr + ' ' + i.file + ' ' + i.w + 'x' + i.h + ' fills: ' + i.fillColors.join(', '));
});

// === CENTERPIECES SHAPE BREAKDOWN ===
console.log('\n\n====== FLORAL/CENTERPIECES SHAPE BREAKDOWN ======');
const cp = folderReports['floral/centerpieces'] || [];
console.log('Total: ' + cp.length);
const cpByShape = {};
cp.forEach(i => { cpByShape[i.shapeClass] = (cpByShape[i.shapeClass] || []); cpByShape[i.shapeClass].push(i); });
Object.entries(cpByShape).forEach(([shape, items]) => {
  console.log('\n  [' + shape + '] ' + items.length + ' files:');
  items.slice(0, 4).forEach(i => {
    console.log('    ' + i.file + ' ' + i.w + 'x' + i.h + ' paths:' + i.pathCount + ' ' + i.sizeKb + 'KB ' + (i.isOrganic ? '✿organic' : '▢geometric'));
  });
  if (items.length > 4) console.log('    ...+' + (items.length - 4) + ' more');
});

// === SIDE CASCADES BREAKDOWN ===
console.log('\n\n====== FLORAL/SIDE-CASCADES BREAKDOWN ======');
const sc = folderReports['floral/side-cascades'] || [];
console.log('Total: ' + sc.length);
const byShape = {};
sc.forEach(i => { byShape[i.shapeClass] = (byShape[i.shapeClass] || []); byShape[i.shapeClass].push(i); });
Object.entries(byShape).forEach(([shape, items]) => {
  console.log('\n  [' + shape + '] ' + items.length + ':');
  items.slice(0, 4).forEach(i => {
    console.log('    ' + i.file + ' ' + i.w + 'x' + i.h + ' paths:' + i.pathCount + ' theme:' + i.theme);
  });
});

// === CORNERS BREAKDOWN ===
console.log('\n\n====== FLORAL/CORNERS BREAKDOWN ======');
(folderReports['floral/corners'] || []).forEach(i => {
  console.log('  ' + i.file + ' ' + i.w + 'x' + i.h + ' ' + i.shapeClass + ' paths:' + i.pathCount + ' ' + i.sizeKb + 'KB theme:' + i.theme);
});

// Save full data
fs.writeFileSync(
  path.resolve(__dirname, '..', 'scripts', 'audit_results', 'thorough_audit.json'),
  JSON.stringify({ generated: new Date().toISOString(), folderReports, allIssues }, null, 2)
);
console.log('\n\nSaved thorough_audit.json');
