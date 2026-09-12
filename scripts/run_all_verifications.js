const { execSync } = require('child_process');

console.log('===============================================================');
console.log('       HARIKITA MASTER QUALITY GATE & VERIFICATION SUITE       ');
console.log('===============================================================\n');

const testSuites = [
  { name: '1. Color Tokens & Typography Calibration', cmd: 'node scripts/verify_tokens.js' },
  { name: '2. Asset Scaffolding & Vector Standards', cmd: 'node scripts/verify_assets_complete.js' },
  { name: '3. Asset Catalog Manifest & TypeScript Schema', cmd: 'node scripts/verify_asset_manifest.js' },
  { name: '4. UI Component Library (15 Variants)', cmd: 'node scripts/verify_ui_components.js' },
  { name: '5. Mobile UI Components (6 Variants)', cmd: 'node scripts/verify_mobile_components.js' },
];

let failedCount = 0;

for (const suite of testSuites) {
  console.log(`\n▶ Running: ${suite.name}...`);
  try {
    const output = execSync(suite.cmd, { encoding: 'utf8' });
    console.log(output.trim());
    console.log(`✅ ${suite.name} PASSED.`);
  } catch (err) {
    console.error(`❌ ${suite.name} FAILED!`);
    if (err.stdout) console.error(err.stdout);
    if (err.stderr) console.error(err.stderr);
    failedCount++;
  }
}

// 6. Test Showcase Route HTTP 200
console.log('\n▶ Running: 6. Showcase Route HTTP Status Check...');
try {
  const httpCheckCmd = `node -e "fetch('http://localhost:3000/design-system-showcase').then(r => { if (r.status === 200) { console.log('HTTP 200 OK: Showcase route is live!'); process.exit(0); } else { console.error('Non-200 Status:', r.status); process.exit(1); } }).catch(e => { console.error('Fetch error:', e.message); process.exit(1); })"`;
  const output = execSync(httpCheckCmd, { encoding: 'utf8' });
  console.log(output.trim());
  console.log('✅ 6. Showcase Route HTTP Status Check PASSED.');
} catch (err) {
  console.error('❌ Showcase Route HTTP Status Check FAILED!');
  if (err.stdout) console.error(err.stdout);
  if (err.stderr) console.error(err.stderr);
  failedCount++;
}

console.log('\n===============================================================');
if (failedCount === 0) {
  console.log('🎉 ALL HARIKITA VERIFICATION GATES PASSED WITH 100% SUCCESS!');
  console.log('===============================================================\n');
  process.exit(0);
} else {
  console.error(`💥 ${failedCount} SUITE(S) FAILED. PLEASE FIX BEFORE COMMITTING.`);
  console.log('===============================================================\n');
  process.exit(1);
}
