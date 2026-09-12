const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const TEXTURE_DIR = path.join(__dirname, '..', 'public', 'assets', 'harikita', 'textures');
const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-background-pattern-and-texture');

async function generateLuxuryDarkTextures() {
  console.log('▶ Generating Ultra-Luxury Dark Textures (Photographic Composite Overlay)...');
  const size = 1500;
  const t1 = path.join(RAW_DIR, '1.jpeg'); // Real handmade paper
  const t3 = path.join(RAW_DIR, '3.jpeg'); // Real natural linen fabric

  // Base luxury dark background (HariKita Deep Plum Charcoal #271E22)
  const darkBase = await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 39, g: 30, b: 34 } // #271E22
    }
  }).png().toBuffer();

  // 1. PAPER DARK:
  // Extract natural organic fiber shadows & highlights from 1.jpeg
  if (fs.existsSync(t1)) {
    const paperOverlay = await sharp(t1)
      .resize(size, size, { fit: 'cover' })
      .grayscale()
      .normalize()
      .linear(0.32, 0.34) // Gentle contrast preservation
      .png()
      .toBuffer();

    const outPaperPath = path.join(TEXTURE_DIR, 'texture-paper-dark.webp');
    await sharp(darkBase)
      .composite([{ input: paperOverlay, blend: 'overlay' }])
      .webp({ quality: 85 })
      .toFile(outPaperPath);
    console.log(`✅ texture-paper-dark.webp successfully generated (${fs.statSync(outPaperPath).size} bytes)`);
  }

  // 2. LINEN DARK:
  // Extract natural textile cross-weave texture from 3.jpeg
  if (fs.existsSync(t3)) {
    const linenOverlay = await sharp(t3)
      .resize(size, size, { fit: 'cover' })
      .grayscale()
      .normalize()
      .linear(0.36, 0.32)
      .png()
      .toBuffer();

    const outLinenPath = path.join(TEXTURE_DIR, 'texture-linen-dark.webp');
    await sharp(darkBase)
      .composite([{ input: linenOverlay, blend: 'overlay' }])
      .webp({ quality: 85 })
      .toFile(outLinenPath);
    console.log(`✅ texture-linen-dark.webp successfully generated (${fs.statSync(outLinenPath).size} bytes)`);
  }
}

generateLuxuryDarkTextures().catch(console.error);
