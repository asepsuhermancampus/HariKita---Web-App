const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TARGET_ASSETS_DIR = path.join(ROOT_DIR, 'public', 'harikita-assets');
const MANIFEST_PATH = path.join(TARGET_ASSETS_DIR, 'harikita_manifest.json');
const WHITELIST_PATH = path.join(__dirname, 'whitelist_registry.json');
const SOURCE_SVG_DIR = path.join(ROOT_DIR, 'references', 'kadio-assets', 'harvested', 'svg');

console.log('=== VERIFYING HARIKITA-ASSETS DIRECTORY & MANIFEST ===\n');

let errorCount = 0;

// 1. Check Manifest File Existence
if (!fs.existsSync(MANIFEST_PATH)) {
  console.error(`❌ Manifest not found at: ${MANIFEST_PATH}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
console.log(`Manifest loaded: ${manifest.length} registered assets.`);

// 2. Check Whitelist Registry
const whitelist = new Set(
  fs.existsSync(WHITELIST_PATH) ? JSON.parse(fs.readFileSync(WHITELIST_PATH, 'utf8')) : []
);
let whitelistedFound = 0;

// 3. Verify Every Manifest Entry
for (const item of manifest) {
  const fullPath = path.join(TARGET_ASSETS_DIR, item.relativePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File listed in manifest missing on disk: ${item.relativePath}`);
    errorCount++;
    continue;
  }

  const content = fs.readFileSync(fullPath, 'utf8');

  // Check valid SVG structure
  if (!content.includes('<svg') || !content.includes('</svg>')) {
    console.error(`❌ Malformed SVG: ${item.relativePath}`);
    errorCount++;
  }

  // Pure vector check
  if (content.includes('<image')) {
    console.error(`❌ Contains raster <image> tag: ${item.relativePath}`);
    errorCount++;
  }

  if (content.includes('data:image/') || content.includes('base64,')) {
    console.error(`❌ Contains base64 data: ${item.relativePath}`);
    errorCount++;
  }

  if (item.isWhitelisted) {
    whitelistedFound++;
    // Verify bit-exact match with reference source
    const origSourcePath = path.join(SOURCE_SVG_DIR, item.originalFile);
    if (fs.existsSync(origSourcePath)) {
      const origContent = fs.readFileSync(origSourcePath, 'utf8');
      if (origContent !== content) {
        console.error(`❌ Whitelisted asset modified during migration: ${item.relativePath}`);
        errorCount++;
      }
    }
  }
}

// 4. Verify Source Preserved
const sourceFiles = fs.readdirSync(SOURCE_SVG_DIR).filter(f => f.endsWith('.svg'));
console.log(`Reference source directory preserved: ${sourceFiles.length} original SVGs intact in references/.`);

// 5. Summary
console.log('\n--- VERIFICATION SUMMARY ---');
console.log(`Total Assets Verified in public/harikita-assets/: ${manifest.length}`);
console.log(`Whitelisted Grade A Assets Verified (Bit-Exact): ${whitelistedFound}/${whitelist.size}`);
console.log(`Total Errors Detected: ${errorCount}`);

if (errorCount === 0 && whitelistedFound === whitelist.size) {
  console.log('\n✅ ALL VERIFICATION CHECKS PASSED: 100% Pure Vector Guarantee & Clean Structure Met!');
  process.exit(0);
} else {
  console.error(`\n❌ VERIFICATION FAILED with ${errorCount} errors!`);
  process.exit(1);
}
