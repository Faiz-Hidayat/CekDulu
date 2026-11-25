---
name: CekDulu
description: "Cek Terpandu untuk membantu pengguna memilih tindakan berdasarkan bukti."
colors:
  canvas: "#F8F4ED"
  surface: "#FFFDF9"
  ink: "#241F25"
  muted-ink: "#625761"
  primary: "#6C3356"
  primary-hover: "#542743"
  on-primary: "#FFFFFF"
  divider: "#DACFD5"
  control-border: "#8A7886"
  process: "#564550"
  process-surface: "#F3EDF1"
  unsafe: "#8D2839"
  unsafe-surface: "#FDECEF"
  suspicious: "#764600"
  suspicious-surface: "#FFF2D6"
  not-flagged: "#25505C"
  not-flagged-surface: "#E9F3F4"
  inconclusive: "#544960"
  inconclusive-surface: "#F2EDF5"
typography:
  home-title: {fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "2.375rem", fontWeight: 700, lineHeight: 1.12}
  title: {fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.3}
  heading: {fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4}
  body: {fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "1rem", fontWeight: 400, lineHeight: 1.5}
  label: {fontFamily: "DM Sans, system-ui, sans-serif", fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.4}
rounded: {control: "8px", panel: "12px"}
spacing: {xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px", xxl: "32px"}
---

<!-- SEED: spesifikasi sebelum implementasi. Verifikasi token dan komponen pada prototipe. -->

# Design — Cek Terpandu

## Overview

**Arah disetujui.** Satu kolom utama dari input hingga tindakan berikutnya. Ringkasan dan cakupan tampil langsung, lalu pengguna dapat membuka rincian bukti. Token, ukuran, dan copy di sini menjadi baseline prototipe sebelum pembekuan desain. [Konteks produk dan stack](PRODUCT.md)

Dari referensi kiriman, adaptasi input utama Tines, panel tindakan MediSense, status per item Gantry, detail kontekstual Exon, dan hubungan asal temuan pada diagram alur. Di CekDulu pola itu muncul sebagai area tempel, ringkasan hasil, daftar pemeriksaan, dan label seperti **Tangkapan layar → Tautan yang ditemukan**.

## Colors

Pakai krem untuk latar, putih hangat untuk panel, dan plum untuk aksi utama serta fokus. Gunakan pasangan warna verdict di bawah bersama ikon dan teks. Status proses memakai pasangan `process` dan `process-surface` agar dapat dibaca berdampingan dengan verdict. Biru netral untuk hasil `NOT_FLAGGED`.

## Typography

DM Sans untuk judul hingga label, dengan fallback `system-ui` untuk demo offline. Gunakan monospace sistem untuk SHA-256. Nama file, hash, dan tautan panjang membungkus di dalam kolom. Tampilkan URL dari input atau ekstraksi sebagai teks nonaktif, seperti `lowongan[.]example`.

Judul beranda memakai `home-title` mulai 768 px dan 1.875 rem di layar yang lebih sempit. Kolase kertas transparan dan bentuk geometris dekoratif berada di samping judul. Formulir tetap satu kolom di bawahnya.

## Layout

Navigasi global **Cek baru** dan **Riwayat** dengan penanda **DEMO/SIMULASI** yang selalu terlihat. Alur utama memakai kolom baca hingga 720 px. Judul, input, izin, progres, dan hasil mengikuti urutan baca yang sama pada setiap lebar.

| Lebar | Komposisi |
| --- | --- |
| Di bawah 768 px | Gutter 16 px, panel satu kolom, aksi utama selebar kolom. Navigasi dan aksi sekunder boleh membungkus. |
| 768–1023 px | Gutter 24 px, kolom terpusat, aksi pendek dapat sejajar jika muat. |
| 1024 px ke atas | Gutter 32 px, header hingga 1120 px. Pertahankan satu kolom tugas dan letakkan input pada layar pertama. |

## Shapes

Gunakan panel datar dengan garis lembut dan radius `panel`. Batas kontrol memakai `control-border`. Padding panel 16 px di mobile dan 24 px mulai tablet. Beri jarak 24 px antarbagian dan 8–12 px antarelemen terkait.

## Components

- **Tombol dan input.** Satu aksi utama per tahap. Area tempel berlabel, tombol **Pilih file**, dan keterangan jenis serta batas ukuran dari konfigurasi demo. Drag-and-drop boleh melengkapi tombol. Gunakan target interaksi minimal 44 px dan fokus plum 3 px dengan jarak dari tepi kontrol.
- **Bukti dan progres.** Gunakan baris pemeriksaan bersama, badge ikon + teks, serta bagian **Lihat bukti** yang dapat dibuka dengan keyboard. Ikon garis 20 px memakai bentuk yang konsisten, seperti penjepit kertas untuk lampiran dan chevron untuk rincian. Ikon pendamping bersifat dekoratif bagi pembaca layar.
- **Umpan balik.** Letakkan pesan validasi di dekat field dan pertahankan input saat pengguna memperbaiki kesalahan. Pindahkan fokus ke judul tahap atau field bermasalah. Umumkan perubahan progres penting secara sopan bagi pembaca layar dan hormati reduced motion.
- **Motion.** Kolase masuk sekali saat beranda terbuka, diikuti pergeseran singkat bentuk di sekitarnya. Perpindahan tahap, panah tombol, dan buka rincian memakai animasi 180–200 ms. Dengan `prefers-reduced-motion`, kolase dan semua keadaan tampil langsung.

## Alur dan layar

| Layar | Urutan isi dan interaksi |
| --- | --- |
| **Home / Cek baru** | “Apa yang ingin Anda periksa?” → tempel pesan, URL, atau hash, atau **Pilih file** → **Tinjau pemeriksaan**. **Pilih contoh simulasi** mengisi bahan sintetis untuk ditinjau. Pintasan **Pesan & tangkapan layar**, **Tautan & QR**, dan **File & hash** mengatur jenis input di analyzer bersama. Entri fitur lanjutan yang ditampilkan berlabel **Direncanakan**. |
| **Analyzer bersama** | Pratinjau tersanitasi dan bahan turunan → konfirmasi atau koreksi ekstraksi → tinjau cek wajib, pilih cek opsional, dan beri izin → **Mulai simulasi** → progres per cek. Panel izin menyebut data, penerima, tujuan, dan visibilitas laporan. Izin belum terpilih saat panel dibuka. **Lanjutkan tanpa cek eksternal** meneruskan cek lokal yang tersedia. **Batalkan** menghentikan pekerjaan tertunda. Kembali ke draf atau tampilkan hasil yang sudah tersedia. |
| **Hasil pemeriksaan** | Mode + verdict + status → satu sampai tiga tindakan → alasan dengan kutipan tersanitasi → cakupan dan keterbatasan → **Lihat bukti** per bahan dalam urutan waktu. Detail menampilkan sumber, metode, waktu, hasil asli yang aman ditampilkan, dan sinyal ternormalisasi. **Tambah bahan** membuka analyzer untuk kasus yang sama dan mempertahankan bukti yang sudah ada. **Cek baru** memulai kasus lain. |
| **Riwayat** | Satu entri per kasus dengan waktu, jenis input, verdict, status/cakupan, dan mode. **Buka hasil** menampilkan snapshot demo tersanitasi. **Hapus entri** menghapus snapshot itu. Riwayat berada di memori halaman dan kosong saat dimuat ulang. State kosong berbunyi “Belum ada pemeriksaan di sesi ini.” dengan aksi **Cek baru**. |

Contoh izin di demo — “Simulasi izin cek reputasi. Dalam layanan live, penyedia yang tercantum akan menerima SHA-256 berkas ini. Data demo tetap di perangkat.” Tampilkan kebijakan visibilitas pada keputusan yang sama jika laporan dapat diakses pihak lain.

Contoh ringkasan — **Mencurigakan. Tunda transfer.** “Pesan meminta deposit untuk melanjutkan seleksi. Verifikasi melalui kontak resmi perusahaan yang Anda cari sendiri.” **Cakupan** — teks dikonfirmasi, sumber reputasi tidak memiliki catatan untuk tautan `lowongan[.]example`.

## Hasil dan status

| Verdict | Label, ikon, dan perlakuan |
| --- | --- |
| `UNSAFE` | **Berbahaya** · oktagon tanda seru · `unsafe`. Tunjukkan bukti kuat pada bahan yang tepat dan tindakan segera. Bila cek terpilih gagal atau cek wajib dilewati, pertahankan verdict dan tampilkan **Pemeriksaan sebagian**. |
| `SUSPICIOUS` | **Mencurigakan** · segitiga tanda seru · `suspicious`. Kutip indikator dan berikan cara memverifikasi dengan aman. |
| `NOT_FLAGGED` | **Tidak ada indikasi terdeteksi** · daftar dengan centang · `not-flagged`. Semua cek wajib selesai dengan cakupan memadai dan tanpa temuan relevan. Cantumkan cakupan hasil. |
| `INCONCLUSIVE` | **Belum dapat disimpulkan** · lingkaran tanda tanya · `inconclusive`. Jelaskan bukti yang kurang atau konflik yang belum selesai, lalu beri langkah yang memungkinkan. |

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

Gunakan sumber fiktif bertanda simulasi dan data presentasi sintetis. Jika input di luar fixture, arahkan ke **Pilih contoh simulasi**. Prioritas build setelah izin adalah Home dan Hasil, lalu analyzer bersama dan riwayat. Periksa alur utama, izin ditolak, hasil parsial, retry, riwayat kosong, keyboard, teks panjang, dan konsol/jaringan di 1440 × 900, lebar 768, dan lebar 390. [Skenario dan kriteria review](docs/DESIGN_BRIEF.md)
