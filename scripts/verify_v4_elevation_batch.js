const fs = require('fs');
const path = require('path');

const whitelistPath = path.join(__dirname, 'whitelist_registry.json');
const whitelist = new Set(JSON.parse(fs.readFileSync(whitelistPath, 'utf8')));

const harvestedSvgDir = path.join(__dirname, '..', 'references', 'kadio-assets', 'harvested', 'svg');

console.log('=== VERIFYING V4 ELEVATION BATCH & WHOLE LIBRARY ===');

const allSvgFiles = fs.readdirSync(harvestedSvgDir).filter(f => f.endsWith('.svg'));
console.log(`Total SVG files in library: ${allSvgFiles.length}`);

let errorCount = 0;
let rasterImageCount = 0;
let base64Count = 0;
let malformedXmlCount = 0;
let emptyCount = 0;
let whitelistedCount = 0;

for (const file of allSvgFiles) {
  const filePath = path.join(harvestedSvgDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  if (whitelist.has(file)) {
    whitelistedCount++;
  }

  if (content.length < 50) {
    console.error(`❌ Empty or too small: ${file} (${content.length} bytes)`);
    emptyCount++;
    errorCount++;
  }

  if (content.includes('<image')) {
    console.error(`❌ Contains raster <image> tag: ${file}`);
    rasterImageCount++;
    errorCount++;
  }

  if (content.includes('data:image/') || content.includes('base64,')) {
    console.error(`❌ Contains base64 data: ${file}`);
    base64Count++;
    errorCount++;
  }

  if (!content.includes('<svg') || !content.includes('</svg>')) {
    console.error(`❌ Malformed SVG structure: ${file}`);
    malformedXmlCount++;
    errorCount++;
  }
}

console.log('\n--- VERIFICATION SUMMARY ---');
console.log(`Total Files Checked: ${allSvgFiles.length}`);
console.log(`Whitelisted Protected Assets Verified: ${whitelistedCount}`);
console.log(`Raster <image> tags: ${rasterImageCount}`);
console.log(`Base64 data occurrences: ${base64Count}`);
console.log(`Malformed XML structures: ${malformedXmlCount}`);
console.log(`Empty/Invalid files: ${emptyCount}`);

if (errorCount === 0) {
  console.log('\n✅ ALL VERIFICATION CHECKS PASSED: 100% Pure Vector Guarantee Met!');
  process.exit(0);
} else {
  console.error(`\n❌ VERIFICATION FAILED with ${errorCount} errors!`);
  process.exit(1);
}
