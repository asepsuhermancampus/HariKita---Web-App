const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function testComponentExtraction() {
  const sheetPath = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-floral-ilustrations', '36 asset yang harus dibuat.jpeg');
  const outDir = path.join(__dirname, '..', 'public', 'logo-previews', 'smart_crops');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const { data, info } = await sharp(sheetPath)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  // Binary image: 1 for stroke (< 210), 0 for white bg
  const binary = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    binary[i] = data[i] < 210 ? 1 : 0;
  }

  // Find all connected components with dilation radius 3
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

          // Check neighborhood within radius 3 to connect nearby lines/petals
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

        // Only keep components with significant strokes (> 150 px)
        if (count >= 150) {
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

  console.log(`Detected ${components.length} stroke clusters on sheet 36!`);

  // Merge components that belong to the same flower (distance between centroids < 180 and x distance < 100)
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
      const xOverlap = Math.max(0, Math.min(fl.maxX, c2.maxX) - Math.max(fl.minX, c2.minX));
      const xDist = Math.abs((fl.sumX / fl.count) - c2.centerX);
      const yDist = Math.abs((fl.sumY / fl.count) - c2.centerY);

      // If they belong to the same vertical flower stem (x distance is small, e.g. < 90)
      if (xDist < 90 && yDist < 250) {
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

  console.log(`Merged into ${flowers.length} individual flowers!`);

  // Sort flowers row by row:
  // Row 0: y around 200, Row 1: y around 600, Row 2: y around 1050, Row 3: y around 1450
  flowers.sort((a, b) => {
    const rA = Math.floor((a.sumY / a.count) / 420);
    const rB = Math.floor((b.sumY / b.count) / 420);
    if (rA !== rB) return rA - rB;
    return (a.sumX / a.count) - (b.sumX / b.count);
  });

  // Extract each flower onto its OWN clean white canvas containing ONLY its pixels!
  for (let idx = 0; idx < Math.min(9, flowers.length); idx++) {
    const fl = flowers[idx];
    const pad = 20;
    const cropW = (fl.maxX - fl.minX) + pad * 2;
    const cropH = (fl.maxY - fl.minY) + pad * 2;

    // Create blank white buffer
    const outBuf = Buffer.alloc(cropW * cropH, 255);

    // Draw only this flower's pixels
    for (const p of fl.pixelIndices) {
      const cy = Math.floor(p / width);
      const cx = p % width;
      const ox = (cx - fl.minX) + pad;
      const oy = (cy - fl.minY) + pad;
      if (ox >= 0 && ox < cropW && oy >= 0 && oy < cropH) {
        outBuf[oy * cropW + ox] = data[p];
      }
    }

    await sharp(outBuf, {
      raw: {
        width: cropW,
        height: cropH,
        channels: 1
      }
    })
    .png()
    .toFile(path.join(outDir, `flower_isolated_${idx + 1}.png`));
  }

  console.log('Saved isolated flower images for Row 0 (1 to 9)!');
}

testComponentExtraction().catch(console.error);
