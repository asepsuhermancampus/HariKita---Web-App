const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const potrace = require('potrace');

const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara');
const OUT_DIR = path.join(__dirname, '..', 'public', 'logo-previews', 'test_kotak_pure');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

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

async function testKotakPure() {
  const sheetPath = path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-kotak.jpeg');
  const { data, info } = await sharp(sheetPath)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const cW = width / 8; // 256
  const cH = height / 2; // 315

  console.log(`Sheet Kotak: ${width}x${height}`);

  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 8; c++) {
      const idx = r * 8 + c + 1; // 1..16

      // Cell boundaries with small padding
      const cellLeft = Math.round(c * cW);
      const cellTop = Math.round(r * cH);
      const cellWidth = Math.round(cW);
      const cellHeight = Math.round(cH);

      // Extract this cell
      const cellBuf = await sharp(sheetPath)
        .extract({ left: cellLeft, top: cellTop, width: cellWidth, height: cellHeight })
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const subData = cellBuf.data;
      const subW = cellBuf.info.width;
      const subH = cellBuf.info.height;

      // Binary mask: 1 = stroke (< 210), 0 = background
      const binary = new Uint8Array(subW * subH);
      for (let i = 0; i < subW * subH; i++) {
        binary[i] = subData[i] < 210 ? 1 : 0;
      }

      // Connected component labeling
      const visited = new Uint8Array(subW * subH);
      const components = [];

      for (let y = 0; y < subH; y++) {
        for (let x = 0; x < subW; x++) {
          const pidx = y * subW + x;
          if (binary[pidx] === 1 && !visited[pidx]) {
            let minX = x, maxX = x, minY = y, maxY = y;
            let sumX = 0, sumY = 0, count = 0;
            const queue = [pidx];
            visited[pidx] = 1;
            let head = 0;
            const pixels = [];

            while (head < queue.length) {
              const curr = queue[head++];
              const cy = Math.floor(curr / subW);
              const cx = curr % subW;
              sumX += cx;
              sumY += cy;
              count++;
              pixels.push(curr);

              if (cx < minX) minX = cx;
              if (cx > maxX) maxX = cx;
              if (cy < minY) minY = cy;
              if (cy > maxY) maxY = cy;

              const rad = 2;
              for (let dy = -rad; dy <= rad; dy++) {
                for (let dx = -rad; dx <= rad; dx++) {
                  const ny = cy + dy;
                  const nx = cx + dx;
                  if (nx >= 0 && nx < subW && ny >= 0 && ny < subH) {
                    const nidx = ny * subW + nx;
                    if (binary[nidx] === 1 && !visited[nidx]) {
                      visited[nidx] = 1;
                      queue.push(nidx);
                    }
                  }
                }
              }
            }

            if (count >= 20) {
              components.push({
                minX, maxX, minY, maxY,
                centerX: sumX / count,
                centerY: sumY / count,
                count,
                pixels
              });
            }
          }
        }
      }

      // Sort by size descending
      components.sort((a, b) => b.count - a.count);

      // The primary frame is the largest component!
      // Any other component whose center is close to the cell edge (< 15px) or far from center is neighbor bleed!
      const cellCenterX = subW / 2;
      const cellCenterY = subH / 2;

      const keepPixels = new Set();
      let boundMinX = subW, boundMaxX = 0, boundMinY = subH, boundMaxY = 0;

      for (const comp of components) {
        const touchesEdge = comp.minX <= 2 || comp.maxX >= subW - 3;
        const distFromCenter = Math.abs(comp.centerX - cellCenterX);

        // If it's the main frame (largest, count > 1000), keep it!
        // If it's a smaller component that touches the edge and is far from center, it's bleed from neighbor!
        const isBleed = touchesEdge && distFromCenter > 75 && comp.count < 800;

        if (!isBleed) {
          for (const p of comp.pixels) keepPixels.add(p);
          if (comp.minX < boundMinX) boundMinX = comp.minX;
          if (comp.maxX > boundMaxX) boundMaxX = comp.maxX;
          if (comp.minY < boundMinY) boundMinY = comp.minY;
          if (comp.maxY > boundMaxY) boundMaxY = comp.maxY;
        }
      }

      // Create isolated image
      const pad = 15;
      const outW = boundMaxX - boundMinX + 1 + pad * 2;
      const outH = boundMaxY - boundMinY + 1 + pad * 2;

      const cleanBuf = Buffer.alloc(outW * outH, 255);
      for (const p of keepPixels) {
        const cy = Math.floor(p / subW);
        const cx = p % subW;
        const ox = cx - boundMinX + pad;
        const oy = cy - boundMinY + pad;
        if (ox >= 0 && ox < outW && oy >= 0 && oy < outH) {
          cleanBuf[oy * outW + ox] = subData[p];
        }
      }

      const png = await sharp(cleanBuf, {
        raw: { width: outW, height: outH, channels: 1 }
      }).png().toBuffer();

      const svg = await traceBuffer(png, { turdSize: 8 });

      // Save SVG and render PNG
      fs.writeFileSync(path.join(OUT_DIR, `botanical-${String(16 + idx).padStart(2, '0')}.svg`), svg);

      const colored = svg.replace(/currentColor/g, '#88735B');
      await sharp(Buffer.from(colored))
        .resize(300, 300, { fit: 'contain', background: { r: 248, g: 246, b: 241, alpha: 1 } })
        .png()
        .toFile(path.join(OUT_DIR, `botanical-${String(16 + idx).padStart(2, '0')}.png`));

      console.log(`Saved botanical-${16 + idx} (pure, zero bleed)`);
    }
  }
}

testKotakPure().catch(console.error);
