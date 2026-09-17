const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-background-pattern-and-texture');

async function testCompositeTextures() {
  const t1 = path.join(RAW_DIR, '1.jpeg'); // Paper
  const t3 = path.join(RAW_DIR, '3.jpeg'); // Linen

  // Base luxury dark background (HariKita Deep Plum Charcoal #271E22)
  const size = 1500;
  const darkBase = await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 39, g: 30, b: 34 } // #271E22
    }
  }).png().toBuffer();

  // 1. PAPER DARK:
  // Extract high-contrast grain from 1.jpeg
  const paperOverlay = await sharp(t1)
    .resize(size, size, { fit: 'cover' })
    .grayscale()
    .normalize()
    .linear(0.3, 0.35) // keep contrast between 0.35 and 0.65
    .png()
    .toBuffer();

  const paperDark = await sharp(darkBase)
    .composite([{ input: paperOverlay, blend: 'overlay' }])
    .webp({ quality: 85 })
    .toBuffer();

  // 2. LINEN DARK:
  // Extract woven thread contrast from 3.jpeg
  const linenOverlay = await sharp(t3)
    .resize(size, size, { fit: 'cover' })
    .grayscale()
    .normalize()
    .linear(0.35, 0.32)
    .png()
    .toBuffer();

  const linenDark = await sharp(darkBase)
    .composite([{ input: linenOverlay, blend: 'overlay' }])
    .webp({ quality: 85 })
    .toBuffer();

  console.log('Paper Dark WebP size:', paperDark.length, 'bytes');
  console.log('Linen Dark WebP size:', linenDark.length, 'bytes');

  const pStats = await sharp(paperDark).stats();
  console.log('Paper Dark stats:');
  pStats.channels.forEach((c, idx) => console.log(`  ch${idx}: min=${c.min}, max=${c.max}, mean=${Math.round(c.mean)}`));

  const lStats = await sharp(linenDark).stats();
  console.log('Linen Dark stats:');
  lStats.channels.forEach((c, idx) => console.log(`  ch${idx}: min=${c.min}, max=${c.max}, mean=${Math.round(c.mean)}`));
}

testCompositeTextures().catch(console.error);
