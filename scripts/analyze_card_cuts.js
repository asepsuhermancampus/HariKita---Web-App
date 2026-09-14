const sharp = require('sharp');
const path = require('path');

const RAW_SHEET = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-floral-ilustrations', '9 asset yang harus dibuat.jpeg');

async function analyze() {
  const meta = await sharp(RAW_SHEET).metadata();
  console.log(`Card Sheet size: ${meta.width}x${meta.height}`);

  const cardBoxes = [
    { id: 'card-01', left: 50, top: 100, width: 620, height: 420 },
    { id: 'card-02', left: 810, top: 110, width: 480, height: 590 },
    { id: 'card-03', left: 1400, top: 110, width: 470, height: 600 },
    { id: 'card-04', left: 80, top: 600, width: 600, height: 500 },
    { id: 'card-05', left: 810, top: 810, width: 430, height: 600 },
    { id: 'card-06', left: 1330, top: 780, width: 590, height: 590 },
    { id: 'card-07', left: 80, top: 1120, width: 650, height: 650 },
    { id: 'card-08', left: 700, top: 1530, width: 680, height: 350 },
    { id: 'card-09', left: 1370, top: 1340, width: 620, height: 550 },
  ];

  const res = await sharp(RAW_SHEET).grayscale().raw().toBuffer({ resolveWithObject: true });
  const data = res.data;
  const w = res.info.width;
  const h = res.info.height;

  for (const box of cardBoxes) {
    let topDark = 0, bottomDark = 0, leftDark = 0, rightDark = 0;
    const right = Math.min(w - 1, box.left + box.width - 1);
    const bottom = Math.min(h - 1, box.top + box.height - 1);

    for (let x = box.left; x <= right; x++) {
      if (data[box.top * w + x] < 200) topDark++;
      if (data[bottom * w + x] < 200) bottomDark++;
    }
    for (let y = box.top; y <= bottom; y++) {
      if (data[y * w + box.left] < 200) leftDark++;
      if (data[y * w + right] < 200) rightDark++;
    }
    console.log(`${box.id}: topCut=${topDark}px, botCut=${bottomDark}px, leftCut=${leftDark}px, rightCut=${rightDark}px`);
  }
}

analyze().catch(console.error);
