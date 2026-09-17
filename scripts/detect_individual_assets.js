const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function detectBoxes(imgPath, thresholdVal = 200, minPixels = 200, mergeDist = 25) {
  const { data, info } = await sharp(imgPath)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const binary = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    binary[i] = data[i] < thresholdVal ? 1 : 0;
  }

  // Downsample to a smaller grid for fast connected component / bounding box detection
  const scale = 4; // 4x downsampled
  const sw = Math.floor(width / scale);
  const sh = Math.floor(height / scale);
  const sgrid = new Uint8Array(sw * sh);

  for (let sy = 0; sy < sh; sy++) {
    for (let sx = 0; sx < sw; sx++) {
      let count = 0;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const py = sy * scale + dy;
          const px = sx * scale + dx;
          if (binary[py * width + px] === 1) count++;
        }
      }
      if (count > 1) sgrid[sy * sw + sx] = 1;
    }
  }

  const visited = new Uint8Array(sw * sh);
  const rawBoxes = [];

  for (let sy = 0; sy < sh; sy++) {
    for (let sx = 0; sx < sw; sx++) {
      const idx = sy * sw + sx;
      if (sgrid[idx] === 1 && !visited[idx]) {
        let minX = sx, maxX = sx, minY = sy, maxY = sy, pxCount = 0;
        const queue = [idx];
        visited[idx] = 1;
        let head = 0;

        while (head < queue.length) {
          const curr = queue[head++];
          const cy = Math.floor(curr / sw);
          const cx = curr % sw;
          pxCount++;

          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          // 8-neighborhood with small hop
          const step = 1;
          for (let dy = -step; dy <= step; dy++) {
            for (let dx = -step; dx <= step; dx++) {
              const ny = cy + dy;
              const nx = cx + dx;
              if (nx >= 0 && nx < sw && ny >= 0 && ny < sh) {
                const nidx = ny * sw + nx;
                if (sgrid[nidx] === 1 && !visited[nidx]) {
                  visited[nidx] = 1;
                  queue.push(nidx);
                }
              }
            }
          }
        }

        if (pxCount >= 10) {
          rawBoxes.push({
            minX: minX * scale,
            maxX: (maxX + 1) * scale,
            minY: minY * scale,
            maxY: (maxY + 1) * scale,
            pxCount
          });
        }
      }
    }
  }

  // Merge boxes that are within mergeDist of each other (e.g. petals of the same flower)
  let merged = [...rawBoxes];
  let changed = true;
  while (changed) {
    changed = false;
    const next = [];
    const used = new Uint8Array(merged.length);

    for (let i = 0; i < merged.length; i++) {
      if (used[i]) continue;
      let b1 = { ...merged[i] };
      for (let j = i + 1; j < merged.length; j++) {
        if (used[j]) continue;
        const b2 = merged[j];
        // Check proximity
        const xDist = Math.max(0, Math.max(b1.minX, b2.minX) - Math.min(b1.maxX, b2.maxX));
        const yDist = Math.max(0, Math.max(b1.minY, b2.minY) - Math.min(b1.maxY, b2.maxY));
        if (xDist <= mergeDist && yDist <= mergeDist) {
          b1.minX = Math.min(b1.minX, b2.minX);
          b1.maxX = Math.max(b1.maxX, b2.maxX);
          b1.minY = Math.min(b1.minY, b2.minY);
          b1.maxY = Math.max(b1.maxY, b2.maxY);
          b1.pxCount += b2.pxCount;
          used[j] = 1;
          changed = true;
        }
      }
      next.push(b1);
    }
    merged = next;
  }

  // Filter out tiny specks (< 200px)
  const finalBoxes = merged.filter(b => b.pxCount > 100 && (b.maxX - b.minX) > 20 && (b.maxY - b.minY) > 20);

  console.log(`\n=== File: ${path.basename(imgPath)} ===`);
  console.log(`Found ${finalBoxes.length} isolated asset bounding boxes.`);
  return finalBoxes;
}

async function run() {
  const images = [
    'public/refactor_dir_sementara/asset-mentah-floral-ilustrations/36 asset yang harus dibuat.jpeg',
    'public/refactor_dir_sementara/asset-mentah-floral-ilustrations/15 asset yang harus dibuat.jpeg',
    'public/refactor_dir_sementara/asset-mentah-floral-ilustrations/8 asset yang harus dibuat.jpeg',
    'public/refactor_dir_sementara/asset-mentah-floral-ilustrations/9 asset yang harus dibuat.jpeg',
    'public/refactor_dir_sementara/asset-mentah-ornamen-and-element/16 asset yang harus dibuat-kotak.jpeg',
    'public/refactor_dir_sementara/asset-mentah-ornamen-and-element/16 asset yang harus dibuat-lingkaran.jpeg',
    'public/refactor_dir_sementara/asset-mentah-ornamen-and-element/21 asset yang harus dibuat-unik.jpeg',
  ];

  for (const img of images) {
    if (fs.existsSync(img)) {
      const boxes = await detectBoxes(img, 200, 100, 30);
      console.log(`Boxes for ${path.basename(img)}: count = ${boxes.length}`);
    }
  }
}

run().catch(console.error);
