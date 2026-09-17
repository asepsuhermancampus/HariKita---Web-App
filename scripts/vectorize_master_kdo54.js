const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const potrace = require('potrace');
const sharp = require('sharp');

function traceMaskBuffer(maskPng, color, optTolerance = 0.2, turdSize = 4) {
  return new Promise((resolve) => {
    const buf = PNG.sync.write(maskPng);
    potrace.trace(
      buf,
      { threshold: 128, optTolerance, turdSize, color },
      (err, svg) => {
        if (err || !svg) return resolve(null);
        const match = svg.match(/d="([^"]+)"/);
        resolve(match && match[1] ? { color, d: match[1] } : null);
      }
    );
  });
}

function getLuminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

async function vectorizeMaster() {
  const pngPath = path.join('references', 'kadio-assets', 'harvested', '1754648453_kdo54-bg-3.png');
  const buf = fs.readFileSync(pngPath);
  const png = PNG.sync.read(buf);
  const w = png.width;
  const h = png.height;

  // Mask definitions for anatomical botanical layers
  const mFoliageDeep = new PNG({ width: w, height: h });
  const mFoliageMid = new PNG({ width: w, height: h });
  const mFoliageLight = new PNG({ width: w, height: h });
  const mFoliageHigh = new PNG({ width: w, height: h });

  const mRoseDeep = new PNG({ width: w, height: h });
  const mRoseMid = new PNG({ width: w, height: h });
  const mRoseHigh = new PNG({ width: w, height: h });
  const mRoseStamen = new PNG({ width: w, height: h });

  const mFineOutline = new PNG({ width: w, height: h });

  [mFoliageDeep, mFoliageMid, mFoliageLight, mFoliageHigh, mRoseDeep, mRoseMid, mRoseHigh, mRoseStamen, mFineOutline].forEach(m => m.data.fill(255));

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) << 2;
      const a = png.data[idx + 3];
      if (a < 35) continue;

      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const lum = getLuminance(r, g, b);

      // Fine pencil outline / vein
      if (lum < 70) {
        mFineOutline.data[idx] = 0; mFineOutline.data[idx+1] = 0; mFineOutline.data[idx+2] = 0; mFineOutline.data[idx+3] = 255;
      }

      // Foliage has green dominance or olive darkness
      const isFoliage = (g > r + 3 && g > b + 10) || (r < 170 && g > b + 10);
      // Rose petal has warm ivory/cream tones
      const isRose = !isFoliage && (r > 170 && g > 150 && b > 120);

      if (isRose) {
        // Golden Stamen center
        if (r > 200 && g > 150 && b < 110 && lum < 185 && x > w * 0.60 && x < w * 0.85 && y > h * 0.50 && y < h * 0.75) {
          mRoseStamen.data[idx] = 0; mRoseStamen.data[idx+1] = 0; mRoseStamen.data[idx+2] = 0; mRoseStamen.data[idx+3] = 255;
        } else {
          mRoseDeep.data[idx] = 0; mRoseDeep.data[idx+1] = 0; mRoseDeep.data[idx+2] = 0; mRoseDeep.data[idx+3] = 255;
          if (lum >= 170) {
            mRoseMid.data[idx] = 0; mRoseMid.data[idx+1] = 0; mRoseMid.data[idx+2] = 0; mRoseMid.data[idx+3] = 255;
          }
          if (lum >= 220) {
            mRoseHigh.data[idx] = 0; mRoseHigh.data[idx+1] = 0; mRoseHigh.data[idx+2] = 0; mRoseHigh.data[idx+3] = 255;
          }
        }
      } else {
        // Foliage (Eucalyptus & Olive branches)
        mFoliageDeep.data[idx] = 0; mFoliageDeep.data[idx+1] = 0; mFoliageDeep.data[idx+2] = 0; mFoliageDeep.data[idx+3] = 255;
        if (lum >= 110) {
          mFoliageMid.data[idx] = 0; mFoliageMid.data[idx+1] = 0; mFoliageMid.data[idx+2] = 0; mFoliageMid.data[idx+3] = 255;
        }
        if (lum >= 150) {
          mFoliageLight.data[idx] = 0; mFoliageLight.data[idx+1] = 0; mFoliageLight.data[idx+2] = 0; mFoliageLight.data[idx+3] = 255;
        }
        if (lum >= 190) {
          mFoliageHigh.data[idx] = 0; mFoliageHigh.data[idx+1] = 0; mFoliageHigh.data[idx+2] = 0; mFoliageHigh.data[idx+3] = 255;
        }
      }
    }
  }

  console.log('Tracing anatomical masks...');
  const [
    rFolDeep, rFolMid, rFolLight, rFolHigh,
    rRoseDeep, rRoseMid, rRoseHigh, rRoseStam,
    rOutline
  ] = await Promise.all([
    traceMaskBuffer(mFoliageDeep, '#425235', 0.22, 6), // deep olive branch
    traceMaskBuffer(mFoliageMid, '#627652', 0.22, 6),  // midtone sage
    traceMaskBuffer(mFoliageLight, '#8aa07a', 0.22, 5),// fresh eucalyptus leaf
    traceMaskBuffer(mFoliageHigh, '#b6cca7', 0.22, 5), // leaf tip highlight
    traceMaskBuffer(mRoseDeep, '#cfbda0', 0.22, 6),    // warm champagne petal crease
    traceMaskBuffer(mRoseMid, '#ecdeb8', 0.22, 6),     // soft ivory petal body
    traceMaskBuffer(mRoseHigh, '#faf6eb', 0.22, 5),    // luminous white petal rim
    traceMaskBuffer(mRoseStamen, '#d49b38', 0.2, 3),   // rich golden stamen
    traceMaskBuffer(mFineOutline, '#293521', 0.18, 4), // delicate botanical leaf veins & stem
  ]);

  let paths = '';
  if (rFolDeep) paths += `  <!-- Deep Olive Foliage -->\n  <path d="${rFolDeep.d}" fill="#425235" stroke="#425235" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rFolMid) paths += `  <!-- Midtone Sage -->\n  <path d="${rFolMid.d}" fill="#627652" stroke="#627652" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rFolLight) paths += `  <!-- Fresh Eucalyptus -->\n  <path d="${rFolLight.d}" fill="#8aa07a" stroke="#8aa07a" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rFolHigh) paths += `  <!-- Leaf Tip Highlight -->\n  <path d="${rFolHigh.d}" fill="#b6cca7" stroke="#b6cca7" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rRoseDeep) paths += `  <!-- Rose Petal Crease Shadow -->\n  <path d="${rRoseDeep.d}" fill="#cfbda0" stroke="#cfbda0" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rRoseMid) paths += `  <!-- Ivory Rose Body -->\n  <path d="${rRoseMid.d}" fill="#ecdeb8" stroke="#ecdeb8" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rRoseHigh) paths += `  <!-- White Petal Highlight -->\n  <path d="${rRoseHigh.d}" fill="#faf6eb" stroke="#faf6eb" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rRoseStam) paths += `  <!-- Golden Center Stamen -->\n  <path d="${rRoseStam.d}" fill="#d49b38" stroke="#d49b38" stroke-width="0.4" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rOutline) paths += `  <!-- Delicate Leaf Veins & Stems -->\n  <path d="${rOutline.d}" fill="#293521" stroke="#293521" stroke-width="0.4" stroke-linejoin="round" fill-rule="evenodd"/>\n`;

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">\n${paths}</svg>`;

  const svgPath = path.join('references', 'kadio-assets', 'harvested', 'svg', '1754648453_kdo54-bg-3.svg');
  fs.writeFileSync(svgPath, svgContent);
  console.log('Saved master SVG to:', svgPath);

  // Render to rendered PNG
  const renderPath = path.join('references', 'kadio-assets', 'harvested', 'elevated_1754648453_kdo54-bg-3_rendered.png');
  const pngOut = await sharp(Buffer.from(svgContent)).png().toBuffer();
  fs.writeFileSync(renderPath, pngOut);
  console.log('Updated rendered PNG at:', renderPath);
}

vectorizeMaster();
