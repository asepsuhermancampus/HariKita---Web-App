const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function checkRender() {
  const samples = [
    'flowers/single-stem/flower-single-stem-01.svg',
    'flowers/single-stem/flower-single-stem-02.svg',
    'flowers/single-stem/flower-single-stem-03.svg',
    'flowers/single-stem/flower-single-stem-04.svg',
    'flowers/blooms/flower-bloom-01.svg',
    'flowers/blooms/flower-bloom-02.svg',
    'flowers/accents/flower-accent-01.svg',
    'leaves/branches/branch-01.svg',
    'leaves/branches/branch-02.svg',
    'lines/divider-01.svg',
    'ornaments/botanical-01.svg',
    'ornaments/botanical-17.svg',
    'icons/icon-wedding-rings.svg',
    'icons/icon-two-people.svg',
    'cards/card-invitation-01.svg',
    'cards/card-invitation-03.svg',
  ];

  const outDir = path.join(__dirname, '..', 'public', 'logo-previews', 'checks');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const rel of samples) {
    const p = path.join(__dirname, '..', 'public', 'assets', 'harikita', rel);
    const id = path.basename(rel, '.svg');
    const svg = fs.readFileSync(p, 'utf8').replace(/currentColor/g, '#88735B');

    await sharp(Buffer.from(svg))
      .resize(300, 300, { fit: 'contain', background: { r: 248, g: 246, b: 241, alpha: 1 } })
      .png()
      .toFile(path.join(outDir, `${id}.png`));
  }
  console.log(`Rendered ${samples.length} sample checks to ${outDir}`);
}

checkRender().catch(console.error);
