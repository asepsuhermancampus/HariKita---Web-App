const sharp = require('sharp');
const potrace = require('potrace');
const svgo = require('svgo');
const fs = require('fs');

const artifactDir = 'C:/Users/asep.suherman/.gemini/antigravity-ide/brain/0864abd2-810a-440d-9f93-bfaafb312e1a';

async function traceTightSymbol() {
  console.log('Preprocessing tight symbol...');

  // Resize 4x with Lanczos3 for super crisp vector curves
  const processedBuffer = await sharp(artifactDir + '/symbol_tight_crop.png')
    .resize(1360, 800, { kernel: 'lanczos3' })
    .grayscale()
    .threshold(190)
    .png()
    .toBuffer();

  fs.writeFileSync(artifactDir + '/preprocessed_tight.png', processedBuffer);

  potrace.trace(processedBuffer, {
    color: '#88735B',
    optCurve: true,
    turdSize: 20,
    alphaMax: 1.0,
    optTolerance: 0.2
  }, (err, svg) => {
    if (err) {
      console.error('Potrace error:', err);
      return;
    }
    
    // Optimize with SVGO
    const optimized = svgo.optimize(svg, {
      multipass: true,
      plugins: [
        'preset-default',
        {
          name: 'removeViewBox',
          active: false
        }
      ]
    });

    // Extract viewBox and paths
    const taupeSvg = optimized.data;
    fs.writeFileSync(artifactDir + '/harikita_symbol_taupe.svg', taupeSvg);
    
    // Replace fill with currentColor
    const currentColorSvg = taupeSvg.replace(/fill="#88735b"/gi, 'fill="currentColor"');
    fs.writeFileSync(artifactDir + '/harikita_symbol_currentcolor.svg', currentColorSvg);

    console.log('Tight Symbol SVG successfully written!');
    console.log('Output length:', currentColorSvg.length);
  });
}

traceTightSymbol().catch(console.error);
