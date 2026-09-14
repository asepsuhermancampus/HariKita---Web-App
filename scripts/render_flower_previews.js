const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function renderSvgs() {
  const dir = path.join(__dirname, '..', 'public', 'assets', 'harikita', 'flowers', 'single-stem');
  const outDir = path.join(__dirname, '..', 'public', 'logo-previews', 'rendered_flowers');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let i = 1; i <= 12; i++) {
    const filename = `flower-single-stem-${String(i).padStart(2, '0')}.svg`;
    const svgPath = path.join(dir, filename);
    if (fs.existsSync(svgPath)) {
      const svg = fs.readFileSync(svgPath, 'utf8');
      // replace currentColor with #88735B for clear viewing
      const coloredSvg = svg.replace(/currentColor/g, '#88735B');
      await sharp(Buffer.from(coloredSvg))
        .resize(300, 300, { fit: 'contain', background: { r: 248, g: 246, b: 241, alpha: 1 } })
        .png()
        .toFile(path.join(outDir, `flower_${i}.png`));
    }
  }
  console.log('Rendered first 12 single stem flowers to PNG');
}

renderSvgs().catch(console.error);
