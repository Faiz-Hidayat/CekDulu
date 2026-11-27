# Rencana CekDulu

**Status proyek.** Desain **A — Cek Terpandu** dan prototipe lokal disetujui serta dibekukan pada 27 November 2026 (WIB), setelah revisi transisi pintasan. Prototipe tersedia dalam mode **DEMO/SIMULASI** dengan fixture lokal. Backend FastAPI dan API live masing-masing menunggu izin eksplisit yang terpisah. [Acuan desain](DESIGN.md)

Gunakan versi beku sebagai acuan untuk perubahan UI yang disetujui kemudian. Sebelum menyatakan perubahan siap, verifikasi kontinuitas gerak, tata letak, dan fokus sesuai [standar transisi](DESIGN.md#standar-transisi).

Tenggat proyek 10 Desember 2026, pukul 23.59 WIB menurut brief. Cocokkan jam tenggat dan rubrik dengan tugas resmi.

## Lingkup usulan

- **P0** — Cek pesan scam, ekstraksi dan konfirmasi teks tangkapan layar, reputasi URL, dekode QR lokal, tipe file dan reputasi SHA-256, serta laporan kasus bersama dengan bukti, cakupan, tindakan, dan riwayat demo.
- **P1** — Metadata APK statis, konteks domain/IP, bantuan insiden, dan pemeriksaan keaslian gambar jika akses penyedia sesuai. Mulai setelah P0 stabil.
- **P2** — Metadata `.eml`, pencarian cek fakta, pemeriksaan paparan kata sandi di sisi klien, dan sandbox eksternal bersyarat.

Pakai prioritas fitur dari brief produk. Riset API berfungsi sebagai katalog kandidat. Pemilihan penyedia serta verifikasi akses, kuota, biaya, dan kebijakan data mengikuti izin tahap live. [Brief produk](PROJECT_BRIEF.md) · [Katalog kandidat API](docs/API_RESEARCH.md)

## Stack disetujui

Antarmuka memakai **React + Vite + TypeScript + CSS**. **FastAPI** adalah pilihan backend untuk logika inti Python setelah fase P0 diizinkan. Konfirmasi ke asdos tentang batas penggunaan frontend non-Python, tim 3–4 orang, repo publik, dan kontribusi kode individu. [Keputusan stack](PRODUCT.md#stack)

## Jadwal tentatif

| Target | Tahap dan gerbang |
| --- | --- |
| 25–27 Nov | **Selesai.** Discovery, spesifikasi, dan prototipe mock telah disetujui. Desain dibekukan pada 27 November. |
| Setelah izin backend | **Ditunda.** Implementasi P0, pipeline Python, tes offline, dan integrasi UI dengan FastAPI menunggu persetujuan untuk mulai. |
| Setelah izin live terpisah | **Ditunda.** Pengujian dan integrasi API live, termasuk pengiriman data ke penyedia, memerlukan persetujuan eksplisit tersendiri. |
| 3–5 Des | P1 dan P2 terblokir sampai P0 stabil dan tambahan disetujui. Prioritaskan umpan balik dan perbaikan P0 jika waktu terbatas. |
| 6–10 Des | Pembekuan fitur, evaluasi, README, video, dan penyerahan mengikuti kesiapan P0 serta peninjauan tim. |
