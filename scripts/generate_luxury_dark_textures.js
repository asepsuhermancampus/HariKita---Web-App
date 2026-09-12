const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const TEXTURE_DIR = path.join(__dirname, '..', 'public', 'assets', 'harikita', 'textures');
const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-background-pattern-and-texture');

async function generateDarkTextures() {
  console.log('▶ Generating Ultra-Premium Dark Textures for HariKita...');
  const size = 1500;

  // 1. TEXTURE PAPER DARK
  // Base color: Deep Plum Charcoal (#231A1E -> R:35, G:26, B:30)
  // Source: 1.jpeg (high-res handmade deckle paper)
  const rawPaperPath = path.join(RAW_DIR, '1.jpeg');
  if (fs.existsSync(rawPaperPath)) {
    // Extract fine fiber grain from the raw high-res paper (high pass / contrast)
    const paperGrain = await sharp(rawPaperPath)
      .resize(size, size, { fit: 'cover' })
      .grayscale()
      .normalize()
      .linear(0.25, 0) // reduce grain amplitude to subtle fiber variation
      .toBuffer();

    // Create deep luxury base buffer
    // Tone: Warm Obsidian & Deep Plum Charcoal (#22191D)
    const baseBuf = Buffer.alloc(size * size * 3);
    const grainRes = await sharp(paperGrain).raw().toBuffer();

    for (let i = 0; i < size * size; i++) {
      const g = (grainRes[i] - 32) / 255; // centered variation
      // Base: R:34, G:27, B:30 + grain
      const r = Math.min(255, Math.max(0, Math.round(36 + g * 35)));
      const gCol = Math.min(255, Math.max(0, Math.round(28 + g * 28)));
      const b = Math.min(255, Math.max(0, Math.round(32 + g * 30)));
      baseBuf[i * 3] = r;
      baseBuf[i * 3 + 1] = gCol;
      baseBuf[i * 3 + 2] = b;
    }

    const outPaperPath = path.join(TEXTURE_DIR, 'texture-paper-dark.webp');
    await sharp(baseBuf, { raw: { width: size, height: size, channels: 3 } })
      .sharpen({ sigma: 1.0, m1: 1.2, m2: 0.5 })
      .webp({ quality: 90 })
      .toFile(outPaperPath);
    console.log(`✅ texture-paper-dark.webp generated (${fs.statSync(outPaperPath).size} bytes)`);
  }

  // 2. TEXTURE LINEN DARK
  // Base color: Elegant Rich Dark Linen Weave (#1E1719 -> R:30, G:23, B:25)
  // Source: 3.jpeg (real linen cloth)
  const rawLinenPath = path.join(RAW_DIR, '3.jpeg');
  if (fs.existsSync(rawLinenPath)) {
    // Extract high frequency cross-weave texture
    const linenGrain = await sharp(rawLinenPath)
      .resize(size, size, { fit: 'cover' })
      .grayscale()
      .normalize()
      .linear(0.35, 0)
      .toBuffer();

    const baseLinenBuf = Buffer.alloc(size * size * 3);
    const linenRes = await sharp(linenGrain).raw().toBuffer();

    for (let i = 0; i < size * size; i++) {
      const g = (linenRes[i] - 40) / 255;
      // Tone: Deep Charcoal with subtle warm gilded plum undertone
      const r = Math.min(255, Math.max(0, Math.round(32 + g * 42)));
      const gCol = Math.min(255, Math.max(0, Math.round(25 + g * 35)));
      const b = Math.min(255, Math.max(0, Math.round(28 + g * 38)));
      baseLinenBuf[i * 3] = r;
      baseLinenBuf[i * 3 + 1] = gCol;
      baseLinenBuf[i * 3 + 2] = b;
    }

    const outLinenPath = path.join(TEXTURE_DIR, 'texture-linen-dark.webp');
    await sharp(baseLinenBuf, { raw: { width: size, height: size, channels: 3 } })
      .sharpen({ sigma: 1.2, m1: 1.5, m2: 0.8 })
      .webp({ quality: 90 })
      .toFile(outLinenPath);
    console.log(`✅ texture-linen-dark.webp generated (${fs.statSync(outLinenPath).size} bytes)`);
  }
}

generateDarkTextures().catch(console.error);
