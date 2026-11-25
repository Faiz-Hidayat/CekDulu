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

## Cakupan prototipe

- **Pilih contoh simulasi** mengisi fixture untuk ditinjau. Pemilih file mengenali tiga file contoh berdasarkan digest. OCR, pembacaan QR, dan reputasi membaca hasil yang telah disiapkan. Bahan lain diarahkan ke fixture. Batas validasi demo 5 MB.
- **Tambah bahan** tersedia untuk kombinasi tangkapan layar lowongan dan QR. Pratinjau APK serta keaslian media memakai tampilan hasil yang sama dengan penanda **Pratinjau P1**. Riwayat bersifat sementara dan kosong setelah muat ulang.
- `AnalysisService` dan `CaseReport` memisahkan alur UI dari implementasi sumber data. Seluruh cek memakai adapter lokal. FastAPI dan integrasi penyedia menunggu fase berikutnya.

## Penyegaran visual

Beranda memakai kolase ImageGen bawaan dan bentuk CSS asimetris. Aset 840 × 560 dengan alpha disajikan lokal. Animasi beranda berjalan sekali. Transisi tahap dan rincian bukti mengikuti preferensi pengurangan gerak. Skrip verifikasi sekarang memeriksa gambar dan kedua pengaturan motion pada tiga viewport. [Aset kolase](../src/assets/cekdulu-paper-collage-840.png)

### Prompt ImageGen

```text
Use case: stylized-concept.
Asset: compact editorial hero cutout for a warm ivory web utility that helps consumers pause and inspect a suspicious message.
Create an original tactile paper collage: staggered heavyweight ivory paper tiles, a plum circular optical lens laid across them, a folded apricot corner and a small lilac perforated panel. Let a hint of sage and dark aubergine balance the soft colors. Sculptural cut edges, restrained silkscreen grain, gentle directional studio lighting. Compose a single asymmetric, tightly grouped, three-quarter-view silhouette that reads clearly at 220 pixels wide. Keep the composition roughly landscape and centered, with even transparent padding around the whole cluster. Output a true transparent background. No text, lettering, interface mockup, logo, shield, watermark or backdrop.
```
