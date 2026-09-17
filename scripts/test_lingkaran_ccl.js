const sharp = require('sharp');
const path = require('path');

const LINGKARAN_SHEET = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-lingkaran.jpeg');

async function testLingkaran() {
  const { data, info } = await sharp(LINGKARAN_SHEET).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  console.log(`Lingkaran Sheet size: ${w}x${h}`);

  // 4 rows x 4 columns
  const wreathX = [300, 775, 1260, 1720];
  const wreathY = [300, 780, 1265, 1730];

  let oCount = 1;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      // search window around each wreath
      const winLeft = Math.max(0, c * 512);
      const winRight = Math.min(w, (c + 1) * 512);
      const winTop = Math.max(0, r * 512);
      const winBottom = Math.min(h, (r + 1) * 512);

      let dMinX = winRight, dMaxX = winLeft, dMinY = winBottom, dMaxY = winTop;
      let count = 0;
      for (let y = winTop; y < winBottom; y++) {
        for (let x = winLeft; x < winRight; x++) {
          if (data[y * w + x] < 200) {
            count++;
            if (x < dMinX) dMinX = x;
            if (x > dMaxX) dMaxX = x;
            if (y < dMinY) dMinY = y;
            if (y > dMaxY) dMaxY = y;
          }
        }
      }
      const sizeW = dMaxX - dMinX + 1;
      const sizeH = dMaxY - dMinY + 1;
      console.log(`botanical-${String(oCount).padStart(2, '0')}: bounds=[L:${dMinX}, R:${dMaxX}, T:${dMinY}, B:${dMaxY}], size=${sizeW}x${sizeH}, padToCell=[L:${dMinX - winLeft}, R:${winRight - dMaxX}, T:${dMinY - winTop}, B:${winBottom - dMaxY}]`);
      oCount++;
    }
  }
}

testLingkaran().catch(console.error);
