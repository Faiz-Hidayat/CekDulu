---
name: CekDulu
description: "Cek Terpandu untuk membantu pengguna memilih tindakan berdasarkan bukti."
colors:
  canvas: "#FFF8FB"
  surface: "#FFFEFC"
  ink: "#291929"
  muted-ink: "#62505E"
  primary: "#AA124F"
  primary-hover: "#850B3A"
  on-primary: "#FFFFFF"
  divider: "#E8D5E0"
  control-border: "#946B85"
  stage-surface: "#F1E6F9"
  stage-tint: "#FBE3EF"
  message-ink: "#88183F"
  message-surface: "#FFE3EE"
  guide-ink: "#493369"
  guide-surface: "#EEE6FF"
  file-ink: "#56370D"
  file-surface: "#FFF0B5"
  process: "#564258"
  process-surface: "#F5EDF4"
  unsafe: "#8D2839"
  unsafe-surface: "#FDECEF"
  suspicious: "#764600"
  suspicious-surface: "#FFF2D6"
  not-flagged: "#25505C"
  not-flagged-surface: "#E9F3F4"
  inconclusive: "#544960"
  inconclusive-surface: "#F2EDF5"
typography:
  home-title: {fontFamily: "Fraunces, Georgia, serif", fontSize: "clamp(2.7rem, 6.4vw, 5.5rem)", fontWeight: 600, lineHeight: 1.04}
  title: {fontFamily: "Fraunces, Georgia, serif", fontSize: "clamp(2rem, 4vw, 2.65rem)", fontWeight: 600, lineHeight: 1.14}
  heading: {fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4}
  body: {fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1rem", fontWeight: 400, lineHeight: 1.5}
  label: {fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.4}
rounded: {control: "10px", panel: "16px", stage: "22px"}
spacing: {xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px", xxl: "32px"}
---

# Design — Cek Terpandu

## Overview

**Status desain — dibekukan pada 27 November 2026 (WIB).** Versi yang disetujui adalah prototipe lokal **A — Cek Terpandu** setelah revisi transisi pintasan **Pesan**, **Tautan & QR**, dan **File & hash**. Tata letak, ilustrasi, gerak, dan tampilan status pada prototipe tersebut menjadi acuan desain. Perubahan desain memerlukan persetujuan baru. [Bukti revisi terakhir](docs/BUILD_LOG.md#perpindahan-pintasan--27-november-2026) · [Status fase proyek](PLANS.md)

Ringkasan, tindakan, dan cakupan tampil langsung. Rincian bukti dapat dibuka sesuai kebutuhan. [Konteks produk dan stack](PRODUCT.md)

Beranda memakai judul editorial terpusat dan formulir di depan latar ilustrasi orisinal. Kepala layar kerja menonjolkan judul, metadata, dan tahap aktif. Lembar grid pink dan lilac membingkai layar kerja dari tepi, dengan detail lebih sedikit di mobile. Dossier kertas berada di panel bahan, pemindai berada di layar progres, dan folder berada di keadaan kosong riwayat. Bukti menunjukkan asal temuan seperti **Tangkapan layar → Tautan yang ditemukan**.

## Colors

Latar blush terang mengimbangi ilustrasi pink dan kuning di beranda. Aksi utama, fokus, dan penekanan judul memakai pink beri. Kuning mentega menandai ikon file dan hash. Lilac menandai contoh demo, izin, bukti, serta ikon tautan dan QR. Rose menandai ikon pesan dan pilihan aktif pada dropdown.

Gunakan pasangan warna verdict bersama ikon dan teks. Status proses memakai pasangan `process` dan `process-surface` agar terbaca berdampingan dengan verdict. Biru netral untuk hasil `NOT_FLAGGED`.

## Typography

Fraunces 600 untuk judul layar dan aksen miring pada “cek dulu.” DM Sans untuk teks, label, dan tindakan. Kedua font disajikan lokal. Gunakan monospace sistem untuk SHA-256. Nama file, hash, dan tautan panjang membungkus di dalam kolom. Tampilkan URL dari input atau ekstraksi sebagai teks nonaktif, seperti `lowongan[.]example`.

Ukuran judul beranda mengikuti lebar layar dan membungkus per frasa. Gunakan `clamp(2.4rem, 10.5vw, 3rem)` di bawah 600 px. Deskripsi tetap ringkas di bawah judul.

## Layout

Navigasi global **Cek baru** dan **Riwayat** dengan penanda **DEMO/SIMULASI** di header. Beranda dan header selebar maksimal 1.160 px. Layar kerja selebar maksimal 1.080 px. Mulai 900 px, tinjau memasangkan bahan dengan daftar cek, hasil memasangkan verdict dengan cakupan, dan riwayat meletakkan indeks sesi di samping entri. Panel izin dan rincian bukti memakai lebar penuh.

| Lebar | Komposisi |
| --- | --- |
| Di bawah 600 px | Gutter 16 px dan navigasi dua baris. Tepi ilustrasi beranda muncul di belakang formulir. Panel kerja satu kolom, dengan status proses dan tombol batal sebelum ilustrasi pemindai. |
| 600–767 px | Gutter 16 px. Formulir terpusat dengan ilustrasi di tepinya. Pintasan berjejer dengan garis pembatas. |
| 768–1023 px | Gutter 24 px dan panel 24 px. Panduan dan pemilih contoh sejajar di beranda. Progres menempatkan daftar cek di samping pemindai mulai 768 px. |
| 1024 px ke atas | Gutter 32 px. Lebar formulir maksimal 638 px, dengan objek ilustrasi di kedua sisi. |

## Shapes

Gunakan radius 22 px untuk bidang ilustrasi, 16 px untuk panel, dan 10 px untuk kontrol. Beri kedalaman pada formulir dan dropdown. Panel tugas memakai garis tipis. Gunakan jarak 8–12 px antarelemen terkait dan sekitar 20–24 px antarbagian.

## Components

- **Tombol dan input.** Satu aksi utama per tahap. Area tempel berlabel, tombol **Pilih file**, dan keterangan jenis serta batas ukuran dari konfigurasi demo. Gunakan target interaksi minimal 44 px dan fokus pink beri 3 px dengan jarak dari tepi kontrol.
- **Dropdown dan checkbox.** Adaptasi shadcn/ui berbasis Radix memakai token dan CSS lokal. Dropdown mengelompokkan **Skenario demo**, **Validasi input**, dan **Pratinjau P1**. Opsi bisa digulir dan dipilih dengan keyboard. Setelah ditutup, fokus kembali ke pemicu. Checkbox cek opsional sejajar dengan ikon baris lainnya. Seluruh label dapat ditekan. [Select shadcn/ui](https://ui.shadcn.com/docs/components/radix/select) · [Checkbox shadcn/ui](https://ui.shadcn.com/docs/components/radix/checkbox)
- **Bukti dan progres.** Gunakan baris pemeriksaan bersama, badge ikon + teks, serta bagian **Lihat bukti** yang dapat dibuka dengan keyboard. Ikon garis 20 px memakai bentuk yang konsisten, seperti penjepit kertas untuk lampiran dan chevron untuk rincian. Ikon pendamping bersifat dekoratif bagi pembaca layar.
- **Penanda tahap.** Tinjau, Periksa, dan Hasil tampil dalam satu daftar dengan `aria-current="step"` pada tahap aktif. Penanda tahap bersifat informatif. Status proses dan verdict tetap muncul pada komponen masing-masing.
- **Tanggal dan waktu.** Gunakan chip kalender untuk metadata kasus pada hasil dan riwayat. Rincian bukti memakai label inline **Waktu diambil** dan **Waktu sumber**. Gunakan elemen `time` dengan nilai ISO dan teks dalam WIB.
- **Umpan balik.** Letakkan pesan validasi di dekat field dan pertahankan input saat pengguna memperbaiki kesalahan. Fokus masuk ke judul tahap saat navigasi, ke **Konfirmasi teks** setelah memakai teks contoh, lalu ke judul panel izin setelah konfirmasi. Seluruh label cek opsional menjadi target sentuh minimal 44 px. Umumkan konfirmasi dan progres penting melalui region status.
- **Motion.** Judul beranda terungkap per frasa. Penanda pintasan bergeser mengikuti pilihan dan petunjuk input berganti lewat transisi. Fokus tetap pada pintasan yang dipilih sehingga tombol berikutnya dapat dipilih tanpa menggulir ke input. Rincian skenario, lampiran, dan validasi menyesuaikan tinggi dalam 280 ms dari ukuran yang sedang terlihat. Menu masuk dalam 190 ms, lalu fokus kembali ke pemicu saat ditutup.
- **Motion layar kerja.** Latar, garis tahap aktif, panel, dan ilustrasi masuk berurutan dalam sekitar 700 ms. Lembar grid bergerak sekali saat layar dibuka. Pemindai menyapu selama antre atau berjalan. Ikon verdict masuk seperti stempel, lalu bukti dan entri riwayat terbuka bertahap.

## Standar transisi

- Terapkan transisi yang konsisten pada komponen baru dan perubahan keadaan, termasuk pergantian pintasan, pilihan dropdown, lampiran, dan panel rincian. Jaga posisi, tinggi, dan gulir tetap berkesinambungan sejak bingkai pertama. Jika pengguna berganti pilihan saat animasi berjalan, lanjutkan dari keadaan visual yang sedang tampil.
- Pertahankan masukan pengguna dan urutan fokus saat komponen berubah. Dengan `prefers-reduced-motion`, tampilkan keadaan akhir langsung dengan informasi, kontrol, dan urutan fokus yang sama.
- Untuk setiap perubahan UI, periksa di browser pada lebar 1440, 768, dan 390 px. Uji pergantian cepat, konten dengan tinggi berbeda, keyboard, dan mode kurangi gerakan. Pastikan tata letak dan gulir bergerak tanpa sentakan.

## Alur dan layar

| Layar | Urutan isi dan interaksi |
| --- | --- |
| **Home / Cek baru** | “Sebelum klik, cek dulu.” → informasi batas demo dan **Pilih contoh simulasi** → area tempel atau pilih file → **Tinjau pemeriksaan**. Bila bahan di luar contoh, aksi pemulihan memindahkan fokus ke pemilih contoh. Pintasan **Pesan & tangkapan layar**, **Tautan & QR**, dan **File & hash** mengatur jenis input di analyzer bersama. Entri fitur lanjutan yang ditampilkan berlabel **Pratinjau P1**. |
| **Analyzer bersama** | Pratinjau tersanitasi dan bahan turunan → konfirmasi atau koreksi ekstraksi → tinjau cakupan, pilih cek opsional, dan beri izin → **Mulai simulasi** → progres per cek. Panel izin menyebut data, penerima, tujuan, dan visibilitas laporan. Izin belum terpilih saat panel dibuka. **Lanjutkan tanpa cek eksternal** menjelaskan di dekat tombol bahwa hasil hanya mencakup cek lokal. **Batalkan** menghentikan pekerjaan tertunda. Kembali ke draf atau tampilkan hasil yang sudah tersedia. |
| **Hasil pemeriksaan** | Mode + verdict + status → satu sampai tiga tindakan → alasan dengan kutipan tersanitasi → cakupan dan keterbatasan → **Lihat bukti** per bahan dalam urutan waktu. Detail menampilkan sumber, metode, waktu, hasil asli yang aman ditampilkan, dan sinyal ternormalisasi. Bila ada bukti lama dari cek yang sama, label **Percobaan sebelumnya** dan **Percobaan terbaru** membedakan riwayat retry. **Tambah bahan** membuka analyzer untuk kasus yang sama dan mempertahankan bukti yang sudah ada. **Cek baru** memulai kasus lain. |
| **Riwayat** | Satu entri per kasus dengan waktu, jenis input, verdict, status/cakupan, dan mode. **Buka hasil** menampilkan snapshot demo tersanitasi. **Hapus entri** menghapus snapshot itu. Riwayat berada di memori halaman dan kosong saat dimuat ulang. State kosong berbunyi “Belum ada pemeriksaan di sesi ini.” dengan aksi **Cek baru**. |

Contoh izin di demo — “Simulasi izin cek reputasi. Dalam layanan live, penyedia yang tercantum akan menerima SHA-256 berkas ini. Data demo tetap di perangkat.” Tampilkan kebijakan visibilitas pada keputusan yang sama jika laporan dapat diakses pihak lain.

Contoh ringkasan — **Mencurigakan. Tunda transfer.** “Pesan meminta deposit untuk melanjutkan seleksi. Verifikasi melalui kontak resmi perusahaan yang Anda cari sendiri.” **Cakupan** — teks dikonfirmasi, sumber reputasi tidak memiliki catatan untuk tautan `lowongan[.]example`.

## Hasil dan status

| Verdict | Label, ikon, dan perlakuan | Ilustrasi |
| --- | --- | --- |
| `UNSAFE` | **Berbahaya** · oktagon tanda seru · `unsafe`. Tunjukkan bukti kuat pada bahan yang tepat dan tindakan segera. Bila cek terpilih gagal atau cek wajib dilewati, pertahankan verdict dan tampilkan **Pemeriksaan sebagian**. | Palang merah di depan lembar bukti. |
| `SUSPICIOUS` | **Mencurigakan** · segitiga tanda seru · `suspicious`. Kutip indikator dan berikan cara memverifikasi dengan aman. | Petunjuk yang disorot pada kertas amber. |
| `NOT_FLAGGED` | **Tidak ada indikasi terdeteksi** · daftar dengan centang · `not-flagged`. Semua cek wajib selesai dengan cakupan memadai dan tanpa temuan relevan. Cantumkan cakupan hasil. | Lembar pemeriksaan bergaris biru, tanpa lambang jaminan aman. |
| `INCONCLUSIVE` | **Belum dapat disimpulkan** · lingkaran tanda tanya · `inconclusive`. Jelaskan bukti yang kurang atau konflik yang belum selesai, lalu beri langkah yang memungkinkan. | Lembar bukti lilac yang terputus. |
| `null` | **Keamanan belum dinilai** · warna netral. Tampilkan asesmen keaslian secara terpisah jika tersedia. | Amplop netral yang belum diperiksa. |

Ilustrasi di panel verdict bersifat dekoratif dan dipilih dari verdict keamanan. Badge proses tetap menunjukkan hasil penyelesaian cek. Saat percobaan ulang mengubah cakupan tanpa mengubah verdict, ilustrasi tetap sama.

- **Status proses.** `pending` **Antre** (jam), `running` **Sedang memeriksa** (indikator aktivitas), `completed` **Pemeriksaan selesai** (centang), `partial` **Pemeriksaan sebagian** (lingkaran setengah), `failed` **Pemeriksaan gagal** (silang), `unsupported` **Belum didukung** (tanda berhenti), `rate_limited` **Batas pemeriksaan tercapai** (jam pasir). Progres memakai tahap dan keadaan cek yang tersedia. Verdict dapat kosong saat belum ada penilaian.
- **Cakupan dan retry.** Bedakan “Sumber tidak memiliki catatan”, “Dilewati karena izin belum diberikan”, “Penyedia tidak merespons”, dan “Belum didukung”. Tampilkan hasil yang sudah ada saat cek lain menunggu atau gagal. **Ulangi cek yang gagal** tersedia untuk cek yang dapat diulang setelah jeda berakhir. Minta izin baru bila data atau tujuan pengiriman berubah.
- **Validasi.** “Masukkan pesan, tautan, hash, atau pilih file.” untuk input kosong. Jika ukuran berlebih, tampilkan batas demo dan tawarkan berkas yang lebih kecil atau hash. Untuk format tak didukung, tunjukkan format yang diterima. Ekstraksi ambigu memerlukan konfirmasi sebelum cek lanjutan.
- **Keaslian media.** `possible_ai_generated` **Kemungkinan dibuat AI**, `possible_manipulated` **Kemungkinan dimanipulasi**, `no_indication` **Tidak ada indikasi**, `inconclusive` **Belum dapat disimpulkan**, `not_checked` **Belum diperiksa**. Hasil ini independen dari verdict keamanan.

## Rencana mock

Sumber data lokal mengembalikan snapshot bertipe `CaseReport` sesuai fixture dan tindakan simulasi. Pertahankan ID kasus, bahan, dan cek. Setiap percobaan cek memakai `attemptId` baru. Abaikan hasil terlambat dari percobaan yang sudah dibatalkan dan pertahankan bukti yang sudah diterima. UI merender verdict serta tindakan dari snapshot. Kelak FastAPI dapat memasok struktur yang sama.

| Tipe | Field minimum dan hubungan |
| --- | --- |
| `CaseReport` | `id`, `createdAt`, `mode` (`mock` atau `live`), `status`, `verdict` (boleh `null`), `summary`, `artifacts[]`, `checks[]`, `evidence[]`, `actions[]`. |
| `Artifact` | `id`, `kind` (`message`, `screenshot`, `url`, `qr`, `file`, `hash`), `parentId?`, `displayValue` tersanitasi, `extractionStatus` (`not_needed`, `needs_confirmation`, `confirmed`), `sha256?`, `verdict?`, `authenticity?` dengan `assessment` dan `evidenceIds[]`. |
| `Check` | `id`, `artifactId`, `source`, `method` (`context`, `extraction`, `lookup`, `static`, `dynamic`, `authenticity`), `required`, `status` (boleh `null` sebelum penjadwalan atau ketika dilewati), `coverage` (`covered`, `no_data`, `not_checked`, `unavailable`), `reason?`, `attemptId?`, `retryAt?`. `consent?` memuat data, penerima, tujuan, visibilitas, dan keputusan (`pending`, `granted`, `declined`). |
| `Evidence` | `id`, `checkId`, `attemptId`, `signal` (`strong_flag`, `warning`, `no_flag`, `unknown`), `finding`, `rawResult?` tersanitasi, `retrievedAt`, `analyzedAt?`, `limitations[]`. Bahan, sumber, dan metode ditautkan lewat `Check`. |
| `Action` | `text`, `evidenceIds[]`. Riwayat mengambil metadata dari laporan. Waktu memakai ISO 8601 dan ditampilkan dalam WIB. |

| Fixture | Skenario dan hasil yang diharapkan |
| --- | --- |
| `benign_url` | Domain `.example`, cek wajib selesai dengan cakupan memadai → `NOT_FLAGGED`. |
| `scam_screenshot` | Tangkapan layar lowongan fiktif, kutipan deposit, lookup tanpa data → `SUSPICIOUS`. |
| `qr_phishing` | QR sintetis, deteksi phishing simulasi untuk URL yang tepat → `UNSAFE`. Payload tampil nonaktif. |
| `file_detected_partial` | Deteksi simulasi pada SHA-256 yang tepat dan satu timeout → `UNSAFE` + `partial`. |
| `unknown_timeout` | Hash tanpa catatan dan cek penting gagal → `INCONCLUSIVE` dengan aksi retry. |
| `loading_and_errors` | Input/riwayat kosong, berkas terlalu besar, format asing, OCR ambigu, izin ditolak, antre/berjalan, gagal, kuota, batal, dan retry. |
| `apk_indicators` / `synthetic_image` | Preview P1 di layout hasil. APK fiktif dengan indikator izin → `SUSPICIOUS`. Gambar sintetis → keaslian terpisah dengan verdict keamanan kosong. |

Gunakan sumber fiktif bertanda simulasi dan data presentasi sintetis. Jika input di luar fixture, arahkan ke **Pilih contoh simulasi**. Gunakan prototipe yang dibekukan sebagai acuan pemeriksaan alur utama, izin ditolak, hasil parsial, retry, riwayat kosong, keyboard, teks panjang, dan konsol/jaringan di 1440 × 900, lebar 768, dan lebar 390. [Skenario dan kriteria review](docs/DESIGN_BRIEF.md)
