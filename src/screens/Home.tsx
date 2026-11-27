import { Fragment, useRef, useState } from 'react'
import type { FormEvent, RefObject } from 'react'
import { flushSync } from 'react-dom'
import scanBackdrop from '../assets/cekdulu-scan-backdrop.webp'
import { ACCEPTED_FILES, FILE_HINT, validationExamples } from '../analysis/input'
import type { Draft } from '../analysis/input'
import type { DemoExample, Specialist } from '../analysis/model'
import { LayoutReveal } from '../components/LayoutReveal'
import { Button, Icon, InlineNotice } from '../components/ui'
import type { IconName } from '../components/ui'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '../components/primitives/Select'

const tools: { id: Specialist; label: string; icon: IconName; hint: string }[] = [
  { id: 'message', label: 'Pesan & tangkapan layar', icon: 'message', hint: 'Tempel pesan atau pilih gambar chat.' },
  { id: 'url', label: 'Tautan & QR', icon: 'qr', hint: 'Tempel URL atau pilih gambar QR.' },
  { id: 'file', label: 'File & hash', icon: 'file', hint: 'Tempel SHA-256 atau pilih file contoh.' },
]

const clearExample = 'clear-example'
const validationIds = new Set(validationExamples.map(({ id }) => id))
const inputHints = [{ id: 'all', hint: 'Tempel pesan, tautan, atau hash file di sini…' }, ...tools]

interface HomeProps {
  draft: Draft
  activeTool?: Specialist
  examples: readonly DemoExample[]
  inputRef: RefObject<HTMLTextAreaElement | null>
  error?: string
  recoverWithExample: boolean
  busy: boolean
  onDraft: (draft: Draft) => void
  onExample: (id: string) => void
  onTool: (tool: Specialist) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function Home({ draft, activeTool, examples, inputRef, error, recoverWithExample, busy, onDraft, onExample, onTool, onSubmit }: HomeProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const exampleRef = useRef<HTMLButtonElement>(null)
  const [exampleOpen, setExampleOpen] = useState(false)
  const [lastTool, setLastTool] = useState<Specialist>('message')
  const current = examples.find(({ id }) => id === draft.exampleId)
  const visibleExamples = activeTool ? examples.filter(({ specialist }) => specialist === activeTool) : examples
  const exampleGroups = [
    { title: 'Skenario demo', examples: visibleExamples.filter(({ id, preview }) => !preview && !validationIds.has(id)) },
    { title: 'Validasi input', examples: visibleExamples.filter(({ id }) => validationIds.has(id)) },
    { title: 'Pratinjau P1', examples: visibleExamples.filter(({ preview }) => preview) },
  ].filter((group) => group.examples.length > 0)
  const currentAsset = current?.input.kind === 'file' ? current.input.publicPath : undefined
  const inputContext = `${activeTool ?? 'all'}:${current?.id ?? ''}`
  const activeHint = activeTool ?? 'all'
  const placeholder = inputHints.find(({ id }) => id === activeHint)?.hint

  function changeExampleOpen(open: boolean) {
    if (open) {
      setExampleOpen(true)
      return
    }
    // Dismiss the focus trap before restoring the trigger for the next Tab.
    flushSync(() => setExampleOpen(false))
    exampleRef.current?.focus({ preventScroll: true })
  }

  return (
    <>
      <header className="home-hero">
        <h1 tabIndex={-1}>
          <span className="hero-line"><span className="motion-in">Sebelum klik,</span></span>{' '}
          <span className="hero-line"><em className="motion-in">cek dulu.</em></span>
        </h1>
        <p className="motion-in">Periksa pesan, tautan, QR, atau file yang meragukan sebelum Anda bertindak.</p>
      </header>

      <div className="check-stage motion-in">
        <div className="home-art" aria-hidden="true">
          <img src={scanBackdrop} alt="" width={1440} height={960} decoding="async" />
        </div>
        <div className="stage-workspace">
          <section className="example-strip" aria-labelledby="demo-label">
            <div className="example-heading motion-in">
              <span className="tile-icon"><Icon name="flask" /></span>
              <div>
                <label id="demo-label" htmlFor="demo-example">Pilih contoh simulasi</label>
                <p id="demo-hint" className="small">Hasil demo tersedia untuk bahan contoh sintetis.</p>
              </div>
            </div>
            <div className="example-options motion-in">
              <Select open={exampleOpen} onOpenChange={changeExampleOpen} value={draft.exampleId ?? ''} onValueChange={(value) => onExample(value === clearExample ? '' : value)}>
                <SelectTrigger ref={exampleRef} id="demo-example" aria-labelledby="demo-label" aria-describedby="demo-hint">
                  <SelectValue placeholder={<span className="selected-scenario">Pilih skenario</span>}>
                    {current && <span className="selected-scenario" key={current.id}>{current.title}</span>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent aria-labelledby="demo-label" onCloseAutoFocus={(event) => {
                  if (document.activeElement !== document.body) event.preventDefault()
                }}>
                  {exampleGroups.map(({ title, examples }, index) => (
                    <Fragment key={title}>
                      {index > 0 && <SelectSeparator />}
                      <SelectGroup>
                        <SelectLabel>{title}</SelectLabel>
                        {examples.map((example) => (
                          <SelectItem key={example.id} value={example.id} data-fixture-id={example.id}>{example.title}</SelectItem>
                        ))}
                      </SelectGroup>
                    </Fragment>
                  ))}
                  {current && <><SelectSeparator /><SelectItem value={clearExample}>Kosongkan pilihan</SelectItem></>}
                </SelectContent>
              </Select>
              <LayoutReveal sizeKey={current?.id ?? ''}>
                {current && (
                  <div className="scenario-detail motion-in" key={current.id}>
                    <p className="example-detail small">{current.detail}</p>
                    {currentAsset && <a className="text-link download-link" href={currentAsset} download><Icon name="download" size={16} /> Unduh file contoh</a>}
                  </div>
                )}
              </LayoutReveal>
            </div>
          </section>

          <form className="entry-panel" onSubmit={onSubmit} noValidate>
            <label className="field-label motion-in" htmlFor="check-input">Pesan, tautan, atau SHA-256</label>
            <div className="input-frame motion-in">
              <textarea
                ref={inputRef} id="check-input" className="text-input" rows={3} maxLength={4000}
                placeholder={placeholder}
                value={draft.text} onChange={(event) => onDraft({ text: event.target.value })}
                aria-invalid={error && !draft.file ? true : undefined} aria-describedby={error ? 'demo-hint draft-error' : 'demo-hint'}
              />
              <span className="input-prompts" aria-hidden="true">
                {inputHints.map(({ id, hint }) => <span key={id} data-active={id === activeHint}>{hint}</span>)}
              </span>
              <span key={inputContext} className="input-selection-cue" data-family={activeTool ?? current?.specialist} aria-hidden="true" />
            </div>

            <div className="file-line motion-in">
              <input ref={fileRef} type="file" accept={ACCEPTED_FILES} aria-label="File pemeriksaan" id="check-file" hidden
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) onDraft({ text: '', file: { name: file.name, size: file.size, payload: file } })
                  event.target.value = ''
                }} />
              <Button styleKind="secondary" icon="paperclip" onClick={() => fileRef.current?.click()}>Pilih file</Button>
              <span className="muted small">{FILE_HINT}</span>
            </div>

            <LayoutReveal sizeKey={JSON.stringify([draft.file?.name, error, recoverWithExample])}>
              {draft.file && (
                <div className="file-selection motion-in" key={draft.file.name} aria-live="polite">
                  <Icon name="file" /><span><strong>{draft.file.name}</strong><span className="small muted">{current ? 'File contoh simulasi' : 'File dipilih di perangkat'}</span></span>
                  <Button styleKind="quiet" icon="close" aria-label="Lepas file" onClick={() => onDraft({ text: '' })} />
                </div>
              )}
              {error && (recoverWithExample ? (
                <div className="example-recovery motion-in">
                  <InlineNotice id="draft-error" danger>{error}</InlineNotice>
                  <Button styleKind="quiet" icon="flask" onClick={() => exampleRef.current?.focus()}>Pilih contoh simulasi</Button>
                </div>
              ) : <InlineNotice id="draft-error" danger>{error}</InlineNotice>)}
            </LayoutReveal>

            <div className="entry-actions motion-in">
              <span className="local-note"><Icon name="lock" size={17} /> Data simulasi tetap di perangkat.</span>
              <Button type="submit" suffix="arrow" disabled={busy}>{busy ? 'Menyiapkan pemeriksaan…' : 'Tinjau pemeriksaan'}</Button>
            </div>
          </form>
        </div>
      </div>

      <nav className="tool-section" aria-labelledby="tool-heading">
        <h2 id="tool-heading" className="motion-in">Pintasan pemeriksaan</h2>
        <div className="tool-list">
          <span className="tool-selection" data-family={activeTool ?? lastTool} data-visible={activeTool !== undefined} aria-hidden="true" />
          {tools.map(({ id, label, icon }) => (
            <button type="button" key={id} className="tool-entry motion-in" data-family={id} aria-controls="check-input" aria-pressed={activeTool === id} onClick={() => {
              setLastTool(id)
              onTool(id)
            }}>
              <span className="tool-icon"><Icon name={icon} /></span>
              <span className="tool-label">{label}</span>
              <span className="tool-marker" aria-hidden="true"><Icon name="arrow" size={16} /><Icon name="check" size={16} /></span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
