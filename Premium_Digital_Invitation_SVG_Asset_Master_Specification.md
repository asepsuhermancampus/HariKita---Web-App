# PREMIUM DIGITAL INVITATION — SVG ASSET MASTER SPECIFICATION

## 0. Purpose

Dokumen ini adalah master specification untuk AI coding/design agent dalam membangun asset SVG premium untuk 64 template undangan digital.

Target:
- Setiap template memiliki visual identity yang unik.
- Tidak ada decorative SVG yang dipakai ulang secara identik antar-template.
- SVG harus premium, elegant, responsive, scalable, lightweight, animation-ready, dan mobile-friendly.
- Asset harus meningkatkan perceived quality, UI, dan UX secara signifikan.
- Jangan membuat asset generik hanya untuk memenuhi jumlah.

Catatan source:
Daftar template yang diberikan saat ini berjumlah 64 template (8 kategori × 8 template), bukan 65+.

---

# 1. CORE PRINCIPLE

Jangan membangun:
64 template → 1 library SVG generik.

Bangun:
64 template → 64 visual identities → 64 asset systems.

Setiap template harus memiliki:
- primary visual motif
- secondary motif
- signature shape
- border language
- texture language
- decorative language
- icon language
- animation language
- color relationship
- typography relationship

Functional concept boleh sama, tetapi visual implementation harus berbeda.

Contoh:
calendar.svg secara fungsi boleh sama,
tetapi:
- autumnelle-calendar.svg
- javanese-calendar.svg
- medina-calendar.svg
- rose-gold-calendar.svg
harus memiliki visual language masing-masing.

---

# 2. TARGET ASSET

Target dasar:
8–10 core SVG/template

Target premium:
+3–5 premium SVG/template

Optional:
+2–4 animation variants/template

Target keseluruhan:
±640–960 SVG unik.
Dengan animation/UI variants dapat berkembang menjadi ±1.000+ visual assets.

Jangan mengejar jumlah jika kualitas turun.

---

# 3. ASSET SYSTEM PER TEMPLATE

Gunakan struktur:

template/
├── hero/
│   ├── hero-ornament.svg
│   └── hero-frame.svg
├── ornaments/
├── dividers/
├── frames/
├── illustrations/
├── icons/
├── decoration/
└── animation/

Minimal asset families:

1. Hero ornament
2. Hero frame / cover decoration
3. Primary motif
4. Secondary motif
5. Corner ornament
6. Section divider
7. Decorative frame
8. Signature emblem / badge
9. Theme-specific functional icons
10. Interaction decoration
11. Optional animation asset
12. Optional premium accent

---

# 4. UX ASSET SYSTEM

Asset SVG tidak hanya untuk dekorasi.

Buat theme-specific visual treatment untuk:
- calendar
- location
- clock
- maps
- gift
- RSVP
- music
- gallery
- love story
- dress code
- contact
- share
- play
- pause
- arrow
- chevron
- close
- menu

Contoh:
Botanical:
- leaf-calendar
- botanical-pin
- flower-gift

Javanese:
- batik-calendar
- wayang-pin
- royal-gift

Islamic:
- crescent-calendar
- mosque-pin
- arabesque-gift

Celestial:
- moon-calendar
- star-pin
- cosmic-gift

Functional purpose boleh sama; visual design tidak boleh sama.

---

# 5. ANIMATION LANGUAGE

Setiap kategori/template boleh mempunyai animation language sendiri.

Possible behaviors:
- float
- fade
- draw
- rotate
- scale
- pulse
- sparkle
- parallax
- sway
- light sweep

Examples:

Botanical:
leaf sway + floating petals

Javanese:
subtle gold ornament shine

Royal:
foil light sweep

Celestial:
slow star floating + sparkle

Cute:
heart bounce + playful float

Animation harus subtle dan premium, bukan mengganggu readability.

---

# 6. CATEGORY DESIGN DIRECTION

## 6.1 BOTANICAL

Core mood:
eucalyptus, watercolor flowers, garden, earthy palette.

### 01 Autumnelle Garden
Signature:
- autumn leaf wreath
- watercolor autumn bloom
- eucalyptus corner
- falling leaf particles
- garden arch
- pressed flower divider
- botanical envelope

### 02 Tulivelle Blossom
Signature:
- tulip wreath
- tulip bloom cluster
- curved stem
- petal fall
- soft floral frame
- tulip divider
- floral seal

### 03 Fiorella Spring
Signature:
- spring flower cluster
- floating petal
- wildflower meadow
- spring branch
- organic card frame
- floral wave divider
- butterfly silhouette

### 04 Serenade Olive
Signature:
- olive branch crown
- olive leaf cluster
- olive fruit
- Mediterranean arch
- olive line divider
- floating branch
- olive wax seal

### 05 Serenade Dusty Rose
Signature:
- dusty rose wreath
- rosebud cluster
- rose petal drift
- vintage rose frame
- rose scroll divider
- pressed rose
- lace flower corner

### 06 Serenade Deep Moss
Signature:
- moss fern cluster
- deep moss branch
- fern shadow
- forest vine frame
- moss divider
- wild fern corner
- dew particle

### 07 Celestine Botanical
Signature:
- celestine floral crown
- star botanical branch
- moon flower
- botanical orbit
- celestial leaf divider
- floral halo

### 08 Botanica Terracotta
Signature:
- terracotta poppy
- dried botanical bundle
- clay leaf
- sun botanical emblem
- terracotta arch
- earthy divider
- pressed stem

---

# 7. JAVANESE ROYAL

Core mood:
wayang, batik parang/garuda, gebyok teak carving, Keraton grandeur.

### 09 Javanese Royal Keraton
- gebyok carved door
- royal wayang silhouette
- parang border
- teak carving corner
- Keraton crown
- golden pusaka emblem
- royal divider

### 10 Javanese Royal Azurite
- serat scroll
- wayang profile azurite
- azure parang
- Javanese cloud ornament
- royal scroll seal
- carved scroll divider

### 11 Javanese Teak Umber
- teak gebyok
- wood grain frame
- wayang gunungan
- parang carved border
- teak floral carving
- wooden royal seal

### 12 Javanese Ivory Prada
- ivory wayang
- prada gold ornament
- cream parang frame
- Keraton floral carving
- golden gunungan
- royal scroll divider

### 13 Javanese Crimson Palace
- crimson gunungan
- royal red gebyok
- palace crown
- gold parang border
- wayang couple
- royal batik divider

### 14 Javanese Golden Garuda
- golden Garuda emblem
- Garuda wing frame
- golden parang
- royal crown
- wayang pair
- Keraton medallion

### 15 Javanese Kebumen Heritage
- Kebumen heritage emblem
- traditional gebyok
- Java landscape
- heritage wayang
- local batik pattern
- heritage seal

### 16 Javanese White Pearl
- pearl wayang
- white gebyok
- pearl parang
- ivory carving
- royal pearl divider
- white Garuda medallion

---

# 8. ISLAMIC

Core mood:
Islamic arch/dome, arabesque, refined Islamic heritage, emerald/gold, walimah elegance.

### 17 Medina Royal Gold
- Medina arch
- gold arabesque
- royal mosaic
- gold moon medallion
- Islamic lattice
- luxury divider

### 18 Emerald Syar'i Grace
- emerald arch
- emerald arabesque
- leaf Islamic pattern
- mosque lattice
- emerald medallion

### 19 Walimatul 'Ursy Classic
- classic Islamic frame
- walimah ornament
- traditional arabesque
- arch corner
- gold divider

### 20 Al-Fatih Heritage
- heritage arabesque
- Ottoman-inspired frame
- geometric star
- golden lantern
- heritage medallion

### 21 Salsabila Spring
- Salsabila floral
- spring arabesque
- floral Islamic frame
- jasmine ornament
- water ripple divider

### 22 Ar-Rahman Blessings
- blessing rays
- arabesque halo
- floral moon
- ornamental arch
- golden light divider

### 23 Nur Jannah Light
- nur light orbit
- Jannah garden
- light arch
- golden floral star
- luminous divider

### 24 Barakah Rose Gold
- rose-gold mashrabiya
- rose-gold arch
- floral arabesque
- rose moon
- Barakah medallion

IMPORTANT:
Religious/Arabic motifs must be handled respectfully.
Do not create malformed Arabic calligraphy.
If exact sacred text is required, use verified text/source rather than AI-generated pseudo-calligraphy.

---

# 9. MINIMALIST / VOGUE EDITORIAL

Core mood:
clean serif, whitespace, monochrome, thin modern lines.

Rule:
Minimalist must NOT be overloaded with ornament.
Premium comes from precision, proportion, spacing and restraint.

### 25 Seraphicus Vogue
- Seraphicus monogram
- editorial rule
- serif flourish
- micro frame
- signature line

### 26 Minimal Noir Haute
- noir geometric frame
- black ribbon
- editorial corner
- thin double rule
- minimal seal

### 27 Kinfolk Odyssey
- organic sun
- odyssey line art
- editorial landscape
- Kinfolk symbol
- handdrawn divider

### 28 Blanc Studio Pure
- blanc monogram
- hardcover edge
- paper fold
- minimal floral line
- studio divider

### 29 Harmony Gray Architecture
- architectural grid
- concrete line art
- harmony circle
- modern frame
- architectural divider

### 30 Clay Peak Modernist
- clay mountain
- abstract sun
- modernist arch
- organic shape
- clay line divider

### 31 Marble Mist Gallery
- marble vein
- gallery frame
- mist wave
- stone circle
- luxury hairline

### 32 Serenity Sky Editorial
- sky arc
- editorial cloud line
- serenity circle
- soft horizon
- skyline divider

---

# 10. ROYAL LUXURY / ROSE GOLD

Core mood:
gold foil, monogram, velvet burgundy/navy, jewels, glamour.

### 33 Rose Gold Elegance
- rose gold monogram
- foil floral ring
- luxury corner
- rose gold ribbon
- jewel divider

### 34 Glamour Grey Foil
- grey foil medallion
- silver-gold frame
- diamond corner
- foil wave
- glamour divider

### 35 Black Diamond Luxury
- black diamond emblem
- diamond frame
- luxury chevron
- black satin ribbon
- diamond divider

### 36 Burgundy Velvet Bliss
- burgundy crest
- velvet frame
- gold vine
- royal ribbon
- burgundy medallion

### 37 Golden Seafoam Emerald
- emerald jewel
- golden seafoam frame
- jewel leaf
- emerald crown
- golden orbit

### 38 Amber Grace Lustre
- amber crystal
- lustre frame
- golden spark
- amber floral corner
- luxury divider

### 39 Blue Sapphire Royalty
- sapphire crown
- royal sapphire frame
- gold jewel chain
- sapphire medallion
- royal star divider

### 40 Gilded Cameo Emblem
- gilded cameo
- antique frame
- golden profile
- ornate cameo corner
- Victorian divider

---

# 11. RUSTIC VINTAGE

Core mood:
kraft paper, vintage postage, pampas, dried leaves, warm countryside.

### 41 Cocoa Rustic Pampas
- cocoa pampas
- rustic stamp
- kraft corner
- dried grass
- postal divider

### 42 Terracotta Sienna Hearth
- Sienna hearth
- terracotta flower
- clay pot
- rustic window
- earthy divider

### 43 Bohemian Dried Leaves
- boho leaf cluster
- dried palm
- bohemian sun
- woven frame
- boho divider

### 44 Sienna Earth Postal
- postal envelope
- Sienna stamp
- earth leaf
- old paper corner
- postal route line

### 45 Golden Amber Kraft
- amber wheat
- golden kraft frame
- vintage postmark
- wheat crown
- aged paper divider

### 46 Celadon Dried Charm
- celadon botanical
- dried eucalyptus
- ceramic charm
- vintage label
- celadon divider

### 47 Dusty Blush Linen
- linen flower
- blush dried bouquet
- fabric edge
- lace label
- linen divider

### 48 Rustic Pine Country
- pine branch
- mountain country
- pinecone cluster
- woodland badge
- country road

---

# 12. CELESTIAL

Core mood:
stars, constellation, deep cosmos, nebula, floating particles.

### 49 Aeternum Vita Cosmic
- cosmic orbit
- starfield
- Aeternum symbol
- nebula line
- cosmic divider

### 50 Primus Noctis Constellation
- constellation couple
- zodiac ring
- night medallion
- star map
- celestial frame

### 51 Lunar Melody Eclipse
- lunar eclipse
- moon phase
- cosmic wave
- lunar flower
- eclipse divider

### 52 Stellar Nova Nebula
- nova burst
- nebula cloud
- stellar ring
- star medallion
- cosmic particle

### 53 Midnight Blue Horizon
- midnight horizon
- star horizon
- moonline
- night mountain
- horizon divider

### 54 Velvet Noir Galaxy
- velvet galaxy
- black hole orbit
- galaxy medallion
- star dust
- noir cosmic frame

### 55 Aurora Glow Borealis
- aurora ribbon
- northern lights
- aurora particles
- polar star
- aurora wave divider

### 56 Eclipse Solar Corona
- solar corona
- gold eclipse
- solar flare
- sun ring
- eclipse medallion

---

# 13. CUTE / ILLUSTRATED

Core mood:
chibi, kawaii, pastel, sticker, Polaroid, playful illustrations.

### 57 Marielle Forest Tale
- forest character
- cute treehouse
- forest animal
- mushroom cluster
- fairytale frame

### 58 Alleya Sweet Romance
- romantic Polaroid
- love bear
- heart flower
- cute camera
- love letter

### 59 Manga Sweet Kawaii
- manga couple
- sparkle eyes
- manga heart
- kawaii frame
- speech bubble

### 60 Cute Cartoon Maps Kebumen
- cartoon Kebumen map
- cute landmark
- cartoon road
- location character
- travel stamp

### 61 Pastel Joy Confetti
- pastel confetti
- joy burst
- cute ribbon
- party character
- balloon cluster

### 62 Sweet Bubble Heart
- bubble heart
- heart cloud
- bubble character
- floating hearts
- cute frame

### 63 Cotton Candy Clouds
- cotton cloud
- rainbow arc
- cloud character
- candy star
- pastel sky divider

### 64 Doodle Love Notes
- handdrawn heart
- doodle envelope
- love note
- scribble flower
- doodle arrow

---

# 14. FOLDER ARCHITECTURE

Recommended:

assets/
└── invitations/
    ├── botanical/
    │   ├── autumnelle/
    │   ├── tulivelle/
    │   ├── fiorella/
    │   ├── serenade-green/
    │   ├── serenade-rose/
    │   ├── serenade-moss/
    │   ├── celestine/
    │   └── botanica-terracotta/
    ├── javanese/
    ├── islamic/
    ├── minimalist/
    ├── royal/
    ├── rustic/
    ├── celestial/
    └── cute/

Inside every template:

hero/
ornaments/
dividers/
frames/
illustrations/
icons/
decoration/
animation/

---

# 15. SVG TECHNICAL REQUIREMENTS

Every SVG MUST:

- use valid SVG/XML
- have correct viewBox
- be scalable
- be responsive
- avoid raster images unless explicitly required
- avoid external resource dependencies
- avoid broken paths
- avoid clipping errors
- avoid unnecessary metadata
- be optimized/minified where appropriate
- render correctly in modern browsers
- work on mobile viewport
- support CSS-controlled color/opacity where practical
- be animation-ready where relevant

Prefer:
- vector paths
- groups
- reusable internal definitions only when they do not violate cross-template uniqueness
- CSS variables/classes where appropriate
- semantic IDs

Avoid:
- enormous path complexity without visual benefit
- accidental duplicated geometry
- unnecessary filters that destroy performance
- huge embedded base64 images
- fake/pseudo Arabic text

---

# 16. UNIQUENESS RULE

NON-NEGOTIABLE:

An SVG created for one template MUST NOT be reused as-is by another template.

No duplicate:
- ornament
- frame
- divider
- illustration
- hero decoration
- decorative corner
- badge
- emblem
- background pattern
- signature icon

Allowed:
A functional role may be repeated.

Not allowed:
The exact visual asset may be copied between templates.

If two templates need the same concept, redesign it according to their visual DNA.

---

# 17. QUALITY GATE

AI Agent must reject/rework any asset that:

- looks generic
- resembles another template too closely
- feels like a random stock SVG
- has inconsistent stroke language
- has poor path quality
- is not aligned with template identity
- contains excessive tiny details
- damages mobile performance
- has invalid SVG structure
- has poor viewBox
- has clipping/overflow issues
- depends on external resources
- looks cheap or unfinished

Every asset should pass:

✓ Elegant
✓ Premium
✓ Original
✓ Theme-specific
✓ Responsive
✓ Scalable
✓ Lightweight
✓ Animation-ready
✓ Mobile-friendly
✓ Browser-safe
✓ Accessible where applicable
✓ Consistent with template typography
✓ Consistent with template color system

---

# 18. DESIGN QUALITY PRINCIPLE

Do not optimize for "more decoration".

Optimize for:
- hierarchy
- whitespace
- visual rhythm
- contrast
- balance
- consistency
- perceived craftsmanship
- emotional tone
- interaction feedback
- readability

Premium design often comes from restraint.

Especially:
Minimalist → fewer but extremely precise assets.
Royal → richer ornament but controlled.
Javanese → detailed craftsmanship.
Islamic → geometric precision and respectful ornament.
Botanical → organic asymmetry.
Rustic → tactile imperfection.
Celestial → depth and subtle motion.
Cute → playful consistency.

---

# 19. IMPLEMENTATION WORKFLOW FOR AI AGENT

Phase 01 — Audit
1. Read this specification.
2. Inspect existing application structure.
3. Inspect all 64 template definitions.
4. Identify current reusable SVG assets.
5. Detect duplicate/reused assets.
6. Build an asset inventory.

Phase 02 — Visual DNA
For every template create:
- visual identity
- primary motif
- secondary motif
- signature shape
- texture language
- border language
- icon language
- animation language
- color relationship

Phase 03 — Asset Manifest
Create machine-readable manifest, e.g.:

{
  "template": "autumnelle",
  "category": "botanical",
  "assets": [
    {
      "name": "autumn-leaf-wreath",
      "type": "hero",
      "unique": true
    }
  ]
}

Phase 04 — SVG Generation
Generate assets according to manifest.
Do not start all 64 blindly.
Build one category first and validate quality.

Phase 05 — Technical QA
Validate:
- SVG parsing
- viewBox
- dimensions
- path integrity
- browser rendering
- mobile rendering
- file size
- duplicate detection

Phase 06 — Visual QA
Create previews/contact sheets.
Compare all templates side-by-side.
Look for:
- repetition
- visual similarity
- generic-looking assets
- category confusion
- inconsistent quality

Phase 07 — Integration
Integrate assets into:
- hero
- section transitions
- couple section
- event section
- gallery
- RSVP
- gift
- footer
- navigation/interaction elements

Phase 08 — Responsive QA
Test:
- 320px
- 375px
- 390px
- 414px
- tablet
- desktop

Phase 09 — Performance
Check:
- SVG file sizes
- DOM complexity
- animation cost
- loading behavior
- lazy loading
- asset caching

Phase 10 — Final Acceptance
Do not declare completion until:
- all templates have required assets
- uniqueness audit passes
- SVG technical QA passes
- responsive QA passes
- visual QA passes
- no major performance regression exists.

---

# 20. AGENT EXECUTION RULE

IMPORTANT:

Do NOT immediately generate hundreds of SVG files.

First:
1. Analyze this specification.
2. Analyze the existing project.
3. Produce an implementation plan.
4. Produce an asset manifest for all 64 templates.
5. Identify existing assets and duplication.
6. Identify missing assets.
7. Propose the generation order.
8. Wait for validation/approval before mass generation if the agent's workflow supports planning approval.

If automatic execution is requested:
- execute category-by-category
- validate after every category
- keep changes reversible
- never overwrite existing assets blindly
- report created/modified/deleted assets
- report duplicate findings
- report QA findings

---

# 21. FINAL DESIGN GOAL

The end product should NOT feel like:

"one website containing 64 templates."

It should feel like:

"64 individually art-directed premium invitation experiences."

Every template should have enough unique visual language that a user can recognize the template even without seeing its template name.

Success criteria:

A user switching:
Autumnelle → Javanese Royal → Medina → Minimal Noir → Rose Gold → Rustic → Celestial → Cute

should feel like entering a completely new visual world while the underlying product UX remains familiar and easy to use.
