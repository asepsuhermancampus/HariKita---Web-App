const sharp = require('sharp');
const path = require('path');

async function checkColors(file) {
  const pngPath = path.join('references', 'kadio-assets', 'harvested', file + '.png');
  const { data, info } = await sharp(pngPath).raw().toBuffer({ resolveWithObject: true });
  const colorMap = new Map();
  let opaqueCount = 0;
  let semiCount = 0;
  let transparentCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i+3];
    if (a < 20) {
      transparentCount++;
    } else if (a < 220) {
      semiCount++;
    } else {
      opaqueCount++;
    }

    if (a > 20) {
      const r = Math.round(data[i] / 16) * 16;
      const g = Math.round(data[i+1] / 16) * 16;
      const b = Math.round(data[i+2] / 16) * 16;
      const key = `${r},${g},${b}`;
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }
  }

  console.log(`\n=== ASSET: ${file} ===`);
  console.log(`Alpha distribution -> Transparent(<20): ${transparentCount}, Semi(20-220): ${semiCount}, Opaque(>220): ${opaqueCount}`);
  const sorted = [...colorMap.entries()].sort((a,b) => b[1] - a[1]).slice(0, 5);
  console.log('Top RGB groups:', sorted);
}

async function main() {
  await checkColors('event-bottom-right');
  await checkColors('bride-flower-3');
  await checkColors('bg-flower-3');
  await checkColors('1754648453_kdo54-bg-3');
  await checkColors('1754403915_kdo56-flower-1');
}

main();
