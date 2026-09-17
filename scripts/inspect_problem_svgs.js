// inspect_problem_svgs.js  
// Inspect specific SVGs that are likely misplaced or unusual
const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..', 'public', 'harikita-assets');

function inspect(relPath, label) {
  const fullPath = path.join(BASE, relPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const vb = content.match(/viewBox="([^"]+)"/);
  let dims = 'no-viewBox';
  if (vb) {
    const p = vb[1].trim().split(/[\s,]+/);
    const w = parseFloat(p[2]);
    const h = parseFloat(p[3]);
    const r = (h/w).toFixed(2);
    dims = w + 'x' + h + ' ratio:' + r;
  }
  const pathCount = (content.match(/<path/g) || []).length;
  const hasImage = content.includes('<image');
  const hasBase64 = content.includes('base64');
  const sizeKb = (fs.statSync(fullPath).size / 1024).toFixed(1);
  
  console.log('\n=== ' + label + ': ' + relPath + ' ===');
  console.log('  Dims: ' + dims + ' | Paths:' + pathCount + ' | Size:' + sizeKb + 'KB');
  console.log('  hasImage:' + hasImage + ' hasBase64:' + hasBase64);
  // Print first 400 chars of SVG
  console.log('  SVG preview: ' + content.substring(0, 400).replace(/\n/g, ' ').substring(0, 400));
}

// Check cascade that is "square" shaped
inspect('floral/side-cascades/cascade-side-sage-01.svg', 'SQUARE SHAPE in cascades');
inspect('floral/side-cascades/cascade-side-sage-18.svg', 'SQUARE SHAPE in cascades 2');

// Check some large centerpieces 
inspect('floral/centerpieces/centerpiece-bouquet-terracotta-64.svg', 'HUGE 1363KB centerpiece');
inspect('floral/centerpieces/centerpiece-bouquet-terracotta-84.svg', 'LARGE 571KB 1-path centerpiece');
inspect('floral/centerpieces/centerpiece-bouquet-blush-60.svg', 'BLUSH centerpiece');
inspect('floral/centerpieces/centerpiece-bouquet-iceblue-74.svg', 'ICEBLUE centerpiece');

// Non-wide items in dividers
console.log('\n=== Non-wide dividers ===');
const divDir = path.join(BASE, 'frames', 'dividers-horizontal');
fs.readdirSync(divDir).filter(f => f.endsWith('.svg')).forEach(f => {
  const content = fs.readFileSync(path.join(divDir, f), 'utf8');
  const vb = content.match(/viewBox="([^"]+)"/);
  if (vb) {
    const p = vb[1].trim().split(/[\s,]+/);
    const w = parseFloat(p[2]);
    const h = parseFloat(p[3]);
    const r = h/w;
    if (r > 0.8) {
      console.log('  ' + f + ' ' + w + 'x' + h + ' ratio:' + r.toFixed(2));
      const snippet = content.substring(0, 200).replace(/\n/g, ' ');
      console.log('    ' + snippet);
    }
  }
});

// Check corners - what do they look like?
console.log('\n=== Floral corners ===');
const cornerDir = path.join(BASE, 'floral', 'corners');
fs.readdirSync(cornerDir).filter(f => f.endsWith('.svg')).forEach(f => {
  const content = fs.readFileSync(path.join(cornerDir, f), 'utf8');
  const vb = content.match(/viewBox="([^"]+)"/);
  if (vb) {
    const p = vb[1].trim().split(/[\s,]+/);
    const w = parseFloat(p[2]);
    const h = parseFloat(p[3]);
    const r = (h/w).toFixed(2);
    const pathCount = (content.match(/<path/g) || []).length;
    const sizeKb = (fs.statSync(path.join(cornerDir, f)).size / 1024).toFixed(1);
    console.log('  ' + f + ' ' + w + 'x' + h + ' ratio:' + r + ' paths:' + pathCount + ' ' + sizeKb + 'KB');
  }
});

// Check backgrounds
console.log('\n=== Backgrounds ===');
const bgDirs = ['backgrounds/gradients', 'backgrounds/textures'];
bgDirs.forEach(dir => {
  const d = path.join(BASE, dir);
  console.log('\n  --- ' + dir + ' ---');
  fs.readdirSync(d).filter(f => f.endsWith('.svg')).slice(0, 5).forEach(f => {
    const content = fs.readFileSync(path.join(d, f), 'utf8');
    const vb = content.match(/viewBox="([^"]+)"/);
    let dims = '-';
    if (vb) {
      const p = vb[1].trim().split(/[\s,]+/);
      dims = p[2] + 'x' + p[3];
    }
    const pathCount = (content.match(/<path/g) || []).length;
    const sizeKb = (fs.statSync(path.join(d, f)).size / 1024).toFixed(1);
    console.log('    ' + f + ' ' + dims + ' paths:' + pathCount + ' ' + sizeKb + 'KB');
    console.log('    ' + content.substring(0, 200).replace(/\n/g, ' '));
  });
});
