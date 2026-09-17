// scripts/test_theme_asset_registry.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// 1. Verify module exists
let registryModule;
try {
  registryModule = require('../src/lib/templates/themeAssetRegistry.ts');
} catch (e) {
  // If ts-node/tsx needed or transpiled
  try {
    const tsx = require('tsx/cjs/api');
    registryModule = tsx.require('../src/lib/templates/themeAssetRegistry.ts', __filename);
  } catch (err) {
    console.error("FAIL: Cannot load themeAssetRegistry module:", err.message);
    process.exit(1);
  }
}

const { THEME_ASSET_REGISTRY, DEFAULT_ARCHETYPE_FALLBACKS, getThemeAssets } = registryModule;

assert(THEME_ASSET_REGISTRY, "THEME_ASSET_REGISTRY must be defined");
assert(DEFAULT_ARCHETYPE_FALLBACKS, "DEFAULT_ARCHETYPE_FALLBACKS must be defined");
assert(typeof getThemeAssets === 'function', "getThemeAssets must be a function");

// Check 8 archetype fallbacks
const requiredArchetypes = [
  'botanical', 'javanese', 'islamic', 'minimalist',
  'rose-gold', 'celestial', 'rustic', 'cute-illustrated'
];
requiredArchetypes.forEach(arch => {
  const fallback = DEFAULT_ARCHETYPE_FALLBACKS[arch];
  assert(fallback, `DEFAULT_ARCHETYPE_FALLBACKS must contain ${arch}`);
  assert(fallback.heroCenterpiece, `Fallback for ${arch} must have heroCenterpiece`);
  assert(fallback.sectionDivider, `Fallback for ${arch} must have sectionDivider`);
});

// Check that every asset path actually exists in public/
const publicDir = path.resolve(__dirname, '../public');
let checkedCount = 0;

for (const [themeId, bundle] of Object.entries(THEME_ASSET_REGISTRY)) {
  for (const [key, relativePath] of Object.entries(bundle)) {
    if (!relativePath) continue;
    if (typeof relativePath === 'string') {
      const fullPath = path.join(publicDir, relativePath.replace(/^\//, ''));
      assert(fs.existsSync(fullPath), `Theme '${themeId}' property '${key}' points to missing file: ${fullPath}`);
      const stat = fs.statSync(fullPath);
      assert(stat.size > 0, `Theme '${themeId}' property '${key}' file is empty: ${fullPath}`);
      checkedCount++;
    }
  }
}

console.log(`PASS: All checked ${checkedCount} theme assets physically exist on disk and are valid!`);
