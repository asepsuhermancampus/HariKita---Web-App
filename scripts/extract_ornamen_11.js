const sharp = require('sharp');
const path = require('path');
const potrace = require('potrace');
const fs = require('fs');

const SRC_IMAGE = path.join(__dirname, '..', 'public', 'logo-previews', 'ornamen_11.png');
const OUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'harikita', 'ornaments');

function traceBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    potrace.trace(
      buffer,
      {
        color: 'currentColor',
        optCurve: true,
        turdSize: 6,
        alphaMax: 1.0,
        ...options,
      },
      (err, svg) => {
        if (err) return reject(err);
        let clean = svg.replace(
          '<svg ',
          '<svg fill="currentColor" vector-effect="non-scaling-stroke" '
        );
        resolve(clean);
      }
    );
  });
}

const cells = [
  // Row 1: 3 Wide Horizontal Vine Brackets
  { id: 'ornament-vine-01.svg', minX: 10, maxX: 278, minY: 15, maxY: 185 },
  { id: 'ornament-vine-02.svg', minX: 278, maxX: 525, minY: 15, maxY: 185 },
  { id: 'ornament-vine-03.svg', minX: 525, maxX: 790, minY: 15, maxY: 185 },

  // Row 2: 4 Circular Vine Wreaths
  { id: 'ornament-vine-04.svg', minX: 10, maxX: 210, minY: 188, maxY: 365 },
  { id: 'ornament-vine-05.svg', minX: 210, maxX: 395, minY: 188, maxY: 365 },
  { id: 'ornament-vine-06.svg', minX: 395, maxX: 585, minY: 188, maxY: 365 },
  { id: 'ornament-vine-07.svg', minX: 585, maxX: 790, minY: 188, maxY: 365 },

  // Row 3: 4 Curved Bottom Crest Wreaths
  { id: 'ornament-vine-08.svg', minX: 10, maxX: 190, minY: 370, maxY: 535 },
  { id: 'ornament-vine-09.svg', minX: 190, maxX: 405, minY: 370, maxY: 535 },
  { id: 'ornament-vine-10.svg', minX: 405, maxX: 585, minY: 370, maxY: 535 },
  { id: 'ornament-vine-11.svg', minX: 585, maxX: 790, minY: 370, maxY: 535 },
];

async function extractAllVines() {
  console.log('▶ Extracting 11 Vine Ornaments from ornamen_11.png...');
  const { data, info } = await sharp(SRC_IMAGE).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  for (let i = 0; i < cells.length; i++) {
    const cfg = cells[i];
    // 1. Scan true pixel bounds within cell
    let bMinX = 9999, bMaxX = 0, bMinY = 9999, bMaxY = 0;
    let darkCount = 0;
    for (let y = cfg.minY; y <= cfg.maxY; y++) {
      for (let x = cfg.minX; x <= cfg.maxX; x++) {
        if (data[y * w + x] < 220) {
          darkCount++;
          if (x < bMinX) bMinX = x;
          if (x > bMaxX) bMaxX = x;
          if (y < bMinY) bMinY = y;
          if (y > bMaxY) bMaxY = y;
        }
      }
    }

    if (darkCount === 0) {
      console.warn(`⚠️ No pixels found for ${cfg.id}`);
      continue;
    }

    // 2. Add 25px safe pad
    const pad = 25;
    const cropW = bMaxX - bMinX + 1;
    const cropH = bMaxY - bMinY + 1;
    const outW = cropW + pad * 2;
    const outH = cropH + pad * 2;

    const cleanBuf = Buffer.alloc(outW * outH, 255);
    for (let y = 0; y < cropH; y++) {
      for (let x = 0; x < cropW; x++) {
        const srcVal = data[(bMinY + y) * w + (bMinX + x)];
        cleanBuf[(pad + y) * outW + (pad + x)] = srcVal;
      }
    }

    const png = await sharp(cleanBuf, { raw: { width: outW, height: outH, channels: 1 } }).png().toBuffer();
    const svg = await traceBuffer(png);

    const destPath = path.join(OUT_DIR, cfg.id);
    fs.writeFileSync(destPath, svg);
    console.log(`✅ [${i + 1}/11] ${cfg.id}: ${outW}x${outH}px, darkPixels=${darkCount}, svgLen=${svg.length}`);
  }
}

extractAllVines().catch(console.error);
