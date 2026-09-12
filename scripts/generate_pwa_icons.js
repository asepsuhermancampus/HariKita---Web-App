const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generate() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'));
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

  // 1. Generate PNG launcher icons
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192x192.png'));
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512x512.png'));
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-maskable.png'));
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(__dirname, '..', 'public', 'apple-touch-icon.png'));

  // 2. Generate 32x32 and 16x16 for favicon.ico replacement
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(__dirname, '..', 'public', 'favicon-32x32.png'));

  // 3. Update manifest.json and create manifest.webmanifest
  const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
  const manifestWebPath = path.join(__dirname, '..', 'public', 'manifest.webmanifest');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.theme_color = '#FAF8F5';
  manifest.background_color = '#FAF8F5';

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  fs.writeFileSync(manifestWebPath, JSON.stringify(manifest, null, 2));

  console.log('PWA icons and manifests successfully updated!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
