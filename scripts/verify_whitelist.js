const fs = require('fs');
const path = require('path');

const whitelistPath = path.join(__dirname, 'whitelist_registry.json');
const svgDir = path.join(__dirname, '..', 'references', 'kadio-assets', 'harvested', 'svg');

const list = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));
console.log(`Verifying ${list.length} whitelisted assets...`);

let passed = 0;
for (const item of list) {
  const p = path.join(svgDir, item);
  if (!fs.existsSync(p)) {
    console.error(`FAIL: File missing -> ${item}`);
    process.exit(1);
  }
  const content = fs.readFileSync(p, 'utf8');
  if (content.length < 100) {
    console.error(`FAIL: File too small / empty -> ${item} (${content.length} bytes)`);
    process.exit(1);
  }
  if (!content.includes('<svg') || !content.includes('</svg>')) {
    console.error(`FAIL: Invalid SVG tags -> ${item}`);
    process.exit(1);
  }
  if (content.includes('<image') || content.includes('data:image/')) {
    console.error(`FAIL: Raster artifact found -> ${item}`);
    process.exit(1);
  }
  console.log(`✅ Verified: ${item} (${content.length} bytes)`);
  passed++;
}

console.log(`\nAll ${passed}/${list.length} Whitelisted Assets 100% Locked & Verified!`);
