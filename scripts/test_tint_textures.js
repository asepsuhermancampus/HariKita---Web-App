const sharp = require('sharp');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara', 'asset-mentah-background-pattern-and-texture');

async function testNegateTint() {
  const t1 = path.join(RAW_DIR, '1.jpeg'); // Paper
  const t3 = path.join(RAW_DIR, '3.jpeg'); // Linen

  // Paper Dark: Invert light paper fibers to create dark handmade paper with organic fiber highlights
  const paperBuf = await sharp(t1)
    .resize(1500, 1500, { fit: 'cover' })
    .grayscale()
    .negate() // background becomes dark (~15), fibers become bright (~30..60)
    .linear(1.8, 15) // boost fiber visibility smoothly, lift floor to ~25 (dark charcoal)
    .tint({ r: 60, g: 46, b: 50 }) // warm deep plum charcoal highlights
    .webp({ quality: 85 })
    .toBuffer();

  // Linen Dark: Invert light linen weave to create dark luxury linen with visible thread weave
  const linenBuf = await sharp(t3)
    .resize(1500, 1500, { fit: 'cover' })
    .grayscale()
    .negate()
    .linear(1.6, 20) // smooth lift
    .tint({ r: 58, g: 45, b: 48 })
    .webp({ quality: 85 })
    .toBuffer();

  console.log('Paper Dark WebP size:', paperBuf.length, 'bytes');
  console.log('Linen Dark WebP size:', linenBuf.length, 'bytes');

  const pStats = await sharp(paperBuf).stats();
  console.log('Paper Dark stats:');
  pStats.channels.forEach((c, idx) => console.log(`  ch${idx}: min=${c.min}, max=${c.max}, mean=${Math.round(c.mean)}`));

  const lStats = await sharp(linenBuf).stats();
  console.log('Linen Dark stats:');
  lStats.channels.forEach((c, idx) => console.log(`  ch${idx}: min=${c.min}, max=${c.max}, mean=${Math.round(c.mean)}`));
}

testNegateTint().catch(console.error);
