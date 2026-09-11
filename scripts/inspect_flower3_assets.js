const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const files = [
  'bg-bride-flower-1',
  'bg-bride-flower-2',
  'bg-bride-flower-3',
  'event-flower-3',
  'flower-3',
  'index-flower-3',
  'story-flower-3',
  '1748925440_flower-3-44',
  '1753942874_bg-flower-3',
  '1754404018_kdo56-flower-3',
  '1755675618_kdo58-flower-3'
];

async function run() {
  for (const f of files) {
    const p = path.join('references', 'kadio-assets', 'harvested', f + '.png');
    if (fs.existsSync(p)) {
      const meta = await sharp(p).metadata();
      const stats = await sharp(p).stats();
      console.log(`${f}: ${meta.width}x${meta.height}, dominant:`, stats.dominant);
    }
  }
}

run();
