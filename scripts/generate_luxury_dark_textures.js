const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const TEXTURE_DIR = path.join(__dirname, '..', 'public', 'assets', 'harikita', 'textures');
const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-background-pattern-and-texture');

async function generateLuxuryDarkTextures() {
  console.log('▶ Generating Elegant Transparent Brown Textures (RGBA WebP)...');
  const size = 1500;
  const t1 = path.join(RAW_DIR, '1.jpeg'); // Real handmade paper
  const t3 = path.join(RAW_DIR, '3.jpeg'); // Real natural linen fabric

  // Brand brown from HariKita palette: #6B5741 (Deep Taupe Brown / --color-gold-dark)
  const brownR = 107, brownG = 87, brownB = 65;

  // 1. PAPER DARK (Transparent Brown Paper):
  if (fs.existsSync(t1)) {
    const paperRaw = await sharp(t1)
      .resize(size, size, { fit: 'cover' })
      .grayscale()
      .normalize()
      .raw()
      .toBuffer();

    // Create RGBA buffer: RGB is brand brown, Alpha encodes organic handmade paper fibers
    const paperRGBA = Buffer.alloc(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const val = paperRaw[i];
      // Subtle elegant opacity: 15% to 45% (38 to 115 alpha)
      const alpha = Math.round(38 + (val / 255) * 77);
      paperRGBA[i * 4] = brownR;
      paperRGBA[i * 4 + 1] = brownG;
      paperRGBA[i * 4 + 2] = brownB;
      paperRGBA[i * 4 + 3] = alpha;
    }

    const outPaperPath = path.join(TEXTURE_DIR, 'texture-paper-dark.webp');
    await sharp(paperRGBA, { raw: { width: size, height: size, channels: 4 } })
      .webp({ quality: 90 })
      .toFile(outPaperPath);
    console.log(`✅ texture-paper-dark.webp successfully generated (${fs.statSync(outPaperPath).size} bytes)`);
  }

  // 2. LINEN DARK (Transparent Brown Linen):
  if (fs.existsSync(t3)) {
    const linenRaw = await sharp(t3)
      .resize(size, size, { fit: 'cover' })
      .grayscale()
      .normalize()
      .raw()
      .toBuffer();

    // Create RGBA buffer: RGB is brand brown, Alpha encodes textile cross-weave
    const linenRGBA = Buffer.alloc(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const val = linenRaw[i];
      // Subtle elegant opacity: 18% to 55% (46 to 140 alpha)
      const alpha = Math.round(46 + (val / 255) * 94);
      linenRGBA[i * 4] = brownR;
      linenRGBA[i * 4 + 1] = brownG;
      linenRGBA[i * 4 + 2] = brownB;
      linenRGBA[i * 4 + 3] = alpha;
    }

    const outLinenPath = path.join(TEXTURE_DIR, 'texture-linen-dark.webp');
    await sharp(linenRGBA, { raw: { width: size, height: size, channels: 4 } })
      .webp({ quality: 90 })
      .toFile(outLinenPath);
    console.log(`✅ texture-linen-dark.webp successfully generated (${fs.statSync(outLinenPath).size} bytes)`);
  }
}

generateLuxuryDarkTextures().catch(console.error);
