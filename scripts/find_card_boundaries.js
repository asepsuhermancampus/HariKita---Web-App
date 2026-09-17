const sharp = require('sharp');
const path = require('path');

const CARD_SHEET = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-floral-ilustrations', '9 asset yang harus dibuat.jpeg');

async function findCardBoundaries() {
  const { data, info } = await sharp(CARD_SHEET).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Let's test horizontal projection and vertical projection in sections
  // Row 1 (cards 1, 2, 3): y in [0..600]
  // Row 2 (cards 4, 5, 6): y in [600..1200]
  // Row 3 (cards 7, 8, 9): y in [1200..2048]

  function analyzeSection(name, minX, maxX, minY, maxY) {
    let bestLeft = minX, bestRight = maxX, bestTop = minY, bestBottom = maxY;
    // find actual dark bounds
    let dMinX = maxX, dMaxX = minX, dMinY = maxY, dMaxY = minY;
    let count = 0;
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        if (data[y * w + x] < 200) {
          count++;
          if (x < dMinX) dMinX = x;
          if (x > dMaxX) dMaxX = x;
          if (y < dMinY) dMinY = y;
          if (y > dMaxY) dMaxY = y;
        }
      }
    }
    console.log(`${name}: darkPixels=${count}, bounds=[L:${dMinX}, R:${dMaxX}, T:${dMinY}, B:${dMaxY}], size=${dMaxX - dMinX + 1}x${dMaxY - dMinY + 1}`);
    return { dMinX, dMaxX, dMinY, dMaxY };
  }

  console.log('--- ROW 1 (Cards 1, 2, 3) ---');
  // Card 1: x in [0..750], y in [0..550]
  const c1 = analyzeSection('Card 01', 10, 750, 50, 550);
  // Card 2: x in [720..1360], y in [50..750]
  const c2 = analyzeSection('Card 02', 720, 1360, 50, 750);
  // Card 3: x in [1350..2030], y in [50..750]
  const c3 = analyzeSection('Card 03', 1350, 2030, 50, 750);

  console.log('\n--- ROW 2 (Cards 4, 5, 6) ---');
  // Card 4: x in [10..750], y in [550..1150]
  const c4 = analyzeSection('Card 04', 10, 750, 550, 1150);
  // Card 5: x in [720..1350], y in [750..1450]
  const c5 = analyzeSection('Card 05', 720, 1350, 750, 1450);
  // Card 6: x in [1300..2030], y in [720..1350]
  const c6 = analyzeSection('Card 06', 1300, 2030, 720, 1350);

  console.log('\n--- ROW 3 (Cards 7, 8, 9) ---');
  // Card 7: x in [10..720], y in [1120..2000]
  const c7 = analyzeSection('Card 07', 10, 720, 1120, 2000);
  // Card 8: x in [680..1400], y in [1450..2040]
  const c8 = analyzeSection('Card 08', 680, 1400, 1450, 2040);
  // Card 9: x in [1320..2030], y in [1300..2040]
  const c9 = analyzeSection('Card 09', 1320, 2030, 1300, 2040);
}

findCardBoundaries().catch(console.error);
