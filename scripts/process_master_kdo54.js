const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { PNG } = require('pngjs');

async function extractTransparentMaster() {
  const masterJpg = 'C:\\Users\\asep.suherman\\.gemini\\antigravity-ide\\brain\\f90f8f10-20ca-4247-a5e1-775c0ae698b8\\kdo54_rose_corner_1789111022529.jpg';
  const { data, info } = await sharp(masterJpg).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  // Breadth-first search flood fill from borders to make outside white canvas transparent
  const visited = new Uint8Array(w * h);
  const queue = [];

  function isBackground(idx) {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Background is near pure white
    return r > 240 && g > 240 && b > 240;
  }

  // Seed with border pixels
  for (let x = 0; x < w; x++) {
    queue.push(x); // top border (y=0)
    visited[x] = 1;
  }
  for (let y = 0; y < h; y++) {
    const pLeft = y * w; // left border (x=0)
    queue.push(pLeft);
    visited[pLeft] = 1;
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % w;
    const cy = Math.floor(curr / w);
    const cIdx = curr << 2;

    if (isBackground(cIdx)) {
      // Set pixel transparent
      data[cIdx + 3] = 0;

      // 4-neighborhood
      const neighbors = [
        cy > 0 ? curr - w : -1,
        cy < h - 1 ? curr + w : -1,
        cx > 0 ? curr - 1 : -1,
        cx < w - 1 ? curr + 1 : -1,
      ];

      for (const n of neighbors) {
        if (n >= 0 && !visited[n]) {
          visited[n] = 1;
          const nIdx = n << 2;
          if (isBackground(nIdx)) {
            queue.push(n);
          }
        }
      }
    }
  }

  // Soft feathering on edge pixels
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) << 2;
      if (data[idx + 3] > 0) {
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 245) {
          // Check if adjacent to transparent pixel
          const hasTranspNeighbor = (
            data[idx - 4 + 3] === 0 ||
            data[idx + 4 + 3] === 0 ||
            data[idx - (w << 2) + 3] === 0 ||
            data[idx + (w << 2) + 3] === 0
          );
          if (hasTranspNeighbor) {
            data[idx + 3] = Math.max(0, Math.min(255, Math.round((255 - lum) * 25.5)));
          }
        }
      }
    }
  }

  const outPath = path.join('references', 'kadio-assets', 'harvested', '1754648453_kdo54-bg-3.png');
  await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toFile(outPath);
  console.log('Saved transparent master PNG to:', outPath);
}

extractTransparentMaster();
