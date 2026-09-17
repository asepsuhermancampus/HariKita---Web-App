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

async function extractSheet36Pure() {
  const sheetPath = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-floral-ilustrations', '36 asset yang harus dibuat.jpeg');
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

        if (count >= 120) {
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

  // Merge components belonging to the same vertical flower illustration
  const flowers = [];
  const used = new Uint8Array(components.length);

  for (let i = 0; i < components.length; i++) {
    if (used[i]) continue;
    let fl = {
      minX: components[i].minX,
      maxX: components[i].maxX,
      minY: components[i].minY,
      maxY: components[i].maxY,
      sumX: components[i].centerX * components[i].count,
      sumY: components[i].centerY * components[i].count,
      count: components[i].count,
      pixelIndices: [...components[i].pixelIndices]
    };

    for (let j = i + 1; j < components.length; j++) {
      if (used[j]) continue;
      const c2 = components[j];
      const xDist = Math.abs((fl.sumX / fl.count) - c2.centerX);
      const yDist = Math.abs((fl.sumY / fl.count) - c2.centerY);

      // Same vertical flower if horizontal distance is within 85px and vertical distance within 220px
      if (xDist < 85 && yDist < 220) {
        fl.minX = Math.min(fl.minX, c2.minX);
        fl.maxX = Math.max(fl.maxX, c2.maxX);
        fl.minY = Math.min(fl.minY, c2.minY);
        fl.maxY = Math.max(fl.maxY, c2.maxY);
        fl.sumX += c2.centerX * c2.count;
        fl.sumY += c2.centerY * c2.count;
        fl.count += c2.count;
        fl.pixelIndices.push(...c2.pixelIndices);
        used[j] = 1;
      }
    }
    flowers.push(fl);
  }

  // Sort by row (y / 420) then by x
  flowers.sort((a, b) => {
    const rA = Math.floor((a.sumY / a.count) / 410);
    const rB = Math.floor((b.sumY / b.count) / 410);
    if (rA !== rB) return rA - rB;
    return (a.sumX / a.count) - (b.sumX / b.count);
  });

  console.log(`Extracted ${flowers.length} completely isolated flowers from Sheet 36.`);

  // Return function to get SVG for each index
  const svgs = [];
  for (let i = 0; i < flowers.length; i++) {
    const fl = flowers[i];
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

module.exports = { extractSheet36Pure, traceBuffer };

if (require.main === module) {
  extractSheet36Pure()
    .then(svgs => console.log('Successfully produced', svgs.length, 'SVGs'))
    .catch(console.error);
}
