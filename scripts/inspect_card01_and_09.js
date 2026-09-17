const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const CARD_SHEET = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-floral-ilustrations', '9 asset yang harus dibuat.jpeg');

async function inspectCards() {
  const svg01 = fs.readFileSync('public/assets/harikita/cards/card-invitation-01.svg', 'utf8');
  console.log('Card 01 SVG viewBox:', svg01.match(/viewBox="([^"]+)"/)?.[1]);

  const svg09 = fs.readFileSync('public/assets/harikita/cards/card-invitation-09.svg', 'utf8');
  console.log('Card 09 SVG viewBox:', svg09.match(/viewBox="([^"]+)"/)?.[1]);

  const { data, info } = await sharp(CARD_SHEET).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Let's inspect Card 01 on sheet: [x: 0..800, y: 0..600]
  console.log('\n--- Card 01 components on raw sheet ---');
  // Check in [0..750, 50..550]
  let d01 = [];
  for (let y = 50; y < 550; y++) {
    for (let x = 10; x < 750; x++) {
      if (data[y * w + x] < 200) d01.push({ x, y });
    }
  }
  let minX1 = Math.min(...d01.map(p => p.x)), maxX1 = Math.max(...d01.map(p => p.x));
  let minY1 = Math.min(...d01.map(p => p.y)), maxY1 = Math.max(...d01.map(p => p.y));
  console.log(`Card 01 true dark pixel range: X=[${minX1}..${maxX1}], Y=[${minY1}..${maxY1}]`);

  // In repair_all_flagged_assets.js, Card 01 window was:
  // { id: 'card-invitation-01.svg', minX: 30, maxX: 740, minY: 80, maxY: 520 }
  // Notice if minX was 30, but does Card 01 start earlier than 30? Or does it extend past 740? Or past 520?
  console.log('Checking pixels outside [30..740, 80..520]:');
  let leftOut = d01.filter(p => p.x < 30).length;
  let rightOut = d01.filter(p => p.x > 740).length;
  let topOut = d01.filter(p => p.y < 80).length;
  let botOut = d01.filter(p => p.y > 520).length;
  console.log(`  Outside window: left=${leftOut}, right=${rightOut}, top=${topOut}, bottom=${botOut}`);

  // Now let's inspect Card 09 components:
  // In repair_all_flagged_assets.js:
  // { id: 'card-invitation-09.svg', minX: 1330, maxX: 2000, minY: 1280, maxY: 1920 }
  console.log('\n--- Card 09 components on raw sheet ---');
  // Let's find CCL components in that window [1330..2000, 1280..1920]
  const rW = 2000 - 1330 + 1;
  const rH = 1920 - 1280 + 1;
  const binary = new Uint8Array(rW * rH);
  for (let y = 0; y < rH; y++) {
    for (let x = 0; x < rW; x++) {
      binary[y * rW + x] = data[(1280 + y) * w + (1330 + x)] < 200 ? 1 : 0;
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
        while (head < q.length) {
          const curr = q[head++];
          const cy = Math.floor(curr / rW), cx = curr % rW;
          count++;
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
        if (count > 25) comps.push({ count, cMinX, cMaxX, cMinY, cMaxY });
      }
    }
  }

  comps.sort((a,b) => b.count - a.count);
  console.log(`Found ${comps.length} components in Card 09 window:`);
  comps.forEach((c, idx) => {
    console.log(`  Comp ${idx}: count=${c.count}, bounds=[${1330 + c.cMinX}..${1330 + c.cMaxX}, ${1280 + c.cMinY}..${1280 + c.cMaxY}]`);
  });
}

inspectCards().catch(console.error);
