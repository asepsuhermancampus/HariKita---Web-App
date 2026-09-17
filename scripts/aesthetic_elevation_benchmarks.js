const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const potrace = require('potrace');
const sharp = require('sharp');

function upscaleBilinear(srcPng, scale = 2.0) {
  const targetW = Math.round(srcPng.width * scale);
  const targetH = Math.round(srcPng.height * scale);
  const dstPng = new PNG({ width: targetW, height: targetH });

  for (let y = 0; y < targetH; y++) {
    const srcY = y / scale;
    const y0 = Math.floor(srcY);
    const y1 = Math.min(srcPng.height - 1, y0 + 1);
    const dy = srcY - y0;

    for (let x = 0; x < targetW; x++) {
      const srcX = x / scale;
      const x0 = Math.floor(srcX);
      const x1 = Math.min(srcPng.width - 1, x0 + 1);
      const dx = srcX - x0;

      const idx00 = (srcPng.width * y0 + x0) << 2;
      const idx10 = (srcPng.width * y0 + x1) << 2;
      const idx01 = (srcPng.width * y1 + x0) << 2;
      const idx11 = (srcPng.width * y1 + x1) << 2;

      const dstIdx = (targetW * y + x) << 2;

      for (let c = 0; c < 4; c++) {
        const val0 = srcPng.data[idx00 + c] * (1 - dx) + srcPng.data[idx10 + c] * dx;
        const val1 = srcPng.data[idx01 + c] * (1 - dx) + srcPng.data[idx11 + c] * dx;
        dstPng.data[dstIdx + c] = Math.round(val0 * (1 - dy) + val1 * dy);
      }
    }
  }
  return dstPng;
}

function traceMaskBuffer(maskPng, color, optTolerance = 0.2, turdSize = 4) {
  return new Promise((resolve) => {
    const buf = PNG.sync.write(maskPng);
    potrace.trace(
      buf,
      { threshold: 128, optTolerance, turdSize, color },
      (err, svg) => {
        if (err || !svg) return resolve(null);
        const match = svg.match(/d="([^"]+)"/);
        resolve(match && match[1] ? { color, d: match[1] } : null);
      }
    );
  });
}

// 1. ELEVATED EVENT-BOTTOM-RIGHT: Pure Luxury Filigree Lace
async function elevateEventBottomRight() {
  const buf = fs.readFileSync('references/kadio-assets/harvested/event-bottom-right.png');
  const upPng = upscaleBilinear(PNG.sync.read(buf), 2.5);

  const coreMask = new PNG({ width: upPng.width, height: upPng.height });
  const highMask = new PNG({ width: upPng.width, height: upPng.height });
  coreMask.data.fill(255);
  highMask.data.fill(255);

  for (let i = 0; i < upPng.data.length; i += 4) {
    const a = upPng.data[i + 3];
    if (a >= 80) {
      coreMask.data[i] = 0;
      coreMask.data[i + 1] = 0;
      coreMask.data[i + 2] = 0;
      coreMask.data[i + 3] = 255;
    }
    if (a >= 165) {
      highMask.data[i] = 0;
      highMask.data[i + 1] = 0;
      highMask.data[i + 2] = 0;
      highMask.data[i + 3] = 255;
    }
  }

  const [resCore, resHigh] = await Promise.all([
    traceMaskBuffer(coreMask, '#eef3fb', 0.18, 3),
    traceMaskBuffer(highMask, '#ffffff', 0.18, 3),
  ]);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}" width="100%" height="100%">
  <!-- Pure delicate filigree lace, 100% hollow arabesque negative space -->
  <path d="${resCore.d}" fill="#eef3fb" stroke="#eef3fb" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>
  <path d="${resHigh.d}" fill="#ffffff" stroke="#ffffff" stroke-width="0.4" stroke-linejoin="round" fill-rule="evenodd"/>
</svg>`;

  fs.writeFileSync('references/kadio-assets/harvested/svg/elevated_event-bottom-right.svg', svg);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  fs.writeFileSync('references/kadio-assets/harvested/elevated_event-bottom-right_rendered.png', png);
  console.log('Done elevateEventBottomRight');
}

// 2. ELEVATED BRIDE-FLOWER-3: Fresh Botanical Watercolor Eucalyptus/Sage
async function elevateBrideFlower3() {
  const buf = fs.readFileSync('references/kadio-assets/harvested/bride-flower-3.png');
  const upPng = upscaleBilinear(PNG.sync.read(buf), 3.0);

  // 6 rich botanical watercolor layers
  const colors = [
    '#445239', // deep stem & shadow
    '#5c6e4e', // shadow leaf
    '#778a65', // midtone sage
    '#92a580', // fresh leaf body
    '#aec09d', // bright leaf highlight
    '#cbddbb', // soft tip glow
  ];

  const masks = colors.map(() => {
    const m = new PNG({ width: upPng.width, height: upPng.height });
    m.data.fill(255);
    return m;
  });

  for (let i = 0; i < upPng.data.length; i += 4) {
    const a = upPng.data[i + 3];
    if (a >= 30) {
      const r = upPng.data[i];
      const g = upPng.data[i + 1];
      const b = upPng.data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Base foundation covers all visible leaf pixels
      masks[0].data[i] = 0; masks[0].data[i+1] = 0; masks[0].data[i+2] = 0; masks[0].data[i+3] = 255;

      if (lum >= 90) {
        masks[1].data[i] = 0; masks[1].data[i+1] = 0; masks[1].data[i+2] = 0; masks[1].data[i+3] = 255;
      }
      if (lum >= 120) {
        masks[2].data[i] = 0; masks[2].data[i+1] = 0; masks[2].data[i+2] = 0; masks[2].data[i+3] = 255;
      }
      if (lum >= 145) {
        masks[3].data[i] = 0; masks[3].data[i+1] = 0; masks[3].data[i+2] = 0; masks[3].data[i+3] = 255;
      }
      if (lum >= 165) {
        masks[4].data[i] = 0; masks[4].data[i+1] = 0; masks[4].data[i+2] = 0; masks[4].data[i+3] = 255;
      }
      if (lum >= 185) {
        masks[5].data[i] = 0; masks[5].data[i+1] = 0; masks[5].data[i+2] = 0; masks[5].data[i+3] = 255;
      }
    }
  }

  const results = await Promise.all(
    masks.map((m, idx) => traceMaskBuffer(m, colors[idx], 0.22, 5))
  );

  let paths = '';
  for (let i = 0; i < results.length; i++) {
    if (results[i]) {
      paths += `  <path d="${results[i].d}" fill="${colors[i]}" stroke="${colors[i]}" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
    }
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}" width="100%" height="100%">\n${paths}</svg>`;
  fs.writeFileSync('references/kadio-assets/harvested/svg/elevated_bride-flower-3.svg', svg);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  fs.writeFileSync('references/kadio-assets/harvested/elevated_bride-flower-3_rendered.png', png);
  console.log('Done elevateBrideFlower3');
}

// 3. ELEVATED BG-FLOWER-3: Royal Violet Basket & Silk Ribbon
async function elevateBgFlower3() {
  const buf = fs.readFileSync('references/kadio-assets/harvested/bg-flower-3.png');
  const upPng = upscaleBilinear(PNG.sync.read(buf), 1.5);

  // Masks
  const maskRibbonBase = new PNG({ width: upPng.width, height: upPng.height });
  const maskRibbonMid = new PNG({ width: upPng.width, height: upPng.height });
  const maskRibbonHigh = new PNG({ width: upPng.width, height: upPng.height });
  const maskBasket = new PNG({ width: upPng.width, height: upPng.height });
  const maskBasketHigh = new PNG({ width: upPng.width, height: upPng.height });
  const maskVioletBase = new PNG({ width: upPng.width, height: upPng.height });
  const maskVioletMid = new PNG({ width: upPng.width, height: upPng.height });
  const maskVioletHigh = new PNG({ width: upPng.width, height: upPng.height });
  const maskStamen = new PNG({ width: upPng.width, height: upPng.height });
  const maskLeaves = new PNG({ width: upPng.width, height: upPng.height });

  [maskRibbonBase, maskRibbonMid, maskRibbonHigh, maskBasket, maskBasketHigh, maskVioletBase, maskVioletMid, maskVioletHigh, maskStamen, maskLeaves].forEach(m => m.data.fill(255));

  for (let y = 0; y < upPng.height; y++) {
    for (let x = 0; x < upPng.width; x++) {
      const idx = (upPng.width * y + x) << 2;
      const a = upPng.data[idx + 3];
      if (a < 35) continue;

      const r = upPng.data[idx];
      const g = upPng.data[idx + 1];
      const b = upPng.data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // 1. Silk Ribbon (top area or high luminance warm pink/cream)
      if (lum > 175 && (y < upPng.height * 0.55 || (r > 210 && g > 190 && b > 190))) {
        maskRibbonBase.data[idx] = 0; maskRibbonBase.data[idx+1] = 0; maskRibbonBase.data[idx+2] = 0; maskRibbonBase.data[idx+3] = 255;
        if (lum > 215) {
          maskRibbonMid.data[idx] = 0; maskRibbonMid.data[idx+1] = 0; maskRibbonMid.data[idx+2] = 0; maskRibbonMid.data[idx+3] = 255;
        }
        if (lum > 240) {
          maskRibbonHigh.data[idx] = 0; maskRibbonHigh.data[idx+1] = 0; maskRibbonHigh.data[idx+2] = 0; maskRibbonHigh.data[idx+3] = 255;
        }
      }
      // 2. Yellow Golden Stamen
      else if (r > 170 && g > 130 && b < 90 && lum < 180) {
        maskStamen.data[idx] = 0; maskStamen.data[idx+1] = 0; maskStamen.data[idx+2] = 0; maskStamen.data[idx+3] = 255;
      }
      // 3. Green Foliage leaves
      else if (g > r && g > b) {
        maskLeaves.data[idx] = 0; maskLeaves.data[idx+1] = 0; maskLeaves.data[idx+2] = 0; maskLeaves.data[idx+3] = 255;
      }
      // 4. Wicker Basket (warm golden brown, bottom left)
      else if (r > b + 25 && g > b && r > 90 && r < 190 && (x < upPng.width * 0.4 || y > upPng.height * 0.65)) {
        maskBasket.data[idx] = 0; maskBasket.data[idx+1] = 0; maskBasket.data[idx+2] = 0; maskBasket.data[idx+3] = 255;
        if (lum > 115) {
          maskBasketHigh.data[idx] = 0; maskBasketHigh.data[idx+1] = 0; maskBasketHigh.data[idx+2] = 0; maskBasketHigh.data[idx+3] = 255;
        }
      }
      // 5. Royal Violet Flowers
      else {
        maskVioletBase.data[idx] = 0; maskVioletBase.data[idx+1] = 0; maskVioletBase.data[idx+2] = 0; maskVioletBase.data[idx+3] = 255;
        if (lum > 95) {
          maskVioletMid.data[idx] = 0; maskVioletMid.data[idx+1] = 0; maskVioletMid.data[idx+2] = 0; maskVioletMid.data[idx+3] = 255;
        }
        if (lum > 135) {
          maskVioletHigh.data[idx] = 0; maskVioletHigh.data[idx+1] = 0; maskVioletHigh.data[idx+2] = 0; maskVioletHigh.data[idx+3] = 255;
        }
      }
    }
  }

  const [
    rRibBase, rRibMid, rRibHigh,
    rBask, rBaskHigh,
    rVioBase, rVioMid, rVioHigh,
    rStam, rLeaves
  ] = await Promise.all([
    traceMaskBuffer(maskRibbonBase, '#edd6dc', 0.22, 6), // soft blush silk shadow
    traceMaskBuffer(maskRibbonMid, '#f7e7ec', 0.22, 6),  // blush silk body
    traceMaskBuffer(maskRibbonHigh, '#ffffff', 0.22, 5), // pure silk sheen
    traceMaskBuffer(maskBasket, '#8a5e2d', 0.22, 5),     // golden straw basket
    traceMaskBuffer(maskBasketHigh, '#bf894b', 0.22, 5), // wicker highlight
    traceMaskBuffer(maskVioletBase, '#442255', 0.22, 5), // deep royal violet shadow
    traceMaskBuffer(maskVioletMid, '#6c3b85', 0.22, 5),  // vibrant violet petal
    traceMaskBuffer(maskVioletHigh, '#9963b5', 0.22, 5), // bright violet blossom
    traceMaskBuffer(maskStamen, '#f5be27', 0.2, 3),      // golden yellow stamen
    traceMaskBuffer(maskLeaves, '#637e45', 0.22, 5),     // botanical green leaves
  ]);

  let paths = '';
  if (rBask) paths += `  <path d="${rBask.d}" fill="#8a5e2d" stroke="#8a5e2d" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rBaskHigh) paths += `  <path d="${rBaskHigh.d}" fill="#bf894b" stroke="#bf894b" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rLeaves) paths += `  <path d="${rLeaves.d}" fill="#637e45" stroke="#637e45" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rVioBase) paths += `  <path d="${rVioBase.d}" fill="#442255" stroke="#442255" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rVioMid) paths += `  <path d="${rVioMid.d}" fill="#6c3b85" stroke="#6c3b85" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rVioHigh) paths += `  <path d="${rVioHigh.d}" fill="#9963b5" stroke="#9963b5" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rStam) paths += `  <path d="${rStam.d}" fill="#f5be27" stroke="#f5be27" stroke-width="0.4" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rRibBase) paths += `  <path d="${rRibBase.d}" fill="#edd6dc" stroke="#edd6dc" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rRibMid) paths += `  <path d="${rRibMid.d}" fill="#f7e7ec" stroke="#f7e7ec" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rRibHigh) paths += `  <path d="${rRibHigh.d}" fill="#ffffff" stroke="#ffffff" stroke-width="0.4" stroke-linejoin="round" fill-rule="evenodd"/>\n`;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}" width="100%" height="100%">\n${paths}</svg>`;
  fs.writeFileSync('references/kadio-assets/harvested/svg/elevated_bg-flower-3.svg', svg);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  fs.writeFileSync('references/kadio-assets/harvested/elevated_bg-flower-3_rendered.png', png);
  console.log('Done elevateBgFlower3');
}

// 4. ELEVATED 1754648453_KDO54-BG-3: English Ivory Rose & Olive Botanical
async function elevateKdo54Rose() {
  const buf = fs.readFileSync('references/kadio-assets/harvested/1754648453_kdo54-bg-3.png');
  const upPng = upscaleBilinear(PNG.sync.read(buf), 1.8);

  const maskLeafBase = new PNG({ width: upPng.width, height: upPng.height });
  const maskLeafMid = new PNG({ width: upPng.width, height: upPng.height });
  const maskLeafHigh = new PNG({ width: upPng.width, height: upPng.height });
  const maskRoseBase = new PNG({ width: upPng.width, height: upPng.height });
  const maskRoseMid = new PNG({ width: upPng.width, height: upPng.height });
  const maskRoseHigh = new PNG({ width: upPng.width, height: upPng.height });
  const maskRoseCore = new PNG({ width: upPng.width, height: upPng.height });

  [maskLeafBase, maskLeafMid, maskLeafHigh, maskRoseBase, maskRoseMid, maskRoseHigh, maskRoseCore].forEach(m => m.data.fill(255));

  for (let y = 0; y < upPng.height; y++) {
    for (let x = 0; x < upPng.width; x++) {
      const idx = (upPng.width * y + x) << 2;
      const a = upPng.data[idx + 3];
      if (a < 30) continue;

      const r = upPng.data[idx];
      const g = upPng.data[idx + 1];
      const b = upPng.data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // True foliage has real green saturation (not high-key low-sat ivory)
      const inRoseArea = (x > upPng.width * 0.48 && y > upPng.height * 0.46);
      const isIvoryPetal = inRoseArea || (lum > 175 && r > 200 && g > 190 && Math.abs(r - g) < 25 && b > 165);
      const isFoliage = !inRoseArea && !isIvoryPetal && (g > b + 15 && (g >= r * 0.88 || g > r));

      if (isFoliage) {
        maskLeafBase.data[idx] = 0; maskLeafBase.data[idx+1] = 0; maskLeafBase.data[idx+2] = 0; maskLeafBase.data[idx+3] = 255;
        if (lum > 140) {
          maskLeafMid.data[idx] = 0; maskLeafMid.data[idx+1] = 0; maskLeafMid.data[idx+2] = 0; maskLeafMid.data[idx+3] = 255;
        }
        if (lum > 180) {
          maskLeafHigh.data[idx] = 0; maskLeafHigh.data[idx+1] = 0; maskLeafHigh.data[idx+2] = 0; maskLeafHigh.data[idx+3] = 255;
        }
      } else {
        // Rose Petals (Ivory Cream, Champagne Creases & White Highlights)
        maskRoseBase.data[idx] = 0; maskRoseBase.data[idx+1] = 0; maskRoseBase.data[idx+2] = 0; maskRoseBase.data[idx+3] = 255;
        if (lum >= 225) {
          maskRoseMid.data[idx] = 0; maskRoseMid.data[idx+1] = 0; maskRoseMid.data[idx+2] = 0; maskRoseMid.data[idx+3] = 255;
        }
        if (lum >= 244) {
          maskRoseHigh.data[idx] = 0; maskRoseHigh.data[idx+1] = 0; maskRoseHigh.data[idx+2] = 0; maskRoseHigh.data[idx+3] = 255;
        }
        // Warm golden center
        if (r > 230 && g > 195 && b < 165 && inRoseArea) {
          maskRoseCore.data[idx] = 0; maskRoseCore.data[idx+1] = 0; maskRoseCore.data[idx+2] = 0; maskRoseCore.data[idx+3] = 255;
        }
      }
    }
  }

  const [
    rLeafBase, rLeafMid, rLeafHigh,
    rRoseBase, rRoseMid, rRoseHigh, rRoseCore
  ] = await Promise.all([
    traceMaskBuffer(maskLeafBase, '#617548', 0.22, 6), // deep olive
    traceMaskBuffer(maskLeafMid, '#889c6d', 0.22, 6),  // sage green
    traceMaskBuffer(maskLeafHigh, '#afc197', 0.22, 5), // fresh highlight
    traceMaskBuffer(maskRoseBase, '#d9cfbe', 0.22, 6), // petal crease shadow
    traceMaskBuffer(maskRoseMid, '#ede5d5', 0.22, 6),  // ivory petal body
    traceMaskBuffer(maskRoseHigh, '#faf7f0', 0.22, 5), // bright petal edge
    traceMaskBuffer(maskRoseCore, '#f0ca6e', 0.2, 4),  // golden center stamen
  ]);

  let paths = '';
  if (rLeafBase) paths += `  <path d="${rLeafBase.d}" fill="#617548" stroke="#617548" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rLeafMid) paths += `  <path d="${rLeafMid.d}" fill="#889c6d" stroke="#889c6d" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rLeafHigh) paths += `  <path d="${rLeafHigh.d}" fill="#afc197" stroke="#afc197" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rRoseBase) paths += `  <path d="${rRoseBase.d}" fill="#d9cfbe" stroke="#d9cfbe" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rRoseMid) paths += `  <path d="${rRoseMid.d}" fill="#ede5d5" stroke="#ede5d5" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rRoseHigh) paths += `  <path d="${rRoseHigh.d}" fill="#faf7f0" stroke="#faf7f0" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>\n`;
  if (rRoseCore) paths += `  <path d="${rRoseCore.d}" fill="#f0ca6e" stroke="#f0ca6e" stroke-width="0.4" stroke-linejoin="round" fill-rule="evenodd"/>\n`;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${upPng.width} ${upPng.height}" width="100%" height="100%">\n${paths}</svg>`;
  fs.writeFileSync('references/kadio-assets/harvested/svg/elevated_1754648453_kdo54-bg-3.svg', svg);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  fs.writeFileSync('references/kadio-assets/harvested/elevated_1754648453_kdo54-bg-3_rendered.png', png);
  console.log('Done elevateKdo54Rose');
}

async function run() {
  console.log('--- Generating Elevated Assets ---');
  await elevateEventBottomRight();
  await elevateBrideFlower3();
  await elevateBgFlower3();
  await elevateKdo54Rose();
  console.log('--- All 4 Elevated Benchmarks Ready! ---');
}

run();
