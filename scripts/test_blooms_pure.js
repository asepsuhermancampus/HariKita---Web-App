const sharp = require('sharp');
const path = require('path');
const potrace = require('potrace');

const BLOOM_SHEET = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-floral-ilustrations', '8 asset yang harus dibuat.jpeg');

async function testBlooms() {
  const { data, info } = await sharp(BLOOM_SHEET).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  console.log(`Bloom Sheet size: ${w}x${h}`);

  // Sheet 8 has 2 rows x 4 columns = 8 bloom subjects (numbered 10 to 16 in our catalog, 7 items used)
  // Let's find each bloom's bounding box and verify no borders are cut
  const bloomWindows = [
    // Row 0
    { id: 'bloom-10', minX: 10, maxX: 540, minY: 10, maxY: 580 },
    { id: 'bloom-11', minX: 520, maxX: 1050, minY: 10, maxY: 580 },
    { id: 'bloom-12', minX: 1020, maxX: 1560, minY: 10, maxY: 580 },
    { id: 'bloom-13', minX: 1520, maxX: 2040, minY: 10, maxY: 580 },
    // Row 1
    { id: 'bloom-14', minX: 10, maxX: 560, minY: 560, maxY: 1150 },
    { id: 'bloom-15', minX: 520, maxX: 1060, minY: 560, maxY: 1150 },
    { id: 'bloom-16', minX: 1020, maxX: 1560, minY: 560, maxY: 1150 },
    { id: 'bloom-extra', minX: 1520, maxX: 2040, minY: 560, maxY: 1150 },
  ];

  for (const win of bloomWindows) {
    let dMinX = win.maxX, dMaxX = win.minX, dMinY = win.maxY, dMaxY = win.minY;
    let count = 0;
    for (let y = win.minY; y < win.maxY; y++) {
      for (let x = win.minX; x < win.maxX; x++) {
        if (data[y * w + x] < 200) {
          count++;
          if (x < dMinX) dMinX = x;
          if (x > dMaxX) dMaxX = x;
          if (y < dMinY) dMinY = y;
          if (y > dMaxY) dMaxY = y;
        }
      }
    }
    console.log(`${win.id}: darkPixels=${count}, bounds=[L:${dMinX}, R:${dMaxX}, T:${dMinY}, B:${dMaxY}], size=${dMaxX - dMinX + 1}x${dMaxY - dMinY + 1}`);
  }
}

testBlooms().catch(console.error);
