const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const files = [
  'event-bottom-right',
  'bride-flower-3',
  'bg-flower-3',
  '1754648453_kdo54-bg-3',
  '1754403915_kdo56-flower-1'
];

async function run() {
  for (const name of files) {
    const pngPath = path.join('references', 'kadio-assets', 'harvested', name + '.png');
    const svgPath = path.join('references', 'kadio-assets', 'harvested', 'svg', name + '.svg');
    
    console.log(`\n=== ASSET: ${name} ===`);
    if (fs.existsSync(pngPath)) {
      const meta = await sharp(pngPath).metadata();
      const stats = await sharp(pngPath).stats();
      console.log(`PNG: ${meta.width}x${meta.height}, channels: ${meta.channels}`);
      console.log(`Dominant RGB:`, stats.dominant);
    }
    if (fs.existsSync(svgPath)) {
      const svg = fs.readFileSync(svgPath, 'utf8');
      const fills = svg.match(/fill="([^"]+)"/g) || [];
      console.log(`SVG fills count: ${fills.length}`);
      console.log(`Fills:`, fills.slice(0, 10));
    }
  }
}

run();
