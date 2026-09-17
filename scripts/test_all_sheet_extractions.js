const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara');

async function analyzeGrid(sheetPath, cols, rows, pad = 10) {
  const meta = await sharp(sheetPath).metadata();
  const W = meta.width;
  const H = meta.height;
  const cW = W / cols;
  const cH = H / rows;

  console.log(`Analyzing ${path.basename(sheetPath)}: ${W}x${H} -> ${cols}x${rows}, cell: ${cW.toFixed(1)} x ${cH.toFixed(1)}`);
  return { W, H, cW, cH, cols, rows };
}

async function run() {
  await analyzeGrid(path.join(RAW_DIR, 'asset-mentah-floral-ilustrations', '36 asset yang harus dibuat.jpeg'), 9, 4);
  await analyzeGrid(path.join(RAW_DIR, 'asset-mentah-floral-ilustrations', '15 asset yang harus dibuat.jpeg'), 15, 1);
  await analyzeGrid(path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-lingkaran.jpeg'), 4, 4);
  await analyzeGrid(path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-kotak.jpeg'), 8, 2);
  await analyzeGrid(path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '21 asset yang harus dibuat.jpeg'), 3, 7);
  await analyzeGrid(path.join(RAW_DIR, 'asset-mentah-custom-icons', '2.jpeg'), 5, 4);
  await analyzeGrid(path.join(RAW_DIR, 'asset-mentah-floral-ilustrations', '8 asset yang harus dibuat.jpeg'), 4, 2);
  await analyzeGrid(path.join(RAW_DIR, 'asset-mentah-floral-ilustrations', '9 asset yang harus dibuat.jpeg'), 3, 3);
}

run().catch(console.error);
