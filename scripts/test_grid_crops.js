const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const potrace = require('potrace');

const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara');
const TEST_DIR = path.join(__dirname, '..', 'public', 'logo-previews', 'test_crops');

if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });

async function testSheet36() {
  const sheetPath = path.join(RAW_DIR, 'asset-mentah-floral-ilustrations', '36 asset yang harus dibuat.jpeg');
  const meta = await sharp(sheetPath).metadata();
  const W = meta.width; // 2048
  const H = meta.height; // 1680

  const cols = 9;
  const rows = 4;
  const cellW = W / cols; // ~227.55
  const cellH = H / rows; // 420

  console.log(`Sheet 36: ${W}x${H}, cell size: ${cellW.toFixed(1)} x ${cellH.toFixed(1)}`);

  // Test cropping Row 0 (all 9 columns)
  for (let c = 0; c < cols; c++) {
    const left = Math.round(c * cellW);
    const top = Math.round(0 * cellH);
    const width = Math.round(cellW);
    const height = Math.round(cellH);

    // Add slight inner padding to avoid edge bleeding
    const padX = 10;
    const padY = 15;

    const crop = await sharp(sheetPath)
      .extract({
        left: left + padX,
        top: top + padY,
        width: width - padX * 2,
        height: height - padY * 2
      })
      .toFile(path.join(TEST_DIR, `sheet36_r0_c${c}.png`));
  }
  console.log('Saved 9 test crops for sheet 36 row 0');
}

async function testSheet15() {
  const sheetPath = path.join(RAW_DIR, 'asset-mentah-floral-ilustrations', '15 asset yang harus dibuat.jpeg');
  const meta = await sharp(sheetPath).metadata();
  const W = meta.width; // 2048
  const H = meta.height; // 640

  const cols = 15;
  const cellW = W / cols; // ~136.53

  console.log(`Sheet 15: ${W}x${H}, cell width: ${cellW.toFixed(1)}`);

  for (let c = 0; c < 5; c++) {
    const left = Math.round(c * cellW);
    const width = Math.round(cellW);

    const padX = 6;
    const padY = 30;

    await sharp(sheetPath)
      .extract({
        left: left + padX,
        top: padY,
        width: width - padX * 2,
        height: H - padY * 2
      })
      .toFile(path.join(TEST_DIR, `sheet15_c${c}.png`));
  }
  console.log('Saved 5 test crops for sheet 15');
}

async function run() {
  await testSheet36();
  await testSheet15();
}

run().catch(console.error);
