import type { Action, Artifact, CheckPlan, ConsentScope, DemoExample, DemoInput } from '../analysis/model'
import type { CheckOutcome, EvidenceSeed, Fixture, FixtureOutcome } from './fixture-types'

const localSource = 'Analisis lokal (simulasi)'
const linkIndex = 'Indeks Tautan Fiktif (simulasi)'
const hashCatalog = 'Katalog Hash Fiktif (simulasi)'
const hashArchive = 'Arsip Hash Fiktif (simulasi)'

const idsFor = (fixtureId: string) => (name: string) => `${fixtureId}-${name}`
const paste = (value: string): DemoInput => ({ kind: 'text', value })

function demoFile(name: string, mime: string, size: number, digest: string) {
  return { kind: 'file' as const, name, mime, size, digest, publicPath: `/contoh/${name}` }
}

function example(id: string, title: string, specialist: DemoExample['specialist'], input: DemoInput, detail: string): DemoExample {
  return { id, title, specialist, input, detail: `DEMO/SIMULASI · ${detail}` }
}

function artifact(
  id: string, kind: Artifact['kind'], label: string, displayValue: string,
  details: Partial<Pick<Artifact, 'parentId' | 'extractionStatus' | 'sha256' | 'authenticity'>> = {},
): Artifact {
  return { id, kind, label, displayValue, extractionStatus: 'not_needed', ...details }
}

function localCheck(id: string, item: Artifact, label: string, method: CheckPlan['method'], required = true): CheckPlan {
  return { id, artifactId: item.id, label, method, required, source: localSource }
}

function lookup(id: string, item: Artifact, label: string, recipient: string, required = true): CheckPlan {
  const external: ConsentScope = {
    data: `${item.kind === 'hash' ? 'SHA-256' : 'URL'} ${item.displayValue}`,
    recipient,
    purpose: 'Mencocokkan bahan dengan catatan reputasi simulasi.',
    visibility: 'Hasil hanya tampil dalam laporan demo di perangkat ini.',
  }
  return { id, artifactId: item.id, label, method: 'lookup', source: recipient, required, external }
}

function evidence(
  id: string, signal: EvidenceSeed['signal'], finding: string,
  limitation = 'Bukti berasal dari data simulasi.', rawResult?: string,
): EvidenceSeed {
  const seed = { id, signal, finding, limitations: [limitation] }
  return rawResult === undefined ? seed : { ...seed, rawResult }
}

const covered = (...seeds: EvidenceSeed[]): CheckOutcome => ({
  status: 'completed', coverage: 'covered', evidence: seeds,
})

function noData(id: string): CheckOutcome & { evidence: [EvidenceSeed] } {
  const reason = 'Sumber tidak memiliki catatan.'
  return { status: 'completed', coverage: 'no_data', reason, evidence: [evidence(id, 'unknown', reason)] }
}

const timeout: CheckOutcome = {
  status: 'failed', coverage: 'unavailable', reason: 'Penyedia tidak merespons.', retryable: true,
}

const action = (text: string, ...seeds: EvidenceSeed[]): Action => ({
  text, evidenceIds: seeds.map(seed => seed.id),
})

function result(
  status: FixtureOutcome['status'], verdict: FixtureOutcome['verdict'], summary: string,
  checks: FixtureOutcome['checks'], nextAction: Action, artifactVerdicts?: FixtureOutcome['artifactVerdicts'],
): FixtureOutcome {
  const outcome = { status, verdict, summary, checks, actions: [nextAction] }
  return artifactVerdicts ? { ...outcome, artifactVerdicts } : outcome
}

function benignUrl(): Fixture {
  const id = 'benign_url'
  const key = idsFor(id)
  const input = paste('https://kampus.example/pengumuman')
  const url = artifact(key('url'), 'url', 'Tautan yang ditempel', 'kampus[.]example/pengumuman')
  const format = localCheck(key('check-format'), url, 'Cek format tautan', 'static')
  const domain = localCheck(key('check-domain'), url, 'Identifikasi domain lokal', 'static', false)
  const reputation = lookup(key('check-reputation'), url, 'Cek reputasi tautan', linkIndex)
  const formatResult = evidence(key('evidence-format'), 'no_flag', 'Struktur URL HTTPS valid.',
    'Cek format hanya mencakup susunan URL.')
  const domainResult = evidence(key('evidence-domain'), 'unknown', 'Domain input adalah kampus[.]example.')
  const reputationResult = evidence(key('evidence-reputation'), 'no_flag',
    'Indeks simulasi mencakup URL pengumuman ini tanpa penanda berbahaya.',
    'Cakupan terbatas pada URL dan satu sumber simulasi.')
  const localChecks = { [format.id]: covered(formatResult), [domain.id]: covered(domainResult) }

  return {
    example: example(id, 'Tautan pengumuman kampus', 'url', input, 'URL kampus fiktif dengan catatan reputasi demo.'),
    artifacts: [url],
    checks: [format, domain, reputation],
    full: result('completed', 'NOT_FLAGGED', 'Cek format dan reputasi simulasi selesai tanpa indikasi.',
      { ...localChecks, [reputation.id]: covered(reputationResult) },
      action('Cocokkan alamat dengan kanal resmi kampus sebelum memasukkan data pribadi.', reputationResult),
      { [url.id]: 'NOT_FLAGGED' }),
    localOnly: result('partial', 'INCONCLUSIVE', 'Format tautan valid. Reputasi tautan belum diperiksa.',
      localChecks, action('Cocokkan alamat melalui kanal resmi kampus.', formatResult), { [url.id]: 'INCONCLUSIVE' }),
  }
}

function scamScreenshot(): Fixture {
  const id = 'scam_screenshot'
  const key = idsFor(id)
  const input = demoFile('lowongan-demo.png', 'image/png', 22_726,
    '15c855df99ddd473b41c9777022c7b8a03be09ba45d5de0eec0c2a0659b0c999')
  const exampleText = 'Untuk lanjut seleksi,\ntransfer deposit Rp175.000.\nInfo seleksi: lowongan[.]example'
  const screenshot = artifact(key('screenshot'), 'screenshot', 'Tangkapan layar lowongan', input.name)
  const message = artifact(key('message'), 'message', 'Teks hasil OCR', exampleText,
    { parentId: screenshot.id, extractionStatus: 'needs_confirmation' })
  const url = artifact(key('url'), 'url', 'Tautan yang ditemukan', 'lowongan[.]example',
    { parentId: screenshot.id, extractionStatus: 'needs_confirmation' })
  const extraction = localCheck(key('check-ocr'), screenshot, 'Baca teks tangkapan layar', 'extraction')
  const context = localCheck(key('check-context'), message, 'Tinjau konteks pesan', 'context')
  const reputation = lookup(key('check-reputation'), url, 'Cek reputasi tautan', linkIndex)
  const deposit = evidence(key('evidence-deposit'), 'warning',
    'Pesan meminta “transfer deposit Rp175.000” untuk melanjutkan seleksi.',
    'Penilaian konteks hanya mencakup teks yang dikonfirmasi.', exampleText)
  const localChecks = {
    [extraction.id]: covered(evidence(key('evidence-ocr'), 'unknown', 'Teks lowongan telah dikonfirmasi.')),
    [context.id]: covered(deposit),
  }
  const verdicts = {
    [screenshot.id]: 'SUSPICIOUS', [message.id]: 'SUSPICIOUS', [url.id]: 'INCONCLUSIVE',
  } satisfies FixtureOutcome['artifactVerdicts']
  const nextAction = action('Tunda transfer dan verifikasi lowongan lewat kontak resmi yang Anda cari sendiri.', deposit)

  return {
    example: example(id, 'Tangkapan layar lowongan', 'message', input, 'Lowongan fiktif dengan permintaan deposit.'),
    artifacts: [screenshot, message, url],
    checks: [extraction, context, reputation],
    confirmation: {
      label: 'Konfirmasi teks',
      initialText: exampleText.replace('deposit', 'deposlt'),
      exampleText,
    },
    full: result('completed', 'SUSPICIOUS', 'Pesan meminta deposit untuk melanjutkan seleksi. Sumber reputasi tidak memiliki catatan tautan.',
      { ...localChecks, [reputation.id]: noData(key('evidence-no-record')) }, nextAction, verdicts),
    localOnly: result('partial', 'SUSPICIOUS', 'Pesan meminta deposit untuk melanjutkan seleksi. Reputasi tautan belum diperiksa.',
      localChecks, nextAction, verdicts),
  }
}

function scamMessage(): Fixture {
  const id = 'scam_message'
  const key = idsFor(id)
  const text = 'Panitia Kelas Purnama Demo meminta deposit Rp63.000 untuk mengunci kursi. Transfer malam ini agar pendaftaran diproses.'
  const message = artifact(key('message'), 'message', 'Pesan yang ditempel', text)
  const context = localCheck(key('check-context'), message, 'Tinjau konteks pesan', 'context')
  const warning = evidence(key('evidence-deposit'), 'warning',
    'Pesan meminta deposit Rp63.000 dan mendesak penerima untuk transfer malam ini.',
    'Penilaian mencakup konteks pesan sintetis.', text)

  return {
    example: example(id, 'Pesan deposit kelas', 'message', paste(text), 'Pesan fiktif yang mendesak penerima untuk transfer.'),
    artifacts: [message],
    checks: [context],
    full: result('completed', 'SUSPICIOUS', 'Permintaan deposit dan tenggat transfer muncul dalam pesan.',
      { [context.id]: covered(warning) }, action('Tunda transfer dan konfirmasi biaya melalui kanal resmi panitia.', warning),
      { [message.id]: 'SUSPICIOUS' }),
  }
}

function qrPhishing(): Fixture {
  const id = 'qr_phishing'
  const key = idsFor(id)
  const input = demoFile('qr-demo.png', 'image/png', 7_082,
    '460c8a4fac7c85c7130f156bd48d7801e1469421c6405c888399179522099aca')
  const qr = artifact(key('qr'), 'qr', 'Kode QR demo', input.name)
  const url = artifact(key('url'), 'url', 'Tautan dari QR', 'verifikasi[.]example',
    { parentId: qr.id, extractionStatus: 'needs_confirmation' })
  const extraction = localCheck(key('check-qr'), qr, 'Baca isi QR', 'extraction')
  const reputation = lookup(key('check-reputation'), url, 'Cek reputasi tautan', linkIndex)
  const payload = evidence(key('evidence-payload'), 'unknown', 'Isi QR yang dikonfirmasi adalah verifikasi[.]example.')
  const flag = evidence(key('evidence-phishing'), 'strong_flag', 'URL persis dari QR cocok dengan entri phishing simulasi.',
    'Kecocokan hanya mencakup URL yang tersimpan pada QR ini.', 'URL cocok: verifikasi[.]example')
  const localChecks = { [extraction.id]: covered(payload) }

  return {
    example: example(id, 'QR verifikasi akun', 'url', input, 'QR sintetis dengan kecocokan phishing simulasi.'),
    artifacts: [qr, url],
    checks: [extraction, reputation],
    confirmation: { label: 'Konfirmasi tautan dari QR' },
    full: result('completed', 'UNSAFE', 'Tautan dari QR cocok persis dengan entri phishing simulasi.',
      { ...localChecks, [reputation.id]: covered(flag) },
      action('Tutup pemindai QR dan buka layanan dari kanal resminya.', flag), { [qr.id]: 'UNSAFE', [url.id]: 'UNSAFE' }),
    localOnly: result('partial', 'INCONCLUSIVE', 'Isi QR sudah dikonfirmasi. Reputasi tautan belum diperiksa.',
      localChecks, action('Verifikasi tujuan QR melalui kanal resmi sebelum membukanya.', payload),
      { [qr.id]: 'INCONCLUSIVE', [url.id]: 'INCONCLUSIVE' }),
  }
}

function fileDetectedPartial(): Fixture {
  const id = 'file_detected_partial'
  const key = idsFor(id)
  const input = demoFile('lampiran-demo.txt', 'text/plain', 70,
    'cd86e4ee52f1bb885b528339b53f1f1699d172704fce1ab2ff0225b337101011')
  const file = artifact(key('file'), 'file', 'Berkas lampiran', input.name, { sha256: input.digest })
  const hash = artifact(key('hash'), 'hash', 'SHA-256 lampiran', input.digest, { parentId: file.id, sha256: input.digest })
  const digest = localCheck(key('check-hash'), file, 'Hitung SHA-256 lokal', 'static')
  const reputation = lookup(key('check-reputation'), hash, 'Cek reputasi SHA-256', hashCatalog)
  const crossCheck = lookup(key('check-crosscheck'), hash, 'Cek silang SHA-256', hashArchive)
  const computed = evidence(key('evidence-hash'), 'unknown', 'SHA-256 dihitung dari isi berkas contoh.',
    'SHA-256 mengidentifikasi isi berkas secara persis.', input.digest)
  const flag = evidence(key('evidence-exact-match'), 'strong_flag',
    'SHA-256 lampiran cocok persis dengan entri berlabel berbahaya di katalog simulasi.',
    'Deteksi berasal dari entri simulasi yang dibuat untuk berkas teks contoh ini.', input.digest)
  const localChecks = { [digest.id]: covered(computed) }
  const coreChecks = { ...localChecks, [reputation.id]: covered(flag) }
  const verdicts = { [file.id]: 'UNSAFE', [hash.id]: 'UNSAFE' } satisfies FixtureOutcome['artifactVerdicts']
  const nextAction = action('Tahan lampiran dan verifikasi pengirim lewat kanal tepercaya.', flag)

  return {
    example: example(id, 'Lampiran dengan deteksi parsial', 'file', input, 'Berkas teks dengan kecocokan hash simulasi dan cek silang opsional.'),
    artifacts: [file, hash],
    checks: [digest, reputation, crossCheck],
    full: result('partial', 'UNSAFE', 'SHA-256 cocok dengan entri berbahaya pada katalog simulasi. Cek silang kehabisan waktu.',
      { ...coreChecks, [crossCheck.id]: timeout }, nextAction, verdicts),
    localOnly: result('partial', 'INCONCLUSIVE', 'SHA-256 sudah dihitung. Reputasi lampiran belum diperiksa.',
      localChecks, action('Verifikasi pengirim sebelum membuka lampiran yang belum dikenal.', computed),
      { [file.id]: 'INCONCLUSIVE', [hash.id]: 'INCONCLUSIVE' }),
    retry: result('completed', 'UNSAFE', 'Cek silang selesai tanpa catatan tambahan. Kecocokan hash dari katalog simulasi tetap berlaku.',
      { ...coreChecks, [crossCheck.id]: noData(key('evidence-crosscheck-no-record')) }, nextAction, verdicts),
  }
}

function unknownTimeout(): Fixture {
  const id = 'unknown_timeout'
  const key = idsFor(id)
  const value = 'a95789406de03a3585dc75d26550e8275314a304c5b058334919d8a32466a0ca'
  const hash = artifact(key('hash'), 'hash', 'SHA-256 yang ditempel', value, { sha256: value })
  const format = localCheck(key('check-format'), hash, 'Cek format SHA-256', 'static')
  const reputation = lookup(key('check-reputation'), hash, 'Cek reputasi SHA-256', hashCatalog)
  const crossCheck = lookup(key('check-crosscheck'), hash, 'Cek silang SHA-256', hashArchive)
  const formatResult = evidence(key('evidence-format'), 'unknown', 'Input terdiri dari 64 karakter heksadesimal.',
    'Pemeriksaan lokal hanya mencakup format SHA-256.')
  const localChecks = { [format.id]: covered(formatResult) }
  const catalogResult = noData(key('evidence-catalog-no-record'))
  const archiveResult = noData(key('evidence-archive-no-record'))
  const coreChecks = { ...localChecks, [reputation.id]: catalogResult }
  const verdicts = { [hash.id]: 'INCONCLUSIVE' } satisfies FixtureOutcome['artifactVerdicts']

  return {
    example: example(id, 'Hash tanpa catatan', 'file', paste(value), 'Hash sintetis tanpa catatan dengan satu sumber yang kehabisan waktu.'),
    artifacts: [hash],
    checks: [format, reputation, crossCheck],
    full: result('partial', 'INCONCLUSIVE', 'Katalog tidak memiliki catatan untuk hash ini. Sumber pembanding kehabisan waktu.',
      { ...coreChecks, [crossCheck.id]: timeout },
      action('Ulangi cek yang gagal untuk memeriksa sumber pembanding.', ...catalogResult.evidence), verdicts),
    localOnly: result('partial', 'INCONCLUSIVE', 'Format SHA-256 valid. Sumber reputasi belum diperiksa.',
      localChecks, action('Verifikasi asal bahan melalui kanal tepercaya.', formatResult), verdicts),
    retry: result('completed', 'INCONCLUSIVE', 'Kedua sumber selesai memeriksa. Tidak ada catatan untuk SHA-256 ini.',
      { ...coreChecks, [crossCheck.id]: archiveResult },
      action('Verifikasi asal bahan melalui kanal tepercaya.', ...catalogResult.evidence, ...archiveResult.evidence),
      verdicts),
  }
}

function loadingAndErrors(): Fixture {
  const id = 'loading_and_errors'
  const key = idsFor(id)
  const input = paste('https://antrian.example/status')
  const url = artifact(key('url'), 'url', 'Tautan yang ditempel', 'antrian[.]example/status')
  const format = localCheck(key('check-format'), url, 'Cek format tautan', 'static')
  const reputation = lookup(key('check-reputation'), url, 'Cek reputasi tautan', linkIndex)
  const formatResult = evidence(key('evidence-format'), 'no_flag', 'Struktur URL HTTPS valid.',
    'Cek format hanya mencakup susunan URL.')
  const quota = evidence(key('evidence-quota'), 'unknown', 'Kuota pemeriksaan simulasi tercapai.')
  const retryResult = evidence(key('evidence-reputation'), 'no_flag', 'Indeks simulasi mencakup URL ini tanpa penanda berbahaya.',
    'Cakupan terbatas pada URL dan satu sumber simulasi.')
  const localChecks = { [format.id]: covered(formatResult) }
  const rateLimited: CheckOutcome = {
    status: 'rate_limited', coverage: 'unavailable', reason: quota.finding,
    retryable: true, retryDelayMs: 2_000, evidence: [quota],
  }

  return {
    example: example(id, 'Antrean dan batas pemeriksaan', 'url', input, 'Tautan fiktif untuk latihan batal dan ulangi cek.'),
    artifacts: [url],
    checks: [format, reputation],
    timingMs: 2_700,
    full: result('rate_limited', 'INCONCLUSIVE', 'Batas pemeriksaan reputasi simulasi tercapai.',
      { ...localChecks, [reputation.id]: rateLimited }, action('Ulangi cek yang gagal setelah jeda berakhir.', quota), { [url.id]: 'INCONCLUSIVE' }),
    localOnly: result('partial', 'INCONCLUSIVE', 'Format tautan valid. Reputasi tautan belum diperiksa.',
      localChecks, action('Cocokkan alamat melalui kanal resmi.', formatResult), { [url.id]: 'INCONCLUSIVE' }),
    retry: result('completed', 'NOT_FLAGGED', 'Cek ulang reputasi simulasi selesai tanpa indikasi.',
      { ...localChecks, [reputation.id]: covered(retryResult) },
      action('Cocokkan alamat dengan kanal resmi sebelum memasukkan data pribadi.', retryResult), { [url.id]: 'NOT_FLAGGED' }),
  }
}

function apkIndicators(): Fixture {
  const id = 'apk_indicators'
  const key = idsFor(id)
  const input = { kind: 'file' as const, name: 'indikator-demo.apk', mime: 'application/vnd.android.package-archive', size: 42_000 }
  const apk = artifact(key('file'), 'file', 'APK fiktif', input.name)
  const permissions = localCheck(key('check-permissions'), apk, 'Tinjau indikator izin APK', 'static')
  const warning = evidence(key('evidence-sms-permission'), 'warning', 'Metadata APK fiktif mencantumkan izin membaca SMS.',
    'Pratinjau P1 memakai metadata izin sintetis.', 'android.permission.READ_SMS')

  return {
    example: { ...example(id, 'Indikator izin APK', 'file', input, 'Pratinjau hasil pemeriksaan izin dari metadata sintetis.'), preview: 'P1' },
    artifacts: [apk],
    checks: [permissions],
    full: result('completed', 'SUSPICIOUS', 'Izin membaca SMS tercantum pada metadata APK fiktif.',
      { [permissions.id]: covered(warning) }, action('Verifikasi sumber aplikasi sebelum memasangnya.', warning),
      { [apk.id]: 'SUSPICIOUS' }),
  }
}

function syntheticImage(): Fixture {
  const id = 'synthetic_image'
  const key = idsFor(id)
  const input = { kind: 'file' as const, name: 'gambar-sintetis-demo.png', mime: 'image/png', size: 24_000 }
  const finding = evidence(key('evidence-authenticity'), 'unknown', 'Skenario simulasi menunjukkan indikasi gambar dibuat dengan AI.',
    'Pratinjau P1 memakai penilaian keaslian yang sudah disiapkan.')
  const image = artifact(key('image'), 'screenshot', 'Gambar sintetis', input.name,
    { authenticity: { assessment: 'possible_ai_generated', evidenceIds: [finding.id] } })
  const authenticity = localCheck(key('check-authenticity'), image, 'Tinjau keaslian gambar', 'authenticity')

  return {
    example: { ...example(id, 'Keaslian gambar sintetis', 'message', input, 'Pratinjau penilaian keaslian gambar.'), preview: 'P1' },
    artifacts: [image],
    checks: [authenticity],
    full: result('completed', null, 'Kemungkinan dibuat AI berdasarkan penilaian keaslian simulasi.',
      { [authenticity.id]: covered(finding) }, action('Periksa sumber gambar sebelum membagikannya.', finding)),
  }
}

export const fixtures: readonly Fixture[] = [
  benignUrl(),
  scamScreenshot(),
  scamMessage(),
  qrPhishing(),
  fileDetectedPartial(),
  unknownTimeout(),
  loadingAndErrors(),
  apkIndicators(),
  syntheticImage(),
]
