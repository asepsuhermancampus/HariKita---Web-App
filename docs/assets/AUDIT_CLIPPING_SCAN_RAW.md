# LAPORAN AUDIT CLIPPING & BOUNDARY ASSET SVG HARIKITA

**Tanggal Audit:** 2026-09-12T14:47:49.707Z
**Total Aset SVG Diperiksa:** 246 file

## 1. Ringkasan Statistik

| Metrik | Jumlah | Persentase |
| :--- | :--- | :--- |
| **Total SVG Diperiksa** | 246 | 100% |
| **Terindikasi Clipping / Menempel Batas (Pad = 0)** | 5 | 2.0% |
| **Margin Sangat Sempit / Tight (Pad <= 2px)** | 0 | 0.0% |
| **Margin Aman (Pad > 2px)** | 241 | 98.0% |

## 2. Aset yang Menempel Batas / Terpotong (Clipped)

| File Name | Kategori | Sisi Menempel | Padding (T/B/L/R) | Status di Daftar User |
| :--- | :--- | :--- | :--- | :--- |
| `mask-arch-01.svg` | harikita | TOP(40px), BOTTOM(400px), LEFT(420px), RIGHT(420px) | 0/0/0/0px | ⚠️ *Temuan Scanner Baru* |
| `pattern-02.svg` | harikita | TOP(12px), BOTTOM(12px), LEFT(12px), RIGHT(12px) | 0/0/0/0px | ⚠️ *Temuan Scanner Baru* |
| `pattern-04.svg` | harikita | LEFT(8px), RIGHT(8px) | 147/206/0/0px | ⚠️ *Temuan Scanner Baru* |
| `pattern-05.svg` | harikita | LEFT(21px), RIGHT(21px) | 57/55/0/0px | ⚠️ *Temuan Scanner Baru* |
| `pattern-08.svg` | harikita | TOP(10px), BOTTOM(10px), LEFT(10px), RIGHT(10px) | 0/0/0/0px | ⚠️ *Temuan Scanner Baru* |

## 4. Evaluasi Aset dalam Daftar User yang Marginnya Aman di SVG
*Catatan: Aset berikut memiliki margin aman terhadap viewBox SVG-nya, namun dilaporkan User terpotong atau memotong aset lain. Ini mengindikasikan bahwa **pemotongan atau kebocoran terjadi pada gambar sumber (crop mentah) sebelum ditrace**, bukan karena terpotong oleh viewBox SVG itu sendiri.*

| File Name | Padding Aktual | Analisis Penyebab Masalah |
| :--- | :--- | :--- |
| `card-invitation-01.svg` | T=26, B=25, L=25, R=25px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `card-invitation-02.svg` | T=25, B=25, L=25, R=25px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `card-invitation-08.svg` | T=25, B=25, L=24, R=25px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `card-invitation-09.svg` | T=25, B=25, L=25, R=24px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `flower-bloom-10.svg` | T=38, B=37, L=38, R=38px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `flower-bloom-12.svg` | T=36, B=37, L=37, R=38px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `flower-bloom-13.svg` | T=37, B=38, L=38, R=37px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `flower-bloom-14.svg` | T=31, B=32, L=32, R=32px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `flower-bloom-15.svg` | T=36, B=36, L=37, R=36px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `flower-bloom-16.svg` | T=36, B=36, L=37, R=36px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `branch-05.svg` | T=25, B=26, L=25, R=25px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `botanical-02.svg` | T=31, B=31, L=31, R=31px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `botanical-03.svg` | T=31, B=31, L=32, R=32px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `botanical-06.svg` | T=31, B=31, L=31, R=31px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `botanical-10.svg` | T=32, B=32, L=31, R=31px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `botanical-11.svg` | T=31, B=31, L=32, R=32px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `botanical-14.svg` | T=32, B=31, L=31, R=31px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `botanical-15.svg` | T=31, B=31, L=32, R=32px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `botanical-17.svg` | T=61, B=60, L=61, R=59px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `botanical-18.svg` | T=58, B=58, L=59, R=58px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `botanical-23.svg` | T=62, B=63, L=62, R=62px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `botanical-24.svg` | T=62, B=62, L=62, R=61px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `botanical-25.svg` | T=60, B=60, L=60, R=60px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `botanical-26.svg` | T=65, B=65, L=65, R=64px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `botanical-31.svg` | T=61, B=61, L=61, R=63px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
| `botanical-32.svg` | T=56, B=57, L=56, R=56px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |
