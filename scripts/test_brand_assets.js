const fs = require('fs');
const assert = require('assert');

const files = [
  'public/brand/harikita-symbol.svg',
  'public/brand/harikita-logo-horizontal.svg',
  'public/brand/harikita-logo-stacked.svg',
  'public/favicon.svg'
];

for (const file of files) {
  assert(fs.existsSync(file), `File ${file} must exist`);
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('<svg'), `${file} must contain <svg`);
  assert(!content.includes('<image'), `${file} must not contain raster <image tags`);
  assert(!content.includes('data:image'), `${file} must not contain base64 bitmaps`);
}

console.log('✅ Task 1 SVG Asset Test Passed!');
