const sharp = require('sharp');
const path = require('path');
const potrace = require('potrace');
const fs = require('fs');

const CARD_SHEET = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-floral-ilustrations', '9 asset yang harus dibuat.jpeg');

function traceBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    potrace.trace(
      buffer,
      {
        color: 'currentColor',
        optCurve: true,
        turdSize: 10,
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

async function extractCardsPure() {
  const { data, info } = await sharp(CARD_SHEET).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Let's define the center seed and search area for each of the 9 cards
  const cardsConfig = [
    { id: 'card-01', seedX: 350, seedY: 300, minX: 30, maxX: 740, minY: 80, maxY: 520 },
    { id: 'card-02', seedX: 1050, seedY: 400, minX: 740, maxX: 1350, minY: 100, maxY: 730 },
    { id: 'card-03', seedX: 1640, seedY: 410, minX: 1400, maxX: 1900, minY: 100, maxY: 730 },
    { id: 'card-04', seedX: 380, seedY: 850, minX: 60, maxX: 700, minY: 600, maxY: 1120 },
    { id: 'card-05', seedX: 1020, seedY: 1130, minX: 780, maxX: 1250, minY: 820, maxY: 1450 },
    { id: 'card-06', seedX: 1640, seedY: 1070, minX: 1330, maxX: 1960, minY: 790, maxY: 1350 },
    { id: 'card-07', seedX: 400, seedY: 1470, minX: 50, maxX: 730, minY: 1120, maxY: 1830 },
    { id: 'card-08', seedX: 1030, seedY: 1670, minX: 700, maxX: 1370, minY: 1440, maxY: 1910 },
    { id: 'card-09', seedX: 1650, seedY: 1600, minX: 1330, maxX: 2000, minY: 1280, maxY: 1920 },
  ];

  for (const cfg of cardsConfig) {
    // Extract region
    const rW = cfg.maxX - cfg.minX + 1;
    const rH = cfg.maxY - cfg.minY + 1;
    const binary = new Uint8Array(rW * rH);
    for (let y = 0; y < rH; y++) {
      for (let x = 0; x < rW; x++) {
        const gy = cfg.minY + y;
        const gx = cfg.minX + x;
        binary[y * rW + x] = data[gy * w + gx] < 200 ? 1 : 0;
      }
    }

    // CCL inside region
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
    // Find all components belonging to the card (main card frame is comp[0], plus accents within proximity)
    const cardComp = comps[0];
    const keepPixels = new Set();
    let bMinX = rW, bMaxX = 0, bMinY = rH, bMaxY = 0;

    for (const comp of comps) {
      // Filter out any component that touches the region boundary if it's far from the main card
      const touchesBorder = comp.cMinX <= 2 || comp.cMaxX >= rW - 3 || comp.cMinY <= 2 || comp.cMaxY >= rH - 3;
      const isNeighbor = touchesBorder && (comp !== cardComp && (comp.cMaxX < cardComp.cMinX - 10 || comp.cMinX > cardComp.cMaxX + 10));
      if (!isNeighbor) {
        for (const p of comp.px) keepPixels.add(p);
        if (comp.cMinX < bMinX) bMinX = comp.cMinX;
        if (comp.cMaxX > bMaxX) bMaxX = comp.cMaxX;
        if (comp.cMinY < bMinY) bMinY = comp.cMinY;
        if (comp.cMaxY > bMaxY) bMaxY = comp.cMaxY;
      }
    }

    // Now write with generous 25px padding
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
        const gy = cfg.minY + cy;
        const gx = cfg.minX + cx;
        cleanBuf[oy * outW + ox] = data[gy * w + gx];
      }
    }

    const png = await sharp(cleanBuf, { raw: { width: outW, height: outH, channels: 1 } }).png().toBuffer();
    const svg = await traceBuffer(png, { turdSize: 8 });
    console.log(`${cfg.id}: extracted ${outW}x${outH} with pad=${pad}, keepPixels=${keepPixels.size}, svgLen=${svg.length}`);
  }
}

extractCardsPure().catch(console.error);
