const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const potrace = require('potrace');

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

async function extractIconsPure() {
  const iconPath = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-custom-icons', '2.jpeg');
  const { data, info } = await sharp(iconPath)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const cols = 5;
  const rows = 4;
  const cellW = width / cols;
  const cellH = height / rows;

  const svgs = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const left = Math.round(c * cellW);
      const top = Math.round(r * cellH);
      const w = Math.round(cellW);
      const h = Math.round(cellH);

      // Add 25px inner padding to avoid edge lines from neighboring icons
      const pad = 25;
      const crop = await sharp(iconPath)
        .extract({
          left: left + pad,
          top: top + pad,
          width: w - pad * 2,
          height: h - pad * 2
        })
        .grayscale()
        .threshold(200)
        .toBuffer();

      const svg = await traceBuffer(crop, { turdSize: 10 });
      svgs.push(svg);
    }
  }

  console.log(`Extracted ${svgs.length} pure isolated wedding icons.`);
  return svgs;
}

module.exports = { extractIconsPure };

if (require.main === module) {
  extractIconsPure()
    .then(svgs => console.log('Successfully produced', svgs.length, 'icon SVGs'))
    .catch(console.error);
}
