const sharp = require('sharp');
const path = require('path');

const RAW_SHEET = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-floral-ilustrations', '8 asset yang harus dibuat.jpeg');

async function analyze() {
  const meta = await sharp(RAW_SHEET).metadata();
  console.log(`Bloom Sheet 8 size: ${meta.width}x${meta.height}`);

  const res = await sharp(RAW_SHEET).grayscale().raw().toBuffer({ resolveWithObject: true });
  const data = res.data;
  const w = res.info.width;
  const h = res.info.height;

  const cW8 = meta.width / 4;
  const cH8 = meta.height / 2;

  let bloomIdx = 10;
  for (let r = 0; r < 2 && bloomIdx <= 16; r++) {
    for (let c = 0; c < 4 && bloomIdx <= 16; c++) {
      const left = Math.round(c * cW8 + 20);
      const top = Math.round(r * cH8 + 20);
      const width = Math.round(cW8 - 40);
      const height = Math.round(cH8 - 40);
      const right = left + width - 1;
      const bottom = top + height - 1;

      let topDark = 0, bottomDark = 0, leftDark = 0, rightDark = 0;
      for (let x = left; x <= right; x++) {
        if (data[top * w + x] < 200) topDark++;
        if (data[bottom * w + x] < 200) bottomDark++;
      }
      for (let y = top; y <= bottom; y++) {
        if (data[y * w + left] < 200) leftDark++;
        if (data[y * w + right] < 200) rightDark++;
      }
      console.log(`bloom-${bloomIdx} (r=${r}, c=${c}): box=[${left}, ${top}, ${width}, ${height}] -> topCut=${topDark}px, botCut=${bottomDark}px, leftCut=${leftDark}px, rightCut=${rightDark}px`);
      bloomIdx++;
    }
  }
}

analyze().catch(console.error);
