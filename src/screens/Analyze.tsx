import type { AnalysisPlan, Artifact, CaseReport } from '../analysis/model'
import { artifactIcon, Button, Icon, InlineNotice, StatusBadge } from '../components/ui'

export interface ReviewState {
  plan: AnalysisPlan
  confirmed: boolean
  text: string
  optional: string[]
  consent: boolean
}

export function defaultReview(plan: AnalysisPlan): ReviewState {
  return { plan, confirmed: !plan.confirmation, text: plan.confirmation?.initialText ?? '', optional: [], consent: false }
}

export function ArtifactList({ artifacts, confirmed = true }: { artifacts: Artifact[]; confirmed?: boolean }) {
  return (
    <ul className="rows artifact-list">
      {artifacts.map((artifact) => {
        const parent = artifacts.find(({ id }) => id === artifact.parentId)
        return (
          <li className="detail-row" key={artifact.id}>
            <span className="tile-icon"><Icon name={artifactIcon[artifact.kind]} /></span>
            <div className="row-content">
              <strong>{artifact.label}</strong>
              {parent && <span className="small muted">Dari {parent.label.toLowerCase()}</span>}
              {artifact.kind === 'hash' ? <code>{artifact.displayValue}</code> :
                <span className="muted">{artifact.extractionStatus === 'needs_confirmation' && !confirmed ? 'Menunggu konfirmasi' : artifact.displayValue}</span>}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

interface AnalyzerProps {
  review: ReviewState
  adding: boolean
  onUpdate: (review: ReviewState) => void
  onBack: () => void
  onRun: (allowExternal: boolean) => void
  error?: string
}

export function Analyzer({ review, adding, onUpdate, onBack, onRun, error }: AnalyzerProps) {
  const { plan, confirmed, text, optional, consent } = review
  const selected = plan.checks.filter((check) => check.required || optional.includes(check.id))
  const externalChecks = selected.filter((check) => check.external)
  const expected = plan.confirmation?.exampleText
  const textMatches = expected === undefined || text.trim() === expected.trim()
  const assetPath = plan.example.input.kind === 'file' ? plan.example.input.publicPath : undefined

  return (
    <>
      <header className="page-intro">
        <Button className="back-button" styleKind="quiet" icon="back" onClick={onBack}>{adding ? 'Kembali ke hasil' : 'Kembali ke input'}</Button>
        <h1>{adding ? 'Tinjau bahan tambahan' : 'Tinjau pemeriksaan'}</h1>
        <p>{plan.example.preview ? 'Pratinjau P1 · laporan contoh untuk fitur yang direncanakan.' : plan.example.title}</p>
      </header>

      <section className="panel screen-panel" aria-labelledby="materials-heading">
        <h2 id="materials-heading">Bahan pemeriksaan</h2>
        <ArtifactList artifacts={plan.artifacts} confirmed={confirmed} />
        {assetPath?.endsWith('.png') && <img className="fixture-preview" src={assetPath} alt={`Pratinjau simulasi: ${plan.example.title}`} />}

        {plan.confirmation && (
          <div className="confirmation">
            {expected !== undefined && (
              <>
                <label className="field-label" htmlFor="extracted-text">Teks hasil ekstraksi simulasi</label>
                <textarea id="extracted-text" className="text-input" rows={3} maxLength={4000} value={text}
                  onChange={(event) => onUpdate({ ...review, text: event.target.value, confirmed: false })} />
                {!textMatches && <p className="small muted">Periksa ejaan hasil ekstraksi. Gunakan teks contoh jika perlu.</p>}
              </>
            )}
            <div className="action-row">
              {confirmed ? <span className="confirmed"><Icon name="check" size={18} />Hasil dikonfirmasi</span> :
                <Button styleKind="secondary" icon="check" disabled={!textMatches} onClick={() => onUpdate({ ...review, confirmed: true })}>{plan.confirmation.label}</Button>}
              {expected !== undefined && !textMatches && <Button styleKind="quiet" onClick={() => onUpdate({ ...review, text: expected, confirmed: false })}>Gunakan teks contoh</Button>}
            </div>
          </div>
        )}
      </section>

      <section className="panel screen-panel" aria-labelledby="checks-heading">
        <h2 id="checks-heading">Pemeriksaan yang dipilih</h2>
        <ul className="rows">
          {plan.checks.map((check) => (
            <li className="detail-row check-plan" key={check.id}>
              {check.required ? <span className="tile-icon"><Icon name={check.external ? 'link' : 'checkList'} /></span> :
                <input type="checkbox" id={`choose-${check.id}`} checked={optional.includes(check.id)} onChange={(event) => {
                  const next = event.target.checked ? [...optional, check.id] : optional.filter((id) => id !== check.id)
                  onUpdate({ ...review, optional: next, consent: check.external ? false : consent })
                }} />}
              <div className="row-content">
                {check.required ? <strong>{check.label}</strong> : <label htmlFor={`choose-${check.id}`}><strong>{check.label}</strong></label>}
                <span className="small muted">{check.required ? 'Wajib' : 'Opsional'} · {check.external ? 'Penyedia simulasi' : 'Lokal (simulasi)'}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {externalChecks.length > 0 && (
        <section className="panel screen-panel consent-panel" aria-labelledby="consent-heading">
          <h2 id="consent-heading"><Icon name="lock" />Persetujuan cek eksternal</h2>
          <p>Ini simulasi izin. Data demo tetap di perangkat.</p>
          {externalChecks.map(({ id, external }) => external && (
            <dl className="consent-data" key={id}>
              <div><dt>Data</dt><dd>{external.data}</dd></div>
              <div><dt>Penerima</dt><dd>{external.recipient}</dd></div>
              <div><dt>Tujuan</dt><dd>{external.purpose}</dd></div>
              <div><dt>Visibilitas</dt><dd>{external.visibility}</dd></div>
            </dl>
          ))}
          <label className="consent-choice"><input type="checkbox" checked={consent} disabled={!confirmed}
            onChange={(event) => onUpdate({ ...review, consent: event.target.checked })} />
            <span>Saya menyetujui cakupan cek eksternal dalam simulasi ini.</span>
          </label>
        </section>
      )}

      {error && <InlineNotice danger>{error}</InlineNotice>}
      <div className="action-row analyzer-actions">
        <Button suffix="arrow" disabled={!confirmed || (externalChecks.length > 0 && !consent)} onClick={() => onRun(externalChecks.length > 0)}>Mulai simulasi</Button>
        {externalChecks.length > 0 && <Button styleKind="secondary" disabled={!confirmed} onClick={() => onRun(false)}>Lanjutkan tanpa cek eksternal</Button>}
      </div>
    </>
  )
}

export function CheckList({ report }: { report: CaseReport }) {
  return (
    <ul className="rows check-rows">
      {report.checks.map((check) => (
        <li className="check-row" key={check.id}>
          <div className="row-content">
            <strong>{check.label}</strong>
            <span className="small muted">{check.source}</span>
            {check.reason && <span className="small">{check.reason}</span>}
          </div>
          <StatusBadge status={check.status} check={check} />
        </li>
      ))}
    </ul>
  )
}

export function Progress({ report, onCancel }: { report?: CaseReport; onCancel: () => void }) {
  return (
    <>
      <header className="page-intro">
        <h1>Simulasi pemeriksaan</h1>
        <p>Ikuti status tiap cek. Hasil akan terbuka saat simulasi selesai.</p>
      </header>
      <section className="panel screen-panel" aria-labelledby="progress-heading">
        <div className="section-heading"><h2 id="progress-heading">Progres simulasi</h2><span role="status"><StatusBadge status={report?.status ?? 'pending'} /></span></div>
        {report && <CheckList report={report} />}
      </section>
      <Button styleKind="secondary" icon="close" onClick={onCancel}>Batalkan</Button>
    </>
  )
}
