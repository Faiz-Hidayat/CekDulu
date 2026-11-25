# Product — CekDulu

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

**Disetujui.** React + Vite + TypeScript + CSS biasa untuk antarmuka. FastAPI untuk validasi, ekstraksi, orkestrasi penyedia, model bukti, dan keputusan deterministik di Python pada fase P0. Prototipe memakai sumber fixture lokal bertipe. Pilihan ini menjadi acuan stack proyek.

## Users

Mahasiswa dan pengguna internet Indonesia yang ingin memeriksa pesan, tangkapan layar, tautan, QR, atau berkas yang meragukan sebelum membuka, mengirim data, memasang aplikasi, atau mentransfer uang.

## Product Purpose

CekDulu menggabungkan bahan yang berkaitan dalam satu kasus. Pengguna perlu memahami tindakan berikutnya, alasan yang mendukungnya, dan pemeriksaan yang belum memberikan jawaban. Antarmuka menggunakan bahasa Indonesia yang lugas, dengan istilah teknis di bagian bukti.

## Operating Context

Proyek kelompok DDP1 dengan tenggat 10 Desember 2026. Arah **A — Cek Terpandu** dijabarkan di [DESIGN.md](DESIGN.md). Prototipe lokal menunggu izin pengerjaan. Implementasi P0 mengikuti persetujuan prototipe dan pembekuan desain. Pengiriman data ke penyedia memerlukan persetujuan tersendiri. [Rencana proyek](PLANS.md)

## Capabilities and Constraints

- Cakupan P0 mengikuti brief produk. Pemeriksaan pesan dan tangkapan layar berbagi alur konteks. URL dari pesan atau QR masuk ke pemeriksaan tautan yang sama. Pemeriksaan file mulai dari tipe berkas dan SHA-256. Semua jenis bahan memakai laporan dan riwayat kasus bersama. [Brief produk](PROJECT_BRIEF.md)
- Setiap hasil menunjukkan verdict, status proses, cakupan, sumber, waktu, dan keterbatasan. Keaslian media memiliki penilaian tersendiri. Cakupan P1 dan P2 mengikuti prioritas di brief produk.
- Perlakukan input dan hasil eksternal sebagai data tak tepercaya. Proses lampiran secara statis, tampilkan tautan berisiko sebagai teks nonaktif, dan batasi akses jaringan ke endpoint penyedia yang diizinkan. Utamakan hash sebelum mempertimbangkan pengiriman berkas. Lindungi OTP, kredensial, chat pribadi, dan URL bertoken. Simpan hanya metadata tersanitasi di riwayat.
- Demo bertanda **DEMO/SIMULASI** memakai fixture sintetis. Akses penyedia, kebijakan retensi live, dan batas unggahan produksi ditetapkan pada fase integrasi. [Panduan kerja](AGENTS.md) · [Katalog kandidat API](docs/API_RESEARCH.md)
