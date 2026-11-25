import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { AnalysisStatus, ArtifactKind, Check, Verdict } from '../analysis/model'

const paths = {
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  back: 'M19 12H5m6-6-6 6 6 6',
  chevron: 'm6 9 6 6 6-6',
  paperclip: 'M20 11.5 11 20.4a5 5 0 0 1-7-7l10-10a3.5 3.5 0 0 1 5 5l-10 10a2 2 0 0 1-3-3l9-9',
  message: 'M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-9.5A7.5 7.5 0 0 1 10.5 4h2a7.5 7.5 0 0 1 7.5 7.5ZM7 10h8m-8 4h5',
  file: 'M6 3h8l4 4v14H6zM14 3v5h4M9 13h6m-6 4h6',
  image: 'M4 4h16v16H4zm0 13 5-5 3 3 3-4 5 5M9 8h.01',
  qr: 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h3v3h-3zm7 0v5h-4v2h-3M6.5 6.5h.01m11 0h.01m-11 11h.01',
  link: 'm10 14 4-4m-6 6H7a4 4 0 0 1-2.8-6.8l3-3A4 4 0 0 1 13 6m-2 12a4 4 0 0 0 5.8-.2l3-3A4 4 0 0 0 17 8h-1',
  hash: 'M10 3 7 21m10-18-3 18M4 9h17M3 15h17',
  lock: 'M6 10h12v10H6zm2 0V7a4 4 0 0 1 8 0v3m-4 4v2',
  flask: 'M9 3h6m-5 0v6l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3M8 14h8',
  close: 'm6 6 12 12M18 6 6 18',
  check: 'm5 12 4 4L19 6',
  checkList: 'M10 6h10M10 12h10M10 18h10M4 5l1 1 2-2M4 11l1 1 2-2M4 17l1 1 2-2',
  warning: 'M12 3 2 21h20L12 3Zm0 6v5m0 3h.01',
  danger: 'M8 3h8l5 5v8l-5 5H8l-5-5V8zm4 5v5m0 3h.01',
  unknown: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM9 9a3 3 0 0 1 6 0c0 2-3 2.4-3 4m0 3h.01',
  info: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 11v6m0-10h.01',
  clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 7v5l3 2',
  running: 'M19 5a9 9 0 1 1-7-2',
  half: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 2v20m0-7 7-7m-7 2 5-5m-5 15 9-9',
  hourglass: 'M6 3h12M6 21h12M7 3v4c0 2 2 4 5 5-3 1-5 3-5 5v4m10-18v4c0 2-2 4-5 5 3 1 5 3 5 5v4',
  plus: 'M12 5v14M5 12h14',
  retry: 'M3 11a9 9 0 1 1 3 7M3 5v6h6',
  trash: 'M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5',
  download: 'M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5',
} satisfies Record<string, string>

export type IconName = keyof typeof paths

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg className={`icon icon-${name}`} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d={paths[name]} stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Button({ children, styleKind = 'primary', icon, suffix, className = '', type = 'button', ...props }:
  ButtonHTMLAttributes<HTMLButtonElement> & { styleKind?: 'primary' | 'secondary' | 'quiet'; icon?: IconName; suffix?: IconName }) {
  return (
    <button type={type} className={`button button-${styleKind} ${className}`} {...props}>
      {icon && <Icon name={icon} size={18} />}{children}{suffix && <Icon name={suffix} size={18} />}
    </button>
  )
}

export function DemoBadge() {
  return <span className="demo-badge"><Icon name="flask" size={15} />DEMO/SIMULASI</span>
}

export function InlineNotice({ children, danger = false, id }: { children: ReactNode; danger?: boolean; id?: string }) {
  return <p className={`notice ${danger ? 'notice-error' : ''}`} id={id} role={danger ? 'alert' : undefined}><Icon name={danger ? 'warning' : 'info'} size={18} /><span>{children}</span></p>
}

export const artifactIcon: Record<ArtifactKind, IconName> = {
  message: 'message', screenshot: 'image', url: 'link', qr: 'qr', file: 'file', hash: 'hash',
}

export const verdictPresentation: Record<Verdict, { label: string; icon: IconName; tone: string }> = {
  UNSAFE: { label: 'Berbahaya', icon: 'danger', tone: 'unsafe' },
  SUSPICIOUS: { label: 'Mencurigakan', icon: 'warning', tone: 'suspicious' },
  NOT_FLAGGED: { label: 'Tidak ada indikasi terdeteksi', icon: 'checkList', tone: 'not-flagged' },
  INCONCLUSIVE: { label: 'Belum dapat disimpulkan', icon: 'unknown', tone: 'inconclusive' },
}

const statusPresentation: Record<AnalysisStatus, { label: string; icon: IconName }> = {
  pending: { label: 'Antre', icon: 'clock' },
  running: { label: 'Sedang memeriksa', icon: 'running' },
  completed: { label: 'Pemeriksaan selesai', icon: 'check' },
  partial: { label: 'Pemeriksaan sebagian', icon: 'half' },
  failed: { label: 'Pemeriksaan gagal', icon: 'close' },
  unsupported: { label: 'Belum didukung', icon: 'danger' },
  rate_limited: { label: 'Batas pemeriksaan tercapai', icon: 'hourglass' },
}

export function VerdictBadge({ verdict }: { verdict: Verdict | null }) {
  const state = verdict ? verdictPresentation[verdict] : { label: 'Belum dinilai', icon: 'unknown' as const, tone: 'process' }
  return <span className={`badge tone-${state.tone}`}><Icon name={state.icon} size={15} />{state.label}</span>
}

export function StatusBadge({ status, check }: { status: AnalysisStatus | null; check?: Check }) {
  const state = check?.coverage === 'no_data'
    ? { label: 'Tanpa catatan', icon: 'unknown' as const }
    : status ? statusPresentation[status] : { label: 'Dilewati', icon: 'info' as const }
  return <span className="badge tone-process"><Icon name={state.icon} size={15} />{state.label}</span>
}

const timeFormat = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta',
})

export function DateLabel({ value }: { value: string }) {
  return <time dateTime={value}>{timeFormat.format(new Date(value))} WIB</time>
}
