const sharp = require('sharp');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara');
const sheetLingkaran = path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-lingkaran.jpeg');

async function diagLingkaran() {
  const { data, info } = await sharp(sheetLingkaran).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Let's divide into 4x4 cells of 512x512
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const idx = r * 4 + c + 1;
      const cellLeft = c * 512;
      const cellTop = r * 512;
      const cellW = 512;
      const cellH = 512;

      // Find all components in this 512x512 cell
      const binary = new Uint8Array(cellW * cellH);
      for (let y = 0; y < cellH; y++) {
        for (let x = 0; x < cellW; x++) {
          binary[y * cellW + x] = data[(cellTop + y) * w + (cellLeft + x)] < 200 ? 1 : 0;
        }
      }

      const visited = new Uint8Array(cellW * cellH);
      const comps = [];
      for (let y = 0; y < cellH; y++) {
        for (let x = 0; x < cellW; x++) {
          const pidx = y * cellW + x;
          if (binary[pidx] && !visited[pidx]) {
            let minX = x, maxX = x, minY = y, maxY = y;
            let count = 0;
            const q = [pidx];
            visited[pidx] = 1;
            let head = 0;
            const px = [];
            while (head < q.length) {
              const curr = q[head++];
              const cy = Math.floor(curr / cellW), cx = curr % cellW;
              count++;
              px.push(curr);
              if (cx < minX) minX = cx; if (cx > maxX) maxX = cx;
              if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
              for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                  const ny = cy + dy, nx = cx + dx;
                  if (nx >= 0 && nx < cellW && ny >= 0 && ny < cellH) {
                    const nidx = ny * cellW + nx;
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

      comps.sort((a,b) => b.count - a.count);
      console.log(`Wreath ${idx} (r=${r}, c=${c}): found ${comps.length} comps. Largest: count=${comps[0]?.count}, bounds=[${comps[0]?.minX}..${comps[0]?.maxX}, ${comps[0]?.minY}..${comps[0]?.maxY}]`);
    }
  }
}

diagLingkaran().catch(console.error);
