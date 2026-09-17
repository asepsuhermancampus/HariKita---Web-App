const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const potrace = require('potrace');

function traceBuffer(maskPng, color, optTolerance = 0.2, turdSize = 4) {
  return new Promise((resolve) => {
    const buf = PNG.sync.write(maskPng);
    potrace.trace(buf, { threshold: 128, optTolerance, turdSize, color }, (err, svg) => {
      if (err || !svg) return resolve(null);
      const match = svg.match(/d="([^"]+)"/);
      resolve(match ? match[1] : null);
    });
  });
}

async function testThresholds() {
  const origBuf = fs.readFileSync('references/kadio-assets/harvested/event-bottom-right.png');
  const png = PNG.sync.read(origBuf);

  for (const th of [40, 70, 100, 130]) {
    const mask = new PNG({ width: png.width, height: png.height });
    mask.data.fill(255);
    let count = 0;
    for (let i = 0; i < png.data.length; i += 4) {
      if (png.data[i+3] >= th) {
        mask.data[i] = 0;
        mask.data[i+1] = 0;
        mask.data[i+2] = 0;
        mask.data[i+3] = 255;
        count++;
      }
    }
    const d = await traceBuffer(mask, '#ffffff');
    console.log(`Threshold ${th}: pixels=${count}, path commands count=${d ? d.split(/[A-Z]/).length : 0}`);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${png.width} ${png.height}">
  <path d="${d}" fill="#ffffff"/>
</svg>`;
    fs.writeFileSync(`references/kadio-assets/harvested/svg/test-event-th-${th}.svg`, svg);
  }
}

testThresholds();
