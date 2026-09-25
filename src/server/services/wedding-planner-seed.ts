import { prisma } from "@/lib/prisma";

export interface SeedTask {
  stage: number;
  taskText: string;
  pic: string;
  priority: string;
  note: string;
}
export interface SeedKua {
  category: string;
  docName: string;
  party: string;
  docFormat: string;
  institution: string;
  note: string;
  isRequired: boolean;
}
export interface SeedEmergency {
  itemText: string;
}

export const DEFAULT_TASKS: SeedTask[] = [
  { stage: 1, taskText: "Pertemuan keluarga besar & penetapan tanggal akad/resepsi", pic: "Keluarga Inti", priority: "Tinggi", note: "Sepakati konsep utama (Intimate vs Tradisional)" },
  { stage: 1, taskText: "Menentukan batas plafon anggaran (budget) & tabungan bersama", pic: "Mempelai", priority: "Tinggi", note: "Buat rekening bersama persiapan pernikahan" },
  { stage: 1, taskText: "Survei dan booking lokasi / venue (Gedung/Masjid/Hotel)", pic: "Mempelai", priority: "Tinggi", note: "Gedung favorit wajib diamankan jauh hari" },
  { stage: 2, taskText: "Test food & booking vendor katering", pic: "Mempelai & Ortu", priority: "Tinggi", note: "Gunakan rumus porsi: Undangan x 2 x 2.2" },
  { stage: 2, taskText: "Booking MUA, Dekorasi Pelaminan, & Fotografer", pic: "Mempelai", priority: "Tinggi", note: "Vendor visual cepat penuh di tanggal cantik" },
  { stage: 2, taskText: "Booking Wedding Organizer (WO) atau bentuk Panitia Keluarga", pic: "Mempelai", priority: "Sedang", note: "Menentukan koordinator teknis hari H" },
  { stage: 3, taskText: "Fitting baju pengantin serta seragam keluarga", pic: "Mempelai", priority: "Sedang", note: "Bagi kain seragam ke bridesmaid & keluarga" },
  { stage: 3, taskText: "Beli cincin kawin", pic: "Mempelai", priority: "Sedang", note: "Ukur lingkar jari & grafir nama" },
  { stage: 3, taskText: "Sesi foto Pre-wedding & cetak galeri resepsi", pic: "Vendor Foto", priority: "Sedang", note: "Siapkan file foto untuk undangan website" },
  { stage: 3, taskText: "Beli isi seserahan & booking boks hantaran akrilik", pic: "Kedua Pihak", priority: "Sedang", note: "Sepakati jumlah boks (misal 7 atau 9 boks)" },
  { stage: 4, taskText: "Cek kesehatan Puskesmas & sertifikat Elsimil", pic: "Mempelai", priority: "Tinggi", note: "Tes darah Catin & vaksin TT calon istri" },
  { stage: 4, taskText: "Urus surat RT/RW, formulir N1 kelurahan & numpang nikah", pic: "Mempelai", priority: "Tinggi", note: "Kelurahan domisili & KUA asal" },
  { stage: 4, taskText: "Daftar portal Simkah Kemenag & bayar billing PNBP", pic: "Mempelai", priority: "Tinggi", note: "Minimal H-10 hari kerja sebelum hari H" },
  { stage: 4, taskText: "Finalisasi daftar tamu & sebar undangan fisik/digital", pic: "Mempelai & Ortu", priority: "Tinggi", note: "Kirim pesan personal WhatsApp H-14" },
  { stage: 5, taskText: "Technical Meeting (TM) seluruh vendor & panitia", pic: "WO & Vendor", priority: "Tinggi", note: "Matangkan rundown acara menit demi menit" },
  { stage: 5, taskText: "Briefing peran rahasia keluarga (Angpao, Mahar, Katering)", pic: "Keluarga Inti", priority: "Tinggi", note: "Serahkan kunci gembok kotak uang kepada PIC" },
  { stage: 5, taskText: "Mengikuti kursus pranikah Bimwin KUA", pic: "Mempelai", priority: "Tinggi", note: "Bimbingan perkawinan KUA kecamatan" },
  { stage: 6, taskText: "Packing Wedding Emergency Kit & baju ganti santai", pic: "Bridesmaid", priority: "Tinggi", note: "Peniti, obat, flat shoes cadangan, sedotan" },
  { stage: 6, taskText: "Siapkan amplop uang tips tunai pecahan kecil", pic: "Panitia Keluarga", priority: "Tinggi", note: "Pecahan 20rb & 50rb untuk parkir, kebersihan, genset" },
  { stage: 6, taskText: "Istirahat total, gladi resik singkat, cek fisik mahar", pic: "Mempelai", priority: "Tinggi", note: "Tidur cukup sebelum mulai dirias subuh" },
  { stage: 7, taskText: "Akad Nikah Khidmat & Ijab Kabul", pic: "Semua Pihak", priority: "Tinggi", note: "Serahkan mahar resmi di meja penghulu" },
  { stage: 7, taskText: "Resepsi Pernikahan & Ramah Tamah", pic: "Semua Pihak", priority: "Tinggi", note: "Nikmati momen indah bersama pasangan & keluarga" },
];

export const DEFAULT_KUA: SeedKua[] = [
  { category: "1. Pengantar RT/RW", docName: "Surat Pengantar Nikah dari RT & RW", party: "CPP", docFormat: "Asli 1 Lembar", institution: "Ketua RT & RW Domisili CPP", note: "Bawa fotokopi KTP & KK domisili asal", isRequired: true },
  { category: "1. Pengantar RT/RW", docName: "Surat Pengantar Nikah dari RT & RW", party: "CPW", docFormat: "Asli 1 Lembar", institution: "Ketua RT & RW Domisili CPW", note: "Bawa fotokopi KTP & KK domisili asal", isRequired: true },
  { category: "2. Kelurahan (Model N)", docName: "Formulir Model N1 (Pengantar Nikah)", party: "Bersama", docFormat: "Asli 2 Rangkap", institution: "Kelurahan / Kantor Desa", note: "Mencantumkan status pernikahan calon mempelai", isRequired: true },
  { category: "2. Kelurahan (Model N)", docName: "Formulir Model N2 (Permohonan Kehendak Nikah)", party: "Bersama", docFormat: "Asli 1 Lembar", institution: "Kelurahan / Kantor Desa", note: "Surat permohonan resmi mendaftar ke KUA", isRequired: true },
  { category: "2. Kelurahan (Model N)", docName: "Formulir Model N4 (Persetujuan Calon Mempelai)", party: "Bersama", docFormat: "Asli 1 Lembar", institution: "Kelurahan / Kantor Desa", note: "Tanda tangan bermaterai", isRequired: true },
  { category: "2. Kelurahan (Model N)", docName: "Surat Keterangan Belum Menikah", party: "Bersama", docFormat: "Asli Bermaterai", institution: "Kelurahan / Desa", note: "Surat pernyataan resmi belum pernah menikah", isRequired: true },
  { category: "3. Identitas Kependudukan", docName: "e-KTP Calon Pengantin Pria & Wanita", party: "Bersama", docFormat: "Asli & FC 4 Rangkap", institution: "Disdukcapil / Mandiri", note: "Pastikan NIK aktif di server nasional", isRequired: true },
  { category: "3. Identitas Kependudukan", docName: "Kartu Keluarga (KK) Calon Pengantin", party: "Bersama", docFormat: "Asli & FC 4 Rangkap", institution: "Disdukcapil / Mandiri", note: "KK terbaru ber-barcode TTE resmi", isRequired: true },
  { category: "3. Identitas Kependudukan", docName: "Akta Kelahiran Calon Pengantin", party: "Bersama", docFormat: "Asli & FC 3 Rangkap", institution: "Disdukcapil / Mandiri", note: "Verifikasi nama orang tua kandung", isRequired: true },
  { category: "3. Identitas Kependudukan", docName: "Ijazah Terakhir (SD/SMP/SMA/S1)", party: "Bersama", docFormat: "Asli & FC 2 Rangkap", institution: "Sekolah / Kampus", note: "Sinkronisasi ejaan nama pada buku nikah & paspor", isRequired: true },
  { category: "3. Identitas Kependudukan", docName: "e-KTP Kedua Pasang Orang Tua (Bapak & Ibu)", party: "Keluarga", docFormat: "FC 3 Rangkap", institution: "Disdukcapil / Mandiri", note: "KTP Ayah & Ibu kedua calon", isRequired: true },
  { category: "3. Identitas Kependudukan", docName: "Buku Nikah / Akta Nikah Orang Tua CPW", party: "Keluarga", docFormat: "Asli & FC 2 Rangkap", institution: "KUA Asal Orang Tua CPW", note: "Verifikasi keabsahan wali nikah anak perempuan", isRequired: true },
  { category: "4. Pas Foto Resmi", docName: "Pas Foto Latar Belakang Biru Ukuran 2x3", party: "Bersama", docFormat: "Fisik 4 Lembar Masing-masing", institution: "Studio Foto", note: "Kemeja berkerah rapi, hijab warna kontras", isRequired: true },
  { category: "4. Pas Foto Resmi", docName: "Pas Foto Latar Belakang Biru Ukuran 4x6", party: "Bersama", docFormat: "Fisik 2 Lembar Masing-masing", institution: "Studio Foto", note: "Untuk arsip buku nikah dan lembar akta nikah", isRequired: true },
  { category: "4. Pas Foto Resmi", docName: "Softcopy Foto Background Biru Resolusi Tinggi", party: "Bersama", docFormat: "File JPG (< 500 KB)", institution: "Studio Foto", note: "Diunggah saat pendaftaran online Simkah", isRequired: true },
  { category: "5. Kesehatan & Elsimil", docName: "Surat Keterangan Sehat Pranikah (Catin)", party: "Bersama", docFormat: "Asli 1 Lembar", institution: "Puskesmas Domisili", note: "Cek Lab: Hb, Gol Darah, HIV, Sifilis, Hepatitis B", isRequired: true },
  { category: "5. Kesehatan & Elsimil", docName: "Kartu / Bukti Suntik Imunisasi TT (Tetanus)", party: "CPW", docFormat: "Asli 1 Lembar", institution: "Puskesmas / Faskes", note: "Wajib bagi calon istri", isRequired: true },
  { category: "5. Kesehatan & Elsimil", docName: "Sertifikat Elektronik Siap Nikah (Elsimil)", party: "Bersama", docFormat: "Sertifikat Digital PDF", institution: "Aplikasi Elsimil BKKBN", note: "Diunduh & dicetak untuk pendaftaran KUA", isRequired: true },
  { category: "6. Numpang Nikah", docName: "Surat Rekomendasi Nikah dari KUA Asal", party: "CPP", docFormat: "Asli 1 Lembar", institution: "KUA Domisili Asal CPP", note: "Wajib jika menikah di domisili CPW / kecamatan lain", isRequired: true },
  { category: "7. Wali & Saksi", docName: "e-KTP Asli & FC Wali Nikah (Ayah Kandung CPW)", party: "Keluarga", docFormat: "Asli & FC 2 Lembar", institution: "Disdukcapil / Mandiri", note: "Wajib hadir saat akad ijab kabul", isRequired: true },
  { category: "7. Wali & Saksi", docName: "e-KTP 2 Orang Saksi Nikah Resmi", party: "Bersama", docFormat: "FC 2 Lembar", institution: "Disdukcapil / Mandiri", note: "1 saksi pihak CPP, 1 saksi pihak CPW", isRequired: true },
  { category: "8. KUA & Hari-H", docName: "Bukti Pendaftaran Akun Simkah Online", party: "Bersama", docFormat: "Cetak Bukti Daftar", institution: "simkah4.kemenag.go.id", note: "Daftar minimal 10 hari kerja sebelum hari H", isRequired: true },
  { category: "8. KUA & Hari-H", docName: "Bukti Setor Billing PNBP Nikah Rp 600.000", party: "Bersama", docFormat: "Struk Setor Bank / Pos", institution: "Bank Persepsi / SIMPONI", note: "Khusus nikah luar kantor KUA", isRequired: true },
  { category: "8. KUA & Hari-H", docName: "Sertifikat Bimbingan Perkawinan (Bimwin)", party: "Bersama", docFormat: "Sertifikat Kemenag", institution: "KUA Kecamatan", note: "Kursus pranikah tatap muka / mandiri", isRequired: true },
  { category: "8. KUA & Hari-H", docName: "Materai Rp 10.000 (Minimal 4 Lembar)", party: "Bersama", docFormat: "Materai Fisik Tempel", institution: "Kantor Pos", note: "Untuk berkas pernyataan darurat di meja KUA", isRequired: true },
  { category: "8. KUA & Hari-H", docName: "Pemeriksaan Fisik Buku Nikah di Meja Akad", party: "Bersama", docFormat: "Buku Cokelat & Hijau", institution: "Meja Akad / Penghulu", note: "Periksa nama, TTL, & mahar sebelum menandatangani", isRequired: true },
  { category: "9. Berkas Khusus (Opsional)", docName: "Surat Izin Nikah dari Atasan / Komandan / Instansi", party: "Bersama", docFormat: "Asli 1 Lembar", institution: "Instansi / Kedinasan / Kesatuan", note: "Jika profesi mewajibkan (TNI, POLRI, Kedinasan, BUMN)", isRequired: false },
  { category: "9. Berkas Khusus (Opsional)", docName: "Akta Cerai Asli Pengadilan Agama", party: "Bersama", docFormat: "Asli", institution: "Pengadilan Agama", note: "Jika salah satu pernah menikah (duda/janda cerai hidup)", isRequired: false },
  { category: "9. Berkas Khusus (Opsional)", docName: "Akta Kematian Pasangan Terdahulu", party: "Bersama", docFormat: "Asli", institution: "Disdukcapil", note: "Jika pasangan terdahulu meninggal dunia", isRequired: false },
  { category: "9. Berkas Khusus (Opsional)", docName: "Surat Kematian Ayah / Surat Kuasa Taukil Wali", party: "Keluarga", docFormat: "Asli", institution: "Kelurahan / KUA", note: "Jika ayah kandung telah wafat atau berhalangan hadir", isRequired: false },
  { category: "9. Berkas Khusus (Opsional)", docName: "Akta Notaris Perjanjian Pranikah (Pisah Harta)", party: "Bersama", docFormat: "Asli", institution: "Kantor Notaris", note: "Jika memilih perjanjian pisah harta sebelum akad", isRequired: false },
  { category: "9. Berkas Khusus (Opsional)", docName: "Surat Dispensasi Nikah dari Kantor Camat", party: "Bersama", docFormat: "Asli", institution: "Kantor Camat Setempat", note: "Jika mendaftar ke KUA kurang dari 10 hari kerja", isRequired: false },
];

export const DEFAULT_EMERGENCY: SeedEmergency[] = [
  { itemText: "Peniti Bohlam & Peniti Biasa" },
  { itemText: "Jarum Pentul & Benang Jahit Mini" },
  { itemText: "Gunting Lipat Kecil & Lakban Bening" },
  { itemText: "Sedotan Minum (Lipstik awet)" },
  { itemText: "Obat Maag & Tolak Angin" },
  { itemText: "Paracetamol & Minyak Kayu Putih" },
  { itemText: "Plester Luka (Hansaplast)" },
  { itemText: "Permen Pelega Napas" },
  { itemText: "Tisu Kering & Tisu Basah" },
  { itemText: "Sandal Jepit / Flat Shoes Cadangan" },
  { itemText: "Amplop Cash Tips (Parkir, Satpam, Genset)" },
  { itemText: "Materai Rp 10.000 (4 lembar)" },
  { itemText: "Koper Baju Ganti Santai" },
];

export function expectedWeddingPlannerSeedKeys() {
  return {
    tasks: DEFAULT_TASKS.map((_, index) => `task-${index}`),
    kua: DEFAULT_KUA.map((_, index) => `kua-${index}`),
    emergency: DEFAULT_EMERGENCY.map((_, index) => `emergency-${index}`),
  };
}

export function isWeddingPlannerSeedComplete(keys: {
  tasks: string[];
  kua: string[];
  emergency: string[];
}): boolean {
  const expected = expectedWeddingPlannerSeedKeys();
  return (["tasks", "kua", "emergency"] as const).every((type) =>
    keys[type].length === expected[type].length &&
    expected[type].every((key) => keys[type].includes(key))
  );
}

/** Rekonsiliasi default berdasarkan key stabil; aman dipanggil ulang atau paralel. */
export async function ensureWeddingPlannerSeeded(userId: string): Promise<void> {
  const [taskRows, kuaRows, emergencyRows] = await Promise.all([
    prisma.weddingTask.findMany({ where: { userId, seedKey: { not: null } }, select: { seedKey: true } }),
    prisma.kuaRequirement.findMany({ where: { userId, seedKey: { not: null } }, select: { seedKey: true } }),
    prisma.weddingEmergencyItem.findMany({ where: { userId, seedKey: { not: null } }, select: { seedKey: true } }),
  ]);
  if (isWeddingPlannerSeedComplete({
    tasks: taskRows.flatMap((row) => row.seedKey ?? []),
    kua: kuaRows.flatMap((row) => row.seedKey ?? []),
    emergency: emergencyRows.flatMap((row) => row.seedKey ?? []),
  })) return;

  await prisma.$transaction(async (tx) => {
    await Promise.all([
      ...DEFAULT_TASKS.map((task, index) =>
        tx.weddingTask.updateMany({
          where: { userId, taskText: task.taskText, isCustom: false, seedKey: null },
          data: { seedKey: `task-${index}` },
        })
      ),
      ...DEFAULT_KUA.map((item, index) =>
        tx.kuaRequirement.updateMany({
          where: {
            userId,
            docName: item.docName,
            party: item.party,
            isCustom: false,
            seedKey: null,
          },
          data: { seedKey: `kua-${index}` },
        })
      ),
      ...DEFAULT_EMERGENCY.map((item, index) =>
        tx.weddingEmergencyItem.updateMany({
          where: { userId, itemText: item.itemText, seedKey: null },
          data: { seedKey: `emergency-${index}` },
        })
      ),
    ]);
    await tx.weddingTask.createMany({
      data: DEFAULT_TASKS.map((task, index) => ({
        userId,
        ...task,
        sortOrder: index,
        seedKey: `task-${index}`,
      })),
      skipDuplicates: true,
    });
    await tx.kuaRequirement.createMany({
      data: DEFAULT_KUA.map((item, index) => ({
        userId,
        ...item,
        isActive: item.isRequired,
        sortOrder: index,
        seedKey: `kua-${index}`,
      })),
      skipDuplicates: true,
    });
    await tx.weddingEmergencyItem.createMany({
      data: DEFAULT_EMERGENCY.map((item, index) => ({
        userId,
        ...item,
        sortOrder: index,
        seedKey: `emergency-${index}`,
      })),
      skipDuplicates: true,
    });
  });
}
