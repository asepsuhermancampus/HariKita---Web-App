const sharp = require('sharp');
const path = require('path');
const potrace = require('potrace');

const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara');
const sheetLingkaran = path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-lingkaran.jpeg');

function traceBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    potrace.trace(
      buffer,
      {
        color: 'currentColor',
        optCurve: true,
        turdSize: 10,
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

async function testWreathVoronoi() {
  const { data, info } = await sharp(sheetLingkaran).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  const centers = [
    { id: 1, cx: 310, cy: 303 },
    { id: 2, cx: 790, cy: 308 },
    { id: 3, cx: 1256, cy: 302 },
    { id: 4, cx: 1726, cy: 309 },
    { id: 5, cx: 325, cy: 784 },
    { id: 6, cx: 793, cy: 785 },
    { id: 7, cx: 1257, cy: 785 },
    { id: 8, cx: 1726, cy: 786 },
    { id: 9, cx: 311, cy: 1262 },
    { id: 10, cx: 789, cy: 1262 },
    { id: 11, cx: 1256, cy: 1267 },
    { id: 12, cx: 1726, cy: 1254 },
    { id: 13, cx: 318, cy: 1738 },
    { id: 14, cx: 789, cy: 1743 },
    { id: 15, cx: 1256, cy: 1741 },
    { id: 16, cx: 1729, cy: 1739 },
  ];

  // Binarize
  const binary = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) binary[i] = data[i] < 200 ? 1 : 0;

  // Find all connected components
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

  console.log(`Found ${comps.length} components across the entire wreath sheet.`);

  // Assign each component to closest center
  const wreathComps = {};
  for (const c of centers) wreathComps[c.id] = [];

  for (const comp of comps) {
    const compCx = (comp.minX + comp.maxX) / 2;
    const compCy = (comp.minY + comp.maxY) / 2;
    let closestCenter = null;
    let minDist = Infinity;
    for (const c of centers) {
      const d = Math.hypot(compCx - c.cx, compCy - c.cy);
      if (d < minDist) {
        minDist = d;
        closestCenter = c;
      }
    }
    // Only accept if component is within reasonable distance from wreath center (d < 235)
    if (minDist < 235) {
      wreathComps[closestCenter.id].push(comp);
    }
  }

  for (const c of centers) {
    const assigned = wreathComps[c.id];
    let bMinX = w, bMaxX = 0, bMinY = h, bMaxY = 0;
    const keepPixels = new Set();
    for (const comp of assigned) {
      for (const p of comp.px) keepPixels.add(p);
      if (comp.minX < bMinX) bMinX = comp.minX;
      if (comp.maxX > bMaxX) bMaxX = comp.maxX;
      if (comp.minY < bMinY) bMinY = comp.minY;
      if (comp.maxY > bMaxY) bMaxY = comp.maxY;
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
    console.log(`botanical-${String(c.id).padStart(2, '0')}: ${outW}x${outH} with pad=${pad}px, keepPixels=${keepPixels.size}, svgLen=${svg.length}`);
  }
}

testWreathVoronoi().catch(console.error);
