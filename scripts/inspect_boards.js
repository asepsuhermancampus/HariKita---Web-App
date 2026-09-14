const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function inspectBoards() {
  const publicDir = path.join(__dirname, '..', 'public');
  const outDir = path.join(__dirname, '..', '.gemini-inspect');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const boards = ['HariKita-DesignSystem-General.png', 'HariKita-DesignSystem-Asset.png', 'HariKita-Design.png'];
  for (const b of boards) {
    const p = path.join(publicDir, b);
    const meta = await sharp(p).metadata();
    console.log(`Board ${b}: ${meta.width}x${meta.height}`);

    // Generate quadrants / sections to see contents clearly if needed
    // Also extract dominant colors or stats
    const stats = await sharp(p).stats();
    console.log(`  Dominant channels for ${b}: R avg=${stats.channels[0].mean.toFixed(1)}, G avg=${stats.channels[1].mean.toFixed(1)}, B avg=${stats.channels[2].mean.toFixed(1)}`);
  }
}

inspectBoards().catch(console.error);
