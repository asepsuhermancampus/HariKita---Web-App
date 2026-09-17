const sharp = require('sharp');

async function inspectRibbon() {
  const { data, info } = await sharp('references/kadio-assets/harvested/bg-flower-3.png').raw().toBuffer({ resolveWithObject: true });
  console.log('bg-flower-3 dimensions:', info.width, info.height);

  // Ribbon is in the top half (y: 0 to 250, x: 50 to 350)
  const ribbonColors = new Map();
  let minL = 255, maxL = 0;
  for (let y = 0; y < 200; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 4;
      if (data[idx+3] > 40) {
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 150) { // bright ribbon area
          if (lum < minL) minL = lum;
          if (lum > maxL) maxL = lum;
          const k = `${Math.round(r/8)*8},${Math.round(g/8)*8},${Math.round(b/8)*8}`;
          ribbonColors.set(k, (ribbonColors.get(k) || 0) + 1);
        }
      }
    }
  }

  console.log(`Ribbon Lum range: ${minL} to ${maxL}`);
  const sorted = [...ribbonColors.entries()].sort((a,b)=>b[1]-a[1]).slice(0, 10);
  console.log('Top ribbon colors:', sorted);
}

inspectRibbon();
