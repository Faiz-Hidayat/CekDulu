import type { ReactNode } from 'react'
import { Icon } from './ui'
import type { IconName } from './ui'

const steps = [
  { stage: 'analyzer', label: 'Tinjau', icon: 'checkList' },
  { stage: 'progress', label: 'Periksa', icon: 'scan' },
  { stage: 'result', label: 'Hasil', icon: 'file' },
] as const satisfies ReadonlyArray<{ stage: string; label: string; icon: IconName }>

type WorkspaceStage = typeof steps[number]['stage'] | 'history'

interface WorkspaceHeaderProps {
  stage: WorkspaceStage
  title: string
  description?: ReactNode
  action?: ReactNode
  meta?: ReactNode
}

export function WorkspaceHeader({ stage, title, description, action, meta }: WorkspaceHeaderProps) {
  return (
    <header className={`page-intro workspace-heading${stage === 'result' ? ' result-intro' : ''}`} data-stage={stage}>
      {action && <div className="workspace-back">{action}</div>}
      <div className="workspace-title">
        <h1 className="motion-in" tabIndex={-1}>{title}</h1>
        {description && <p className="workspace-description motion-in">{description}</p>}
        {meta && <div className="workspace-meta motion-in">{meta}</div>}
      </div>
      {stage !== 'history' && (
        <ol className="workspace-steps" role="list" aria-label="Tahap pemeriksaan">
          {steps.map(({ stage: name, label, icon }) => (
            <li className="workspace-step" key={name} aria-current={stage === name ? 'step' : undefined}>
              <span className="workspace-step-icon"><Icon name={icon} size={17} /></span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
      )}
    </header>
  )
}
