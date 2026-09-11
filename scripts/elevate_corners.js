const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const potrace = require('potrace');

function upscaleBilinear(srcPng, scale = 2.5) {
  const targetW = Math.round(srcPng.width * scale);
  const targetH = Math.round(srcPng.height * scale);
  const dstPng = new PNG({ width: targetW, height: targetH });

  for (let y = 0; y < targetH; y++) {
    const srcY = y / scale;
    const y0 = Math.floor(srcY);
    const y1 = Math.min(srcPng.height - 1, y0 + 1);
    const dy = srcY - y0;

    for (let x = 0; x < targetW; x++) {
      const srcX = x / scale;
      const x0 = Math.floor(srcX);
      const x1 = Math.min(srcPng.width - 1, x0 + 1);
      const dx = srcX - x0;

      const idx00 = (srcPng.width * y0 + x0) << 2;
      const idx10 = (srcPng.width * y0 + x1) << 2;
      const idx01 = (srcPng.width * y1 + x0) << 2;
      const idx11 = (srcPng.width * y1 + x1) << 2;

      const dstIdx = (targetW * y + x) << 2;

      for (let c = 0; c < 4; c++) {
        const val0 = srcPng.data[idx00 + c] * (1 - dx) + srcPng.data[idx10 + c] * dx;
        const val1 = srcPng.data[idx01 + c] * (1 - dx) + srcPng.data[idx11 + c] * dx;
        dstPng.data[dstIdx + c] = Math.round(val0 * (1 - dy) + val1 * dy);
      }
    }
  }
  return dstPng;
}

function traceMaskBuffer(maskPng, color, optTolerance = 0.18, turdSize = 3) {
  return new Promise((resolve) => {
    const buf = PNG.sync.write(maskPng);
    potrace.trace(
      buf,
      { threshold: 128, optTolerance, turdSize, color },
      (err, svg) => {
        if (err || !svg) return resolve(null);
        const match = svg.match(/d="([^"]+)"/);
        resolve(match && match[1] ? { color, d: match[1] } : null);
      }
    );
  });
}

async function elevateFiligreeCorner(name) {
  const pngPath = path.join('references', 'kadio-assets', 'harvested', name + '.png');
  if (!fs.existsSync(pngPath)) return;
  const buf = fs.readFileSync(pngPath);
  const upPng = upscaleBilinear(PNG.sync.read(buf), 2.5);

  const coreMask = new PNG({ width: upPng.width, height: upPng.height });
  const highMask = new PNG({ width: upPng.width, height: upPng.height });
  coreMask.data.fill(255);
  highMask.data.fill(255);

  for (let i = 0; i < upPng.data.length; i += 4) {
    const a = upPng.data[i + 3];
    if (a >= 80) {
      coreMask.data[i] = 0; coreMask.data[i + 1] = 0; coreMask.data[i + 2] = 0; coreMask.data[i + 3] = 255;
    }
    if (a >= 165) {
      highMask.data[i] = 0; highMask.data[i + 1] = 0; highMask.data[i + 2] = 0; highMask.data[i + 3] = 255;
    }
  }

  const [resCore, resHigh] = await Promise.all([
    traceMaskBuffer(coreMask, '#eef3fb', 0.18, 3),
    traceMaskBuffer(highMask, '#ffffff', 0.18, 3),
  ]);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}" width="100%" height="100%">
  <!-- Pure delicate filigree lace, 100% hollow arabesque negative space -->
  <path d="${resCore.d}" fill="#eef3fb" stroke="#eef3fb" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>
  <path d="${resHigh.d}" fill="#ffffff" stroke="#ffffff" stroke-width="0.4" stroke-linejoin="round" fill-rule="evenodd"/>
</svg>`;

  fs.writeFileSync(path.join('references', 'kadio-assets', 'harvested', 'svg', name + '.svg'), svg);
  console.log(`Elevated ${name}.svg!`);
}

async function run() {
  await elevateFiligreeCorner('event-top-left');
  await elevateFiligreeCorner('event-top-right');
  await elevateFiligreeCorner('event-bottom-left');
  await elevateFiligreeCorner('event-bottom-right');
}

run();
