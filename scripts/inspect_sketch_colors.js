const sharp = require('sharp');

async function test() {
  const { data, info } = await sharp('references/kadio-assets/harvested/1754403915_kdo56-flower-1.png').raw().toBuffer({ resolveWithObject: true });
  const samples = [];
  for (let y = 0; y < info.height; y += 10) {
    for (let x = 0; x < info.width; x += 10) {
      const idx = (y * info.width + x) * 4;
      if (data[idx+3] > 30) {
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        const diff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
        if (diff > 25) {
          samples.push({ x, y, r, g, b, hex: '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('') });
        }
      }
    }
  }
  console.log('Colored samples count:', samples.length);
  console.log('Sample colored points:', samples.slice(0, 10));
}

test();
