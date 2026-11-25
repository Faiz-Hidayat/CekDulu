import { useEffect, useState } from 'react'
import type { CaseReport, DemoExample, Evidence, Method, Signal } from '../analysis/model'
import { artifactIcon, Button, DateLabel, DemoBadge, Icon, InlineNotice, StatusBadge, VerdictBadge, verdictPresentation } from '../components/ui'
import { ArtifactList, CheckList } from './Analyze'

export interface SavedCase {
  example: DemoExample
  report: CaseReport
}

const methodLabels: Record<Method, string> = {
  context: 'Konteks pesan', extraction: 'Ekstraksi', lookup: 'Pencarian reputasi', static: 'Analisis statis', dynamic: 'Analisis dinamis', authenticity: 'Keaslian media',
}
const signalLabels: Record<Signal, string> = {
  strong_flag: 'Deteksi kuat', warning: 'Indikator mencurigakan', no_flag: 'Tanpa temuan relevan', unknown: 'Belum diketahui',
}
const authenticityLabels = {
  possible_ai_generated: 'Kemungkinan dibuat AI', possible_manipulated: 'Kemungkinan dimanipulasi',
  no_indication: 'Tidak ada indikasi', inconclusive: 'Belum dapat disimpulkan', not_checked: 'Belum diperiksa',
}

function EvidenceItem({ entry, report }: { entry: Evidence; report: CaseReport }) {
  const check = report.checks.find(({ id }) => id === entry.checkId)
  return (
    <article className="evidence-item" id={`evidence-${entry.id}`}>
      <p className="evidence-finding"><strong>{entry.finding}</strong></p>
      <dl className="evidence-meta">
        {check && <div><dt>Sumber</dt><dd>{check.source} · {methodLabels[check.method]}</dd></div>}
        <div><dt>Sinyal</dt><dd>{signalLabels[entry.signal]}</dd></div>
        <div><dt>Waktu</dt><dd><DateLabel value={entry.retrievedAt} /></dd></div>
        {entry.analyzedAt && <div><dt>Waktu sumber</dt><dd><DateLabel value={entry.analyzedAt} /></dd></div>}
        {entry.rawResult && <div><dt>Hasil sumber</dt><dd>{entry.rawResult}</dd></div>}
        {entry.limitations.length > 0 && <div><dt>Batasan</dt><dd>{entry.limitations.join(' ')}</dd></div>}
      </dl>
    </article>
  )
}

function EvidencePanel({ report }: { report: CaseReport }) {
  return (
    <details className="panel evidence-panel">
      <summary><Icon name="checkList" /><span>Lihat bukti</span><Icon name="chevron" /></summary>
      <div className="evidence-groups">
        {report.artifacts.map((artifact) => {
          const checkIds = new Set(report.checks.filter(({ artifactId }) => artifactId === artifact.id).map(({ id }) => id))
          const evidence = report.evidence.filter(({ checkId }) => checkIds.has(checkId)).sort((a, b) => a.retrievedAt.localeCompare(b.retrievedAt))
          return (
            <section className="evidence-group" key={artifact.id}>
              <div className="section-heading"><h3><Icon name={artifactIcon[artifact.kind]} size={18} />{artifact.label}</h3>{artifact.verdict && <VerdictBadge verdict={artifact.verdict} />}</div>
              {artifact.sha256 && <p className="small"><strong>SHA-256</strong> <code>{artifact.sha256}</code></p>}
              {evidence.length === 0 ? <p className="small muted">Belum ada bukti untuk bahan ini.</p> : evidence.map((entry) => <EvidenceItem entry={entry} report={report} key={entry.id} />)}
            </section>
          )
        })}
      </div>
    </details>
  )
}

export function Result({ record, addExample, onAdd, onRetry, onNew, error }:
  { record: SavedCase; addExample?: DemoExample; onAdd: () => void; onRetry: () => void; onNew: () => void; error?: string }) {
  const { report, example } = record
  const visual = report.verdict ? verdictPresentation[report.verdict] : { label: 'Keamanan belum dinilai', icon: 'unknown' as const, tone: 'process' }
  const retryable = report.checks.filter(({ retryable }) => retryable)
  const nextRetry = Math.min(...retryable.map(({ retryAt }) => retryAt ? Date.parse(retryAt) : 0))
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (retryable.length === 0 || nextRetry === 0) return
    const timer = window.setTimeout(() => setNow(Date.now()), Math.max(0, nextRetry - Date.now()) + 30)
    return () => window.clearTimeout(timer)
  }, [nextRetry, retryable.length])

  const retryWaiting = retryable.length > 0 && nextRetry > now
  const authenticity = report.artifacts.filter(({ authenticity }) => authenticity)

  return (
    <>
      <header className="page-intro result-intro">
        <div><h1>Hasil pemeriksaan</h1><p>{example.preview && 'Pratinjau P1 · '}{example.title} · <DateLabel value={report.createdAt} /></p></div>
        <DemoBadge />
      </header>

      <section className="panel result-panel" aria-labelledby="verdict-heading">
        <div className={`verdict-band tone-${visual.tone}`}>
          <span className="verdict-icon"><Icon name={visual.icon} size={26} /></span>
          <h2 id="verdict-heading">{visual.label}</h2>
          <StatusBadge status={report.status} />
        </div>
        <div className="result-copy">
          {report.actions.length > 0 && (
            <>
              <h3>Yang bisa Anda lakukan</h3>
              <ul className="result-actions">
                {report.actions.map(({ text }) => <li key={text}><Icon name="arrow" size={18} /><span>{text}</span></li>)}
              </ul>
            </>
          )}
          {report.summary && <p className="result-reason">{report.summary}</p>}
        </div>
      </section>

      {authenticity.length > 0 && (
        <section className="panel screen-panel" aria-labelledby="auth-heading">
          <h2 id="auth-heading">Keaslian media</h2>
          {authenticity.map((artifact) => artifact.authenticity && <p className="confirmed" key={artifact.id}><Icon name="image" />{authenticityLabels[artifact.authenticity.assessment]}</p>)}
        </section>
      )}

      <section className="panel screen-panel" aria-labelledby="coverage-heading">
        <h2 id="coverage-heading">Cakupan pemeriksaan</h2>
        <CheckList report={report} />
        {retryable.length > 0 && <div className="retry-line" aria-live="polite"><Button styleKind="secondary" icon="retry" disabled={retryWaiting} onClick={onRetry}>Ulangi cek yang gagal</Button>{retryWaiting && <span className="small muted">Tunggu jeda kuota simulasi.</span>}</div>}
      </section>

      <section className="panel screen-panel" aria-labelledby="result-artifacts">
        <h2 id="result-artifacts">Bahan yang diperiksa</h2>
        <ArtifactList artifacts={report.artifacts} />
      </section>
      <EvidencePanel report={report} />

      {error && <InlineNotice danger>{error}</InlineNotice>}
      <div className="action-row report-actions">
        <Button icon="plus" styleKind="secondary" onClick={onAdd} disabled={!addExample}>Tambah bahan</Button>
        <Button suffix="arrow" onClick={onNew}>Cek baru</Button>
      </div>
      {!addExample && <p className="small muted action-note">Bahan tambahan tersedia pada contoh tangkapan layar lowongan.</p>}
    </>
  )
}

export function History({ cases, onOpen, onDelete, onNew }:
  { cases: SavedCase[]; onOpen: (record: SavedCase) => void; onDelete: (record: SavedCase) => void; onNew: () => void }) {
  return (
    <>
      <header className="page-intro"><h1>Riwayat pemeriksaan</h1><p>Hasil simulasi pada sesi ini. Riwayat kosong saat halaman dimuat ulang.</p></header>
      {cases.length === 0 ? (
        <section className="panel empty-state"><span className="tile-icon"><Icon name="clock" size={24} /></span><h2>Belum ada pemeriksaan di sesi ini.</h2><Button suffix="arrow" onClick={onNew}>Cek baru</Button></section>
      ) : (
        <ul className="panel history-list">
          {cases.map((record) => (
            <li className="history-row" key={record.report.id}>
              <div className="section-heading"><h2>{record.example.title}</h2><DemoBadge /></div>
              {record.example.preview && <span className="small muted">Pratinjau P1</span>}
              <p className="small muted"><DateLabel value={record.report.createdAt} /> · {Array.from(new Set(record.report.artifacts.map(({ label }) => label))).join(', ')}</p>
              <div className="history-badges"><VerdictBadge verdict={record.report.verdict} /><StatusBadge status={record.report.status} /></div>
              <div className="action-row"><Button styleKind="secondary" suffix="arrow" onClick={() => onOpen(record)}>Buka hasil</Button><Button styleKind="quiet" icon="trash" onClick={() => onDelete(record)}>Hapus entri</Button></div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
