const sharp = require('sharp');
const path = require('path');

const RAW_SHEET = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-lingkaran.jpeg');

async function analyze() {
  const meta = await sharp(RAW_SHEET).metadata();
  console.log(`Lingkaran Sheet size: ${meta.width}x${meta.height}`);

  const res = await sharp(RAW_SHEET).grayscale().raw().toBuffer({ resolveWithObject: true });
  const data = res.data;
  const w = res.info.width;
  const h = res.info.height;

  const wreathX = [320, 775, 1260, 1720];
  const wreathY = [315, 780, 1265, 1730];

  let oCount = 1;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cx = wreathX[c];
      const cy = wreathY[r];
      const left = Math.max(0, Math.round(cx - 245));
      const top = Math.max(0, Math.round(cy - 245));
      const width = Math.min(2048 - left, 490);
      const height = Math.min(2048 - top, 490);
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
      console.log(`botanical-${String(oCount).padStart(2, '0')}: box=[${left}, ${top}, ${width}, ${height}] -> topCut=${topDark}px, botCut=${bottomDark}px, leftCut=${leftDark}px, rightCut=${rightDark}px`);
      oCount++;
    }
  }
}

analyze().catch(console.error);
