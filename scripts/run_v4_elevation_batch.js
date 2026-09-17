const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const { vectorizeV4 } = require('./ultra_fidelity_vectorizer_v4');

const whitelistPath = path.join(__dirname, 'whitelist_registry.json');
const whitelist = new Set(JSON.parse(fs.readFileSync(whitelistPath, 'utf8')));

const harvestedSvgDir = path.join(__dirname, '..', 'references', 'kadio-assets', 'harvested', 'svg');
const harvestedPngDir = path.join(__dirname, '..', 'references', 'kadio-assets', 'harvested');

async function runBatch() {
  console.log('=== STARTING V4 BATCH AESTHETIC ELEVATION ===');
  const files = fs.readdirSync(harvestedSvgDir)
    .filter(f => f.endsWith('.svg') && !f.startsWith('proto_') && !f.startsWith('elevated_') && !f.startsWith('test-'));

  let elevatedCount = 0;
  let skippedWhitelist = 0;
  let skippedClean = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (whitelist.has(file)) {
      skippedWhitelist++;
      continue;
    }

    const baseName = file.replace('.svg', '');
    const pngPath = path.join(harvestedPngDir, baseName + '.png');
    const svgPath = path.join(harvestedSvgDir, file);

    if (!fs.existsSync(pngPath)) {
      continue;
    }

    const currentSvg = fs.readFileSync(svgPath, 'utf8');
    const pathCount = (currentSvg.match(/<path/g) || []).length;

    // Skip full background gradients
    const isBackgroundGradient = currentSvg.includes('<linearGradient') && currentSvg.includes('<rect') && 
      (file.startsWith('bg-') || file.includes('-bg') || file.startsWith('paper-') || file.startsWith('cover-bg') || file.startsWith('rsvp-bg'));
    if (isBackgroundGradient) {
      skippedClean++;
      continue;
    }

    // Determine if asset needs elevation
    const isFiligreeOrFrame = file.includes('frame') || file.includes('border') || file.includes('corner') || file.includes('top-left') || file.includes('top-right') || file.includes('bottom-left') || file.includes('bottom-right');
    const isFlattenedFloral = pathCount <= 3 && (file.includes('flower') || file.includes('leaf') || file.includes('rose') || file.includes('foliage') || file.includes('ornament'));
    const isFlower3Family = file.includes('flower-3') || file.includes('bg-bride-flower');

    if (!isFiligreeOrFrame && !isFlattenedFloral && !isFlower3Family) {
      skippedClean++;
      continue;
    }

    // Check PNG transparency
    const pngBuf = fs.readFileSync(pngPath);
    const png = PNG.sync.read(pngBuf);
    let hasTransparency = false;
    for (let p = 3; p < png.data.length; p += 16) {
      if (png.data[p] < 200) {
        hasTransparency = true;
        break;
      }
    }
    if (!hasTransparency) {
      skippedClean++;
      continue;
    }

    process.stdout.write(`[${i+1}/${files.length}] Elevating ${file}... `);
    try {
      const newSvg = await vectorizeV4(png, file);

      if (newSvg && newSvg.includes('<svg') && newSvg.includes('</svg>')) {
        fs.writeFileSync(svgPath, newSvg);
        const newPaths = (newSvg.match(/<path/g) || []).length;
        console.log(`✅ Success (${newPaths} paths, ${newSvg.length} bytes)`);
        elevatedCount++;
      } else {
        console.log(`⚠️ Skipped: Empty output`);
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  }

  console.log(`\n=== BATCH ELEVATION COMPLETE ===`);
  console.log(`Elevated: ${elevatedCount} assets`);
  console.log(`Skipped (Whitelisted): ${skippedWhitelist} assets`);
  console.log(`Skipped (Already Clean): ${skippedClean} assets`);
}

runBatch();
