# Log build prototipe CekDulu

25 November 2026 WIB · **Cek Terpandu — DEMO/SIMULASI**

## Menjalankan

Dari root proyek, gunakan Node.js dan npm. `npm ci` memakai versi dari lockfile. Server mendengarkan di [127.0.0.1:5173](http://127.0.0.1:5173/).

```powershell
npm.cmd ci
npm.cmd run dev -- --port 5173 --strictPort
```

Untuk verifikasi, biarkan server berjalan dan gunakan terminal kedua. Pengujian browser memakai Playwright Python 1.57.0 dengan Chromium yang tersedia di mesin ini.

```powershell
npm.cmd run build
python scripts/verify-prototype.py
```

## Bukti pengujian

- Build dan pemeriksaan tipe lulus dengan Node.js 22.22.3. Pemeriksaan Impeccable `detect --json src` menghasilkan `[]`.
- Chromium 143.0.7499.4 lulus pada 1440 × 900, 768 × 1024, dan 390 × 844. Verifikasi mencakup keyboard, pemilih file lokal, koreksi OCR, persetujuan dan penolakan, kuota, timeout, batal, retry, bukti parsial, penambahan bahan, serta buka/hapus/reset riwayat. Pengujian mencatat 0 error konsol dan 0 permintaan HTTP eksternal. [Log pengujian](../output/playwright/qa-run.txt)
- Screenshot ditinjau untuk urutan baca, keterbacaan, serta perilaku layout dan pesan validasi. Script menyimpan ulang screenshot dan memeriksa overflow horizontal.

| Viewport | Home | Tinjau | Hasil | Validasi |
| --- | --- | --- | --- | --- |
| Desktop 1440 | [Home](../output/playwright/desktop-home-1440.png) | [Tinjau](../output/playwright/desktop-tinjau-1440.png) | [Mencurigakan](../output/playwright/desktop-hasil-1440.png) | [Error ukuran](../output/playwright/desktop-validasi-1440.png) |
| Tablet 768 | [Home](../output/playwright/tablet-home-768.png) | [QR dan izin](../output/playwright/tablet-tinjau-768.png) | [Berbahaya](../output/playwright/tablet-hasil-768.png) | [Error ukuran](../output/playwright/tablet-validasi-768.png) |
| Mobile 390 | [Home](../output/playwright/mobile-home-390.png) | [Tinjau lampiran](../output/playwright/mobile-tinjau-390.png) | [Berbahaya + parsial](../output/playwright/mobile-hasil-390.png) | [Error ukuran](../output/playwright/mobile-validasi-390.png) |

Layar lain yang ditangkap meliputi [bukti terbuka](../output/playwright/desktop-bukti-1440.png), [progres](../output/playwright/desktop-progres-1440.png), dan [riwayat](../output/playwright/desktop-riwayat-1440.png). Artefak QA tersimpan lokal di `output/playwright/`.

## Perbaikan setelah review

| Area | Sebelum | Sesudah |
| --- | --- | --- |
| Palet dan pintasan | Pintasan memakai permukaan netral. [Desktop](../output/playwright/review-before/desktop-home-1440.png) | Mint menandai panduan dan izin. Mawar, biru langit, dan aprikot menandai jenis bahan dengan ikon dan teks. [Desktop](../output/playwright/review-after/desktop-home-1440.png) · [Mobile](../output/playwright/review-after/mobile-home-390.png) |
| Fokus dan target sentuh | Aktivasi teks contoh mengembalikan fokus ke awal halaman. Konfirmasi OCR tercapai setelah tujuh kali Tab pada 390 px. Area label cek opsional setinggi 24 px. [Fokus](../output/playwright/review-before/mobile-fokus-reset-390.png) | Fokus langsung menuju konfirmasi OCR, lalu ke judul izin. Seluruh baris cek opsional dapat ditekan dan terukur setinggi 63 px pada 390 px. [Fokus](../output/playwright/review-after/mobile-fokus-lanjut-390.png) |
| Batas demo | Setelah validasi gagal, pemilih contoh mulai di posisi 891 px pada viewport setinggi 844 px. [Validasi](../output/playwright/review-before/mobile-batas-demo-390.png) | Panduan dan pemilih contoh tampil sebelum formulir. Tombol pemulihan memindahkan fokus ke pemilih tanpa menghapus masukan. [Validasi](../output/playwright/review-after/mobile-batas-demo-390.png) |
| Persetujuan | Cek eksternal ditandai “Wajib”. [Tinjau](../output/playwright/review-before/tablet-tinjau-768.png) | Label cakupan lengkap dan izin menjelaskan pilihan. Dampak memilih cakupan lokal tampil di dekat tombol. [Tinjau](../output/playwright/review-after/tablet-tinjau-768.png) |
| Percobaan ulang | Bukti dari sumber yang sama tampil pada menit yang sama. [Bukti](../output/playwright/review-before/mobile-jejak-retry-390.png) | “Percobaan sebelumnya” dan “Percobaan terbaru” menandai bukti dari cek yang dicoba ulang. [Bukti](../output/playwright/review-after/mobile-jejak-retry-390.png) |

Build, detektor Impeccable, dan uji regresi browser lulus. Playwright menjalankan ulang alur pada 1440 × 900, 768 × 1024, dan 390 × 844. Audit mencakup progres, validasi, timeout, cakupan parsial, hasil belum dapat disimpulkan, hasil berbahaya, serta retry kuota. Kasus berbahaya tetap menampilkan status pemeriksaan sebagian saat cek lain gagal. Retry tanpa bukti memadai tetap menampilkan hasil belum dapat disimpulkan. [Log regresi](../output/playwright/review-after/regression.txt)

Pada 390 px, audit mencakup teks Indonesia 2.016 karakter, nama file 204 karakter, dan uji render URL nonaktif 337 karakter tanpa overflow horizontal. Rasio kontras sampel teks pada aksen baru terukur 6,60:1 hingga 6,94:1. Uji mencatat 0 error konsol dan 0 permintaan HTTP eksternal. [Data audit](../output/playwright/review-after/audit-live.json)

## Cakupan prototipe

- **Pilih contoh simulasi** mengisi fixture untuk ditinjau. Pemilih file mengenali tiga file contoh berdasarkan digest. OCR, pembacaan QR, dan reputasi membaca hasil yang telah disiapkan. Bahan lain diarahkan ke fixture. Batas validasi demo 5 MB.
- **Tambah bahan** tersedia untuk kombinasi tangkapan layar lowongan dan QR. Pratinjau APK serta keaslian media memakai tampilan hasil yang sama dengan penanda **Pratinjau P1**. Riwayat bersifat sementara dan kosong setelah muat ulang.
- `AnalysisService` dan `CaseReport` memisahkan alur UI dari implementasi sumber data. Seluruh cek memakai adapter lokal. FastAPI dan integrasi penyedia menunggu fase berikutnya.

## Revisi visual 26 November 2026

Judul terpusat dan bidang pink lebar menggantikan komposisi judul dan kolase kecil. Formulir menyatukan panduan kuning dengan aksi utama. Lilac menandai izin dan bukti. Judul, ilustrasi, komponen tugas, dan baris hasil memakai gerak yang mengikuti masuknya tahap atau perubahan status. [Sebelum](../output/playwright/review-after/desktop-home-1440.png) · [Desktop](../output/playwright/pink-redesign/desktop-home-1440.png) · [Tablet](../output/playwright/pink-redesign/tablet-home-768.png) · [Mobile](../output/playwright/pink-redesign/mobile-home-390.png) · [Rekaman motion](../output/playwright/pink-redesign/demo-motion.webm)

Build dan regresi Chromium lulus pada 1440 × 900, 768 × 1024, dan 390 × 844. Uji memeriksa gerak normal dan pengaturan pengurangan gerak, fokus, izin, progres, validasi, retry, serta hasil dan bukti. Pada 390 px, tombol **Tinjau pemeriksaan** berakhir di y=824 px pada layar awal. Teks panjang, nama file, dan URL nonaktif membungkus tanpa overflow horizontal. Kontras sampel teks mulai 6,90:1. Konsol dan jaringan mencatat 0 error serta 0 permintaan HTTP eksternal. [Log regresi](../output/playwright/pink-redesign/regression.txt) · [Data audit](../output/playwright/pink-redesign/audit-live.json) · [Berbahaya dan parsial](../output/playwright/pink-redesign/mobile-hasil-390.png)

Detektor Impeccable hanya menandai Fraunces sebagai font populer. Fraunces dan DM Sans dimuat dari aset lokal. [Laporan detektor](../output/playwright/pink-redesign/detector.json) · [Lisensi Fraunces](../public/licenses/Fraunces-OFL.txt)

### Ilustrasi lensa

ImageGen bawaan menghasilkan ilustrasi orisinal dengan transparansi. WebP 860 × 786 yang dipakai pada prototipe berukuran sekitar 109 kB. [Aset lensa](../src/assets/cekdulu-pink-lens.webp)

```text
Use case: stylized-concept. Asset: original transparent cutout for an Indonesian consumer tool that checks suspicious messages and links, used at about 340 px wide in the right half of a vivid bubblegum-pink background. A playful editorial still life of a very large thick dark-berry/magenta transparent acrylic circular magnifying lens with plum-black rim and short diagonally down-right handle floating over two offset ivory index cards. The top index card carries a few simple thick aubergine abstract redaction bars and thin pink diagram rules (no legible text). A vivid butter-yellow folded strip and a small strong cool lilac perforated corner are tucked under the cards. Lens, card and ribbons form one tight clean asymmetrical silhouette with clear gaps and contact shadows on the objects. Punchy art-directed studio lighting, tactile paper edges and photographic acrylic refraction, crisp contrast, graphic and contemporary. Nearly square composition, no enclosing square, generous transparent margin, no cast shadow outside silhouette. No logos, faces, readable text, watermarks, camera frames, app UI, extra objects or background.
```

## Latar ilustrasi dan kontrol shadcn/ui

Formulir dipusatkan di depan latar ilustrasi. Pink beri dipakai pada aksi dan fokus. Skenario, validasi, dan pratinjau P1 kini dikelompokkan di dropdown. Baris opsional menyelaraskan checkbox dengan ikon pemeriksaan lain. Metadata hasil dan riwayat memakai chip kalender WIB. Bukti membedakan waktu pengambilan dari waktu sumber. [Sebelum](../output/playwright/pink-redesign/desktop-home-1440.png) · [Desktop](../output/playwright/art-shadcn/desktop-home-1440.png) · [Tablet](../output/playwright/art-shadcn/tablet-home-768.png) · [Mobile](../output/playwright/art-shadcn/mobile-home-390.png)

Komponen Select dan Checkbox diadaptasi dari shadcn/ui memakai `@radix-ui/react-select` dan `@radix-ui/react-checkbox` serta CSS lokal. Ikon dan token mengikuti CekDulu. [Lisensi shadcn/ui](../public/licenses/shadcn-ui-MIT.txt)

Build dan regresi Chromium lulus pada 1440 × 900, 768 × 1024, dan 390 × 844. Uji mencakup navigasi dropdown dengan keyboard, pemulihan fokus, klik label checkbox, izin awal nonaktif, tanggal ISO/WIB, dan mode pengurangan gerak. Pada 390 px tombol utama berakhir di y=794 dan label opsional setinggi 65 px. Kontras opsi aktif terukur 8,30:1, chip tanggal 7,90:1. Uji mencatat 0 error konsol dan 0 permintaan HTTP eksternal. [Dropdown](../output/playwright/art-shadcn/mobile-dropdown-390.png) · [Checkbox](../output/playwright/art-shadcn/mobile-kontrol-analyzer-390.png) · [Riwayat](../output/playwright/art-shadcn/desktop-riwayat-1440.png) · [Log regresi](../output/playwright/art-shadcn/regression.txt) · [Data audit](../output/playwright/art-shadcn/audit-live.json)

Vite melaporkan peringatan bundling `use client` dari Radix. Build selesai. Detektor Impeccable mencatat Fraunces sebagai font populer dan grid sebagai pola yang perlu ditinjau. Grid dipakai pada bidang ilustrasi di beranda. [Log build](../output/playwright/art-shadcn/build.txt) · [Laporan detektor](../output/playwright/art-shadcn/detector.json)

### Artwork beranda

ImageGen bawaan menghasilkan dua rangkaian objek akrilik dengan ruang kosong untuk formulir. Aset transparan WebP 1440 × 960 berukuran sekitar 158 kB. [Aset latar](../src/assets/cekdulu-scan-backdrop.webp)

```text
Use case: stylized-concept. Asset: a wide landscape website background in genuine alpha transparency, designed to sit BEHIND a centered interactive form. Create a graphic, playful editorial still life for a consumer service that helps people examine suspicious digital material, imagined as two separated installations built from real physical objects. Left installation: an oversized pale-lavender translucent acrylic indexing plate leaning diagonally on a hot pink perforated file tab and textured white index paper, with one thin dark pink guide line. Right installation: stacked deep magenta glass chips, a thick butter-yellow ridged loop resembling an optical scanner coil, tiny lavender and sky-blue squares and an off-white corner of paper. Give them crisp architectural depth, tilted off-axis elegant composition, directional studio lights, saturated berry-pink and lilac with very selective lemon yellow, and textured highlights on the acrylic. Group the dramatic objects along the far left and far right edges, concentrated in the middle-height horizontal band. The entire middle 44 percent of the width must remain empty full transparency from top to bottom; two islands never touch. Use an oblique three-quarter camera. This is abstract physical product art with clean edges and no solid background or ground plane. No magnifying glass, no text, no typography, no faces, no readable QR codes, no logos, no UI, no screenshots, no watermarks. Wide composition at a 3:2 landscape aspect ratio.
```

## Layar kerja dan ilustrasi verdict · 27 November 2026

Layar tinjau, progres, hasil, dan riwayat memakai kepala layar tipografis. Penanda aktif mengikuti alur **Tinjau**, **Periksa**, dan **Hasil**. Pemindai bergerak saat antre atau berjalan, lalu berhenti saat tahap berakhir. Dossier kertas berada di panel bahan. Riwayat memperlihatkan indeks sesi dan folder pada keadaan kosong.

Panel hasil memakai satu ilustrasi untuk setiap verdict keamanan. Badge proses dan rincian cakupan tampil terpisah. Percobaan ulang yang menyelesaikan pemeriksaan sebagian mempertahankan ilustrasi **Berbahaya** selama verdict masih sama. [Perbandingan hasil sebelumnya](../output/playwright/workspace-motion/after/desktop-hasil-1440.png) · [Hasil terbaru](../output/playwright/workspace-motion/status-art/desktop-hasil-1440.png) · [Lima varian](../output/playwright/workspace-motion/status-art/lima-varian-hasil.png)

| Layar | Desktop | Mobile |
| --- | --- | --- |
| Tinjau | [1440 px](../output/playwright/workspace-motion/status-art/desktop-tinjau-1440.png) | [390 px](../output/playwright/workspace-motion/status-art/mobile-tinjau-390.png) |
| Progres | [1440 px](../output/playwright/workspace-motion/status-art/desktop-progres-1440.png) | [390 px](../output/playwright/workspace-motion/status-art/mobile-progres-390.png) |
| Hasil dan bukti | [1440 px](../output/playwright/workspace-motion/status-art/desktop-bukti-1440.png) | [390 px](../output/playwright/workspace-motion/status-art/mobile-bukti-390.png) |
| Riwayat | [1440 px](../output/playwright/workspace-motion/status-art/desktop-riwayat-1440.png) | [390 px](../output/playwright/workspace-motion/status-art/mobile-riwayat-390.png) |

`npm.cmd run build` dan `python scripts/verify-prototype.py` lulus. Uji Chromium pada 1440 × 900, 768 × 1024, dan 390 × 844 mencakup penanda tahap, fokus, progres, persetujuan, bukti parsial, retry, riwayat, dan pengurangan gerak. Tercatat 0 error konsol dan 0 permintaan HTTP eksternal. Build mencatat peringatan bundling `use client` dari Radix. [Log build](../output/playwright/workspace-motion/build.txt) · [Log regresi](../output/playwright/workspace-motion/status-art/regression.txt)

Kelima judul hasil membungkus utuh per kata pada ketiga viewport dan pada lebar tambahan 320, 900, dan 1024 px. Kontras teks verdict terukur minimal 7,15:1. [Audit ilustrasi](../output/playwright/workspace-motion/status-art/artwork-audit.json) · [Rekaman alur](../output/playwright/workspace-motion/status-art/alur-ilustrasi.webm)

ImageGen bawaan menghasilkan enam cutout transparan yang disajikan lokal sebagai WebP. [Dossier](../src/assets/review-dossier.webp) · [Berbahaya](../src/assets/reports/unsafe.webp) · [Mencurigakan](../src/assets/reports/suspicious.webp) · [Tanpa indikasi](../src/assets/reports/not-flagged.webp) · [Belum dapat disimpulkan](../src/assets/reports/inconclusive.webp) · [Belum dinilai](../src/assets/reports/unassessed.webp)

<details>
<summary>Prompt ImageGen</summary>

```text
Awalan bersama untuk lima verdict
Use case: stylized-concept. Asset: a tiny original cutout for an editorial consumer safety-check report, displayed at 90–175 px. Make a bold three-quarter-view still life entirely from cut cardstock, paper relief, and stamped matte ink. The result should feel like a physical instruction diagram, with an immediately legible compact silhouette and tactile subtle paper edges. Center one cohesive cluster with the whole object visible and a small even margin. True alpha background, no backdrop, no platform, no shadows outside the object cluster. No readable text, numerals, branding, people, shield or lock, UI, or logos. Do not draw a generic circle or badge behind the subjects.

unsafe
Subject: a wide solid crimson crossbar shutter built from two dark-red diagonally striped cardstock strips, closed across a pale folded evidence slip, like a paper barrier blocking a route. Add a small perpendicular brick paper tab to support the barrier visually. The hard horizontal stop and two stripe bands must dominate; high-contrast dark crimson and warm blush paper. Keep the composition distinctly horizontal.

suspicious
Subject: a butter-ochre folded file slip with one angular triangular translucent amber frame hovering just above a selected line of thick charcoal abstract ink. Two small orange corner brackets isolate that line like a clue in an editorial markup. No exclamation mark and no circle; angular shapes and uplifted corner communicate a clue that needs closer inspection. Golden amber, cream, light apricot, restrained brown ink.

notFlagged
Subject: a tidy sequence of three overlapping evidence strips with precise blue-gray ruled marks, visible rows and staggered tabs, beside a short flat cool-blue inspection guide with two notches. A quiet horizontal stack with no checkmark or safety symbol, conveying an orderly inspection and limited recorded scope. Slate blue, muted cyan, ivory and steel ink.

inconclusive
Subject: two separated halves of a pale lilac index sheet, with a clearly missing center bridge and a short row of lavender dashed markings parallel to the torn edge. Large simple irregular gap between the pieces must stand out at small sizes. Use plum ink only for short abstract marks, soft violet paper and lilac. No question mark glyph, no alert triangle.

unassessed
Subject: a blank warm gray cardstock envelope with a half-visible cream page, unmarked outside except a charcoal paper clip and one small pale slate tab. It should read as a sealed, unreviewed packet, distinctly neutral and quiet. Sideways flat folded paper, warm gray, ivory, graphite. No signs, text, stamps, check marks or icons.

review
Use case: stylized-concept. Asset: original compact decorative cutout for the top right of an input material panel in an Indonesian consumer safety-checking app. Create a tactile little editorial filing scene: two slipped ivory blank note cards with a few abstract ink rules and a berry-pink chunky paper clip holding a lilac punched index tab, one pale amber marker tab showing at the edge. Build from layered textured cardstock and matte ink, three-quarter view, diagonal yet distinctly upright composition, strong clean silhouette. Center all objects with even breathing room. Background genuinely transparent, no ground plane, no fake canvas, no logos, no symbols of security or safety, no legible text, no people, no magnifying glass.
```

</details>

## Transisi pilihan dan latar layar kerja · 27 November 2026

Saat beralih dari skenario pesan ke lampiran, panel sebelumnya langsung bertambah 136–137 px pada viewport uji. Sekarang perubahan tinggi detail dan lampiran berlangsung dalam 280 ms. Pintasan memberi isyarat pada pilihan aktif dan mengarahkan fokus ke input. Menu masuk dalam 190 ms dan menutup langsung agar Tab berikutnya dapat diterima. [Pengukuran sebelum](../output/playwright/interaction-motion/before/layout.json) · [Sampel bingkai sesudah](../output/playwright/interaction-motion/after/layout.json) · [Rekaman sebelum](../output/playwright/interaction-motion/before/alur-sebelum.webm) · [Rekaman sesudah](../output/playwright/interaction-motion/after/alur-sesudah.webm)

Lembar grid berlapis warna pink dan lilac muncul sekali saat layar kerja dibuka. Panel dan teks tugas tampil di depan. [Tinjau sebelum](../output/playwright/interaction-motion/before/desktop-tinjau-1440.png) · [Tinjau desktop](../output/playwright/interaction-motion/after/desktop-tinjau-1440.png) · [Tablet](../output/playwright/interaction-motion/after/tablet-tinjau-768.png) · [Mobile](../output/playwright/interaction-motion/after/mobile-tinjau-390.png) · [Dropdown mobile](../output/playwright/interaction-motion/after/mobile-dropdown-390.png)

Build dan regresi Chromium lulus pada 1440, 768, dan 390 px dengan 0 error konsol dan 0 permintaan HTTP eksternal. Uji terfokus mencakup Tab langsung setelah Enter atau Escape dan pengurangan gerak. Latar dekoratif tidak menambah area gulir. Retry pada fixture parsial mempertahankan verdict ketika cakupan berubah. Build masih mencatat peringatan bundling Radix. [Build](../output/playwright/interaction-motion/build.txt) · [Regresi](../output/playwright/interaction-motion/regression.txt) · [Fokus dan latar](../output/playwright/interaction-motion/focus-and-backdrop.txt) · [Layar kerja dan retry](../output/playwright/interaction-motion/scenes.txt)

## Perpindahan pintasan · 27 November 2026

Pada **File & hash → Pesan**, rekaman awal menangkap tinggi formulir menyusut 164–185 px pada bingkai pertama, lalu membesar sebelum animasi selesai. Panel sekarang mempertahankan tinggi yang sedang terlihat sampai transisi dimulai. Pengukuran pada 1440, 768, dan 390 px mencatat perubahan 0 px pada bingkai pertama, diikuti penyusutan bertahap. [Jejak sebelum](../output/playwright/shortcut-motion/before/trace.json) · [Jejak sesudah](../output/playwright/shortcut-motion/after/trace.json)

Fokus menetap di tombol pintasan. Satu bidang aktif bergeser antar tombol dan petunjuk input berganti dengan transisi. [Rekaman desktop sebelum](../output/playwright/shortcut-motion/before/pintasan-1440-sebelum.webm) · [Desktop sesudah](../output/playwright/shortcut-motion/after/pintasan-1440-sesudah.webm) · [Mobile sesudah](../output/playwright/shortcut-motion/after/pintasan-390-sesudah.webm)

`npm.cmd run build` dan `python scripts/verify-prototype.py` lulus. Chromium menguji pergantian cepat, fokus keyboard, masukan yang sedang diketik, serta mode kurangi gerakan. Regresi mencatat 0 error konsol dan 0 permintaan eksternal. [Regresi](../output/playwright/shortcut-motion/regression.txt) · [Fokus keyboard](../output/playwright/shortcut-motion/keyboard.txt) · [Log build](../output/playwright/shortcut-motion/build.txt)

## Penyegaran visual awal

Iterasi awal memakai kolase ImageGen 840 × 560 dan bentuk CSS asimetris. [Aset kolase awal](../src/assets/cekdulu-paper-collage-840.png)

### Prompt ImageGen awal

```text
Use case: stylized-concept.
Asset: compact editorial hero cutout for a warm ivory web utility that helps consumers pause and inspect a suspicious message.
Create an original tactile paper collage: staggered heavyweight ivory paper tiles, a plum circular optical lens laid across them, a folded apricot corner and a small lilac perforated panel. Let a hint of sage and dark aubergine balance the soft colors. Sculptural cut edges, restrained silkscreen grain, gentle directional studio lighting. Compose a single asymmetric, tightly grouped, three-quarter-view silhouette that reads clearly at 220 pixels wide. Keep the composition roughly landscape and centered, with even transparent padding around the whole cluster. Output a true transparent background. No text, lettering, interface mockup, logo, shield, watermark or backdrop.
```
