const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT_DIR, 'src', 'data', 'harikita-assets.json');
const TYPES_PATH = path.join(ROOT_DIR, 'src', 'types', 'harikita-asset.ts');
const LIB_PATH = path.join(ROOT_DIR, 'src', 'lib', 'harikita-assets.ts');

function verifyManifest() {
  console.log('=== VERIFYING HARIKITA ASSET MANIFEST & SCHEMA ===\n');

  let passed = true;

  if (!fs.existsSync(TYPES_PATH)) {
    console.error('❌ Missing src/types/harikita-asset.ts');
    passed = false;
  }

  if (!fs.existsSync(LIB_PATH)) {
    console.error('❌ Missing src/lib/harikita-assets.ts');
    passed = false;
  }

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Missing src/data/harikita-assets.json');
    passed = false;
    process.exit(1);
  }

  try {
    const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');
    const catalog = JSON.parse(raw);

    if (!Array.isArray(catalog) || catalog.length === 0) {
      console.error('❌ Manifest is empty or not an array');
      passed = false;
    } else {
      console.log(`Checking ${catalog.length} manifest entries...`);
      let missingFiles = 0;
      const categories = new Set();

      for (const item of catalog) {
        if (!item.id || !item.name || !item.category || !item.filePath) {
          console.error(`❌ Invalid manifest entry: ${JSON.stringify(item)}`);
          passed = false;
        }

        categories.add(item.category);
        const diskPath = path.join(ROOT_DIR, 'public', item.filePath);
        if (!fs.existsSync(diskPath)) {
          missingFiles++;
          if (missingFiles <= 5) console.error(`❌ File not found on disk: ${item.filePath}`);
        }
      }

      console.log(`Manifest spans ${categories.size} unique categories.`);
      if (missingFiles > 0) {
        console.error(`❌ ${missingFiles} manifest files missing on disk.`);
        passed = false;
      }
    }
  } catch (err) {
    console.error(`❌ Error parsing JSON manifest: ${err.message}`);
    passed = false;
  }

  if (passed) {
    console.log('✅ MANIFEST & SCHEMA VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.log('\n❌ Manifest verification failed.');
    process.exit(1);
  }
}

verifyManifest();
