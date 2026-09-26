# Client Couple Profile Design

## Ringkasan

Halaman `/client/profil` akan memperlakukan identitas pasangan sebagai satu unit acara, bukan memisahkan pemilik akun dan pasangan secara implisit. Profil menyimpan peran pemilik akun, nama lengkap mempelai pria, nama lengkap mempelai wanita, serta nama tampilan pasangan yang ringkas untuk sidebar.

Setelah login, client diarahkan ke `/client` (Ringkasan), bukan `/client/profil`.

## Tujuan

- Menampilkan kedua mempelai dalam satu section yang elegan dan seimbang.
- Desktop: mempelai pria di kiri, mempelai wanita di kanan.
- Mobile: kartu bertumpuk, pria dahulu lalu wanita, tanpa overflow.
- Menyimpan perubahan identitas secara nyata ke database.
- Menampilkan nama pasangan yang ringkas pada sidebar tanpa bergantung pada session cookie lama.
- Memigrasikan data existing tanpa menebak gender pemilik akun.
- Menjaga `User.name` sebagai nama legal pemilik akun untuk autentikasi, audit, dan kontrak.

## Model Data

Tambahkan field nullable berikut pada `ClientProfile` di kedua schema Prisma:

```prisma
accountOwnerRole  String? // "GROOM" | "BRIDE"
groomName         String?
brideName         String?
coupleDisplayName String?
```

`partnerName` tidak dihapus pada fase ini. Field tersebut menjadi compatibility bridge untuk data lama dan tidak lagi menjadi sumber utama UI baru setelah data pasangan lengkap tersimpan.

### Invariant

- `accountOwnerRole` hanya `GROOM` atau `BRIDE`.
- `groomName` dan `brideName` masing-masing 2-100 karakter saat diisi.
- Setelah pemilik memilih peran, kedua nama wajib diisi sebelum save.
- `coupleDisplayName` 2-40 karakter.
- `User.name` selalu disinkronkan dari nama sesuai `accountOwnerRole`.
- `partnerName` disinkronkan ke nama pasangan non-pemilik untuk kompatibilitas consumer lama.

## Migrasi Data Lama

Migration database hanya menambah kolom nullable; tidak menghapus atau menafsirkan data existing.

Saat profil lama dibuka:

- `accountOwnerRole` kosong.
- UI meminta pengguna memilih "Saya mempelai pria" atau "Saya mempelai wanita".
- `User.name` dan `partnerName` ditampilkan pada prompt migrasi sebagai dua kandidat awal, tetapi field gender tetap kosong sebelum peran dipilih.
- Setelah pengguna memilih peran, UI mengisi mapping sementara (`User.name` ke kartu pemilik, `partnerName` ke kartu pasangan) untuk ditinjau dan dikoreksi sebelum save.

Saat save pertama:

- Jika `GROOM`: `User.name = groomName`, `partnerName = brideName`.
- Jika `BRIDE`: `User.name = brideName`, `partnerName = groomName`.
- Field canonical `groomName`, `brideName`, dan `coupleDisplayName` disimpan bersamaan dalam satu transaction.

Tidak ada backfill destruktif atau asumsi bahwa pemilik akun selalu pria.

## UI/UX Profil

### Struktur Halaman

1. Header halaman dan ringkasan pasangan.
2. Progress kelengkapan profil.
3. Section "Identitas Kedua Mempelai".
4. Section "Kontak Akun Utama".
5. Section data Hari H.
6. Alamat, peta, preferensi konsep, catatan.
7. Tombol save yang jelas dan status feedback.

### Identitas Kedua Mempelai

Satu surface putih dengan border champagne lembut dan header editorial.

Di atas dua kartu terdapat segmented control:

- "Saya mempelai pria"
- "Saya mempelai wanita"

Desktop memakai grid dua kolom:

- Kiri: kartu "Mempelai Pria" dengan ikon `UserRound` dan aksen taupe.
- Kanan: kartu "Mempelai Wanita" dengan ikon `Heart` atau `UserRound` dan aksen champagne.

Setiap kartu berisi:

- Label peran.
- Badge "Pemilik akun" pada kartu yang sesuai pilihan.
- Input nama lengkap.
- Helper text singkat tentang pemakaian pada kontrak dan undangan.
- Error inline dengan `aria-describedby` dan `aria-invalid`.

Pada mobile 375px, kartu bertumpuk dengan gap konsisten. Semua control memiliki target sentuh minimal 44px.

### Nama Tampilan Sidebar

Field `coupleDisplayName` diletakkan setelah dua kartu sebagai field bersama, bukan milik salah satu mempelai.

Contoh:

- Nama lengkap: `Muhammad Rizky Pratama` dan `Siti Nur Aisyah Ramadhani`
- Nama tampilan: `Rizky & Aisyah`

UI menampilkan counter karakter `n/40` dan preview kecil sidebar agar pengguna memahami hasilnya.

Jika field kosong pada data legacy, UI menyarankan nilai dari nama depan kedua mempelai. Nilai tetap harus dikonfirmasi saat save pertama.

### Kontak Akun

Nomor WhatsApp dan email tetap terkait pemilik akun. Section diberi label jelas "Kontak Pemilik Akun", dengan badge yang menunjukkan peran terpilih.

### Save Experience

- Tombol save disabled saat pending.
- Success message inline dan live-region.
- Error global untuk kegagalan server.
- Error per field ditampilkan dekat control.
- Form state tidak hilang ketika save gagal.
- Setelah save sukses, halaman di-refresh/revalidated sehingga banner, form, root dashboard, dan sidebar memakai data baru.

## Sidebar

`src/app/client/layout.tsx` membaca `ClientProfile` owner-scoped dari database.

Prioritas label sidebar:

1. `coupleDisplayName`
2. Gabungan nama depan `groomName & brideName`
3. Gabungan legacy `User.name & partnerName`
4. `User.name`
5. `Klien`

Sidebar tetap memiliki pembatas visual dan `title` berisi nama lengkap untuk aksesibilitas, tetapi nama utama berasal dari field ringkas, bukan truncation acak.

Tidak perlu mengubah payload session untuk label sidebar. Ini memastikan perubahan nama tampil segera setelah revalidation tanpa logout/login ulang.

## Ringkasan Client

`getClientPlannerOverview()` dan banner profil menggunakan field canonical:

- `groomName`
- `brideName`
- `coupleDisplayName`

Fallback legacy dipertahankan untuk akun yang belum mengisi profil baru.

## Redirect Login

`getDashboardPath("CLIENT")` diubah dari `/client/profil` menjadi `/client`.

Aturan callback tetap berlaku:

- Callback internal yang tervalidasi diprioritaskan.
- Login client tanpa callback selalu menuju Ringkasan `/client`.
- Vendor, BA, dan Admin tidak berubah.

## Server Action

`updateClientProfileAction()`:

1. Memastikan session role `CLIENT`.
2. Memvalidasi semua field identitas dan data acara.
3. Menentukan nama legal pemilik berdasarkan `accountOwnerRole`.
4. Menjalankan `User.update` dan `ClientProfile.upsert` dalam satu Prisma transaction.
5. Menyimpan compatibility `partnerName` berdasarkan peran.
6. Revalidate `/client`, `/client/profil`, dan layout client.
7. Mengembalikan `ClientProfileData` terbaru agar form dapat langsung sinkron.

Exception Prisma dipetakan ke pesan generik; detail internal hanya masuk server log.

## File Utama

- `prisma/schema.prisma`
- `prisma/schema.sqlite.prisma`
- `prisma/migrations/<timestamp>_client_couple_profile/migration.sql`
- `src/lib/validations/client-profile.ts`
- `src/server/actions/client-profile.ts`
- `src/app/client/profil/ClientProfileForm.tsx`
- `src/app/client/profil/page.tsx`
- `src/app/client/layout.tsx`
- `src/lib/session.ts`
- `src/server/queries/wedding-planner.ts`
- Tests profil, redirect, migration mapping, dan sidebar fallback.

## Testing

### Unit

- Validator menerima dua nama, role, dan display name valid.
- Validator menolak role invalid, nama kosong, dan display name lebih dari 40 karakter.
- Mapping pemilik pria menghasilkan `User.name = groomName`.
- Mapping pemilik wanita menghasilkan `User.name = brideName`.
- Sidebar fallback mengikuti prioritas yang ditentukan.
- `getDashboardPath("CLIENT") === "/client"`.

### Integration

- Save membuat atau memperbarui `ClientProfile` dan `User` secara atomik.
- Save pertama akun legacy memigrasikan `partnerName` sesuai pilihan peran.
- User A tidak dapat mengubah profil User B.
- Readback setelah save mengembalikan nama canonical.
- Migration additive berhasil pada PostgreSQL; SQLite `db push` berhasil setelah backup.

### UI/Build

- 375px: kartu bertumpuk tanpa overflow.
- 768px+: pria kiri, wanita kanan.
- Error field dan pending state dapat diakses.
- Sidebar memakai display name baru setelah save.
- `npm run typecheck`, `npm test`, Prisma validation dua schema, migration status, dan production build lulus.

## Non-Goals

- Tidak menambah dokumen identitas pribadi baru.
- Tidak menambah gender di model `User` global.
- Tidak mengubah engine undangan atau kontrak di luar penggunaan nama canonical.
- Tidak menghapus `partnerName` pada fase ini.
- Tidak merombak keseluruhan desain halaman profil di luar struktur pasangan dan section terkait.
