const sharp = require('sharp');
const path = require('path');
const potrace = require('potrace');
const fs = require('fs');

const CARD_SHEET = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-floral-ilustrations', '9 asset yang harus dibuat.jpeg');
const ASSET_DIR = path.join(__dirname, '..', 'public', 'assets', 'harikita', 'cards');

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

async function fixCard01And09() {
  const { data, info } = await sharp(CARD_SHEET).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // 1. CARD 01: [x: 30..765, y: 80..520]
  console.log('▶ Extracting Card 01 with maxX: 765...');
  {
    const minX = 30, maxX = 765, minY = 80, maxY = 520;
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
    const cardComp = comps[0];
    const keepPixels = new Set();
    let bMinX = rW, bMaxX = 0, bMinY = rH, bMaxY = 0;

    for (const comp of comps) {
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
    fs.writeFileSync(path.join(ASSET_DIR, 'card-invitation-01.svg'), svg);
    console.log(`✅ Card 01: ${outW}x${outH}, keepPixels=${keepPixels.size}, svgLen=${svg.length}`);
  }

  // 2. CARD 09: [x: 1400..2000, y: 1350..1930] -> Completely excludes Card 08 at [733..1380]!
  console.log('\n▶ Extracting Card 09 with minX: 1400...');
  {
    const minX = 1400, maxX = 2000, minY = 1350, maxY = 1930;
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
    const cardComp = comps[0];
    const keepPixels = new Set();
    let bMinX = rW, bMaxX = 0, bMinY = rH, bMaxY = 0;

    for (const comp of comps) {
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
    fs.writeFileSync(path.join(ASSET_DIR, 'card-invitation-09.svg'), svg);
    console.log(`✅ Card 09: ${outW}x${outH}, keepPixels=${keepPixels.size}, svgLen=${svg.length}`);
  }
}

fixCard01And09().catch(console.error);
