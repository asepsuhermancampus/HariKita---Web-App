const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const potrace = require('potrace');

const ROOT_DIR = path.join(__dirname, '..');
const RAW_DIR = path.join(ROOT_DIR, 'public', 'refactor_dir_sementara');
const ASSET_DIR = path.join(ROOT_DIR, 'public', 'assets', 'harikita');

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

async function repairCards() {
  console.log('▶ [1/6] Repairing Card Invitations (card-01..09)...');
  const cardSheetPath = path.join(RAW_DIR, 'asset-mentah-floral-ilustrations', '9 asset yang harus dibuat.jpeg');
  const { data, info } = await sharp(cardSheetPath).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  const cardsConfig = [
    { id: 'card-invitation-01.svg', minX: 30, maxX: 740, minY: 80, maxY: 520 },
    { id: 'card-invitation-02.svg', minX: 740, maxX: 1350, minY: 100, maxY: 730 },
    { id: 'card-invitation-03.svg', minX: 1400, maxX: 1900, minY: 100, maxY: 730 },
    { id: 'card-invitation-04.svg', minX: 60, maxX: 700, minY: 600, maxY: 1120 },
    { id: 'card-invitation-05.svg', minX: 780, maxX: 1250, minY: 820, maxY: 1450 },
    { id: 'card-invitation-06.svg', minX: 1330, maxX: 1960, minY: 790, maxY: 1350 },
    { id: 'card-invitation-07.svg', minX: 50, maxX: 730, minY: 1120, maxY: 1830 },
    { id: 'card-invitation-08.svg', minX: 720, maxX: 1395, minY: 1580, maxY: 1900 },
    { id: 'card-invitation-09.svg', minX: 1330, maxX: 2000, minY: 1280, maxY: 1920 },
  ];

  const cardsDir = path.join(ASSET_DIR, 'cards');

  for (const cfg of cardsConfig) {
    const rW = cfg.maxX - cfg.minX + 1;
    const rH = cfg.maxY - cfg.minY + 1;
    const binary = new Uint8Array(rW * rH);
    for (let y = 0; y < rH; y++) {
      for (let x = 0; x < rW; x++) {
        const gy = cfg.minY + y;
        const gx = cfg.minX + x;
        binary[y * rW + x] = data[gy * w + gx] < 200 ? 1 : 0;
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
          if (count > 25) comps.push({ count, cMinX, cMaxX, cMinY, cMaxY, px });
        }
      }
    }

    comps.sort((a,b) => b.count - a.count);
    const cardComp = comps[0];
    const keepPixels = new Set();
    let bMinX = rW, bMaxX = 0, bMinY = rH, bMaxY = 0;

    for (const comp of comps) {
      const touchesBorder = comp.cMinX <= 2 || comp.cMaxX >= rW - 3 || comp.cMinY <= 2 || comp.cMaxY >= rH - 3;
      const isNeighbor = touchesBorder && (comp !== cardComp && (comp.cMaxX < cardComp.cMinX - 10 || comp.cMinX > cardComp.cMaxX + 10));
      if (!isNeighbor) {
        for (const p of comp.px) keepPixels.add(p);
        if (comp.cMinX < bMinX) bMinX = comp.cMinX;
        if (comp.cMaxX > bMaxX) bMaxX = comp.cMaxX;
        if (comp.cMinY < bMinY) bMinY = comp.cMinY;
        if (comp.cMaxY > bMaxY) bMaxY = comp.cMaxY;
      }
    }

    const pad = 25;
    const outW = bMaxX - bMinX + 1 + pad * 2;
    const outH = bMaxY - bMinY + 1 + pad * 2;
    const cleanBuf = Buffer.alloc(outW * outH, 255);
    for (const p of keepPixels) {
      const cy = Math.floor(p / rW);
      const cx = p % rW;
      const ox = cx - bMinX + pad;
      const oy = cy - bMinY + pad;
      if (ox >= 0 && ox < outW && oy >= 0 && oy < outH) {
        const gy = cfg.minY + cy;
        const gx = cfg.minX + cx;
        cleanBuf[oy * outW + ox] = data[gy * w + gx];
      }
    }

    const png = await sharp(cleanBuf, { raw: { width: outW, height: outH, channels: 1 } }).png().toBuffer();
    const svg = await traceBuffer(png, { turdSize: 8 });
    fs.writeFileSync(path.join(cardsDir, cfg.id), svg);
    console.log(`  ✅ Saved ${cfg.id} (${outW}x${outH}, pad=${pad}px)`);
  }
}

async function repairBlooms() {
  console.log('\n▶ [2/6] Repairing Flower Blooms (flower-bloom-10..16)...');
  const sheet8Path = path.join(RAW_DIR, 'asset-mentah-floral-ilustrations', '8 asset yang harus dibuat.jpeg');
  const { data, info } = await sharp(sheet8Path).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  const seeds = [
    { id: 10, cx: 340, cy: 330 },
    { id: 11, cx: 830, cy: 350 },
    { id: 12, cx: 1290, cy: 360 },
    { id: 13, cx: 1680, cy: 360 },
    { id: 14, cx: 360, cy: 800 },
    { id: 15, cx: 790, cy: 810 },
    { id: 16, cx: 1300, cy: 810 },
    { id: 17, cx: 1700, cy: 800 }, // 8th seed prevents bleed into bloom 16
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

  const bloomsDir = path.join(ASSET_DIR, 'flowers', 'blooms');
  for (const s of seeds.slice(0, 7)) { // Only export blooms 10 to 16
    const assigned = bloomComps[s.id];
    let bMinX = w, bMaxX = 0, bMinY = h, bMaxY = 0;
    const keepPixels = new Set();
    for (const c of assigned) {
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
    const filename = `flower-bloom-${s.id}.svg`;
    fs.writeFileSync(path.join(bloomsDir, filename), svg);
    console.log(`  ✅ Saved ${filename} (${outW}x${outH}, pad=${pad}px)`);
  }
}

async function repairBranches() {
  console.log('\n▶ [3/6] Repairing Branches (branch-04 and branch-05)...');
  const leafPath = path.join(RAW_DIR, 'asset-mentah-leaf-and-branch', '9.jpeg');
  const { data, info } = await sharp(leafPath).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

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
        if (count > 500) comps.push({ count, minX, maxX, minY, maxY, px });
      }
    }
  }

  comps.sort((a,b) => b.count - a.count);
  const branchDir = path.join(ASSET_DIR, 'leaves', 'branches');

  // Comp 0: Left Branch (branch-04)
  // Comp 1: Right Branch (branch-05)
  const branchPairs = [
    { filename: 'branch-04.svg', comp: comps[0] },
    { filename: 'branch-05.svg', comp: comps[1] },
  ];

  for (const bp of branchPairs) {
    const c = bp.comp;
    const pad = 25;
    const outW = c.maxX - c.minX + 1 + pad * 2;
    const outH = c.maxY - c.minY + 1 + pad * 2;
    const cleanBuf = Buffer.alloc(outW * outH, 255);
    for (const p of c.px) {
      const cy = Math.floor(p / w);
      const cx = p % w;
      const ox = cx - c.minX + pad;
      const oy = cy - c.minY + pad;
      if (ox >= 0 && ox < outW && oy >= 0 && oy < outH) {
        cleanBuf[oy * outW + ox] = data[p];
      }
    }

    const png = await sharp(cleanBuf, { raw: { width: outW, height: outH, channels: 1 } }).png().toBuffer();
    const svg = await traceBuffer(png, { turdSize: 10 });
    fs.writeFileSync(path.join(branchDir, bp.filename), svg);
    console.log(`  ✅ Saved ${bp.filename} (${outW}x${outH}, pad=${pad}px)`);
  }
}

async function repairBotanicalLingkaran() {
  console.log('\n▶ [4/6] Repairing Circular Wreaths (botanical-01..16)...');
  const sheetLingkaran = path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-lingkaran.jpeg');
  const { data, info } = await sharp(sheetLingkaran).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  const ornamenDir = path.join(ASSET_DIR, 'ornaments');

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
    const filename = `botanical-${String(c.id).padStart(2, '0')}.svg`;
    fs.writeFileSync(path.join(ornamenDir, filename), svg);
    console.log(`  ✅ Saved ${filename} (${outW}x${outH}, pad=${pad}px)`);
  }
}

async function repairBotanicalKotak() {
  console.log('\n▶ [5/6] Repairing Square Botanical Frames (botanical-17..32)...');
  const sheetKotak = path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-kotak.jpeg');
  const { data, info } = await sharp(sheetKotak).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  const ornamenDir = path.join(ASSET_DIR, 'ornaments');

  let oCount = 17;
  for (let r = 0; r < 2; r++) {
    const rowTop = r * 315;
    const rowH = 315;

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

    for (let c = 0; c < 8 && c < comps.length; c++) {
      const comp = comps[c];
      const pad = 25;
      const outW = comp.maxX - comp.minX + 1 + pad * 2;
      const outH = comp.maxY - comp.minY + 1 + pad * 2;
      const cleanBuf = Buffer.alloc(outW * outH, 255);
      for (const p of comp.px) {
        const cy = Math.floor(p / w);
        const cx = p % w;
        const ox = cx - comp.minX + pad;
        const oy = cy - comp.minY + pad;
        if (ox >= 0 && ox < outW && oy >= 0 && oy < outH) {
          cleanBuf[oy * outW + ox] = data[(rowTop + cy) * w + cx];
        }
      }

      const png = await sharp(cleanBuf, { raw: { width: outW, height: outH, channels: 1 } }).png().toBuffer();
      const svg = await traceBuffer(png, { turdSize: 8 });
      const filename = `botanical-${oCount}.svg`;
      fs.writeFileSync(path.join(ornamenDir, filename), svg);
      console.log(`  ✅ Saved ${filename} (${outW}x${outH}, pad=${pad}px)`);
      oCount++;
    }
  }
}

async function repairSymbol07() {
  console.log('\n▶ [6/6] Repairing Symbol 07 (symbol-07.svg)...');
  const symbol07Path = path.join(ASSET_DIR, 'abstract', 'symbol-07.svg');
  // Perfectly centered crescent moon and star with 15px safe margin
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <path d="M50 20 A22 22 0 0 1 50 80 A28 28 0 1 0 50 20 Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <circle cx="62" cy="45" r="2.5" fill="currentColor"/>
</svg>`;
  fs.writeFileSync(symbol07Path, svg);
  console.log('  ✅ Saved symbol-07.svg (Centered with 15px safe margin)');
}

async function repairDarkTextures() {
  console.log('\n▶ [7/7] Generating Ultra-Luxury Dark Textures (Photographic Composite Overlay)...');
  const size = 1500;
  const rawTextureDir = path.join(RAW_DIR, 'asset-mentah-background-pattern-and-texture');
  const textureDir = path.join(ASSET_DIR, 'textures');
  const t1 = path.join(rawTextureDir, '1.jpeg');
  const t3 = path.join(rawTextureDir, '3.jpeg');

  const darkBase = await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 39, g: 30, b: 34 } // Deep Plum Charcoal #271E22
    }
  }).png().toBuffer();

  if (fs.existsSync(t1)) {
    const paperOverlay = await sharp(t1)
      .resize(size, size, { fit: 'cover' })
      .grayscale()
      .normalize()
      .linear(0.32, 0.34)
      .png()
      .toBuffer();

    const outPaperPath = path.join(textureDir, 'texture-paper-dark.webp');
    await sharp(darkBase)
      .composite([{ input: paperOverlay, blend: 'overlay' }])
      .webp({ quality: 85 })
      .toFile(outPaperPath);
    console.log(`  ✅ texture-paper-dark.webp generated (${fs.statSync(outPaperPath).size} bytes)`);
  }

  if (fs.existsSync(t3)) {
    const linenOverlay = await sharp(t3)
      .resize(size, size, { fit: 'cover' })
      .grayscale()
      .normalize()
      .linear(0.36, 0.32)
      .png()
      .toBuffer();

    const outLinenPath = path.join(textureDir, 'texture-linen-dark.webp');
    await sharp(darkBase)
      .composite([{ input: linenOverlay, blend: 'overlay' }])
      .webp({ quality: 85 })
      .toFile(outLinenPath);
    console.log(`  ✅ texture-linen-dark.webp generated (${fs.statSync(outLinenPath).size} bytes)`);
  }
}

async function main() {
  console.log('================================================================');
  console.log('     HARIKITA COMPREHENSIVE ASSET REPAIR & PURIFICATION         ');
  console.log('================================================================\n');

  await repairCards();
  await repairBlooms();
  await repairBranches();
  await repairBotanicalLingkaran();
  await repairBotanicalKotak();
  await repairSymbol07();
  await repairDarkTextures();

  console.log('\n================================================================');
  console.log('  🎉 ALL FLAGGED ASSETS SUCCESSFULLY REPAIRED & PURIFIED!      ');
  console.log('================================================================\n');
}

main().catch(console.error);
