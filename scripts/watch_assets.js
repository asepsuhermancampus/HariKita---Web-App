const fs = require('fs');
const path = require('path');
const { generateManifest } = require('./generate_asset_manifest');

const ROOT_DIR = path.join(__dirname, '..');
const ASSET_DIR = path.join(ROOT_DIR, 'public', 'assets', 'harikita');

if (!fs.existsSync(ASSET_DIR)) {
  console.error(`[Asset Watcher] Directory not found: ${ASSET_DIR}`);
  process.exit(1);
}

console.log(`[Asset Watcher] 👁️  Watching for asset changes in public/assets/harikita...`);

let debounceTimer = null;
const DEBOUNCE_DELAY_MS = 300;

function handleAssetChange(eventType, filename) {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    try {
      console.log(`[Asset Watcher] ⚡ Change detected (${eventType}: ${filename || 'unknown'}), auto-updating manifest...`);
      generateManifest();
      console.log(`[Asset Watcher] ✅ Manifest synced successfully.`);
    } catch (err) {
      console.error(`[Asset Watcher] ❌ Error updating manifest:`, err.message);
    }
  }, DEBOUNCE_DELAY_MS);
}

try {
  fs.watch(ASSET_DIR, { recursive: true }, handleAssetChange);
} catch (err) {
  console.error(`[Asset Watcher] Failed to initialize recursive watcher:`, err.message);
}
