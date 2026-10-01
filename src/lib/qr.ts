/**
 * HariKita - QR Rendering Helper
 *
 * Merender string QR (mis. `qrString` dinamis dari Xendit) menjadi data URL PNG
 * agar bisa ditampilkan sebagai <img src="..."/>. Dijalankan di sisi klien.
 *
 * Dipakai oleh halaman pembayaran untuk mode gateway QRIS (Xendit).
 */
import QRCode from "qrcode";

/**
 * Mengubah string QR menjadi data URL PNG.
 * @param text Isi QR (mis. "00020101021226...")
 * @param size Ukuran sisi gambar (px). Default 224 (selaras kotak QR 56*4).
 */
export async function qrStringToDataUrl(text: string, size = 224): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    width: size,
    margin: 1,
    color: { dark: "#4A2E35", light: "#FFFFFF" },
  });
}
