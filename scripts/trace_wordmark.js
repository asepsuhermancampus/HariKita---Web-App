const sharp = require('sharp');
const potrace = require('potrace');
const svgo = require('svgo');
const fs = require('fs');

const artifactDir = 'C:/Users/asep.suherman/.gemini/antigravity-ide/brain/0864abd2-810a-440d-9f93-bfaafb312e1a';

async function traceWordmark() {
  console.log('Extracting and tracing HariKita wordmark...');

  // Bounding box from earlier: textMinX: 251, textMaxX: 725, textMinY: 299, textMaxY: 395
  // Crop tightly around 'HariKita'
  const cropBuffer = await sharp('public/HariKita-Design.png')
    .extract({ left: 245, top: 290, width: 490, height: 110 })
    .toBuffer();

  const processedBuffer = await sharp(cropBuffer)
    .resize(1960, 440, { kernel: 'lanczos3' })
    .grayscale()
    .threshold(170)
    .png()
    .toBuffer();

  fs.writeFileSync(artifactDir + '/wordmark_preprocessed.png', processedBuffer);

  potrace.trace(processedBuffer, {
    color: '#2B2B2B',
    optCurve: true,
    turdSize: 15,
    alphaMax: 1.0,
    optTolerance: 0.2
  }, (err, svg) => {
    if (err) {
      console.error('Potrace error:', err);
      return;
    }

    const optimized = svgo.optimize(svg, {
      multipass: true,
      plugins: [
        'preset-default',
        { name: 'removeViewBox', active: false }
      ]
    });

    fs.writeFileSync(artifactDir + '/harikita_wordmark_charcoal.svg', optimized.data);
    const currentColorWordmark = optimized.data.replace(/fill="#2b2b2b"/gi, 'fill="currentColor"');
    fs.writeFileSync(artifactDir + '/harikita_wordmark_currentcolor.svg', currentColorWordmark);

    console.log('Wordmark SVG successfully generated!');
    console.log('Wordmark SVG length:', currentColorWordmark.length);
  });
}

traceWordmark().catch(console.error);
