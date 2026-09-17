const sharp = require('sharp');
const path = require('path');
const potrace = require('potrace');
const fs = require('fs');

const SHEET8_PATH = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-floral-ilustrations', '8 asset yang harus dibuat.jpeg');
const OUT_PATH = path.join(__dirname, '..', 'public', 'assets', 'harikita', 'flowers', 'blooms', 'flower-bloom-16.svg');

function traceBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    potrace.trace(
      buffer,
      {
        color: 'currentColor',
        optCurve: true,
        turdSize: 8,
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

async function fixBloom16() {
  const { data, info } = await sharp(SHEET8_PATH).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // 8 seeds on Sheet 8
  const seeds = [
    { id: 10, cx: 340, cy: 330 },
    { id: 11, cx: 830, cy: 350 },
    { id: 12, cx: 1290, cy: 360 },
    { id: 13, cx: 1680, cy: 360 },
    { id: 14, cx: 360, cy: 800 },
    { id: 15, cx: 790, cy: 810 },
    { id: 16, cx: 1300, cy: 810 },
    { id: 17, cx: 1700, cy: 800 }, // 8th bloom prevents bleeding into bloom 16!
  ];

  const binary = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) binary[i] = data[i] < 200 ? 1 : 0;

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
        if (count > 20) comps.push({ count, minX, maxX, minY, maxY, px });
      }
    }
  }

  const bloomComps = {};
  for (const s of seeds) bloomComps[s.id] = [];

  for (const comp of comps) {
    const compCx = (comp.minX + comp.maxX) / 2;
    const compCy = (comp.minY + comp.maxY) / 2;
    let closestSeed = null;
    let minDist = Infinity;
    for (const s of seeds) {
      const d = Math.hypot(compCx - s.cx, compCy - s.cy);
      if (d < minDist) {
        minDist = d;
        closestSeed = s;
      }
    }
    bloomComps[closestSeed.id].push(comp);
  }

  const assigned16 = bloomComps[16];
  let bMinX = w, bMaxX = 0, bMinY = h, bMaxY = 0;
  const keepPixels = new Set();
  for (const c of assigned16) {
    for (const p of c.px) keepPixels.add(p);
    if (c.minX < bMinX) bMinX = c.minX;
    if (c.maxX > bMaxX) bMaxX = c.maxX;
    if (c.minY < bMinY) bMinY = c.minY;
    if (c.maxY > bMaxY) bMaxY = c.maxY;
  }

  const pad = 25;
  const outW = bMaxX - bMinX + 1 + pad * 2;
  const outH = bMaxY - bMinY + 1 + pad * 2;
  const cleanBuf = Buffer.alloc(outW * outH, 255);
  for (const p of keepPixels) {
    const cy = Math.floor(p / w);
    const cx = p % w;
    const ox = cx - bMinX + pad;
    const oy = cy - bMinY + pad;
    if (ox >= 0 && ox < outW && oy >= 0 && oy < outH) {
      cleanBuf[oy * outW + ox] = data[p];
    }
  }

  const png = await sharp(cleanBuf, { raw: { width: outW, height: outH, channels: 1 } }).png().toBuffer();
  const svg = await traceBuffer(png, { turdSize: 8 });
  fs.writeFileSync(OUT_PATH, svg);
  console.log(`✅ Successfully extracted Bloom 16: ${outW}x${outH}, keepPixels=${keepPixels.size}, svgLen=${svg.length}`);
}

fixBloom16().catch(console.error);
