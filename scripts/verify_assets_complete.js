const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const ASSET_BASE = path.join(ROOT_DIR, 'public');
const MANIFEST_PATH = path.join(ROOT_DIR, 'src', 'data', 'harikita-assets.json');

function verifyAssets() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`❌ Manifest not found at: ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  console.log(`=== VERIFYING HARIKITA VISUAL ASSETS (${manifest.length} ASSETS IN MANIFEST) ===\n`);

  let missing = 0;
  let invalid = 0;

  for (const asset of manifest) {
    const fullPath = path.join(ASSET_BASE, asset.filePath);
    if (!fs.existsSync(fullPath)) {
      missing++;
      if (missing <= 10) console.error(`❌ Missing asset file: ${asset.filePath}`);
      continue;
    }

    const ext = path.extname(asset.filePath).toLowerCase();
    if (ext === '.svg') {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes('<svg') || !content.includes('</svg>')) {
        invalid++;
        console.error(`❌ Malformed SVG content: ${asset.filePath}`);
      }
      if (!content.includes('viewBox')) {
        invalid++;
        console.error(`❌ SVG missing viewBox: ${asset.filePath}`);
      }
    } else if (ext === '.webp') {
      const size = fs.statSync(fullPath).size;
      if (size < 100) {
        invalid++;
        console.error(`❌ WebP file suspiciously small (<100B): ${asset.filePath}`);
      }
    }
  }

  if (missing > 10) console.error(`... and ${missing - 10} more missing assets.`);

  const validCount = manifest.length - missing - invalid;
  console.log(`\nResults: ${validCount} / ${manifest.length} assets valid.`);
  if (missing === 0 && invalid === 0) {
    console.log(`✅ ALL ${manifest.length} ASSETS VERIFIED SUCCESSFULLY!`);
    process.exit(0);
  } else {
    console.log(`❌ Failed verification: ${missing} missing, ${invalid} invalid.`);
    process.exit(1);
  }
}

verifyAssets();

