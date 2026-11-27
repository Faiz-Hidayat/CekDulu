import { useEffect, useState } from 'react'
import type { CaseReport, Check, DemoExample, Evidence, Method, Signal, Verdict } from '../analysis/model'
import unsafeArt from '../assets/reports/unsafe.webp'
import suspiciousArt from '../assets/reports/suspicious.webp'
import notFlaggedArt from '../assets/reports/not-flagged.webp'
import inconclusiveArt from '../assets/reports/inconclusive.webp'
import unassessedArt from '../assets/reports/unassessed.webp'
import { artifactIcon, Button, DateLabel, DemoBadge, Icon, InlineNotice, StatusBadge, VerdictBadge, verdictPresentation } from '../components/ui'
import { WorkspaceHeader } from '../components/Workspace'
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

const verdictArtwork = {
  UNSAFE: unsafeArt,
  SUSPICIOUS: suspiciousArt,
  NOT_FLAGGED: notFlaggedArt,
  INCONCLUSIVE: inconclusiveArt,
  UNASSESSED: unassessedArt,
} satisfies Record<Verdict | 'UNASSESSED', string>

function EvidenceItem({ entry, check, showAttempt }: { entry: Evidence; check?: Check; showAttempt: boolean }) {
  const attempt = entry.attemptId === check?.attemptId ? 'current' : 'previous'
  return (
    <article className="evidence-item motion-in" id={`evidence-${entry.id}`}>
      {showAttempt && (
        <span className="attempt-tag" data-attempt={attempt}>
          {attempt === 'current' ? 'Percobaan terbaru' : 'Percobaan sebelumnya'}
        </span>
      )}
      <p className="evidence-finding"><strong>{entry.finding}</strong></p>
      <dl className="evidence-meta">
        {check && <div><dt>Sumber</dt><dd>{check.source} · {methodLabels[check.method]}</dd></div>}
        <div><dt>Sinyal</dt><dd>{signalLabels[entry.signal]}</dd></div>
        <div><dt>Waktu diambil</dt><dd><DateLabel value={entry.retrievedAt} /></dd></div>
        {entry.analyzedAt && <div><dt>Waktu sumber</dt><dd><DateLabel value={entry.analyzedAt} /></dd></div>}
        {entry.rawResult && <div><dt>Hasil sumber</dt><dd>{entry.rawResult}</dd></div>}
        {entry.limitations.length > 0 && <div><dt>Batasan</dt><dd>{entry.limitations.join(' ')}</dd></div>}
      </dl>
    </article>
  )
}

function EvidencePanel({ report }: { report: CaseReport }) {
  const checksById = new Map(report.checks.map((check) => [check.id, check]))
  const checksWithPreviousEvidence = new Set<string>()
  for (const { checkId, attemptId } of report.evidence) {
    const currentAttemptId = checksById.get(checkId)?.attemptId
    if (currentAttemptId !== undefined && attemptId !== currentAttemptId) {
      checksWithPreviousEvidence.add(checkId)
    }
  }

  return (
    <details className="panel evidence-panel motion-in">
      <summary>
        <span className="evidence-summary-icon"><Icon name="checkList" /></span>
        <span className="evidence-summary-label">Lihat bukti</span>
        <span className="evidence-count">{report.evidence.length} catatan</span>
        <Icon name="chevron" />
      </summary>
      <div className="evidence-groups">
        {report.artifacts.map((artifact) => {
          const checkIds = new Set(report.checks.filter(({ artifactId }) => artifactId === artifact.id).map(({ id }) => id))
          const evidence = report.evidence.filter(({ checkId }) => checkIds.has(checkId)).sort((a, b) => a.retrievedAt.localeCompare(b.retrievedAt))
          return (
            <section className="evidence-group" key={artifact.id}>
              <div className="section-heading"><h3><Icon name={artifactIcon[artifact.kind]} size={18} />{artifact.label}</h3>{artifact.verdict && <VerdictBadge verdict={artifact.verdict} />}</div>
              {artifact.sha256 && <p className="small"><strong>SHA-256</strong> <code>{artifact.sha256}</code></p>}
              {evidence.length === 0 ? <p className="small muted">Belum ada bukti untuk bahan ini.</p> : (
                <div className="evidence-items">
                  {evidence.map((entry) => (
                    <EvidenceItem
                      key={entry.id}
                      entry={entry}
                      check={checksById.get(entry.checkId)}
                      showAttempt={checksWithPreviousEvidence.has(entry.checkId)}
                    />
                  ))}
                </div>
              )}
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
  const artworkState = report.verdict ?? 'UNASSESSED'
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
      <WorkspaceHeader
        stage="result"
        title="Hasil pemeriksaan"
        description={example.preview ? `Pratinjau P1 · ${example.title}` : example.title}
        meta={<><DateLabel value={report.createdAt} variant="chip" /><DemoBadge /></>}
      />

      <div className="workspace-grid report-grid">
        <div className="workspace-stack">
          <section className="panel result-panel motion-in" aria-labelledby="verdict-heading">
            <div className={`verdict-band tone-${visual.tone}`}>
              <div className="verdict-content">
                <span className="verdict-icon motion-in"><Icon name={visual.icon} size={28} /></span>
                <h2 id="verdict-heading" className="motion-in">{visual.label}</h2>
                <StatusBadge status={report.status} />
              </div>
              <img className="verdict-art motion-in" data-verdict={artworkState} src={verdictArtwork[artworkState]} alt="" decoding="async" />
            </div>
            <div className="result-copy">
              {report.actions.length > 0 && (
                <>
                  <h3 className="motion-in">Yang bisa Anda lakukan</h3>
                  <ul className="result-actions">
                    {report.actions.map(({ text }) => <li className="motion-in" key={text}><Icon name="arrow" size={18} /><span>{text}</span></li>)}
                  </ul>
                </>
              )}
              {report.summary && <p className="result-reason motion-in">{report.summary}</p>}
            </div>
          </section>

          {authenticity.length > 0 && (
            <section className="panel screen-panel authenticity-panel motion-in" aria-labelledby="auth-heading">
              <h2 id="auth-heading">Keaslian media</h2>
              {authenticity.map((artifact) => artifact.authenticity && (
                <p className="authenticity-assessment" key={artifact.id}><Icon name="image" />{authenticityLabels[artifact.authenticity.assessment]}</p>
              ))}
            </section>
          )}
        </div>

        <section className="panel screen-panel coverage-panel motion-in" aria-labelledby="coverage-heading">
          <h2 id="coverage-heading">Cakupan pemeriksaan</h2>
          <CheckList report={report} />
          {retryable.length > 0 && (
            <div className="retry-line" aria-live="polite">
              <Button styleKind="secondary" icon="retry" disabled={retryWaiting} onClick={onRetry}>Ulangi cek yang gagal</Button>
              {retryWaiting && <span className="small muted">Tunggu jeda kuota simulasi.</span>}
            </div>
          )}
        </section>

        <section className="panel screen-panel workspace-wide motion-in" aria-labelledby="result-artifacts">
          <h2 id="result-artifacts">Bahan yang diperiksa</h2>
          <ArtifactList artifacts={report.artifacts} />
        </section>
      </div>
      <EvidencePanel report={report} />

      {error && <InlineNotice danger>{error}</InlineNotice>}
      <div className="workspace-actions motion-in">
        <div className="action-row report-actions">
          <Button icon="plus" styleKind="secondary" onClick={onAdd} disabled={!addExample}>Tambah bahan</Button>
          <Button suffix="arrow" onClick={onNew}>Cek baru</Button>
        </div>
        {!addExample && <p className="small muted action-note">Bahan tambahan tersedia pada contoh tangkapan layar lowongan.</p>}
      </div>
    </>
  )
}
