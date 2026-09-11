const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Test that ultra_fidelity_vectorizer_v4 exists and functions properly
const { vectorizeV4 } = require('./ultra_fidelity_vectorizer_v4');

async function test() {
  console.log('Testing V4 Vectorizer Engine...');

  // Test 1: Filigree corner
  const p1 = path.join(__dirname, '..', 'references', 'kadio-assets', 'harvested', 'event-top-left.png');
  const buf1 = fs.readFileSync(p1);
  const svg1 = await vectorizeV4(PNG.sync.read(buf1), 'event-top-left.png');
  
  if (!svg1.includes('<svg') || !svg1.includes('</svg>')) {
    throw new Error('Test 1 Failed: Invalid SVG output for filigree');
  }
  if (svg1.includes('fill="#9dc1fb"') || svg1.includes('<image')) {
    throw new Error('Test 1 Failed: Found blocked background plate or raster in filigree');
  }
  console.log('✅ Test 1 Passed: Filigree preserved hollow with pure vector');

  // Test 2: Botanical leaf sprig (not 3-band posterized)
  const p2 = path.join(__dirname, '..', 'references', 'kadio-assets', 'harvested', 'bride-flower-3.png');
  const buf2 = fs.readFileSync(p2);
  const svg2 = await vectorizeV4(PNG.sync.read(buf2), 'bride-flower-3.png');
  const fills2 = (svg2.match(/fill="([^"]+)"/g) || []).length;
  if (fills2 < 4) {
    throw new Error(`Test 2 Failed: Botanical sprig has only ${fills2} fills (expected >= 4)`);
  }
  console.log(`✅ Test 2 Passed: Botanical sprig has rich tonal depth (${fills2} layers)`);

  console.log('\nAll V4 Unit Tests Passed Successfully!');
}

test().catch(err => {
  console.error('Unit Test Failed:', err.message);
  process.exit(1);
});
