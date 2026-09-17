const sharp = require('sharp');
const path = require('path');

const CARD_SHEET = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-floral-ilustrations', '9 asset yang harus dibuat.jpeg');

async function testCards() {
  const { data, info } = await sharp(CARD_SHEET).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Let's test proposed expanded card boxes and check cuts
  // Card 1: top-left. Let's see how wide it actually is
  // Card 2: top-center. It's an arch/card. Let's see how tall it is!
  // Card 3: top-right.
  // Card 4: mid-left.
  // Card 5: mid-center.
  // Card 6: mid-right.
  // Card 7: bot-left.
  // Card 8: bot-center.
  // Card 9: bot-right.

  const proposedBoxes = [
    { id: 'card-01', left: 40, top: 80, width: 680, height: 460 },
    { id: 'card-02', left: 780, top: 80, width: 550, height: 680 },
    { id: 'card-03', left: 1380, top: 80, width: 550, height: 650 },
    { id: 'card-04', left: 40, top: 580, width: 660, height: 520 },
    { id: 'card-05', left: 780, top: 780, width: 520, height: 680 },
    { id: 'card-06', left: 1320, top: 750, width: 650, height: 620 },
    { id: 'card-07', left: 40, top: 1100, width: 700, height: 700 },
    { id: 'card-08', left: 660, top: 1480, width: 750, height: 480 },
    { id: 'card-09', left: 1340, top: 1300, width: 680, height: 650 },
  ];

  console.log('Testing proposed expanded boxes on 9 asset yang harus dibuat.jpeg:\n');
  for (const box of proposedBoxes) {
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

testCards().catch(console.error);
