import assert from 'node:assert';

const tokens = {
  charcoal: '#2B2B2B',
  plum: '#4A2E35',
  taupe: '#88735B',
  champagne: '#C9A88A',
  softBeige: '#E8DED1',
  ivory: '#F8F6F1',
  alabaster: '#FAF8F5',
  gildedGold: '#C5A880',
};

function getLuminance(hex) {
  const rgb = hex.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16) / 255);
  const a = rgb.map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function getContrast(hex1, hex2) {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// 1. Charcoal on Alabaster (Target: >= 4.5:1)
const charcoalOnAlabaster = getContrast(tokens.charcoal, tokens.alabaster);
console.log(`Charcoal on Alabaster contrast ratio: ${charcoalOnAlabaster.toFixed(2)}:1`);
assert(charcoalOnAlabaster >= 4.5, `Charcoal contrast fail: ${charcoalOnAlabaster}`);

// 2. Plum on Ivory (Target: >= 4.5:1)
const plumOnIvory = getContrast(tokens.plum, tokens.ivory);
console.log(`Plum on Ivory contrast ratio: ${plumOnIvory.toFixed(2)}:1`);
assert(plumOnIvory >= 4.5, `Plum contrast fail: ${plumOnIvory}`);

// 3. Taupe on Charcoal (Target: >= 3.0:1)
const taupeOnCharcoal = getContrast(tokens.taupe, tokens.charcoal);
console.log(`Taupe on Charcoal contrast ratio: ${taupeOnCharcoal.toFixed(2)}:1`);

// 4. Gilded Gold on Alabaster (< 4.5:1) -> Must be used as accent/decor, not body text!
const goldOnAlabaster = getContrast(tokens.gildedGold, tokens.alabaster);
console.log(`Gilded Gold on Alabaster contrast ratio: ${goldOnAlabaster.toFixed(2)}:1 (accent token)`);

console.log('\n✅ HariKita design token WCAG AA contrast verification passed.');
