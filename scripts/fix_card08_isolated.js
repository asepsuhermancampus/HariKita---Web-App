const sharp = require('sharp');
const path = require('path');
const potrace = require('potrace');
const fs = require('fs');

const CARD_SHEET = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-floral-ilustrations', '9 asset yang harus dibuat.jpeg');
const OUT_PATH = path.join(__dirname, '..', 'public', 'assets', 'harikita', 'cards', 'card-invitation-08.svg');

function traceBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    potrace.trace(
      buffer,
      {
        color: 'currentColor',
        optCurve: true,
        turdSize: 8,
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

async function fixCard08() {
  const { data, info } = await sharp(CARD_SHEET).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Exact window for Card 08:
  // Starts at X: 720, ends at X: 1395 (before Card 09 starts at 1411)
  // Starts at Y: 1580, ends at Y: 1900
  const minX = 720, maxX = 1395, minY = 1580, maxY = 1900;
  const rW = maxX - minX + 1;
  const rH = maxY - minY + 1;

  const binary = new Uint8Array(rW * rH);
  for (let y = 0; y < rH; y++) {
    for (let x = 0; x < rW; x++) {
      binary[y * rW + x] = data[(minY + y) * w + (minX + x)] < 200 ? 1 : 0;
    }
  }

  const visited = new Uint8Array(rW * rH);
  const comps = [];
  for (let y = 0; y < rH; y++) {
    for (let x = 0; x < rW; x++) {
      const idx = y * rW + x;
      if (binary[idx] && !visited[idx]) {
        let cMinX = x, cMaxX = x, cMinY = y, cMaxY = y;
        let count = 0;
        const q = [idx];
        visited[idx] = 1;
        let head = 0;
        const px = [];
        while (head < q.length) {
          const curr = q[head++];
          const cy = Math.floor(curr / rW), cx = curr % rW;
          count++;
          px.push(curr);
          if (cx < cMinX) cMinX = cx; if (cx > cMaxX) cMaxX = cx;
          if (cy < cMinY) cMinY = cy; if (cy > cMaxY) cMaxY = cy;
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const ny = cy + dy, nx = cx + dx;
              if (nx >= 0 && nx < rW && ny >= 0 && ny < rH) {
                const nidx = ny * rW + nx;
                if (binary[nidx] && !visited[nidx]) {
                  visited[nidx] = 1;
                  q.push(nidx);
                }
              }
            }
          }
        }
        if (count > 25) comps.push({ count, cMinX, cMaxX, cMinY, cMaxY, px });
      }
    }
  }

  comps.sort((a,b) => b.count - a.count);
  console.log(`Found ${comps.length} comps for Card 08.`);
  const cardComp = comps[0];
  console.log(`Main Card 08 comp size: ${cardComp.cMaxX - cardComp.cMinX + 1}x${cardComp.cMaxY - cardComp.cMinY + 1}, pixels=${cardComp.count}`);

  const keepPixels = new Set();
  let bMinX = rW, bMaxX = 0, bMinY = rH, bMaxY = 0;

  for (const comp of comps) {
    const touchesBorder = comp.cMinX <= 2 || comp.cMaxX >= rW - 3 || comp.cMinY <= 2 || comp.cMaxY >= rH - 3;
    if (!touchesBorder) {
      for (const p of comp.px) keepPixels.add(p);
      if (comp.cMinX < bMinX) bMinX = comp.cMinX;
      if (comp.cMaxX > bMaxX) bMaxX = comp.cMaxX;
      if (comp.cMinY < bMinY) bMinY = comp.cMinY;
      if (comp.cMaxY > bMaxY) bMaxY = comp.cMaxY;
    }
  }

  const pad = 25;
  const outW = bMaxX - bMinX + 1 + pad * 2;
  const outH = bMaxY - bMinY + 1 + pad * 2;
  const cleanBuf = Buffer.alloc(outW * outH, 255);
  for (const p of keepPixels) {
    const cy = Math.floor(p / rW);
    const cx = p % rW;
    const ox = cx - bMinX + pad;
    const oy = cy - bMinY + pad;
    if (ox >= 0 && ox < outW && oy >= 0 && oy < outH) {
      cleanBuf[oy * outW + ox] = data[(minY + cy) * w + (minX + cx)];
    }
  }

  const png = await sharp(cleanBuf, { raw: { width: outW, height: outH, channels: 1 } }).png().toBuffer();
  const svg = await traceBuffer(png, { turdSize: 8 });
  fs.writeFileSync(OUT_PATH, svg);
  console.log(`✅ Successfully extracted Card 08: ${outW}x${outH}, keepPixels=${keepPixels.size}, svgLen=${svg.length}`);
}

fixCard08().catch(console.error);
