const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { generateManifest } = require('./generate_asset_manifest');

const ROOT_DIR = path.join(__dirname, '..');
const ASSET_DIR = path.join(ROOT_DIR, 'public', 'assets', 'harikita');

console.log('🚀 [Dev Runner] Initializing HariKita Dev Environment...');

// 1. Initial Synchronous Manifest Generation
try {
  generateManifest();
} catch (err) {
  console.error('[Dev Runner] ⚠️ Initial manifest generation failed:', err.message);
}

// 2. Real-time Asset Watcher
let debounceTimer = null;
const DEBOUNCE_DELAY_MS = 300;

if (fs.existsSync(ASSET_DIR)) {
  try {
    fs.watch(ASSET_DIR, { recursive: true }, (eventType, filename) => {
      if (debounceTimer) clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        try {
          console.log(`\n[Asset Watcher] ⚡ Detected ${eventType} on ${filename || 'file'} -> Auto-updating manifest...`);
          generateManifest();
          console.log('[Asset Watcher] ✅ Manifest synced. Next.js HMR will reflect changes.\n');
        } catch (err) {
          console.error('[Asset Watcher] ❌ Failed to update manifest:', err.message);
        }
      }, DEBOUNCE_DELAY_MS);
    });
    console.log('[Asset Watcher] 👁️  Active: Monitoring public/assets/harikita for live changes.');
  } catch (err) {
    console.warn('[Asset Watcher] ⚠️ Could not start recursive watcher:', err.message);
  }
} else {
  console.warn(`[Asset Watcher] ⚠️ Directory not found: ${ASSET_DIR}`);
}

// 3. Spawn Next.js Dev Server
const userArgs = process.argv.slice(2);
const nextArgs = ['next', 'dev', ...userArgs];

console.log(`[Dev Runner] 🌐 Starting Next.js: npx ${nextArgs.join(' ')}\n`);

const nextProc = spawn('npx', nextArgs, {
  cwd: ROOT_DIR,
  stdio: 'inherit',
  shell: true,
});

// Process Exit Handling
const cleanup = () => {
  if (nextProc && !nextProc.killed) {
    if (process.platform === 'win32') {
      try {
        spawn('taskkill', ['/pid', nextProc.pid.toString(), '/f', '/t']);
      } catch {
        nextProc.kill('SIGINT');
      }
    } else {
      nextProc.kill('SIGINT');
    }
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

nextProc.on('close', (code) => {
  process.exit(code || 0);
});
