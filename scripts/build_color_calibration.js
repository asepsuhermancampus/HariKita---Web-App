const sharp = require('sharp');
const fs = require('fs');

const artifactDir = 'C:/Users/asep.suherman/.gemini/antigravity-ide/brain/0864abd2-810a-440d-9f93-bfaafb312e1a';

// Let's create a dedicated color calibration analysis board
async function buildColorCalibrationBoard() {
  const width = 1600;
  const height = 1100;

  // Let's test 3 calibrations of Champagne:
  // Original: #C9A88A (Sat 39%, Lum 66% - warm orange-tan)
  // Calibration 1 (Subtle Muted Champagne): #C2AF9E (Sat 23%, Lum 69% - elegant desaturated)
  // Calibration 2 (Cashmere Warm Champagne): #C8B5A2 (Sat 27%, Lum 71% - soft golden champagne)
  // Calibration 3 (Pale Luxury Champagne): #CDBCA8 (Sat 26%, Lum 73% - light calm champagne)

  const colors = {
    canvas: '#FAF8F5',
    charcoal: '#2B2B2B',
    taupe: '#88735B',
    ivory: '#F8F6F1',
    softBeigeOriginal: '#E8DED1',
    softBeigeCorrected: '#E5DED5',
    champagneOriginal: '#C9A88A',
    champagneMuted1: '#C2AF9E',
    champagneMuted2: '#C8B5A2',
    champagneMuted3: '#CDBCA8',
  };

  // SVGs for paths
  const symbolSvg = fs.readFileSync(artifactDir + '/harikita_symbol_taupe.svg', 'utf8');
  const wordmarkSvg = fs.readFileSync(artifactDir + '/harikita_wordmark_charcoal.svg', 'utf8');

  const symbolPath = symbolSvg.match(/<path[^>]*d="([^"]+)"/)[1];
  const wordmarkPath = wordmarkSvg.match(/<path[^>]*d="([^"]+)"/)[1];

  const boardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#FAF8F5"/>

    <!-- Header -->
    <text x="60" y="60" font-family="'Playfair Display', Georgia, serif" font-size="30" font-weight="bold" fill="#2B2B2B">HariKita — Kalibrasi &amp; Analisis Warna Visual</text>
    <text x="60" y="90" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="600" fill="#88735B" letter-spacing="2">EVALUASI COLOR TOKENS: SEBELUM VS KOREKSI VISUAL HARIKITA-DESIGN.PNG</text>

    <!-- SECTION 1: PERBANDINGAN TOKEN WARNA (SWATCHES) -->
    <!-- Card Container -->
    <rect x="60" y="115" width="1480" height="285" rx="16" fill="#FFFFFF" stroke="#E5DED5" stroke-width="2"/>
    <text x="85" y="145" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#88735B" letter-spacing="2">01. PERBANDINGAN SWATCHES (TOKEN SEBELUMNYA VS HASIL KOREKSI VISUAL)</text>

    <!-- Column 1: Charcoal -->
    <g transform="translate(100, 175)">
      <circle cx="50" cy="50" r="38" fill="#2B2B2B"/>
      <text x="50" y="112" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B">Charcoal</text>
      <text x="50" y="130" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#2B2B2B">#2B2B2B</text>
      <rect x="15" y="142" width="70" height="22" rx="4" fill="#E8F5E9"/>
      <text x="50" y="157" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" fill="#2E7D32">✅ Tetap</text>
    </g>

    <!-- Column 2: Taupe -->
    <g transform="translate(300, 175)">
      <circle cx="50" cy="50" r="38" fill="#88735B"/>
      <text x="50" y="112" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B">Taupe</text>
      <text x="50" y="130" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#88735B">#88735B</text>
      <rect x="15" y="142" width="70" height="22" rx="4" fill="#E8F5E9"/>
      <text x="50" y="157" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" fill="#2E7D32">✅ Tetap</text>
    </g>

    <!-- Column 3: Ivory -->
    <g transform="translate(500, 175)">
      <circle cx="50" cy="50" r="38" fill="#F8F6F1" stroke="#E5DED5" stroke-width="2"/>
      <text x="50" y="112" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B">Ivory</text>
      <text x="50" y="130" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#88735B">#F8F6F1</text>
      <rect x="15" y="142" width="70" height="22" rx="4" fill="#E8F5E9"/>
      <text x="50" y="157" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" fill="#2E7D32">✅ Tetap</text>
    </g>

    <!-- Column 4: Soft Beige (Perbandingan) -->
    <g transform="translate(710, 175)">
      <!-- Old Soft Beige -->
      <circle cx="28" cy="50" r="30" fill="#E8DED1" stroke="#C5B4A2" stroke-width="1.5"/>
      <!-- Corrected Soft Beige -->
      <circle cx="82" cy="50" r="30" fill="#E5DED5" stroke="#88735B" stroke-width="2.5"/>
      <text x="55" y="112" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B">Soft Beige</text>
      <text x="55" y="130" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="600" fill="#88735B">#E8DED1 → <tspan font-weight="bold" fill="#2B2B2B">#E5DED5</tspan></text>
      <rect x="10" y="142" width="90" height="22" rx="4" fill="#FFF3E0"/>
      <text x="55" y="157" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" fill="#E65100">🔸 Disesuaikan</text>
    </g>

    <!-- Column 5: Champagne (Perbandingan Saturation) -->
    <g transform="translate(970, 175)">
      <!-- Old Champagne -->
      <circle cx="25" cy="50" r="28" fill="#C9A88A" opacity="0.6"/>
      <!-- Muted Champagne (Pilihan Rekomendasi: #C5B39F) -->
      <circle cx="75" cy="50" r="32" fill="#C5B39F" stroke="#88735B" stroke-width="2.5"/>
      <text x="50" y="112" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B">Champagne (Muted)</text>
      <text x="50" y="130" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="600" fill="#88735B">#C9A88A → <tspan font-weight="bold" fill="#2B2B2B">#C5B39F</tspan></text>
      <rect x="5" y="142" width="90" height="22" rx="4" fill="#FFF3E0"/>
      <text x="50" y="157" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" fill="#E65100">🔸 Lebih Muted</text>
    </g>

    <!-- Column 6: Canvas Background (Warna Tambahan) -->
    <g transform="translate(1240, 175)">
      <circle cx="50" cy="50" r="38" fill="#FAF8F5" stroke="#E5DED5" stroke-width="2"/>
      <text x="50" y="112" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B">Canvas Background</text>
      <text x="50" y="130" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#88735B">#FAF8F5</text>
      <rect x="10" y="142" width="80" height="22" rx="4" fill="#E0F2FE"/>
      <text x="50" y="157" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" fill="#0284C7">🔹 Kanvas Ekstra</text>
    </g>


    <!-- SECTION 2: SIMULASI PENERAPAN PADA LOGO IDENTITAS -->
    
    <!-- Box A: Light Stacked (di atas Canvas #FAF8F5, Kartu Ivory #F8F6F1, Border Soft Beige #E5DED5) -->
    <g transform="translate(60, 430)">
      <rect width="460" height="460" rx="16" fill="#F8F6F1" stroke="#E5DED5" stroke-width="2"/>
      <text x="25" y="30" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#88735B" letter-spacing="1.5">LIGHT VERSION (IVORY + SOFT BEIGE BORDER)</text>

      <!-- Symbol Taupe #88735B -->
      <svg x="155" y="55" width="150" height="137.2" viewBox="602 13 741 678">
        <path d="${symbolPath}" fill="#88735B" fill-rule="evenodd"/>
      </svg>
      <!-- Wordmark Charcoal #2B2B2B -->
      <svg x="90" y="215" width="280" height="57.2" viewBox="26 36 1898 388">
        <path d="${wordmarkPath}" fill="#2B2B2B" fill-rule="evenodd"/>
      </svg>
      <!-- Subtitle -->
      <text x="230" y="305" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="600" fill="#88735B" letter-spacing="5">WEDDING &amp; EVENTS</text>
      <!-- Hairline divider -->
      <line x1="195" y1="340" x2="265" y2="340" stroke="#88735B" stroke-width="1.2" opacity="0.5"/>
      <!-- Tagline -->
      <text x="230" y="385" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="20" fill="#88735B">Your Day. Our Story</text>
      
      <text x="230" y="435" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#88735B">Bg: Ivory #F8F6F1 • Border: Soft Beige #E5DED5</text>
    </g>

    <!-- Box B: Dark Stacked dengan Champagne Muted #C5B39F -->
    <g transform="translate(550, 430)">
      <rect width="460" height="460" rx="16" fill="#2B2B2B" stroke="#3D3A37" stroke-width="2"/>
      <text x="25" y="30" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#C5B39F" letter-spacing="1.5">DARK VERSION (DENGAN MUTED CHAMPAGNE #C5B39F)</text>

      <!-- Symbol Champagne Muted #C5B39F -->
      <svg x="155" y="55" width="150" height="137.2" viewBox="602 13 741 678">
        <path d="${symbolPath}" fill="#C5B39F" fill-rule="evenodd"/>
      </svg>
      <!-- Wordmark Ivory #FAF8F5 -->
      <svg x="90" y="215" width="280" height="57.2" viewBox="26 36 1898 388">
        <path d="${wordmarkPath}" fill="#FAF8F5" fill-rule="evenodd"/>
      </svg>
      <!-- Subtitle -->
      <text x="230" y="305" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="600" fill="#C5B39F" letter-spacing="5">WEDDING &amp; EVENTS</text>
      <!-- Hairline divider -->
      <line x1="195" y1="340" x2="265" y2="340" stroke="#C5B39F" stroke-width="1.2" opacity="0.5"/>
      <!-- Tagline -->
      <text x="230" y="385" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="20" fill="#E5DED5">Your Day. Our Story</text>

      <text x="230" y="435" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#C5B39F">Bg: Charcoal #2B2B2B • Simbol: Muted Champagne #C5B39F</text>
    </g>

    <!-- Box C: Pilihan Eksplorasi 3 Tingkat Muted Champagne (Kanan) -->
    <g transform="translate(1040, 430)">
      <rect width="500" height="460" rx="16" fill="#FFFFFF" stroke="#E5DED5" stroke-width="2"/>
      <text x="25" y="30" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="700" fill="#88735B" letter-spacing="1.5">3 PILIHAN TINGKAT MUTED CHAMPAGNE DI LATAR CHARCOAL</text>

      <!-- Option 1: Desaturated Calm #C2AF9E -->
      <g transform="translate(25, 50)">
        <rect width="450" height="115" rx="12" fill="#2B2B2B"/>
        <svg x="20" y="22" width="76" height="69.5" viewBox="602 13 741 678">
          <path d="${symbolPath}" fill="#C2AF9E" fill-rule="evenodd"/>
        </svg>
        <text x="110" y="45" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" fill="#C2AF9E">Opsi 1: Muted Neutral (#C2AF9E)</text>
        <text x="110" y="68" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#FAF8F5">Paling tenang, desaturated, menyatu anggun tanpa kesan oranye.</text>
        <text x="110" y="90" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" fill="#E5DED5">Karakter: Editorial, discreet luxury, ultra calm.</text>
      </g>

      <!-- Option 2: Cashmere Balanced #C5B39F (Rekomendasi Utama) -->
      <g transform="translate(25, 185)">
        <rect width="450" height="115" rx="12" fill="#2B2B2B" stroke="#C5B39F" stroke-width="1.5"/>
        <svg x="20" y="22" width="76" height="69.5" viewBox="602 13 741 678">
          <path d="${symbolPath}" fill="#C5B39F" fill-rule="evenodd"/>
        </svg>
        <text x="110" y="45" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" fill="#C5B39F">Opsi 2: Cashmere Champagne (#C5B39F) ★ Rekomendasi</text>
        <text x="110" y="68" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#FAF8F5">Keseimbangan sempurna antara kehangatan champagne dan kesan muted.</text>
        <text x="110" y="90" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" fill="#E5DED5">Karakter: Hangat, berwibawa, sangat mirip dengan visual di gambar.</text>
      </g>

      <!-- Option 3: Luminous Soft Champagne #C8B5A2 -->
      <g transform="translate(25, 320)">
        <rect width="450" height="115" rx="12" fill="#2B2B2B"/>
        <svg x="20" y="22" width="76" height="69.5" viewBox="602 13 741 678">
          <path d="${symbolPath}" fill="#C8B5A2" fill-rule="evenodd"/>
        </svg>
        <text x="110" y="45" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" fill="#C8B5A2">Opsi 3: Soft Luminous (#C8B5A2)</text>
        <text x="110" y="68" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#FAF8F5">Sedikit lebih terang dan berkilau di latar gelap, kontras tinggi.</text>
        <text x="110" y="90" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" fill="#E5DED5">Karakter: Terang, premium accent, visibilitas tajam di malam hari.</text>
      </g>
    </g>

    <!-- SECTION 3: RINGKASAN TOKEN FINAL (BOTTOM) -->
    <g transform="translate(60, 915)">
      <rect width="1480" height="145" rx="16" fill="#F3EDE6" stroke="#E5DED5" stroke-width="1.5"/>
      <text x="30" y="35" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#2B2B2B" letter-spacing="1">USULAN STRUKTUR TOKEN WARNA RESMI HARIKITA (6 CORE TOKENS):</text>
      <text x="30" y="65" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" fill="#2B2B2B">
        1. <tspan font-weight="bold">--hk-canvas (#FAF8F5):</tspan> Kanvas background utama aplikasi • 
        2. <tspan font-weight="bold">--hk-ivory (#F8F6F1):</tspan> Permukaan kartu primer / wordmark terang • 
        3. <tspan font-weight="bold">--hk-soft-beige (#E5DED5):</tspan> Permukaan sekunder / border halus
      </text>
      <text x="30" y="92" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" fill="#2B2B2B">
        4. <tspan font-weight="bold">--hk-charcoal (#2B2B2B):</tspan> Teks judul &amp; surface dark mode • 
        5. <tspan font-weight="bold">--hk-taupe (#88735B):</tspan> Simbol logo utama &amp; app icon • 
        6. <tspan font-weight="bold">--hk-champagne (#C5B39F):</tspan> Simbol logo dark mode &amp; aksen mewah terkalibrasi
      </text>
      <text x="30" y="120" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-style="italic" fill="#88735B">
        Seluruh token di atas konsisten 100% dengan estetika Cashmere Alabaster &amp; Gilded Champagne pada panduan AGENTS.md tanpa warna emas kuning mencolok.
      </text>
    </g>
  </svg>`;

  await sharp(Buffer.from(boardSvg))
    .png()
    .toFile(artifactDir + '/harikita_color_calibration_review.png');

  console.log('Successfully generated harikita_color_calibration_review.png');
}

buildColorCalibrationBoard().catch(console.error);
