import { WorkspaceHeader } from '../components/Workspace'
import { artifactIcon, Button, DateLabel, DemoBadge, Icon, StatusBadge, VerdictBadge } from '../components/ui'
import type { SavedCase } from './Report'
import './history-workspace.css'

interface HistoryProps {
  cases: readonly SavedCase[]
  onOpen: (record: SavedCase) => void
  onDelete: (record: SavedCase) => void
  onNew: () => void
}

export function History({ cases, onOpen, onDelete, onNew }: HistoryProps) {
  const hasCases = cases.length > 0

  return (
    <div className="history-workspace">
      <WorkspaceHeader
        stage="history"
        title="Riwayat pemeriksaan"
        description="Hasil simulasi pada sesi ini. Riwayat kosong saat halaman dimuat ulang."
      />

      <section className="history-archive" aria-labelledby="history-session">
        <div className="history-index motion-in">
          <div className="history-index-summary">
            <span className="history-index-icon"><Icon name="clock" size={18} /></span>
            <div>
              <h2 id="history-session">Sesi ini</h2>
              <p className="small muted">{cases.length} entri</p>
            </div>
          </div>
          {hasCases && <Button styleKind="secondary" icon="plus" onClick={onNew}>Cek baru</Button>}
        </div>

        {hasCases ? (
          <ul className="history-list motion-in" role="list">
            {cases.map((record) => {
              const { example, report } = record
              const [firstArtifact] = report.artifacts
              const artifactLabels = Array.from(new Set(report.artifacts.map(({ label }) => label))).join(', ')

              return (
                <li className="history-row motion-in" key={report.id}>
                  <div className="history-file">
                    <span className="history-file-icon"><Icon name={firstArtifact ? artifactIcon[firstArtifact.kind] : 'file'} size={20} /></span>
                    <h3>{example.title}</h3>
                    <div className="history-meta small muted">
                      {artifactLabels && <span className="history-materials">{artifactLabels}</span>}
                      <DateLabel value={report.createdAt} variant="chip" />
                      <DemoBadge />
                      {example.preview && <span className="history-preview">Pratinjau P1</span>}
                    </div>
                  </div>

                  <div className="history-badges">
                    <VerdictBadge verdict={report.verdict} />
                    <StatusBadge status={report.status} />
                  </div>

                  <div className="history-actions">
                    <Button styleKind="secondary" suffix="arrow" onClick={() => onOpen(record)}>Buka hasil</Button>
                    <Button styleKind="quiet" icon="trash" onClick={() => onDelete(record)}>Hapus entri</Button>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <section className="history-empty motion-in" aria-labelledby="history-empty-title">
            <div className="history-empty-copy">
              <h3 id="history-empty-title">Belum ada pemeriksaan di sesi ini.</h3>
              <p className="muted">Jalankan contoh simulasi. Hasilnya akan muncul di sini.</p>
              <Button suffix="arrow" onClick={onNew}>Cek baru</Button>
            </div>
            <div className="history-empty-art" aria-hidden="true">
              <div className="history-folder"><span className="history-folder-paper" /></div>
            </div>
          </section>
        )}
      </section>
    </div>
  )
}
