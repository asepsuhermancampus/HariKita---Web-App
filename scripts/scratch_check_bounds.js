const fs = require('fs');
const sharp = require('sharp');

async function main() {
  const symbolSvg = fs.readFileSync('public/brand/harikita-symbol.svg', 'utf8');
  const sRes = await sharp(Buffer.from(symbolSvg)).raw().toBuffer({ resolveWithObject: true });
  
  let sMinX = sRes.info.width, sMaxX = 0, sMinY = sRes.info.height, sMaxY = 0;
  for (let y = 0; y < sRes.info.height; y++) {
    for (let x = 0; x < sRes.info.width; x++) {
      const a = sRes.data[(y * sRes.info.width + x) * sRes.info.channels + 3];
      if (a > 10) {
        if (x < sMinX) sMinX = x; if (x > sMaxX) sMaxX = x;
        if (y < sMinY) sMinY = y; if (y > sMaxY) sMaxY = y;
      }
    }
  }

  console.log('Symbol Rendered BBox (in 741x678):', {
    minX: sMinX,
    maxX: sMaxX,
    minY: sMinY,
    maxY: sMaxY,
    width: sMaxX - sMinX,
    height: sMaxY - sMinY,
    topPad: sMinY,
    bottomPad: sRes.info.height - sMaxY,
    leftPad: sMinX,
    rightPad: sRes.info.width - sMaxX
  });

  // Now Wordmark SVG
  const wordmarkPath = fs.readFileSync('public/brand/harikita-logo-horizontal.svg', 'utf8')
    .match(/viewBox="26 36 1898 388"[^>]*>[\s\S]*?<path d="([^"]+)"/)[1];
  
  const wSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="26 36 1898 388" width="1898" height="388"><path d="${wordmarkPath}" fill="#000"/></svg>`;
  const wRes = await sharp(Buffer.from(wSvg)).raw().toBuffer({ resolveWithObject: true });

  let wMinX = wRes.info.width, wMaxX = 0, wMinY = wRes.info.height, wMaxY = 0;
  for (let y = 0; y < wRes.info.height; y++) {
    for (let x = 0; x < wRes.info.width; x++) {
      const a = wRes.data[(y * wRes.info.width + x) * wRes.info.channels + 3];
      if (a > 10) {
        if (x < wMinX) wMinX = x; if (x > wMaxX) wMaxX = x;
        if (y < wMinY) wMinY = y; if (y > wMaxY) wMaxY = y;
      }
    }
  }

  console.log('Wordmark Rendered BBox (in 1898x388):', {
    minX: wMinX,
    maxX: wMaxX,
    minY: wMinY,
    maxY: wMaxY,
    width: wMaxX - wMinX,
    height: wMaxY - wMinY,
    topPad: wMinY,
    bottomPad: wRes.info.height - wMaxY,
    leftPad: wMinX,
    rightPad: wRes.info.width - wMaxX
  });
}

main().catch(console.error);
