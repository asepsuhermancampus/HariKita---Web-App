// audit_svg_shapes.js
// Audits ALL SVGs in public/harikita-assets/ to validate visual categorization
// by checking viewBox dimensions, path count, and detecting potential misplacements.

const fs = require('fs');
const path = require('path');

function getAllSVGs(dir, base) {
  let results = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const rel = path.relative(base, full);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getAllSVGs(full, base));
    } else if (item.endsWith('.svg')) {
      results.push({ file: item, fullPath: full, relPath: rel, folder: path.dirname(rel) });
    }
  }
  return results;
}

const BASE = path.resolve(__dirname, '..', 'public', 'harikita-assets');
const svgs = getAllSVGs(BASE, BASE);

const results = [];
svgs.forEach(svg => {
  try {
    const content = fs.readFileSync(svg.fullPath, 'utf8');
    
    // Extract viewBox
    const vbMatch = content.match(/viewBox="([^"]+)"/);
    let w = 0, h = 0;
    if (vbMatch) {
      const parts = vbMatch[1].trim().split(/[\s,]+/);
      w = parseFloat(parts[2]) || 0;
      h = parseFloat(parts[3]) || 0;
    }
    // Fallback to width/height attrs
    if (w === 0) {
      const wm = content.match(/\bwidth="([^"]+)"/);
      const hm = content.match(/\bheight="([^"]+)"/);
      if (wm) w = parseFloat(wm[1]) || 0;
      if (hm) h = parseFloat(hm[1]) || 0;
    }

    const ratio = w > 0 ? h / w : 0;
    const pathCount = (content.match(/<path/g) || []).length;
    const rectCount = (content.match(/<rect/g) || []).length;
    const hasImage = content.includes('<image');
    const hasBase64 = content.includes('base64');
    const hasGradient = content.includes('<linearGradient') || content.includes('<radialGradient');
    const hasClipPath = content.includes('<clipPath');
    const sizeKb = (fs.statSync(svg.fullPath).size / 1024).toFixed(1);

    // Shape classification
    let shapeHint;
    if (ratio < 0.35) shapeHint = 'WIDE-BANNER';       // very wide (headers, dividers)
    else if (ratio < 0.7) shapeHint = 'landscape';      // wider than tall
    else if (ratio > 3.0) shapeHint = 'TALL-STRIP';     // super tall (side cascades)
    else if (ratio > 2.0) shapeHint = 'tall-vertical';  // tall
    else if (ratio > 1.3) shapeHint = 'portrait';       // taller than wide
    else shapeHint = 'square';                           // roughly square

    results.push({
      file: svg.file,
      folder: svg.folder.replace(/\\/g, '/'),
      w: Math.round(w),
      h: Math.round(h),
      ratio: parseFloat(ratio.toFixed(2)),
      shapeHint,
      pathCount,
      rectCount,
      hasImage,
      hasBase64,
      hasGradient,
      hasClipPath,
      sizeKb
    });
  } catch(e) {
    results.push({ file: svg.file, folder: svg.folder.replace(/\\/g, '/'), error: e.message });
  }
});

// === OUTPUT BY FOLDER ===
const byFolder = {};
results.forEach(r => {
  const key = r.folder;
  if (!byFolder[key]) byFolder[key] = [];
  byFolder[key].push(r);
});

console.log('\n===== SVG SHAPE AUDIT BY FOLDER =====\n');

Object.entries(byFolder).sort().forEach(([folder, items]) => {
  const shapeDist = {};
  let errorCount = 0;
  items.forEach(i => {
    if (i.error) errorCount++;
    else shapeDist[i.shapeHint] = (shapeDist[i.shapeHint] || 0) + 1;
  });

  console.log('--- ' + folder + ' (' + items.length + ' files) ---');
  console.log('  Shapes: ' + JSON.stringify(shapeDist));
  if (errorCount > 0) console.log('  ERRORS: ' + errorCount);
  console.log('  Samples:');
  items.slice(0, 8).forEach(i => {
    if (i.error) {
      console.log('    [ERR] ' + i.file + ': ' + i.error);
    } else {
      const flags = [];
      if (i.hasImage) flags.push('HAS-IMAGE');
      if (i.hasBase64) flags.push('BASE64');
      const flagStr = flags.length > 0 ? ' [' + flags.join(', ') + ']' : '';
      console.log('    ' + i.file);
      console.log('      ' + i.w + 'x' + i.h + ' | ratio:' + i.ratio + ' | ' + i.shapeHint + ' | paths:' + i.pathCount + ' | ' + i.sizeKb + 'KB' + flagStr);
    }
  });
  if (items.length > 8) console.log('  ...+' + (items.length - 8) + ' more files');
  console.log('');
});

// === MISPLACEMENT DETECTION ===
console.log('\n===== POTENTIAL MISPLACEMENTS =====\n');

const center = byFolder['floral/centerpieces'] || [];
const wrongCenter = center.filter(i => !i.error && (i.shapeHint === 'WIDE-BANNER' || i.shapeHint === 'TALL-STRIP' || i.shapeHint === 'tall-vertical'));
console.log('floral/centerpieces with NON-square/portrait shape (' + wrongCenter.length + '):');
wrongCenter.forEach(i => console.log('  ' + i.file + ' ' + i.w + 'x' + i.h + ' => ' + i.shapeHint));

const cascades = byFolder['floral/side-cascades'] || [];
const wrongCasc = cascades.filter(i => !i.error && (i.shapeHint === 'WIDE-BANNER' || i.shapeHint === 'landscape' || i.shapeHint === 'square'));
console.log('\nfloral/side-cascades with NON-tall shape (' + wrongCasc.length + '):');
wrongCasc.forEach(i => console.log('  ' + i.file + ' ' + i.w + 'x' + i.h + ' => ' + i.shapeHint));

const headers = byFolder['floral/headers-garlands'] || [];
const wrongHead = headers.filter(i => !i.error && i.shapeHint !== 'WIDE-BANNER' && i.shapeHint !== 'landscape');
console.log('\nfloral/headers-garlands with NON-wide shape (' + wrongHead.length + '):');
wrongHead.forEach(i => console.log('  ' + i.file + ' ' + i.w + 'x' + i.h + ' => ' + i.shapeHint));

const corners = byFolder['floral/corners'] || [];
const wrongCorners = corners.filter(i => !i.error && i.shapeHint === 'WIDE-BANNER');
console.log('\nfloral/corners with WIDE-BANNER shape (' + wrongCorners.length + '):');
wrongCorners.forEach(i => console.log('  ' + i.file + ' ' + i.w + 'x' + i.h + ' => ' + i.shapeHint));

// === SIZE OUTLIERS ===
console.log('\n===== SIZE OUTLIERS (>500KB - possibly PNG wrapped) =====');
results.filter(i => !i.error && parseFloat(i.sizeKb) > 500).forEach(i => {
  console.log('  ' + i.folder + '/' + i.file + ' ' + i.sizeKb + 'KB (paths:' + i.pathCount + ')');
});

// === HIGH PATH COUNT (complex, might be original-class worthy) =====
console.log('\n===== HIGH PATH COUNT (>50 paths) =====');
results.filter(i => !i.error && i.pathCount > 50).sort((a, b) => b.pathCount - a.pathCount).slice(0, 20).forEach(i => {
  console.log('  ' + i.folder + '/' + i.file + ' paths:' + i.pathCount + ' ' + i.sizeKb + 'KB');
});

// Save JSON
const outputPath = path.resolve(__dirname, '..', 'scripts', 'audit_results', 'svg_shape_audit.json');
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify({ generated: new Date().toISOString(), total: results.length, byFolder: Object.fromEntries(Object.entries(byFolder).map(([k, v]) => [k, v.length])), items: results }, null, 2));
console.log('\nFull audit saved to: scripts/audit_results/svg_shape_audit.json');
