import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STUDIO_FONTS, STUDIO_FONT_CATEGORIES, getFontFamilyCss } from '../src/lib/invitation-studio/fonts';
import { HARIKITA_WEDDING_PALETTES, QUICK_ACCENT_COLORS, isValidColorString } from '../src/lib/invitation-studio/colors';
import { createBlankStudioDocument } from '../src/lib/invitation-studio/sections';
import { createStudioNode } from '../src/lib/invitation-studio/editor';
import { validateStudioDocument } from '../src/lib/invitation-studio/validation';

test('katalog font studio menyediakan lebih dari 120 font terkurasi dengan metadata lengkap', () => {
  assert.ok(STUDIO_FONTS.length >= 120, `Jumlah font harus >= 120, ditemukan ${STUDIO_FONTS.length}`);
  assert.equal(STUDIO_FONTS.length, 135);
  assert.ok(STUDIO_FONT_CATEGORIES.length >= 8);

  for (const font of STUDIO_FONTS) {
    assert.ok(font.name && font.name.length > 0, 'Nama font tidak boleh kosong');
    assert.ok(font.category, `Font ${font.name} harus memiliki kategori`);
    assert.ok(['serif', 'sans-serif', 'cursive'].includes(font.fallback), `Fallback font ${font.name} harus valid`);
    assert.match(getFontFamilyCss(font.name), new RegExp(font.name));
  }
});

test('katalog warna studio menyediakan palet tema lengkap dan validasi warna yang fleksibel', () => {
  assert.ok(HARIKITA_WEDDING_PALETTES.length >= 5);
  assert.ok(QUICK_ACCENT_COLORS.length >= 8);

  // Validasi warna hex
  assert.equal(isValidColorString('#4A2E35'), true);
  assert.equal(isValidColorString('#C5A880'), true);
  assert.equal(isValidColorString('#FAF8F5'), true);
  assert.equal(isValidColorString('#FFF'), true);
  assert.equal(isValidColorString('#12345678'), true);
  assert.equal(isValidColorString('rgb(255, 0, 0)'), true);
  assert.equal(isValidColorString('rgba(197, 168, 128, 0.8)'), true);
  assert.equal(isValidColorString('bukan-warna'), false);
  assert.equal(isValidColorString('#ZZZZZZ'), false);
});

test('validator dokumen studio menerima node text dengan fontFamily dan custom styling', () => {
  const d = createBlankStudioDocument();
  const n = createStudioNode('text', 'font-test-node', 'cover');
  n.config = {
    text: 'Ananda & Bintang',
    color: '#D4AF37',
    fontSize: 48,
    align: 'center',
    fontFamily: 'Great Vibes',
    fontWeight: 'bold',
    fontStyle: 'italic',
    letterSpacing: 2,
    lineHeight: 1.4,
  };
  d.sections[0].nodes.push(n);

  const res = validateStudioDocument(d);
  assert.equal(res.success, true);
});
