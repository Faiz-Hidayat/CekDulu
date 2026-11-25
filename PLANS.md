# Rencana CekDulu

**Fase aktif — desain saja.** Pekerjaan dalam giliran ini adalah inisialisasi dokumen. Discovery menunggu referensi pengguna. Tenggat proyek 10 Desember 2026, pukul 23.59 WIB menurut brief. Cocokkan jam tenggat dan rubrik dengan tugas resmi.

## Lingkup usulan

- **P0** — Cek pesan scam, ekstraksi dan konfirmasi teks tangkapan layar, reputasi URL, dekode QR lokal, tipe file dan reputasi SHA-256, serta laporan kasus bersama dengan bukti, cakupan, tindakan, dan riwayat demo.
- **P1** — Metadata APK statis, konteks domain/IP, bantuan insiden, dan pemeriksaan keaslian gambar jika akses penyedia sesuai. Mulai setelah P0 stabil.
- **P2** — Metadata `.eml`, pencarian cek fakta, pemeriksaan paparan kata sandi di sisi klien, dan sandbox eksternal bersyarat.

Pakai prioritas fitur dari [brief produk](PROJECT_BRIEF.md). [Katalog API](docs/API_RESEARCH.md) mencatat usulan lama Streamlit, uji live pada hari pertama, dan prioritas lebih awal untuk media, cek fakta, serta paparan kata sandi. Framework masih terbuka. Akses, kuota, biaya, dan kebijakan data perlu divalidasi setelah ada izin. Untuk P0, pilih kandidat minimum yang mencakup kebutuhan. Jadwalkan uji benign hanya setelah disetujui secara terpisah.

## Pilihan stack

| Opsi | Upaya dan kepatuhan DDP1 |
| --- | --- |
| FastAPI + Jinja2 + CSS | UI khusus dengan template server-side dan satu proses lokal. Integrasi lebih ringan dan lebih banyak waktu untuk pipeline Python serta tes. |
| React + Vite + TypeScript + CSS, dengan FastAPI | Lebih leluasa untuk interaksi UI kompleks. Perlu alur kerja Node, kontrak HTTP, dan pengujian integrasi tambahan. Python tetap menjadi program utama jika React hanya menangani presentasi. |

**Rekomendasi sementara** adalah FastAPI + Jinja2 + CSS karena alur input dan laporan dapat memakai template bersama. Konfirmasi ke asdos tentang batas penggunaan frontend non-Python, tim 3–4 orang, repo publik, dan kontribusi kode individu. Setelah melihat referensi, tim memilih arah visual dan satu stack, menyepakati cakupan P0 dan pembagian kerja, lalu mencatat keputusan stack dalam ADR. Sebelum live, sepakati penyedia yang dipakai, data yang boleh dikirim, dan batas retensi.

## Jadwal tentatif

| Target | Tahap dan gerbang |
| --- | --- |
| 25–27 Nov | Discovery terblokir sampai referensi diterima. Ajukan dua arah desain, masing-masing dengan alur utama dan pertimbangan mobile. |
| 25–27 Nov | Spesifikasi dan prototipe mock terblokir sampai arah desain dan stack disetujui. Setelah izin prototipe, uji lokal skenario utama dan kegagalan sesuai [brief desain](docs/DESIGN_BRIEF.md), lalu minta persetujuan pembekuan desain. |
| 28 Nov–2 Des | P0 terblokir sampai desain dibekukan, prototipe disetujui, dan pengerjaan diizinkan. Susun kontrak bukti, pipeline Python, tes offline, dan integrasi UI. Uji dan aktifkan penyedia live hanya dengan izin yang sesuai. |
| 3–5 Des | P1 dan P2 terblokir sampai P0 stabil dan tambahan disetujui. Prioritaskan umpan balik dan perbaikan P0 jika waktu terbatas. |
| 6–10 Des | Pembekuan fitur, evaluasi, README, video, dan penyerahan mengikuti kesiapan P0 serta peninjauan tim. |
