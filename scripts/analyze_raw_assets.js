const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BASE_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara');

async function analyze() {
  console.log('=== ANALYZING REFACTOR_DIR_SEMENTARA ===\n');
  const subdirs = fs.readdirSync(BASE_DIR);
  let totalFiles = 0;

  for (const subdir of subdirs) {
    const fullSubdirPath = path.join(BASE_DIR, subdir);
    const stat = fs.statSync(fullSubdirPath);
    if (!stat.isDirectory()) continue;

    const files = fs.readdirSync(fullSubdirPath);
    console.log(`\n📁 [${subdir}] (${files.length} files):`);

    for (const file of files) {
      totalFiles++;
      const filePath = path.join(fullSubdirPath, file);
      const fStat = fs.statSync(filePath);
      const ext = path.extname(file).toLowerCase();
      
      let metaInfo = `${(fStat.size / 1024).toFixed(1)} KB`;
      if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
        try {
          const meta = await sharp(filePath).metadata();
          metaInfo += ` | ${meta.width}x${meta.height} (${meta.format})`;
        } catch (e) {
          metaInfo += ` | sharp error: ${e.message}`;
        }
      } else if (ext === '.svg') {
        const content = fs.readFileSync(filePath, 'utf8');
        const viewBoxMatch = content.match(/viewBox=["']([^"']+)["']/i);
        const vb = viewBoxMatch ? viewBoxMatch[1] : 'no viewBox';
        metaInfo += ` | SVG (viewBox: ${vb})`;
      }
      console.log(`  - ${file} (${metaInfo})`);
    }
  }

  console.log(`\nTotal raw files in refactor_dir_sementara: ${totalFiles}`);

  console.log('\n=== ANALYZING MAIN PNG BOARDS IN /public ===\n');
  const publicDir = path.join(__dirname, '..', 'public');
  const mainFiles = [
    'HariKita-Design.png',
    'HariKita-DesignSystem-General.png',
    'HariKita-DesignSystem-Asset.png'
  ];

  for (const mf of mainFiles) {
    const mfPath = path.join(publicDir, mf);
    if (fs.existsSync(mfPath)) {
      const fStat = fs.statSync(mfPath);
      const meta = await sharp(mfPath).metadata();
      console.log(`🖼️ ${mf}: ${(fStat.size / 1024 / 1024).toFixed(2)} MB | ${meta.width}x${meta.height} | format: ${meta.format} | channels: ${meta.channels}`);
    } else {
      console.log(`❌ ${mf}: Not found in public!`);
    }
  }
}

analyze().catch(err => {
  console.error(err);
  process.exit(1);
});
