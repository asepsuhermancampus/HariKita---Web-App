const sharp = require('sharp');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara');
const cardSheetPath = path.join(RAW_DIR, 'asset-mentah-floral-ilustrations', '9 asset yang harus dibuat.jpeg');

async function testCard08Full() {
  const { data, info } = await sharp(cardSheetPath).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Search in [650..1500], y in [1400..2000]
  const minX = 650, maxX = 1500, minY = 1400, maxY = 2000;
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
        if (count > 50) comps.push({ count, cMinX, cMaxX, cMinY, cMaxY });
      }
    }
  }

  comps.sort((a,b) => b.count - a.count);
  console.log(`Found ${comps.length} comps in wider Card 08 window:`);
  comps.forEach((c, idx) => {
    console.log(`  Comp ${idx}: count=${c.count}, bounds=[${minX + c.cMinX}..${minX + c.cMaxX}, ${minY + c.cMinY}..${minY + c.cMaxY}], size=${c.cMaxX - c.cMinX + 1}x${c.cMaxY - c.cMinY + 1}`);
  });
}

testCard08Full().catch(console.error);
