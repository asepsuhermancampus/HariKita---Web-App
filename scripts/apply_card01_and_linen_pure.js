const sharp = require('sharp');
const path = require('path');
const potrace = require('potrace');
const fs = require('fs');

const CARD_SHEET = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-floral-ilustrations', '9 asset yang harus dibuat.jpeg');
const CARDS_DIR = path.join(__dirname, '..', 'public', 'assets', 'harikita', 'cards');
const TEXTURES_DIR = path.join(__dirname, '..', 'public', 'assets', 'harikita', 'textures');
const LINEN_SRC = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-background-pattern-and-texture', 'authentic_linen_weave.jpg');

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

async function runFix() {
  // 1. REPAIR CARD INVITATION 01 (FULL CLOSED RECTANGLE BOX)
  console.log('▶ [1/3] Generating complete Card Invitation 01 (Closed Box)...');
  const { data, info } = await sharp(CARD_SHEET).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const minX = 30, maxX = 838, minY = 80, maxY = 550;
  const rW = maxX - minX + 1, rH = maxY - minY + 1;
  const binary = new Uint8Array(rW * rH);

  for (let y = 0; y < rH; y++) {
    for (let x = 0; x < rW; x++) {
      binary[y * rW + x] = data[(minY + y) * w + (minX + x)] < 200 ? 1 : 0;
    }
  }

  // Find components
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

  comps.sort((a, b) => b.count - a.count);
  const cardComp = comps[0];
  const pad = 25;
  const outW = cardComp.cMaxX - cardComp.cMinX + 1 + pad * 2;
  const outH = cardComp.cMaxY - cardComp.cMinY + 1 + pad * 2;
  const cleanBuf = Buffer.alloc(outW * outH, 255);
  for (const p of cardComp.px) {
    const cy = Math.floor(p / rW), cx = p % rW;
    const ox = cx - cardComp.cMinX + pad;
    const oy = cy - cardComp.cMinY + pad;
    cleanBuf[oy * outW + ox] = data[(minY + cy) * w + (minX + cx)];
  }

  const cardPng = await sharp(cleanBuf, { raw: { width: outW, height: outH, channels: 1 } }).png().toBuffer();
  const cardSvg = await traceBuffer(cardPng, { turdSize: 8 });
  const cardOutPath = path.join(CARDS_DIR, 'card-invitation-01.svg');
  fs.writeFileSync(cardOutPath, cardSvg);
  console.log(`✅ card-invitation-01.svg written, dimensions: ${outW}x${outH}, size: ${cardSvg.length} bytes`);

  // 2. REPAIR TEXTURE LINEN DARK (AUTHENTIC PURE WOVEN LINEN FABRIC)
  console.log('\n▶ [2/3] Generating Texture Linen Dark (Pure Linen Fabric RGBA WebP)...');
  const size = 1500;
  const brownR = 107, brownG = 87, brownB = 65; // #6B5741
  const linenRaw = await sharp(LINEN_SRC)
    .resize(size, size, { fit: 'cover' })
    .grayscale()
    .normalize()
    .raw()
    .toBuffer();

  const linenRGBA = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const val = linenRaw[i];
    // Tactile textile weave in elegant opacity (16% to 58%)
    const alpha = Math.round(40 + (val / 255) * 108);
    linenRGBA[i * 4] = brownR;
    linenRGBA[i * 4 + 1] = brownG;
    linenRGBA[i * 4 + 2] = brownB;
    linenRGBA[i * 4 + 3] = alpha;
  }

  const linenDarkOut = path.join(TEXTURES_DIR, 'texture-linen-dark.webp');
  await sharp(linenRGBA, { raw: { width: size, height: size, channels: 4 } })
    .webp({ quality: 90 })
    .toFile(linenDarkOut);
  console.log(`✅ texture-linen-dark.webp written, size: ${fs.statSync(linenDarkOut).size} bytes`);

  // 3. ALSO REPAIR TEXTURE LINEN LIGHT (PURE LINEN FABRIC, ELIMINATING OLD MOCKUP TEXT)
  console.log('\n▶ [3/3] Generating Texture Linen Light (Pure Linen Fabric, Natural Ivory)...');
  const linenLightOut = path.join(TEXTURES_DIR, 'texture-linen-light.webp');
  await sharp(LINEN_SRC)
    .resize(size, size, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(linenLightOut);
  console.log(`✅ texture-linen-light.webp written, size: ${fs.statSync(linenLightOut).size} bytes`);
}

runFix().catch(console.error);
