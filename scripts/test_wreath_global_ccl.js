const sharp = require('sharp');
const path = require('path');

const LINGKARAN_SHEET = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-lingkaran.jpeg');

async function testWreathGlobalCCL() {
  const { data, info } = await sharp(LINGKARAN_SHEET).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Binarize
  const binary = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) binary[i] = data[i] < 200 ? 1 : 0;

  // Find all components on the sheet
  const visited = new Uint8Array(w * h);
  const comps = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pidx = y * w + x;
      if (binary[pidx] && !visited[pidx]) {
        let minX = x, maxX = x, minY = y, maxY = y;
        let count = 0;
        const q = [pidx];
        visited[pidx] = 1;
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
        if (count > 200) comps.push({ count, minX, maxX, minY, maxY, px });
      }
    }
  }

  console.log(`Found ${comps.length} large components (>200px) on 16 asset yang harus dibuat-lingkaran.jpeg`);
  comps.sort((a,b) => b.count - a.count);
  for (let i = 0; i < Math.min(25, comps.length); i++) {
    const c = comps[i];
    console.log(`Comp ${i}: count=${c.count}, bounds=[L:${c.minX}, R:${c.maxX}, T:${c.minY}, B:${c.maxY}], size=${c.maxX - c.minX + 1}x${c.maxY - c.minY + 1}`);
  }
}

testWreathGlobalCCL().catch(console.error);
