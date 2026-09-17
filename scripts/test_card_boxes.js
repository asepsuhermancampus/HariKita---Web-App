const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const potrace = require('potrace');

const cardSheet = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-floral-ilustrations', '9 asset yang harus dibuat.jpeg');
const outDir = path.join(__dirname, '..', 'public', 'logo-previews', 'test_cards_pure');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const cardBoxes = [
  // 1: Horizontal rectangle with leaf branch corner
  { left: 50, top: 100, width: 620, height: 420 },
  // 2: Vertical rectangle with bottom floral spray
  { left: 810, top: 110, width: 480, height: 590 },
  // 3: Oval arch with rose stem
  { left: 1400, top: 110, width: 470, height: 600 },
  // 4: Square frame with opposite diagonal leaves
  { left: 80, top: 600, width: 600, height: 500 },
  // 5: Arched dome card with top floral crest
  { left: 810, top: 810, width: 430, height: 600 },
  // 6: Circular botanical wreath frame card
  { left: 1330, top: 780, width: 590, height: 590 },
  // 7: Diamond angled card with delicate leaf branch
  { left: 80, top: 1120, width: 650, height: 650 },
  // 8: Capsule horizontal card with foliage
  { left: 700, top: 1530, width: 680, height: 350 },
  // 9: Rounded square card with diagonal flower corners
  { left: 1370, top: 1340, width: 620, height: 550 },
];

async function run() {
  for (let i = 0; i < cardBoxes.length; i++) {
    const box = cardBoxes[i];
    const crop = await sharp(cardSheet)
      .extract(box)
      .grayscale()
      .threshold(200)
      .toBuffer();

    potrace.trace(crop, { color: 'currentColor', turdSize: 10 }, async (err, svg) => {
      const colored = svg.replace(/currentColor/g, '#88735B');
      await sharp(Buffer.from(colored))
        .resize(300, 300, { fit: 'contain', background: { r: 248, g: 246, b: 241, alpha: 1 } })
        .png()
        .toFile(path.join(outDir, `card_pure_${i + 1}.png`));
      console.log(`Saved card_pure_${i + 1}.png`);
    });
  }
}

run().catch(console.error);
