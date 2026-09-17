const sharp = require('sharp');
const fs = require('fs');
const assert = require('assert');

async function test() {
  const icon192 = await sharp('public/icons/icon-192x192.png').metadata();
  assert.strictEqual(icon192.width, 192);
  assert.strictEqual(icon192.height, 192);

  const icon512 = await sharp('public/icons/icon-512x512.png').metadata();
  assert.strictEqual(icon512.width, 512);
  assert.strictEqual(icon512.height, 512);

  const appleTouch = await sharp('public/icons/apple-touch-icon.png').metadata();
  assert.strictEqual(appleTouch.width, 180);
  assert.strictEqual(appleTouch.height, 180);

  const manifest = JSON.parse(fs.readFileSync('public/manifest.webmanifest', 'utf8'));
  assert(manifest.name.includes('HariKita'), 'manifest must contain HariKita name');
  assert.strictEqual(manifest.theme_color, '#FAF8F5');
  assert.strictEqual(manifest.background_color, '#FAF8F5');

  console.log('✅ Task 2 PWA Icon Test Passed!');
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
