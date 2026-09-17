const assert = require('assert');
const { classifyAsset, generateSemanticName } = require('./organize_harikita_assets');

console.log('Testing HariKita Asset Categorization Engine...');

// Test 1: Corner Rose
const c1 = classifyAsset('1754648453_kdo54-bg-3.svg', '<svg viewBox="0 0 1200 1200"><path fill="#f7f2ea"/></svg>');
assert.strictEqual(c1.category, 'floral', '1754648453_kdo54-bg-3.svg should be floral');
assert.strictEqual(c1.subCategory, 'corners', '1754648453_kdo54-bg-3.svg should be corners');
console.log('✅ Test 1 Passed: Corner floral classified correctly');

// Test 2: Filigree Corner
const c2 = classifyAsset('event-bottom-right.svg', '<svg viewBox="0 0 450 450"><path fill="#eef3fb"/></svg>');
assert.strictEqual(c2.category, 'frames', 'event-bottom-right.svg should be frames');
assert.strictEqual(c2.subCategory, 'filigree', 'event-bottom-right.svg should be filigree');
console.log('✅ Test 2 Passed: Filigree corner classified correctly');

// Test 3: Card Border
const c3 = classifyAsset('frame-2.svg', '<svg viewBox="0 0 1725 1725"><path fill="#cfb66e"/></svg>');
assert.strictEqual(c3.category, 'frames', 'frame-2.svg should be frames');
assert.strictEqual(c3.subCategory, 'borders', 'frame-2.svg should be borders');
console.log('✅ Test 3 Passed: Card border classified correctly');

// Test 4: Divider / Line
const c4 = classifyAsset('event-border-1.svg', '<svg viewBox="0 0 358 87"><path fill="#a65d00"/></svg>');
assert.strictEqual(c4.category, 'frames', 'event-border-1.svg should be frames');
assert.strictEqual(c4.subCategory, 'dividers', 'event-border-1.svg should be dividers');
console.log('✅ Test 4 Passed: Divider flourish classified correctly');

// Test 5: Gradient Background
const c5 = classifyAsset('1745992861_bg-kdo43.svg', '<svg><linearGradient id="bgGrad"/><rect width="600" height="900"/></svg>');
assert.strictEqual(c5.category, 'backgrounds', '1745992861_bg-kdo43.svg should be backgrounds');
assert.strictEqual(c5.subCategory, 'gradients', '1745992861_bg-kdo43.svg should be gradients');
console.log('✅ Test 5 Passed: Gradient background classified correctly');

// Test 6: Decorative Star / Glow
const c6 = classifyAsset('vector-2.svg', '<svg viewBox="0 0 100 100"><path fill="#f7f2ea"/></svg>');
assert.strictEqual(c6.category, 'decorative', 'vector-2.svg should be decorative');
assert.strictEqual(c6.subCategory, 'stars', 'vector-2.svg should be stars');
console.log('✅ Test 6 Passed: Decorative star classified correctly');

// Test 7: Semantic Name Generator
const name1 = generateSemanticName({ category: 'floral', subCategory: 'corners', descriptor: 'rose-ivory-english' }, 1);
assert.strictEqual(name1, 'rose-ivory-english-corner-01.svg', 'Semantic name should format correctly');
console.log('✅ Test 7 Passed: Semantic name generator formats correctly');

console.log('\nAll Unit Tests Passed Successfully!');
