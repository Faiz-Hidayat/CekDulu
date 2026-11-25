import { useRef } from 'react'
import type { FormEvent, RefObject } from 'react'
import paperCollage from '../assets/cekdulu-paper-collage-840.png'
import { ACCEPTED_FILES, FILE_HINT } from '../analysis/input'
import type { Draft } from '../analysis/input'
import type { DemoExample, Specialist } from '../analysis/model'
import { Button, Icon, InlineNotice } from '../components/ui'
import type { IconName } from '../components/ui'

const tools: { id: Specialist; label: string; icon: IconName; hint: string }[] = [
  { id: 'message', label: 'Pesan & tangkapan layar', icon: 'message', hint: 'Tempel pesan atau pilih gambar chat.' },
  { id: 'url', label: 'Tautan & QR', icon: 'qr', hint: 'Tempel URL atau pilih gambar QR.' },
  { id: 'file', label: 'File & hash', icon: 'file', hint: 'Tempel SHA-256 atau pilih file contoh.' },
]

interface HomeProps {
  draft: Draft
  activeTool?: Specialist
  examples: readonly DemoExample[]
  inputRef: RefObject<HTMLTextAreaElement | null>
  error?: string
  busy: boolean
  onDraft: (draft: Draft) => void
  onExample: (id: string) => void
  onTool: (tool: Specialist) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function Home({ draft, activeTool, examples, inputRef, error, busy, onDraft, onExample, onTool, onSubmit }: HomeProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const tool = tools.find(({ id }) => id === activeTool)
  const current = examples.find(({ id }) => id === draft.exampleId)
  const visibleExamples = activeTool ? examples.filter(({ specialist }) => specialist === activeTool) : examples
  const currentAsset = current?.input.kind === 'file' ? current.input.publicPath : undefined

  return (
    <>
      <header className="page-intro home-hero">
        <div className="home-hero-copy">
          <h1>Apa yang ingin Anda periksa?</h1>
          <p>Periksa pesan, tautan, QR, atau file yang meragukan sebelum Anda bertindak.</p>
        </div>
        <div className="home-art" aria-hidden="true">
          <span className="art-mark art-orbit" />
          <span className="art-mark art-arch" />
          <img src={paperCollage} alt="" width={840} height={560} decoding="async" />
          <span className="art-mark art-diamond" />
          <span className="art-mark art-dot" />
          <span className="art-mark art-dash" />
        </div>
      </header>

      <form className="panel entry-panel" onSubmit={onSubmit} noValidate>
        <label className="field-label" htmlFor="check-input">Pesan, tautan, atau SHA-256</label>
        <textarea
          ref={inputRef} id="check-input" className="text-input" rows={4} maxLength={4000}
          placeholder={tool?.hint ?? 'Tempel pesan, tautan, atau hash file di sini…'}
          value={draft.text} onChange={(event) => onDraft({ text: event.target.value })}
          aria-invalid={error && !draft.file ? true : undefined} aria-describedby={error ? 'draft-error' : undefined}
        />

        <div className="file-line">
          <input ref={fileRef} type="file" accept={ACCEPTED_FILES} aria-label="File pemeriksaan" id="check-file" hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onDraft({ text: '', file: { name: file.name, size: file.size, payload: file } })
              event.target.value = ''
            }} />
          <Button styleKind="secondary" icon="paperclip" onClick={() => fileRef.current?.click()}>Pilih file</Button>
          <span className="muted small">{FILE_HINT}</span>
        </div>

        {draft.file && (
          <div className="file-selection" aria-live="polite">
            <Icon name="file" /><span><strong>{draft.file.name}</strong><span className="small muted">{current ? 'File contoh simulasi' : 'File dipilih di perangkat'}</span></span>
            <Button styleKind="quiet" icon="close" aria-label="Lepas file" onClick={() => onDraft({ text: '' })} />
          </div>
        )}
        {error && <InlineNotice id="draft-error" danger>{error}</InlineNotice>}

        <div className="entry-actions">
          <span className="local-note"><Icon name="lock" size={17} /> Data simulasi tetap di perangkat.</span>
          <Button type="submit" suffix="arrow" disabled={busy}>{busy ? 'Menyiapkan pemeriksaan…' : 'Tinjau pemeriksaan'}</Button>
        </div>
      </form>

      <section className="example-strip" aria-labelledby="demo-label">
        <div className="example-heading"><span className="tile-icon"><Icon name="flask" /></span><label id="demo-label" htmlFor="demo-example">Pilih contoh simulasi</label></div>
        <div className="example-options">
          <select id="demo-example" value={draft.exampleId ?? ''} onChange={(event) => onExample(event.target.value)}>
            <option value="">Pilih skenario</option>
            {visibleExamples.filter(({ preview }) => !preview).map((example) => <option key={example.id} value={example.id}>{example.title}</option>)}
            {visibleExamples.some(({ preview }) => preview) && (
              <optgroup label="Pratinjau P1">
                {visibleExamples.filter(({ preview }) => preview).map((example) => <option key={example.id} value={example.id}>{example.title}</option>)}
              </optgroup>
            )}
          </select>
          {current && <p className="example-detail small muted">{current.detail}</p>}
          {currentAsset && <a className="text-link download-link" href={currentAsset} download><Icon name="download" size={16} /> Unduh file contoh</a>}
        </div>
      </section>

      <nav className="tool-section" aria-labelledby="tool-heading">
        <h2 id="tool-heading">Pintasan pemeriksaan</h2>
        <div className="tool-list">
          {tools.map(({ id, label, icon }) => (
            <button type="button" key={id} className="tool-entry" aria-pressed={activeTool === id} onClick={() => onTool(id)}>
              <Icon name={icon} /><span>{label}</span><Icon name="arrow" size={16} />
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
