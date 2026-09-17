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

async function extractSheet15Pure() {
  const sheetPath = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-floral-ilustrations', '15 asset yang harus dibuat.jpeg');
  const { data, info } = await sharp(sheetPath)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const binary = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    binary[i] = data[i] < 210 ? 1 : 0;
  }

  const visited = new Uint8Array(width * height);
  const components = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (binary[idx] === 1 && !visited[idx]) {
        let minX = x, maxX = x, minY = y, maxY = y;
        let sumX = 0, sumY = 0, count = 0;
        const queue = [idx];
        visited[idx] = 1;
        let head = 0;
        const pixelIndices = [];

        while (head < queue.length) {
          const curr = queue[head++];
          const cy = Math.floor(curr / width);
          const cx = curr % width;
          sumX += cx;
          sumY += cy;
          count++;
          pixelIndices.push(curr);

          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          const r = 3;
          for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              const ny = cy + dy;
              const nx = cx + dx;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nidx = ny * width + nx;
                if (binary[nidx] === 1 && !visited[nidx]) {
                  visited[nidx] = 1;
                  queue.push(nidx);
                }
              }
            }
          }
        }

        if (count >= 100) {
          components.push({
            minX, maxX, minY, maxY,
            centerX: sumX / count,
            centerY: sumY / count,
            count,
            pixelIndices
          });
        }
      }
    }
  }

  // Sort components by horizontal position X
  components.sort((a, b) => a.centerX - b.centerX);
  console.log(`Extracted ${components.length} isolated botanical elements from Sheet 15.`);

  const svgs = [];
  for (let i = 0; i < components.length; i++) {
    const fl = components[i];
    const pad = 24;
    const cropW = (fl.maxX - fl.minX) + pad * 2;
    const cropH = (fl.maxY - fl.minY) + pad * 2;

    const outBuf = Buffer.alloc(cropW * cropH, 255);
    for (const p of fl.pixelIndices) {
      const cy = Math.floor(p / width);
      const cx = p % width;
      const ox = (cx - fl.minX) + pad;
      const oy = (cy - fl.minY) + pad;
      if (ox >= 0 && ox < cropW && oy >= 0 && oy < cropH) {
        outBuf[oy * cropW + ox] = data[p];
      }
    }

    const png = await sharp(outBuf, {
      raw: { width: cropW, height: cropH, channels: 1 }
    }).png().toBuffer();

    const svg = await traceBuffer(png, { turdSize: 8 });
    svgs.push(svg);
  }

  return svgs;
}

module.exports = { extractSheet15Pure };

if (require.main === module) {
  extractSheet15Pure()
    .then(svgs => console.log('Successfully produced', svgs.length, 'SVGs from Sheet 15'))
    .catch(console.error);
}
