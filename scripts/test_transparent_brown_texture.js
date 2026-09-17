const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-background-pattern-and-texture');

async function testTransparentBrownTextures() {
  const size = 1500;
  const t1 = path.join(RAW_DIR, '1.jpeg'); // Paper
  const t3 = path.join(RAW_DIR, '3.jpeg'); // Linen

  // Brand brown: #6B5741 (r: 107, g: 87, b: 65) or #88735B (r: 136, g: 115, b: 91)
  // Let's use #6B5741 / #7A624B (Warm Taupe Brown from HariKita palette)
  const brownR = 107, brownG = 87, brownB = 65;

  // 1. PAPER DARK:
  // Extract paper fibers from 1.jpeg as alpha channel
  const paperRaw = await sharp(t1)
    .resize(size, size, { fit: 'cover' })
    .grayscale()
    .normalize()
    .raw()
    .toBuffer();

  // Create RGBA buffer: RGB is constant brand brown, Alpha is derived from fiber contrast
  const paperRGBA = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const val = paperRaw[i]; // 0..255 (paper fibers)
    // Map fiber variation to elegant subtle opacity (e.g. 15% to 50% opacity -> 38 to 128)
    const alpha = Math.round(35 + (val / 255) * 85);
    paperRGBA[i * 4] = brownR;
    paperRGBA[i * 4 + 1] = brownG;
    paperRGBA[i * 4 + 2] = brownB;
    paperRGBA[i * 4 + 3] = alpha;
  }

  const paperOut = await sharp(paperRGBA, { raw: { width: size, height: size, channels: 4 } })
    .webp({ quality: 90 })
    .toBuffer();

  // 2. LINEN DARK:
  // Extract linen cross-weave from 3.jpeg as alpha channel
  const linenRaw = await sharp(t3)
    .resize(size, size, { fit: 'cover' })
    .grayscale()
    .normalize()
    .raw()
    .toBuffer();

  const linenRGBA = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const val = linenRaw[i];
    // Map cross-weave variation to elegant subtle opacity (e.g. 20% to 65% opacity -> 50 to 165)
    const alpha = Math.round(45 + (val / 255) * 110);
    linenRGBA[i * 4] = brownR;
    linenRGBA[i * 4 + 1] = brownG;
    linenRGBA[i * 4 + 2] = brownB;
    linenRGBA[i * 4 + 3] = alpha;
  }

  const linenOut = await sharp(linenRGBA, { raw: { width: size, height: size, channels: 4 } })
    .webp({ quality: 90 })
    .toBuffer();

  console.log('Transparent Paper Dark WebP size:', paperOut.length, 'bytes');
  console.log('Transparent Linen Dark WebP size:', linenOut.length, 'bytes');

  const pStats = await sharp(paperOut).stats();
  console.log('Paper Dark alpha min/max/mean:', pStats.channels[3].min, pStats.channels[3].max, Math.round(pStats.channels[3].mean));

  const lStats = await sharp(linenOut).stats();
  console.log('Linen Dark alpha min/max/mean:', lStats.channels[3].min, lStats.channels[3].max, Math.round(lStats.channels[3].mean));
}

testTransparentBrownTextures().catch(console.error);
