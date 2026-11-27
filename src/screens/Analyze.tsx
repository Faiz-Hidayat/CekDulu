import { useLayoutEffect, useRef } from 'react'
import type { AnalysisPlan, Artifact, CaseReport } from '../analysis/model'
import reviewDossier from '../assets/review-dossier.webp'
import { artifactFamily, artifactIcon, Button, Icon, InlineNotice, StatusBadge } from '../components/ui'
import { Checkbox } from '../components/primitives/Checkbox'
import { WorkspaceHeader } from '../components/Workspace'

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
          <li className="detail-row motion-in" key={artifact.id}>
            <span className="tile-icon artifact-icon" data-family={artifactFamily[artifact.kind]}><Icon name={artifactIcon[artifact.kind]} /></span>
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
  const confirmRef = useRef<HTMLButtonElement>(null)
  const consentHeadingRef = useRef<HTMLHeadingElement>(null)
  const startRef = useRef<HTMLButtonElement>(null)
  const nextFocus = useRef<'confirm' | 'next-step' | null>(null)

  useLayoutEffect(() => {
    if (nextFocus.current === 'confirm') confirmRef.current?.focus()
    if (nextFocus.current === 'next-step') {
      if (externalChecks.length) consentHeadingRef.current?.focus()
      else startRef.current?.focus()
    }
    nextFocus.current = null
  }, [text, confirmed, externalChecks.length])

  return (
    <>
      <WorkspaceHeader
        stage="analyzer"
        title={adding ? 'Tinjau bahan tambahan' : 'Tinjau pemeriksaan'}
        description={plan.example.preview ? `Pratinjau P1 · ${plan.example.title}` : plan.example.title}
        action={<Button styleKind="quiet" icon="back" onClick={onBack}>{adding ? 'Kembali ke hasil' : 'Kembali ke input'}</Button>}
      />

      <div className="workspace-grid review-grid">
        <section className="panel screen-panel motion-in" aria-labelledby="materials-heading">
          <div className="materials-intro">
            <h2 id="materials-heading">Bahan pemeriksaan</h2>
            <img className="materials-art motion-in" src={reviewDossier} alt="" decoding="async" />
          </div>
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
                <span className={confirmed ? 'confirmed motion-in' : 'visually-hidden'} role="status">{confirmed && <><Icon name="check" size={18} />Hasil dikonfirmasi</>}</span>
                {!confirmed && <Button ref={confirmRef} styleKind="secondary" icon="check" disabled={!textMatches} onClick={() => {
                  nextFocus.current = 'next-step'
                  onUpdate({ ...review, confirmed: true })
                }}>{plan.confirmation.label}</Button>}
                {expected !== undefined && !textMatches && <Button styleKind="quiet" onClick={() => {
                  nextFocus.current = 'confirm'
                  onUpdate({ ...review, text: expected, confirmed: false })
                }}>Gunakan teks contoh</Button>}
              </div>
            </div>
          )}
        </section>

        <section className="panel screen-panel motion-in" aria-labelledby="checks-heading">
          <h2 id="checks-heading">Pemeriksaan yang dipilih</h2>
          <ul className="rows">
            {plan.checks.map((check) => {
              const labelId = `check-caption-${check.id}`
              const copy = <span className="row-content">
                <strong id={labelId}>{check.label}</strong>
                <span className="small muted">
                  {check.required ? (check.external ? 'Untuk cakupan lengkap' : 'Cek dasar') : 'Opsional'} · {check.external ? 'Perlu izin' : 'Lokal (simulasi)'}
                </span>
              </span>
              return (
                <li className="detail-row check-plan motion-in" key={check.id}>
                  {check.required ? (
                    <div className="check-choice-static"><span className={`tile-icon ${check.external ? 'guide-icon' : ''}`}><Icon name={check.external ? 'link' : 'checkList'} /></span>{copy}</div>
                  ) : (
                    <label className="check-choice" htmlFor={`choose-${check.id}`}>
                      <span className="check-choice-mark">
                        <Checkbox id={`choose-${check.id}`} aria-labelledby={labelId} checked={optional.includes(check.id)} onCheckedChange={(checked) => {
                          const next = checked === true ? [...optional, check.id] : optional.filter((id) => id !== check.id)
                          onUpdate({ ...review, optional: next, consent: check.external ? false : consent })
                        }} />
                      </span>
                      {copy}
                    </label>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        {externalChecks.length > 0 && (
          <section className="panel screen-panel consent-panel workspace-wide motion-in" aria-labelledby="consent-heading">
            <h2 ref={consentHeadingRef} id="consent-heading" tabIndex={-1}><Icon name="lock" />Persetujuan cek eksternal</h2>
            <p>Ini simulasi izin. Data demo tetap di perangkat.</p>
            <div className="consent-details">
              {externalChecks.map(({ id, external }) => external && (
                <dl className="consent-data" key={id}>
                  <div><dt>Penerima</dt><dd>{external.recipient}</dd></div>
                  <div><dt>Data</dt><dd>{external.data}</dd></div>
                  <div><dt>Tujuan</dt><dd>{external.purpose}</dd></div>
                  <div><dt>Visibilitas</dt><dd>{external.visibility}</dd></div>
                </dl>
              ))}
            </div>
            <label className="consent-choice" htmlFor="external-consent">
              <Checkbox id="external-consent" aria-labelledby="external-consent-label" checked={consent} disabled={!confirmed}
                onCheckedChange={(checked) => onUpdate({ ...review, consent: checked === true })} />
              <span id="external-consent-label">Saya menyetujui cakupan cek eksternal dalam simulasi ini.</span>
            </label>
          </section>
        )}
      </div>

      {error && <InlineNotice danger>{error}</InlineNotice>}
      <div className="workspace-actions analyzer-actions motion-in">
        <Button ref={startRef} suffix="arrow" disabled={!confirmed || (externalChecks.length > 0 && !consent)} onClick={() => onRun(externalChecks.length > 0)}>Mulai simulasi</Button>
        {externalChecks.length > 0 && (
          <div className="local-choice">
            <Button styleKind="secondary" disabled={!confirmed} aria-describedby="local-checks-note" onClick={() => onRun(false)}>Lanjutkan tanpa cek eksternal</Button>
            <p id="local-checks-note" className="small muted">Hasil hanya mencakup pemeriksaan lokal.</p>
          </div>
        )}
      </div>
    </>
  )
}

export function CheckList({ report }: { report: CaseReport }) {
  return (
    <ul className="rows check-rows">
      {report.checks.map((check) => (
        <li className="check-row motion-in" data-check-status={check.status ?? 'skipped'} data-coverage={check.coverage} key={check.id}>
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
  const status = report?.status ?? 'pending'

  return (
    <>
      <WorkspaceHeader
        stage="progress"
        title="Simulasi pemeriksaan"
        description="Ikuti status tiap cek. Hasil akan terbuka saat simulasi selesai."
      />
      <div className="workspace-grid progress-grid">
        <section className="panel screen-panel progress-panel motion-in" aria-labelledby="progress-heading">
          <div className="section-heading"><h2 id="progress-heading">Progres simulasi</h2><span role="status"><StatusBadge status={status} /></span></div>
          {report ? <CheckList report={report} /> : <p className="small muted">Menyiapkan daftar cek.</p>}
          <div className="progress-actions">
            <Button styleKind="secondary" icon="close" onClick={onCancel}>Batalkan</Button>
          </div>
        </section>
        <div className="scan-illustration motion-in" data-active={status === 'pending' || status === 'running'} aria-hidden="true">
          <div className="scan-window">
            <div className="scan-paper scan-paper-back" />
            <div className="scan-paper scan-paper-front"><Icon name="file" size={34} /><span /><span /><span /></div>
            <div className="scan-beam" />
          </div>
        </div>
      </div>
    </>
  )
}
