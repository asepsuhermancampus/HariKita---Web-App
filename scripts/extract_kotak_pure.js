const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const potrace = require('potrace');

const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara');
const sheetPath = path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-kotak.jpeg');
const ornamenDir = path.join(__dirname, '..', 'public', 'assets', 'harikita', 'ornaments');
const previewDir = path.join(__dirname, '..', 'public', 'logo-previews');

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

async function extractPureKotak() {
  console.log('▶ Extracting and purifying 16 square botanical frames (botanical-17..32)...');
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 8; c++) {
      const idx = 17 + r * 8 + c;
      const cellLeft = c * 256;
      const cellTop = r * 315;
      const cellW = 256;
      const cellH = 315;

      const { data, info } = await sharp(sheetPath)
        .extract({ left: cellLeft, top: cellTop, width: cellW, height: cellH })
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const w = info.width, h = info.height;
      const binary = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) binary[i] = data[i] < 210 ? 1 : 0;

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

      comps.sort((a,b) => b.count - a.count);
      const comp0 = comps[0];
      const keepPixels = new Set();
      let bMinX = w, bMaxX = 0, bMinY = h, bMaxY = 0;

      for (const comp of comps) {
        const isLeftBleed = comp.minX <= 5 && comp.maxX < comp0.minX - 15;
        const isRightBleed = comp.maxX >= w - 5 && comp.minX > comp0.maxX + 15;
        if (!isLeftBleed && !isRightBleed) {
          for (const p of comp.px) keepPixels.add(p);
          if (comp.minX < bMinX) bMinX = comp.minX;
          if (comp.maxX > bMaxX) bMaxX = comp.maxX;
          if (comp.minY < bMinY) bMinY = comp.minY;
          if (comp.maxY > bMaxY) bMaxY = comp.maxY;
        }
      }

      const pad = 12;
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

      // Save to ornaments directory
      const svgPath = path.join(ornamenDir, `botanical-${String(idx).padStart(2, '0')}.svg`);
      fs.writeFileSync(svgPath, svg);

      // Render 22 and 23 to preview PNG for inspection
      if (idx === 22 || idx === 23) {
        const colored = svg.replace(/currentColor/g, '#88735B');
        await sharp(Buffer.from(colored))
          .resize(300, 300, { fit: 'contain', background: { r: 248, g: 246, b: 241, alpha: 1 } })
          .png()
          .toFile(path.join(previewDir, `botanical-${idx}.png`));
        console.log(`Rendered pure preview: botanical-${idx}.png`);
      }

      console.log(`Saved botanical-${idx} (pure, zero bleed)`);
    }
  }
}

if (require.main === module) {
  extractPureKotak()
    .then(() => console.log('✅ ALL 16 SQUARE FRAMES PURIFIED!'))
    .catch(console.error);
}

module.exports = { extractPureKotak };
