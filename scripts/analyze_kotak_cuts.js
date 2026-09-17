const sharp = require('sharp');
const path = require('path');

const RAW_SHEET = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-kotak.jpeg');

async function analyze() {
  const { data, info } = await sharp(RAW_SHEET).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  console.log(`Sheet size: ${w}x${h}`);

  // Find connected components across the entire sheet, or by row
  for (let r = 0; r < 2; r++) {
    const rowTop = r * 315;
    const rowH = 315;
    console.log(`\n=== ROW ${r} (Y: ${rowTop}..${rowTop + rowH}) ===`);
    for (let c = 0; c < 8; c++) {
      const nominalLeft = c * 256;
      const nominalRight = nominalLeft + 256;
      // Scan window around nominal
      const winLeft = Math.max(0, nominalLeft - 20);
      const winRight = Math.min(w, nominalRight + 20);

      // Check pixel density in columns around the boundary
      let leftBorderDarkCount = 0;
      let rightBorderDarkCount = 0;
      for (let y = rowTop + 20; y < rowTop + rowH - 20; y++) {
        if (data[y * w + nominalLeft] < 200) leftBorderDarkCount++;
        if (data[y * w + (nominalRight - 1)] < 200) rightBorderDarkCount++;
      }
      console.log(`Cell (r=${r}, c=${c}) [Index ${17 + r * 8 + c}]: nominal=[${nominalLeft}..${nominalRight}] | border cuts: left=${leftBorderDarkCount}px, right=${rightBorderDarkCount}px`);
    }
  }
}

analyze().catch(console.error);
