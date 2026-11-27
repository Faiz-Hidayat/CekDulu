import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { exampleDraft, matchExample, validateDraft, validationExamples } from './analysis/input'
import type { Draft } from './analysis/input'
import type { AnalysisService, CaseReport, DemoExample, Specialist } from './analysis/model'
import { DemoBadge } from './components/ui'
import { Analyzer, defaultReview, Progress } from './screens/Analyze'
import type { ReviewState } from './screens/Analyze'
import { Home } from './screens/Home'
import { History } from './screens/History'
import { Result } from './screens/Report'
import type { SavedCase } from './screens/Report'

type View =
  | { name: 'home' }
  | { name: 'analyzer'; review: ReviewState; previous?: SavedCase }
  | { name: 'progress'; report?: CaseReport; back: ReturnView }
  | { name: 'result'; record: SavedCase }
  | { name: 'history' }

type ReturnView = Extract<View, { name: 'analyzer' | 'result' }>
type Run = (update: (snapshot: CaseReport) => void, signal: AbortSignal) => Promise<CaseReport>
type Feedback = { message: string; recovery?: 'examples' }

export function App({ service }: { service: AnalysisService }) {
  const [view, setView] = useState<View>({ name: 'home' })
  const [draft, setDraft] = useState<Draft>({ text: '' })
  const [activeTool, setActiveTool] = useState<Specialist>()
  const [cases, setCases] = useState<SavedCase[]>([])
  const [error, setError] = useState<Feedback>()
  const [busy, setBusy] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const mainRef = useRef<HTMLElement>(null)
  const lastView = useRef<View['name']>('home')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const currentJob = useRef<AbortController | null>(null)
  const preparation = useRef(0)
  const examples = [...service.examples, ...validationExamples]

  useEffect(() => {
    if (lastView.current === view.name) return
    lastView.current = view.name
    window.scrollTo(0, 0)
    mainRef.current?.querySelector('h1')?.focus({ preventScroll: true })
  }, [view.name])

  function navigate(next: View) {
    currentJob.current?.abort()
    preparation.current++
    setBusy(false)
    setError(undefined)
    setView(next)
  }

  function newCase() {
    setDraft({ text: '' })
    setActiveTool(undefined)
    navigate({ name: 'home' })
    if (view.name === 'home') inputRef.current?.focus()
  }

  function changeDraft(next: Draft) {
    preparation.current++
    setBusy(false)
    setError(undefined)
    setDraft(next)
  }

  async function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const isPreview = service.examples.some((example) => example.id === draft.exampleId && example.preview)
    const validation = isPreview ? undefined : validateDraft(draft)
    if (validation) {
      setError({ message: validation })
      if (!draft.file) inputRef.current?.focus()
      return
    }

    const ticket = ++preparation.current
    setBusy(true)
    setError(undefined)
    try {
      const example = await matchExample(draft, service.examples)
      if (ticket !== preparation.current) return
      if (!example) {
        setError({ message: 'Bahan ini belum punya hasil simulasi.', recovery: 'examples' })
        return
      }
      const plan = await service.prepare(example.id)
      if (ticket === preparation.current) navigate({ name: 'analyzer', review: defaultReview(plan) })
    } catch {
      if (ticket === preparation.current) setError({ message: 'Bahan belum dapat disiapkan.', recovery: 'examples' })
    } finally {
      if (ticket === preparation.current) setBusy(false)
    }
  }

  async function execute(example: DemoExample, back: ReturnView, run: Run) {
    currentJob.current?.abort()
    const job = new AbortController()
    currentJob.current = job
    setError(undefined)
    setView({ name: 'progress', back })
    try {
      const report = await run((snapshot) => {
        if (!job.signal.aborted) setView({ name: 'progress', report: snapshot, back })
      }, job.signal)
      if (job.signal.aborted) return
      const record = { example, report }
      setCases((history) => [record, ...history.filter(({ report: old }) => old.id !== report.id)])
      setDraft({ text: '' })
      setView({ name: 'result', record })
    } catch (failure) {
      if (!job.signal.aborted) {
        setView(back)
        setError({ message: failure instanceof Error ? failure.message : 'Simulasi belum selesai. Coba lagi.' })
      }
    } finally {
      if (currentJob.current === job) currentJob.current = null
    }
  }

  async function addMaterial(record: SavedCase, exampleId: string) {
    const ticket = ++preparation.current
    try {
      const plan = await service.prepare(exampleId)
      if (preparation.current === ticket) navigate({ name: 'analyzer', review: defaultReview(plan), previous: record })
    } catch {
      if (preparation.current === ticket) setError({ message: 'Contoh bahan tambahan tidak tersedia.' })
    }
  }

  const addId = view.name === 'result' && !view.record.report.artifacts.some(({ kind }) => kind === 'qr')
    ? service.nextExample(view.record.example.id) : undefined
  const addExample = service.examples.find(({ id }) => id === addId)

  return (
    <>
      <a className="skip-link" href="#main-content">Lewati ke konten</a>
      <header className="app-header">
        <div className="header-inner">
          <button className="wordmark motion-in" type="button" aria-label="CekDulu, cek baru" onClick={newCase}>Cek<span>Dulu</span></button>
          <nav className="main-nav motion-in" aria-label="Navigasi utama">
            <button type="button" onClick={newCase} aria-current={view.name !== 'history' ? 'page' : undefined}>Cek baru</button>
            <button type="button" onClick={() => navigate({ name: 'history' })} aria-current={view.name === 'history' ? 'page' : undefined}>Riwayat</button>
          </nav>
          <DemoBadge />
        </div>
      </header>

      {view.name !== 'home' && <div className="workspace-backdrop" data-scene={view.name} key={`backdrop-${view.name}`} aria-hidden="true" />}
      <main id="main-content" className="screen-motion" data-view={view.name} key={view.name} ref={mainRef} tabIndex={-1}>
        {view.name === 'home' && <Home draft={draft} activeTool={activeTool} examples={examples} inputRef={inputRef}
          error={error?.message} recoverWithExample={error?.recovery === 'examples'} busy={busy}
          onDraft={changeDraft} onExample={(id) => {
            const chosen = examples.find((example) => example.id === id)
            changeDraft(chosen ? exampleDraft(chosen) : { text: '' })
          }} onTool={(tool) => {
            setActiveTool(activeTool === tool ? undefined : tool)
            const selected = examples.find(({ id }) => id === draft.exampleId)
            if (selected && selected.specialist !== tool) changeDraft({ text: '' })
          }} onSubmit={submitDraft} />}

        {view.name === 'analyzer' && <Analyzer review={view.review} adding={Boolean(view.previous)} error={error?.message}
          onUpdate={(review) => setView({ ...view, review })}
          onBack={() => navigate(view.previous ? { name: 'result', record: view.previous } : { name: 'home' })}
          onRun={(allowExternal) => {
            const { plan, confirmed, optional } = view.review
            void execute(view.previous?.example ?? plan.example, view, (update, signal) => service.run({
              exampleId: plan.example.id, allowExternal, optionalChecks: optional, confirmed, existing: view.previous?.report,
            }, update, signal))
          }} />}

        {view.name === 'progress' && <Progress report={view.report} onCancel={() => {
          const back = view.back.name === 'analyzer' && view.back.previous ? { name: 'result' as const, record: view.back.previous } : view.back
          setAnnouncement('Simulasi dibatalkan.')
          navigate(back)
        }} />}

        {view.name === 'result' && <Result key={view.record.report.id} record={view.record} addExample={addExample} error={error?.message}
          onNew={newCase} onAdd={() => { if (addId) void addMaterial(view.record, addId) }}
          onRetry={() => { void execute(view.record.example, view, (update, signal) => service.retry(view.record.example.id, view.record.report, update, signal)) }} />}

        {view.name === 'history' && <History cases={cases} onNew={newCase} onOpen={(record) => navigate({ name: 'result', record })}
          onDelete={(record) => {
            setCases((history) => history.filter(({ report }) => report.id !== record.report.id))
            setAnnouncement('Entri simulasi dihapus.')
            mainRef.current?.querySelector('h1')?.focus({ preventScroll: true })
          }} />}
      </main>
      <span className="visually-hidden" role="status">{announcement}</span>
    </>
  )
}
