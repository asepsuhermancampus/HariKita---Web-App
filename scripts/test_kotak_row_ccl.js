const sharp = require('sharp');
const path = require('path');

const KOTAK_SHEET = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-kotak.jpeg');

async function testKotakAnatomy() {
  const { data, info } = await sharp(KOTAK_SHEET).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // 2 rows x 8 columns = 16 square frames
  // Row 0: y in [0..315] (botanical 17 to 24)
  // Row 1: y in [315..630] (botanical 25 to 32)
  for (let r = 0; r < 2; r++) {
    const rowTop = r * 315;
    const rowH = 315;
    console.log(`\n=== ROW ${r} ===`);
    // Find the 8 square frame components in this row using CCL
    const binary = new Uint8Array(w * rowH);
    for (let y = 0; y < rowH; y++) {
      for (let x = 0; x < w; x++) {
        binary[y * w + x] = data[(rowTop + y) * w + x] < 200 ? 1 : 0;
      }
    }

    const visited = new Uint8Array(w * rowH);
    const comps = [];
    for (let y = 0; y < rowH; y++) {
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
                if (nx >= 0 && nx < w && ny >= 0 && ny < rowH) {
                  const nidx = ny * w + nx;
                  if (binary[nidx] && !visited[nidx]) {
                    visited[nidx] = 1;
                    q.push(nidx);
                  }
                }
              }
            }
          }
          if (count > 500) comps.push({ count, minX, maxX, minY, maxY, px });
        }
      }
    }

    comps.sort((a,b) => a.minX - b.minX);
    console.log(`Row ${r}: Found ${comps.length} major frame components:`);
    comps.forEach((c, idx) => {
      console.log(`  Frame ${idx} (botanical-${17 + r * 8 + idx}): count=${c.count}, bounds=[L:${c.minX}, R:${c.maxX}, T:${c.minY}, B:${c.maxY}], size=${c.maxX - c.minX + 1}x${c.maxY - c.minY + 1}`);
    });
  }
}

testKotakAnatomy().catch(console.error);
