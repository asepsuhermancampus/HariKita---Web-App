const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

async function inspect() {
  const card8 = fs.readFileSync('public/assets/harikita/cards/card-invitation-08.svg', 'utf8');
  console.log('Card 08 SVG viewBox:', card8.match(/viewBox="([^"]+)"/)?.[1]);
  console.log('Card 08 length:', card8.length);

  const bloom16 = fs.readFileSync('public/assets/harikita/flowers/blooms/flower-bloom-16.svg', 'utf8');
  console.log('Bloom 16 SVG viewBox:', bloom16.match(/viewBox="([^"]+)"/)?.[1]);
  console.log('Bloom 16 length:', bloom16.length);

  // Check Card 08 in the raw sheet 9
  const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara');
  const cardSheetPath = path.join(RAW_DIR, 'asset-mentah-floral-ilustrations', '9 asset yang harus dibuat.jpeg');
  const { data, info } = await sharp(cardSheetPath).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Let's check card 08 region: x in [650..1400], y in [1400..2048]
  console.log('\nAnalyzing Card 08 on raw sheet...');
  // Find components around Card 08
  // In our previous script:
  // card-08 config: { id: 'card-invitation-08.svg', minX: 700, maxX: 1370, minY: 1440, maxY: 1910 }
  // Let's see what components were inside that box
  const rW = 1370 - 700 + 1;
  const rH = 1910 - 1440 + 1;
  const binary = new Uint8Array(rW * rH);
  for (let y = 0; y < rH; y++) {
    for (let x = 0; x < rW; x++) {
      binary[y * rW + x] = data[(1440 + y) * w + (700 + x)] < 200 ? 1 : 0;
    }
  }

  const visited = new Uint8Array(rW * rH);
  const comps = [];
  for (let y = 0; y < rH; y++) {
    for (let x = 0; x < rW; x++) {
      const idx = y * rW + x;
      if (binary[idx] && !visited[idx]) {
        let minX = x, maxX = x, minY = y, maxY = y;
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
          if (cx < minX) minX = cx; if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
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
        if (count > 20) comps.push({ count, minX, maxX, minY, maxY });
      }
    }
  }

  comps.sort((a,b) => b.count - a.count);
  console.log(`Found ${comps.length} components in Card 08 window:`);
  comps.slice(0, 10).forEach((c, idx) => {
    console.log(`  Comp ${idx}: count=${c.count}, bounds=[${c.minX}..${c.maxX}, ${c.minY}..${c.maxY}] (global X: ${700 + c.minX}..${700 + c.maxX}, global Y: ${1440 + c.minY}..${1440 + c.maxY})`);
  });
}

inspect().catch(console.error);
