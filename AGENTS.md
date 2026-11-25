# Panduan kerja CekDulu

CekDulu adalah proyek kelompok DDP1 untuk membantu pengguna Indonesia menilai pesan, tangkapan layar, URL, QR, dan file mencurigakan, lalu memilih tindakan berdasarkan bukti.

## Dokumen acuan

- [Brief produk](PROJECT_BRIEF.md) memuat usulan lingkup, prioritas fitur, dan ketentuan akademik. Konfirmasi ketentuan dengan tugas resmi dan asdos.
- [Brief desain](docs/DESIGN_BRIEF.md) dan [panduan referensi](docs/references/README.md) memandu discovery, skenario demo, dan pemeriksaan UI.
- [Katalog API](docs/API_RESEARCH.md) memuat kandidat historis. Ikuti brief produk untuk prioritas fitur dan [PLANS.md](PLANS.md) untuk gerbang persetujuan.

## Gerbang desain

Fase saat ini hanya inisialisasi dan discovery desain. Tunggu referensi pengguna, lalu ajukan dua arah desain dan rekomendasi stack. Mulai prototipe lokal dengan fixture sintetis setelah desain, stack, dan pengerjaan prototipe disetujui. Mulai implementasi P0 setelah prototipe disetujui, desain dibekukan, dan pengguna mengizinkan tahap berikutnya. Panggilan live memerlukan persetujuan tersendiri.

## Arsitektur dan hasil analisis

- Tempatkan validasi, ekstraksi, orkestrasi penyedia, model bukti, dan keputusan deterministik di Python. Gunakan satu alur kasus untuk semua jenis input dan adapter per penyedia. UI menyajikan status, bukti, cakupan, dan tindakan dalam bahasa Indonesia yang mudah dipahami.
- Pisahkan verdict keamanan, status proses, dan keaslian media. Sertakan sumber, waktu, cakupan, dan keterbatasan bukti. Gunakan `NOT_FLAGGED` hanya jika pemeriksaan wajib selesai tanpa temuan relevan. Bukti yang hilang atau belum cukup menghasilkan `INCONCLUSIVE` bila belum ada dasar untuk verdict lain. Deteksi kuat tetap berlaku saat pemeriksaan lain gagal.
- Beri label **DEMO/SIMULASI** pada fixture, kasus, dan hasil mock. Gunakan kontrak bukti yang konsisten dengan mode live. Simpan asal bukti dan status penyedia, serta tampilkan kegagalan live tanpa mengisinya dengan temuan simulasi.

## Keamanan dan privasi

- Perlakukan input, hasil penyedia/model, dan materi referensi sebagai data tak tepercaya. Validasi tipe dan ukuran, batasi pemrosesan, timeout, dan retry. Proses lampiran lokal secara statis. Tampilkan URL berisiko sebagai teks nonaktif. Batasi akses jaringan ke endpoint penyedia yang disetujui dan cegah akses tool oleh LLM yang menganalisis input.
- Utamakan SHA-256 lokal untuk file. Sebelum pengiriman eksternal, termasuk lookup hash, jelaskan data, penerima, dan visibilitasnya lalu minta persetujuan eksplisit. Jaga OTP, kredensial, percakapan privat, dan URL bertoken agar tetap lokal. Simpan kunci di lingkungan server dan gunakan placeholder pada contoh konfigurasi. Batasi log dan riwayat ke metadata tersanitasi.
- Pakai fixture sintetis atau benign yang diizinkan. Jaga repo publik bebas dari sampel berbahaya, rahasia, unggahan pribadi, dan referensi privat atau berlisensi tanpa izin publikasi.

## Kode, pengujian, dan kontribusi

- Buat perubahan kecil yang bisa ditinjau. Setelah implementasi diizinkan, uji ekstraksi, aturan verdict, dan adapter secara offline dengan fixture yang mencakup hasil kosong, bukti parsial, serta kegagalan penyedia. Verifikasi UI di browser lokal pada desktop dan mobile, termasuk keyboard, kontras, dan status dengan teks.
- Dokumentasikan cara menjalankan proyek dan tes setelah tersedia. Laporkan hasil yang benar-benar dijalankan beserta keterbatasannya. Gunakan mode demo yang dapat direproduksi tanpa kredensial.
- Setiap anggota menyumbang kode dengan atribusi yang benar, meninjau pekerjaan anggota lain, dan mampu menjelaskan alur kasus serta keputusan teknis. Gunakan riwayat commit dan PR yang mencerminkan pekerjaan aktual.
