const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const RAW_SHEET = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-kotak.jpeg');

async function check() {
  const meta = await sharp(RAW_SHEET).metadata();
  console.log('Raw Sheet Kotak Dimensions:', meta.width, 'x', meta.height);
  // Sheet is 2 rows x 8 columns:
  // Row 0: botanical-17 to botanical-24 (c=0..7)
  // Row 1: botanical-25 to botanical-32 (c=0..7)
  // Notice user flagged:
  // Botanical 17 (Row 0, Col 0 - Left edge of sheet)
  // Botanical 18 (Row 0, Col 1)
  // Botanical 23 (Row 0, Col 6)
  // Botanical 24 (Row 0, Col 7 - Right edge of sheet)
  // Botanical 25 (Row 1, Col 0 - Left edge of sheet)
  // Botanical 26 (Row 1, Col 1)
  // Botanical 31 (Row 1, Col 6)
  // Botanical 32 (Row 1, Col 7 - Right edge of sheet)

  console.log('\nNotice the column pattern of user flagged items:');
  console.log('Col 0 (left edge): botanical-17, botanical-25');
  console.log('Col 1 (near left): botanical-18, botanical-26');
  console.log('Col 6 (near right): botanical-23, botanical-31');
  console.log('Col 7 (right edge): botanical-24, botanical-32');

  const list = [17, 18, 23, 24, 25, 26, 31, 32];
  for (const n of list) {
    const p = path.join(__dirname, '..', 'public', 'assets', 'harikita', 'ornaments', `botanical-${n}.svg`);
    const content = fs.readFileSync(p, 'utf8');
    const vb = content.match(/viewBox="([^"]+)"/)?.[1];
    console.log(`botanical-${n}: viewBox="${vb}", size=${content.length} chars`);
  }
}

check().catch(console.error);
