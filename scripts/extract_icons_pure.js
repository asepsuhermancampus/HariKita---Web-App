const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const potrace = require('potrace');

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

async function extractIconsPure() {
  const iconPath = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-custom-icons', '2.jpeg');
  const { data, info } = await sharp(iconPath)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const cols = 5;
  const rows = 4;
  const cellW = width / cols;
  const cellH = height / rows;

  const svgs = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const left = Math.round(c * cellW);
      const top = Math.round(r * cellH);
      const w = Math.round(cellW);
      const h = Math.round(cellH);

      // Extract raw cell
      const binary = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          binary[y * w + x] = data[(top + y) * width + (left + x)] < 200 ? 1 : 0;
        }
      }

      // CCL in cell
      const visited = new Uint8Array(w * h);
      const comps = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x;
          if (binary[idx] && !visited[idx]) {
            let minX = x, maxX = x, minY = y, maxY = y;
            let count = 0;
            const q = [idx];
            visited[idx] = 1;
            let head = 0;
            const px = [];
            while (head < q.length) {
              const curr = q[head++];
              const cy = Math.floor(curr / w), cx = curr % w;
              count++;
              px.push(curr);
              if (cx < minX) minX = cx; if (cx > maxX) maxX = cx;
              if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
              for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                  const ny = cy + dy, nx = cx + dx;
                  if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                    const nidx = ny * w + nx;
                    if (binary[nidx] && !visited[nidx]) {
                      visited[nidx] = 1;
                      q.push(nidx);
                    }
                  }
                }
              }
            }
            if (count > 20) comps.push({ count, minX, maxX, minY, maxY, px });
          }
        }
      }

      // Filter out border bleed from adjacent icon cells
      const keepPixels = new Set();
      let bMinX = w, bMaxX = 0, bMinY = h, bMaxY = 0;
      for (const comp of comps) {
        const touchesBorder = comp.minX <= 2 || comp.maxX >= w - 3 || comp.minY <= 2 || comp.maxY >= h - 3;
        if (!touchesBorder) {
          for (const p of comp.px) keepPixels.add(p);
          if (comp.minX < bMinX) bMinX = comp.minX;
          if (comp.maxX > bMaxX) bMaxX = comp.maxX;
          if (comp.minY < bMinY) bMinY = comp.minY;
          if (comp.maxY > bMaxY) bMaxY = comp.maxY;
        }
      }

      const pad = 20;
      const outW = bMaxX - bMinX + 1 + pad * 2;
      const outH = bMaxY - bMinY + 1 + pad * 2;
      const cleanBuf = Buffer.alloc(outW * outH, 255);
      for (const p of keepPixels) {
        const cy = Math.floor(p / w);
        const cx = p % w;
        const ox = cx - bMinX + pad;
        const oy = cy - bMinY + pad;
        if (ox >= 0 && ox < outW && oy >= 0 && oy < outH) {
          cleanBuf[oy * outW + ox] = data[(top + cy) * width + (left + cx)];
        }
      }

      const png = await sharp(cleanBuf, { raw: { width: outW, height: outH, channels: 1 } }).png().toBuffer();
      const svg = await traceBuffer(png, { turdSize: 8 });
      svgs.push(svg);
    }
  }

  console.log(`Extracted ${svgs.length} pure isolated wedding icons with CCL and pad=20px.`);
  return svgs;
}

module.exports = { extractIconsPure };

if (require.main === module) {
  extractIconsPure()
    .then(svgs => console.log('Successfully produced', svgs.length, 'icon SVGs'))
    .catch(console.error);
}
