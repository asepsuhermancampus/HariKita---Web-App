const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { generateManifest } = require('./generate_asset_manifest');

const ROOT_DIR = path.join(__dirname, '..');
const ASSET_DIR = path.join(ROOT_DIR, 'public', 'assets', 'harikita');

console.log('🚀 [Dev Runner] Initializing HariKita Dev Environment...');

// 0. Bersihkan cache Next.js agar tidak bercampur dengan hasil `next build`/`next start`.
//    Cache `.next` campuran (dev + produksi) menyebabkan error seperti
//    "Cannot find module './xxxx.js'" / "MODULE_NOT_FOUND".
//    Set KEEP_NEXT_CACHE=1 untuk melewati (dev lebih cepat, tetapi berisiko bila
//    pernah menjalankan `build`).
const nextDir = path.join(ROOT_DIR, '.next');
if (process.env.KEEP_NEXT_CACHE !== '1') {
  try {
    if (fs.existsSync(nextDir)) {
      fs.rmSync(nextDir, { recursive: true, force: true });
      console.log('[Dev Runner] 🧹 Cleared .next cache (fresh dev build).');
    }
  } catch (err) {
    console.warn('[Dev Runner] ⚠️ Gagal membersihkan .next:', err.message);
  }
}

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

// 3. Ensure .next/routes-manifest.json exists (prevents Windows ENOENT in dev mode)
const routesManifestPath = path.join(nextDir, 'routes-manifest.json');
try {
  if (!fs.existsSync(nextDir)) {
    fs.mkdirSync(nextDir, { recursive: true });
  }
  if (!fs.existsSync(routesManifestPath)) {
    fs.writeFileSync(
      routesManifestPath,
      JSON.stringify(
        {
          version: 3,
          pages404: true,
          caseSensitive: false,
          basePath: '',
          redirects: [],
          headers: [],
          dynamicRoutes: [],
          staticRoutes: [],
          dataRoutes: [],
          rsc: {
            header: 'RSC',
            varyHeader: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch',
            prefetchHeader: 'Next-Router-Prefetch',
            didPostponeHeader: 'x-nextjs-postponed',
            contentTypeHeader: 'text/x-component',
          },
        },
        null,
        2
      )
    );
  }
} catch (manifestErr) {
  // non-blocking
}

// 4. Spawn Next.js Dev Server
const userArgs = process.argv.slice(2);
const nextArgs = ['next', 'dev', ...userArgs];

// Peringatan bila port dev sudah dipakai (mencegah dua instance dev bentrok di .next).
const portArg = process.env.PORT || '3000';
const net = require('net');
const probe = net.createServer();
probe.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`\n⚠️  Port ${portArg} sudah dipakai (mungkin dev server lain masih berjalan).`);
    console.warn('    Hentikan yang lama (Ctrl+C) atau jalankan dengan port lain: npm run dev -- -p 3001\n');
  }
});
probe.once('listening', () => probe.close());
probe.listen(Number(portArg), '127.0.0.1');

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
