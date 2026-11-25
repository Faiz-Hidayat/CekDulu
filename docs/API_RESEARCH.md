# CekDulu — Katalog API dan rencana implementasi
**Riset dokumentasi publik: 24 November 2026 | Deadline: 10 Desember 2026**

Tujuan: MVP Python untuk triase scam, phishing, file, dan media. Dokumen ini adalah hasil penelitian dokumentasi, bukan hasil pengujian token atau klaim akurasi penyedia. Seluruh kuota dan entitlement harus dikonfirmasi pada dashboard akun tim; jangan mengasumsikan layanan gratis untuk penggunaan akademik berarti boleh dipakai untuk penggunaan organisasi/komersial.

## 1. Shortlist API dan layanan

| Penyedia | Fungsi | Akses dan batas utama | Endpoint atau dokumentasi | Prioritas |
|---|---|---|---|---|
| Gemini Developer API | Klasifikasi konteks scam, ekstraksi teks dan gambar, ringkasan laporan dengan JSON schema | Model tertentu memiliki free tier, limit tergantung model/proyek. Konten free tier dapat dipakai untuk peningkatan produk. Jangan kirim data pribadi/rahasia. | https://ai.google.dev/gemini-api/docs/structured-output ; https://ai.google.dev/gemini-api/docs/pricing | P0 |
| Google Safe Browsing v5 | Lookup URL terhadap daftar phishing/malware/social engineering | Nonkomersial; API key; kuota cek Cloud Console. Maks 50 URL per urls.search. Tidak ada match bukan aman. | GET `https://safebrowsing.googleapis.com/v5/urls:search` ; https://developers.google.com/safe-browsing/reference/rest/v5/urls/search | P0 |
| Kaspersky OpenTIP | Hash/domain/IP/URL reputation; submit file dan basic report | Token; docs menyebut 2.000 lookup/hari. Hak akses full dynamic report berbeda, wajib diuji. Tidak mengasumsikan APK runtime. | `https://opentip.kaspersky.com/api/v1/` ; https://opentip.kaspersky.com/Help/Doc_data/en-US/WorkingWithAPI.htm ; https://opentip.kaspersky.com/Help/Doc_data/en-US/LimitationQuota.htm | P0 |
| VirusTotal | Hash dan URL report multi-engine | Public API: 4 request/menit, 500/hari; nonkomersial dan sesuai terms. Bukan private scanning. Advanced sandbox bergantung premium. | GET `https://www.virustotal.com/api/v3/files/{sha256}` ; https://docs.virustotal.com/reference/public-vs-premium-api | P0/fallback |
| Sightengine | AI-generated image dan deepfake image; model terpisah | Free tier tercantum pada pricing; cek entitlement model dan operasi harian/bulanan aktual. Operasi tidak selalu sama dengan jumlah file. Video/audio tidak diasumsikan gratis. | POST `https://api.sightengine.com/1.0/check.json` ; https://sightengine.com/pricing ; https://sightengine.com/docs/ai-generated-image-detection ; https://sightengine.com/docs/deepfake-detection | P0/P1 |
| HIBP Pwned Passwords | Password exposure | Gratis tanpa API key. Hash lokal, hanya prefix 5 karakter SHA-1; cocokkan suffix lokal, jangan log atau simpan. Untuk MVP publik, client-side saja. | GET `https://api.pwnedpasswords.com/range/{prefix}` ; https://haveibeenpwned.com/api/v3/ | P1 |
| Google Fact Check Tools | Pencarian klaim yang pernah diperiksa | API key; cek kuota proyek. Tidak ada hasil bukan berarti klaim benar. | GET `https://factchecktools.googleapis.com/v1alpha1/claims:search` ; https://developers.google.com/fact-check/tools/api/reference/rest/v1alpha1/claims/search | P1 |
| AbuseIPDB | Reputasi IP berdasarkan laporan | Free individual: 1.000 check/report per hari. Lookup saja; jangan auto-report. | GET `https://api.abuseipdb.com/api/v2/check` ; https://www.abuseipdb.com/pricing ; https://docs.abuseipdb.com/ | P1 |
| IANA RDAP bootstrap + registry RDAP | Registrasi domain, event tanggal jika tersedia | Registry publik berbeda per TLD; tidak semua field tersedia. Domain baru tidak otomatis phishing. | https://data.iana.org/rdap/dns.json ; https://www.iana.org/assignments/rdap-dns/rdap-dns.xhtml | P1 |
| Google Public DNS DoH | A/AAAA/MX/TXT, SPF/DMARC publication | Tanpa API key untuk endpoint publik. DNS record bukan bukti autentikasi pesan; tidak membuka URL. | GET `https://dns.google/resolve` ; https://developers.google.com/speed/public-dns/docs/doh/json | P1 |
| IPinfo Lite | ASN, negara IP, organisasi ASN | Free tier dengan token, dokumentasi menyatakan tanpa kuota request. Bukan atribusi pelaku/identitas. | GET `https://api.ipinfo.io/lite/{ip}` ; https://ipinfo.io/developers | P1 |
| OCR.space | OCR screenshot, PDF terbatas | Free key: 500 request/hari/IP, 25.000/bulan, 1 MB/file, 3 halaman PDF menurut docs; uji bahasa Indonesia. Alternatif OCR lokal. | POST `https://api.ocr.space/parse/image` ; https://ocr.space/ocrapi | P1/fallback |
| MalwareBazaar | Lookup hash malware yang diketahui | Community API gratis fair use, Auth-Key. Hanya gunakan lookup metadata hash, bukan unduh sampel. Miss bukan clean. | POST `https://mb-api.abuse.ch/api/v1/` (query=get_info) ; https://bazaar.abuse.ch/api/ | P1 |
| URLhaus | Reputasi URL distribusi malware | Community API gratis fair use, Auth-Key. Bukan feed umum phishing. | https://urlhaus.abuse.ch/api/ | P1 |
| urlscan.io | Browser scan jarak jauh, screenshot/redirect/final URL, report lookup | Key, kuota tiap action menurut dashboard. Public terlihat semua orang; unlisted terlihat pengguna Pro tertentu; private terbatas. Jangan kirim URL bertoken/PII. | https://urlscan.io/docs/api/ | P2 |
| Cloudflare URL Scanner | Analisis halaman jarak jauh | Account ID dan token dengan permission URL Scanner; cek kuota dan visibility. Alternatif urlscan, bukan wajib keduanya. | https://developers.cloudflare.com/radar/investigate/url-scanner/ | P2 |
| Recorded Future / Triage | Sandbox analisis file dan URL | Public cloud API, token akun, semua submission tria.ge publik. Dokumentasi mendukung platform berbeda termasuk Android; cek profil/entitlement akun. Demo hanya artefak nonrahasia yang diizinkan. | https://tria.ge/docs/ ; https://tria.ge/docs/faq/ ; https://hatching.io/triage/ | P2 |
| ANY.RUN | Interactive sandbox Windows/Linux/Android | Community UI tersedia; API task tercantum pada Enterprise. Jangan mengasumsikan API runtime gratis. | https://any.run/plans/ ; https://any.run/api-documentation/ | P2/manual |
| MetaDefender Cloud | Multi-engine file/hash, analisis dan sanitasi menurut tier | Community untuk demo/personal, ketentuan penggunaan data ketat. API limit per key; cek hak integrasi dahulu. | https://www.opswat.com/docs/mdcloud/integrations/public-apis ; https://www.opswat.com/docs/mdcloud/metadefender-cloud-api-v4 | P2 |
| MetaDefender Aether / FileScan.IO | File analysis dan report | Dokumentasi REST tersedia; cek akses API akun, batas privasi dan biaya. | https://www.opswat.com/docs/filescan/metadefender-sandbox-api-reference | P2 |
| Reality Defender RealAPI | Deteksi manipulasi gambar | Update vendor 5 November 2026: free 50 image scans per bulan, audio/video paid. Konfirmasi halaman plan dan akun. | https://www.realitydefender.com/product/realapi ; https://docs.realitydefender.com/api-reference/endpoint/get_media_detail | P2/fallback |
| HIBP breached account | Exposure email sendiri | API email perlu subscription; k-anonymity email tergantung plan. Jangan cek massal email orang lain. | https://haveibeenpwned.com/api/v3/ | P2/tautan resmi |
| Google Web Risk | Lookup URL alternatif Safe Browsing | 100.000 `uris.search` lookup per bulan gratis menurut pricing; Cloud billing dan harga fitur update berbeda. Jangan aktifkan billing tanpa batas pemakaian. | https://cloud.google.com/web-risk/pricing | P2/alternatif |
| PhishTank | Lookup phishing yang diverifikasi komunitas | Gratis menurut FAQ, rate limit per jam; verifikasi registrasi key saat ini. | https://www.phishtank.net/faq.php ; https://www.phishtank.net/developer_info.php | P2 |
| APIVoid | URL/IP reputation, DNS, layanan pemeriksaan lain | Vendor menyatakan tidak ada free plan permanen; trial 30 hari; cek kredit. | https://www.apivoid.com/pricing/ ; https://docs.apivoid.com/ | P2/trial |
| ScamAdviser | Reputasi website/scam | Harga bergantung volume, tidak menjanjikan gratis. | https://www.scamadviser.com/scamadviser-api | P3 |
| OSV.dev | Kerentanan dependency software berdasarkan package/version | API docs menyatakan belum ada limit; query exact package/version. Tidak menentukan file APK/EXE malware. | https://google.github.io/osv.dev/api/ | P3/bonus dev |

## 2. Pemanfaatan ulang: fitur tidak sama dengan jumlah provider

- Chat/text/screenshot: Gemini (atau OCR lokal + rule engine), ekstrak URL, klasifikasi scam, tampilkan kutipan indikator. Input tidak tepercaya, tidak memberi LLM akses tool atau izin untuk menjalankan instruksi yang ada dalam konten.
- QR: OpenCV lokal, decode saja. Jika URL, reuse web pipeline. Jika QR pembayaran, tampilkan payload yang bisa dibaca dan saran verifikasi melalui aplikasi bank; jangan menyimpulkan pemilik rekening dari isi QR.
- Web: Safe Browsing + OpenTIP (opsional VT) + RDAP/DoH. Bedakan URL, domain, dan IP; reputasi IP shared-hosting bukan bukti URL jahat.
- File/APK: SHA256 lokal, file type, metadata dan permission APK dengan Androguard bila tersedia; hash lookup OpenTIP/VT/MalwareBazaar. Jangan menjalankan file di host. Dynamic analysis eksternal hanya consent dan bila terbukti akses.
- EML: Python email parser dan attachment/URL pipeline. Trust authentication-results hanya dari server penerima tepercaya. DNS tidak membuktikan SPF/DKIM/DMARC pesan lolos.
- Media: Sightengine genai/deepfake. Hasil keaslian tidak sama dengan risiko ancaman, dan bukan bukti kebenaran isi.
- Hoaks: Fact Check Tools. Tampilkan review publisher, sumber, waktu, dan kemiripan klaim. Jangan simpulkan benar karena hasil kosong.
- IP/domain: AbuseIPDB, IPinfo Lite, RDAP, DoH. Metadata kontekstual, jangan atribusikan identitas pemilik IP.
- Privacy: HIBP Pwned Passwords, browser-side hashing, opt-in. Jangan menerima password melalui log/server atau kirim ke LLM.
- Incident assistant: decision tree lokal; referensi resmi (IASC OJK, AduanNomor/CekRekening bila relevan), tidak mengotomatisasi laporan.

## 3. Arsitektur minimal

Python + Streamlit + httpx/requests + Pydantic/dataclasses + SQLite + pytest. Satu adapter per provider, interface lookup/evaluate; fixed outbound endpoints, timeout, bounded retry, respect 429 and provider quotas; no direct fetch arbitrary user URLs. Provider result schema: artifact ID/type, source, method, status, finding, strength, raw reference, retrieved_at, analyzed_at if available, coverage and limitations. Keep process status (success/no_match/error/pending/unsupported) separate from verdict.

Verdict: UNSAFE when strong relevant evidence of threat exists; SUSPICIOUS when contextual indicators warrant review; NOT_FLAGGED only when required checks completed and no relevant flag; INCONCLUSIVE when coverage or evidence insufficient. Explicitly indicate disagreement, duplicate underlying engines, freshness, partial results. No universal accuracy percentage or guarantee of safety. Separate authenticity from threat verdict.

Privacy: hash-first, separate consent for external analysis; no confidential work artifacts or real OTP/password, redact personal details before LLM, no automatic public submission. Avoid unsafe URL previews, defang indicators, bound upload size, don't serve user files, don't extract archives unbounded, don't execute file, no malware samples in repository. Store keys only server-side via environment variables, .env.example contains placeholders. Use mocked fixtures for tests, clearly labeled demo vs live.

## 4. Two-week sprint

| Date | Output |
|---|---|
| 24–25 Nov | Repo, shared evidence schema, get API keys, real benign smoke tests, privacy/terms matrix. Cut providers that cannot be activated. |
| 26–29 Nov | Main flow chat/screenshot → extracted indicators → URL/hash lookup → verdict; Streamlit UI; fixtures and error tests. |
| 30 Nov–2 Dec | QR, APK metadata, domain/IP, image AI, optional fact check. Only add provider when main flow tested. |
| 3–5 Dec | Optional remote sandbox (approved safe demo only), integrate reports, cache, coverage, incident recommendations; user feedback. |
| 6–7 Dec | Feature freeze, evaluate benchmark, README, CI, install test. |
| 8–10 Dec | Video/demo rehearsal, regression checks, submission. |

4 owners: (1) UI/workflow and case manager; (2) extraction/scam/media; (3) URL, hash and sandbox adapters; (4) evidence fusion, tests, documentation/CI. Each reviews another module and understands all code. 3 members: combine UI and evidence/integration leadership.

## 5. Day-one validation checklist

Check actual key/account eligibility, successful benign test, response schema, missing field, 401/403/429/timeout, privacy/terms, free cap, format support, paid billing, caching, asynchronous job status. For sandbox, confirm report type and supported platform; no unapproved live malware tests. Record date and outcomes. A documented capability is not an enabled account. If blocked, switch to alternative or mock demonstration clearly labeled, not fabricated live results.

## 6. Evaluation and rubric

Compare standalone provider vs integrated workflow on labeled benign, public documented scam examples, and synthetic ambiguous/error cases. Label provenance separately; test screenshot extraction, URL/QR parsing, duplicate evidence, no match, provider unavailable, contradictory evidence, unsupported type. Report false positive/negative and abstention separately; avoid treating same vendor's verdict as independent ground truth. Use EICAR only to check integration response, not malware detection performance. Make public repo reproducible without credentials via mock mode, README, requirements pinned, sample inputs, tests, GitHub Actions, real contribution history, architecture and limitations. Keep official API links and terms in docs/provider-matrix.md. Demonstrate end-to-end case with screenshot + QR + file, and case where provider fails without turning result green.
