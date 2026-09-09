# ARSITEKTUR INDIVIDUALISASI 64 MASTER TEMPLATE UNDANGAN & SMOOTH OUTRO CLOSING GATE
## Platform Acara Lamaran & Pernikahan Hyperlocal "HariKita" (Kabupaten Kebumen)
**Tanggal:** 9 September 2026  
**Status:** Validated Design Spec (Option 1)  
**Tujuan Dokumen:** Memetakan spesifikasi teknis arsitektur individualisasi menyeluruh untuk 64 template undangan digital, pembuatan pustaka vektor SVG kustom mandiri (`src/components/invitation/svg/*`), komponen gerbang penutup mulus bawah (`SmoothOutroClosingGate`), serta tata letak dan narasi puitis khas Kabupaten Kebumen tanpa copy generic.

---

## 1. Ringkasan Eksekutif & Prinsip Desain

Platform HariKita menaungi **64 Master Template Undangan Digital** yang terbagi rapi dalam **8 Arketipe Desain Utama (masing-masing 8 template)**. Agar tidak jatuh ke dalam perangkap "template generik yang hanya berganti warna", arsitektur ini menerapkan **Sistem Individualisasi 12 Dimensi (12-Dimensional Individuation System)**. Setiap template memiliki:
1. **Identitas Vektor SVG Khas Sendiri:** Tidak bergantung pada file raster bitmap luar yang lambat/rentan hilang.
2. **Narasi Sastra & Ayat Non-Generic:** Bahasa sastrawi Nusantara, filosofi Jawa (*Bimantara & Citrarasmi*), ayat Al-Qur'an terjemahan kontemporer, dan narasi cinta modern.
3. **Soundscape Terkurasi:** Instrumen khas berlisensi (piano akustik, gamelan pelog, nay gambus, string orkestra, lo-fi, kotak musik).
4. **Gerbang Depan Unik (Intro Cover Gate):** Wax seal 3D, gerbang kori agung, tirai beludru, amplop pos kraft, atau lembar majalah mode.
5. **Gerbang Penutup Bawah Mulus (Smooth Outro Closing Gate):** Efek penutup interaktif otomatis saat tamu menyelesaikan pembacaan undangan hingga ke titik paling bawah.

---

## 2. Master Matrix 64 Template & Identitas Arketipe

| No | ID Template | Nama Resmi | Arketipe | Visual Identifier / SVG Motif | Cover Gate Depan | Outro Closing Effect | Soundscape Utama |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **01** | `autumnelle` | Autumnelle Garden | Botanical | Daun maple & urat emas | Envelope Minimal | Dedaunan melayang merapat melingkar | Piano Akustik Hangat |
| **02** | `tulivelle` | Tulivelle Blossom | Botanical | Kuncup tulip Belanda cat air | Envelope Minimal | Bunga menguncup lembut | Cello & Harpa Musim Semi |
| **03** | `fiorella` | Fiorella Spring | Botanical | Mawar liar Tuscan bertumpuk | Envelope Minimal | Kelopak mawar menaburi layar | Solo Biola Romantis |
| **04** | `serenade-olive` | Serenade Olive | Botanical | Ranting zaitun Mediterania | Envelope Minimal | Ranting zaitun mengikat bingkai | Akustik Mediterania |
| **05** | `serenade-dusty-rose`| Serenade Dusty Rose | Botanical | Mawar berdebu gurun | Envelope Minimal | Tirai kain dusty rose menutup | String Orchestra Lambat |
| **06** | `serenade-deep-moss` | Serenade Deep Moss | Botanical | Pakis hutan lumut pinus basah | Envelope Minimal | Bayangan kabut hutan pinus | Ambient Forest & Piano |
| **07** | `celestine` | Celestine Botanical | Botanical | Eucalyptus slate & kristal es | Envelope Minimal | Bingkai kristal membeku lembut | Piano Minimalis Lembut |
| **08** | `botanica-terracotta`| Botanica Terracotta | Botanical | Palem kering & tembikar tanah liat | Envelope Minimal | Kertas terlipat warna terracotta | Folk Fingerstyle Gitar |
| **09** | `heritage-parang` | Javanese Royal Keraton | Javanese | Gunungan Wayang & Parang Rusak | Kori Agung Keraton | Tancep Kayon & Selendang Batik | Gamelan Ladrang Wilujeng |
| **10** | `javanese-azurite` | Javanese Royal Azurite | Javanese | Ukiran prada emas di bludru biru | Kori Agung Keraton | Tirai biru safir merapat | Gamelan Sekaten Halus |
| **11** | `javanese-teak` | Javanese Teak Umber | Javanese | Gebyok jati ukir klasik | Kori Gebyok Kayu | Pintu gebyok jati merapat | Gamelan Siter & Suling |
| **12** | `javanese-ivory` | Javanese Ivory Prada | Javanese | Mori putih suci berhias prada | Kori Agung Keraton | Lipatan kain mori bersulam | Gamelan Pelog Ayun-Ayun |
| **13** | `javanese-crimson` | Javanese Crimson Palace | Javanese | Beludru merah paes ageng | Kori Agung Keraton | Tirai crimson berenda emas menutup | Karawitan Kagok Pangrawit |
| **14** | `javanese-garuda` | Javanese Golden Garuda | Javanese | Sayap Garuda prada Mataram | Kori Agung Keraton | Sayap garuda mengatup | Gamelan Gendhing Kebo Giro |
| **15** | `javanese-kebumen` | Javanese Kebumen Heritage| Javanese | Burung Walet Emas & Batik Jagatan | Gerbang Pendopo Kabumian | Walet berpasangan hinggap di gapura | Gamelan Banyumasan Halus |
| **16** | `javanese-pearl` | Javanese White Pearl | Javanese | Roncean untaian melati tibo dodo | Kori Agung Keraton | Roncean melati menyatu di tengah | Alunan Suling & Rebab |
| **17** | `arabesque-royal` | Medina Royal Gold | Islamic | Lengkungan tapal kuda oktagram | Gerbang Nabawi | Mihrab berkatup doa barakah | Oud & Nay Timur Tengah |
| **18** | `emerald-syari` | Emerald Syar'i Grace | Islamic | Daun zamrud geometri Madinah | Gerbang Nabawi | Ornamen kubah zamrud merapat | Gambus Akustik Syahdu |
| **19** | `walimatul-ursy` | Walimatul 'Ursy Classic | Islamic | Kaligrafi Thuluth melingkar | Gerbang Sutra Krem | Surat Ar-Rum terpatri keemasan | Rebana Duff & Nay Lirih |
| **20** | `al-fatih` | Al-Fatih Heritage | Islamic | Mozaik Iznik biru Istanbul | Gerbang Sultan Utsmani | Pintu ukir Ottoman merapat | Instrumental Kanun Turki |
| **21** | `salsabila` | Salsabila Spring | Islamic | Mata air jannah & bunga melati air | Gerbang Mint Oasis | Gemericik embun surga memudar | Flute Arabesque Damai |
| **22** | `ar-rahman` | Ar-Rahman Blessings | Islamic | Bintang 8 penjuru gurun emas | Gerbang Kubah Emas | Mozaik bintang berputar lalu terkunci | Solo Oud Kontemplatif |
| **23** | `nur-jannah` | Nur Jannah Light | Islamic | Pendaran cahaya perak kaligrafi | Gerbang Cahaya | Pendar cahaya meredup hangat | Instrumental Biola Islami |
| **24** | `barakah-gold` | Barakah Rose Gold | Islamic | Kubah lengkung bunga rose gold | Gerbang Kubah Feminin | Tirai rose gold merapat anggun | Petikan Harpa & Mandolin |
| **25** | `editorial-vogue` | Seraphicus Vogue | Minimalist | Garis asimetris 1px & monogram serif| Sampul Majalah Mode | Efek lipatan halaman majalah (*fold*) | Rhodes Electric Piano |
| **26** | `minimal-noir` | Minimal Noir Haute | Minimalist | Tipografi kapital kontras tinggi | Stark Monochrome Fold | Shutter kamera blitz hitam-putih | Ambient Lo-Fi Beat Halus |
| **27** | `kinfolk-odyssey` | Kinfolk Odyssey | Minimalist | Kertas berserat & polaroid sudut | Paper Sleeve Sliding | Amplop kertas pos taupe tertutup | Gitar Petik Santai Senja |
| **28** | `blanc-pure` | Blanc Studio Pure | Minimalist | Bayangan kartu floating putih | Minimal Pure Slide | Fade-out kartu seni kontemporer | Piano Neoklasik Solo |
| **29** | `harmony-gray` | Harmony Gray Architecture| Minimalist | Garis grid arsitektur modern | Architectural Pocket | Garis grid memadat menjadi satu titik | Synth Pad Minimalis |
| **30** | `clay-peak` | Clay Peak Modernist | Minimalist | Siluet bukit tanah liat adobe | Terracotta Sleeve | Blok warna tanah liat menyatu | Akustik Spanyol Halus |
| **31** | `marble-mist` | Marble Mist Gallery | Minimalist | Urat marmer Carrara tipis | Marble Gallery Portal | Pelat marmer merapat halus | Cello Solo Kontemporer |
| **32** | `serenity-sky` | Serenity Sky Editorial | Minimalist | Garis horizon cakrawala biru | Morning Horizon Gate | Cakrawala langit meredup senja | Piano Berdawai Hangat |
| **33** | `aurum-velvet` | Rose Gold Elegance | Rose Gold | Stempel lilin leleh 3D & inisial | Wax Seal 3D Stamped | Segel lilin 3D mendarat dan terkunci | Orkestra String Romantis |
| **34** | `glamour-grey` | Glamour Grey Foil | Rose Gold | Foil perak holografis embossed | Wax Seal Platinum | Cap perak mendarat di amplop abu | Cinematic String & Piano |
| **35** | `black-diamond` | Black Diamond Luxury | Rose Gold | Aksen kristal faset berlian | Wax Seal Obsidian | Kristal berlian memantulkan kilau | Grand Piano Megah |
| **36** | `burgundy-bliss` | Burgundy Velvet Bliss | Rose Gold | Beludru merah anggur berenda foil | Wax Seal Wine Red | Tirai beludru marun menutup lembut | Biola & Harpa Klasik |
| **37** | `emerald-seafoam` | Golden Seafoam Emerald | Rose Gold | Aliran foil emas cair di atas toska | Wax Seal Emerald | Lelehan emas membeku menjadi cap | Flute & Strings Lembut |
| **38** | `amber-grace` | Amber Grace Lustre | Rose Gold | Permata getah amber tembus pandang | Wax Seal Amber Madu | Bayangan cahaya lilin meredup | Akustik Hangat Intim |
| **39** | `blue-sapphire` | Blue Sapphire Royalty | Rose Gold | Filigree mahkota emas safir | Wax Seal Imperial Blue | Mahkota safir terkunci di tengah | Orkestra Kerajaan Megah |
| **40** | `gilded-cameo` | Gilded Cameo Emblem | Rose Gold | Medali cameo siluet profil | Wax Seal Vintage Cameo | Liontin cameo menutup bingkai | Harpsichord & Biola Kuno |
| **41** | `boho-pampas` | Cocoa Rustic Pampas | Rustic | Bulu pampas halus & simpul rami | Kraft Postal Envelope | Surat pos terlipat dengan cap pos | Folk Akustik Fingerstyle |
| **42** | `terracotta-hearth` | Terracotta Sienna Hearth | Rustic | Dinding bata perapian pedesaan | Kraft Tie Envelope | Ikatan tali rami menyimpul kembali | Petikan Banjo Lirih |
| **43** | `dried-leaves` | Bohemian Dried Leaves | Rustic | Daun monstera & pakis kering | Herbarium Glass Fold | Kaca herbarium merapat berbingkai | Gitar Akustik Hutan |
| **44** | `sienna-earth` | Sienna Earth Postal | Rustic | Garis airmail vintage & perangko | Postal Airmail Flap | Perangko pos Kebumen dicap lunas | Harmonika & Akustik Folk |
| **45** | `golden-amber` | Golden Amber Kraft | Rustic | Sablon tinta putih di kertas kraft | Raw Kraft Tie | Kertas cokelat terikat pita jerami | Fingerpicking Gitar Hangat |
| **46** | `celadon-dried` | Celadon Dried Charm | Rustic | Bunga baby's breath kering | Dried Flower Pocket | Bunga kering terselip rapi di amplop | Musik Akustik Lembut |
| **47** | `dusty-blush` | Dusty Blush Linen | Rustic | Serat tenun kain linen alami | Linen Fabric Wrap | Kain linen membungkus kartu kembali | Piano Santai Bernada Kayu |
| **48** | `rustic-pine` | Rustic Pine Country | Rustic | Kerucut pinus & jarum cemara | Pine Wooden Gate | Gerbang kayu pondok merapat | Suara Angin & Akustik |
| **49** | `starlight-nocturne` | Aeternum Vita Cosmic | Celestial | Rasi bintang zodiak berkilau | Moon Phase Wheel Gate | Bintang meluncur membentuk cincin | Piano & Synth Kosmik |
| **50** | `primus-noctis` | Primus Noctis Constellation | Celestial | Kompas pelaut kuno & polaris | Midnight Blue Compass | Jarum kompas berputar lalu diam | Ambient Deep Space Piano |
| **51** | `lunar-melody` | Lunar Melody Eclipse | Celestial | Cincin gerhana matahari (*corona*) | Solar Eclipse Disc | Gerhana kembali ke fase sabit tipis | Lonceng Angin & Cello |
| **52** | `stellar-nova` | Stellar Nova Nebula | Celestial | Awan debu galaksi ungu magenta | Nebula Cloud Gate | Awan nebula menyelimuti layar | Synth Pad Luas Romantis |
| **53** | `midnight-horizon` | Midnight Blue Horizon | Celestial | Siluet ombak malam Pantai Menganti | Abyssal Wave Gate | Ombak malam membasahi cakrawala | Suara Debur Ombak Lirih |
| **54** | `velvet-galaxy` | Velvet Noir Galaxy | Celestial | Kristal tabur di atas beludru hitam | Starry Velvet Curtain | Tirai beludru berbintang menutup | Grand Piano & Solo Cello |
| **55** | `aurora-glow` | Aurora Glow Borealis | Celestial | Gelombang pendar aurora toska | Borealis Wave Reveal | Cahaya aurora meredup ke langit malam| Ambient Harpa Kristal |
| **56** | `eclipse-solar` | Eclipse Solar Corona | Celestial | Halo emas di balik siluet bumi | Corona Ring Gate | Lingkaran halo memusat ke satu titik | Musik Meditasi Kosmik |
| **57** | `marielle-forest` | Marielle Forest Tale | Cute Illustrated | Kelinci hutan & daun clover hijau | Hardcover Storybook | Buku dongeng menutup berhias pita | Kotak Musik & Ukulele |
| **58** | `alleya-romance` | Alleya Sweet Romance | Cute Illustrated | Ilustrasi cangkir kopi & roti manis| Parisian Cafe Menu | Buku menu kafe menutup rapi | Akordeon Prancis Ceria |
| **59** | `manga-kawaii` | Manga Sweet Kawaii | Cute Illustrated | Balon teks komik & stiker hati | Comic Book Panel | Halaman komik terbalik ke sampul | J-Pop Romance Instrumental |
| **60** | `cartoon-maps` | Cute Cartoon Maps Kebumen | Cute Illustrated | Tugu Lawet & mobil mini Kebumen | Isometric Map Unfold | Mobil kartun terparkir di venue | Ukulele Akustik Ceria |
| **61** | `pastel-confetti` | Pastel Joy Confetti | Cute Illustrated | Pita confetti warna makaron | Party Popper Gate | Confetti berhamburan lalu mengendap | Marimba & Piano Ceria |
| **62** | `sweet-bubble` | Sweet Bubble Heart | Cute Illustrated | Gelembung sabun transparan interaktif| Floating Bubble Pop | Gelembung menyatu jadi hati besar | Glockenspiel & Bell |
| **63** | `cotton-candy` | Cotton Candy Clouds | Cute Illustrated | Awan gula kapas pink-biru | Dreamy Cloud Fold | Awan pastel menutup layar perlahan | Musik Kotak Lilin Impian |
| **64** | `doodle-notes` | Doodle Love Notes | Cute Illustrated | Kertas binder & stiker selotip | Notebook Binder Cover | Buku harian berklip terkunci | Petikan Gitar Lo-Fi Cozy |

---

## 3. Pustaka Vektor SVG Kustom Mandiri (`src/components/invitation/svg/*`)

Semua ikon dan ornamen dibuat sebagai komponen React murni berbasis `<svg>` dengan parameter `className`, `color`, dan `size`, sehingga resolusinya tajam di layar Retina/OLED dan ukurannya sangat ringan (< 2 KB per modul):

1. **`JavaneseGununganSvg.tsx`:** Siluet Gunungan Wayang Purwa dengan tatahan ukir gapuran, pohon hayat, dan garuda prada.
2. **`KebumenWaletSvg.tsx`:** Sepasang Burung Walet Emas khas Kebumen terbang membawa ranting melati keemasan.
3. **`IslamicArabesqueArchSvg.tsx`:** Lengkungan pintu kubah Nabawi bergaya tapal kuda dengan geometri bintang oktagram.
4. **`BotanicalWreathSvg.tsx`:** Rangkaian daun eucalyptus, ranting zaitun, dan kuncup mawar asimetris.
5. **`WaxSealStamp3DSvg.tsx`:** Cap segel lilin 3D dengan tekstur lelehan lilin tepi organik dan monogram emas timbul.
6. **`RusticPampasTwineSvg.tsx`:** Untaian rumput pampas kering berbulu halus dengan lilitan simpul tali rami vintage.
7. **`CelestialConstellationSvg.tsx`:** Rasi bintang zodiak dengan garis penghubung berkilau dan bulan sabit bercahaya halo.
8. **`CuteStorybookMascotSvg.tsx`:** Maskot kelinci mungil berbalut pita dan ikon denah mini (mobil pengantin, tugu lawet Kebumen).

---

## 4. Komponen `SmoothOutroClosingGate`

Komponen ini dipasang di akhir halaman undangan digital (`src/components/invitation/shell/SmoothOutroClosingGate.tsx`).

### Alur Interaksi:
1. **Intersection Observer Trigger:** Sensor scroll mengamati elemen di titik 85%-90% dari batas bawah dokumen.
2. **Animasi Penutup Mulus:** Layar transisi menutup sesuai tema terpilih (contoh: Gunungan wayang tancep kayon, tirai beludru merapat, atau amplop bersegel lilin).
3. **Pesan Kehormatan & Doa:** Ucapan terima kasih tulus dari kedua mempelai dan keluarga besar.
4. **Tombol "Buka Kembali / Scroll ke Atas":** Memberi kontrol penuh kepada tamu bila ingin membaca ulang detail acara, galeri foto, atau nomor rekening.

---

## 5. Hyperlocal Kebumen Context & Dynamic Content

Seluruh 64 template diintegrasikan dengan data lokal Kabupaten Kebumen:
* **Venue Pilihan:**
  - *Mexolie Hotel Kebumen:* Ballroom kolonial tropis modern dekat stasiun kereta.
  - *Grand Kolopaking Hotel:* Suasana klasik elegan di pusat kota Kebumen.
  - *Trio Azana Style Kebumen:* Arsitektur kontemporer minimalis.
  - *Pendopo Kabumian (Rumah Dinas Bupati Kebumen):* Suasana budaya Jawa keraton yang agung dan sakral.
* **Rute Navigasi:** Titik koordinat presisi langsung terhubung ke aplikasi Google Maps dan Waze dengan satu klik.

---

## 6. Rencana Implementasi Bertahap

* **Fase 1 (Selesai):** Spesifikasi arsitektur individualisasi 64 template dalam dokumen ini.
* **Fase 2 (Berikutnya):**
  1. Pembuatan direktori dan modul komponen vektor SVG: `src/components/invitation/svg/*`.
  2. Implementasi komponen `SmoothOutroClosingGate.tsx` di `src/components/invitation/shell/`.
  3. Integrasi `SmoothOutroClosingGate` ke dalam `TemplateEngineResolver.tsx`.
  4. Pengujian visual langsung di halaman demo undangan `/undangan/bima-citra?theme=...`.
