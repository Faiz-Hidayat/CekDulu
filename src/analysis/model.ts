export type Verdict = 'UNSAFE' | 'SUSPICIOUS' | 'NOT_FLAGGED' | 'INCONCLUSIVE'
export type AnalysisStatus = 'pending' | 'running' | 'completed' | 'partial' | 'failed' | 'unsupported' | 'rate_limited'
export type Coverage = 'covered' | 'no_data' | 'not_checked' | 'unavailable'
export type ArtifactKind = 'message' | 'screenshot' | 'url' | 'qr' | 'file' | 'hash'
export type Method = 'context' | 'extraction' | 'lookup' | 'static' | 'dynamic' | 'authenticity'
export type Signal = 'strong_flag' | 'warning' | 'no_flag' | 'unknown'
export type Specialist = 'message' | 'url' | 'file'

export interface Artifact {
  id: string
  kind: ArtifactKind
  label: string
  parentId?: string
  displayValue: string
  extractionStatus: 'not_needed' | 'needs_confirmation' | 'confirmed'
  sha256?: string
  verdict?: Verdict
  authenticity?: {
    assessment: 'possible_ai_generated' | 'possible_manipulated' | 'no_indication' | 'inconclusive' | 'not_checked'
    evidenceIds: string[]
  }
}

export interface ConsentScope {
  data: string
  recipient: string
  purpose: string
  visibility: string
}

export interface CheckPlan {
  id: string
  artifactId: string
  label: string
  source: string
  method: Method
  required: boolean
  external?: ConsentScope
}

export interface Check extends Omit<CheckPlan, 'external'> {
  status: AnalysisStatus | null
  coverage: Coverage
  reason?: string
  attemptId?: string
  retryAt?: string
  retryable?: boolean
  consent?: ConsentScope & { decision: 'pending' | 'granted' | 'declined' }
}

export interface Evidence {
  id: string
  checkId: string
  attemptId: string
  signal: Signal
  finding: string
  rawResult?: string
  retrievedAt: string
  analyzedAt?: string
  limitations: string[]
}

export interface Action {
  text: string
  evidenceIds: string[]
}

export interface CaseReport {
  id: string
  createdAt: string
  mode: 'mock' | 'live'
  status: AnalysisStatus
  verdict: Verdict | null
  summary: string
  artifacts: Artifact[]
  checks: Check[]
  evidence: Evidence[]
  actions: Action[]
}

export type DemoInput =
  | { kind: 'text'; value: string }
  | { kind: 'file'; name: string; mime: string; size: number; digest?: string; publicPath?: string }

export interface DemoExample {
  id: string
  title: string
  detail: string
  specialist: Specialist
  input: DemoInput
  preview?: 'P1'
}

export interface AnalysisPlan {
  example: DemoExample
  artifacts: Artifact[]
  checks: CheckPlan[]
  confirmation?: {
    label: string
    initialText?: string
    exampleText?: string
  }
}

export interface AnalysisRequest {
  exampleId: string
  allowExternal: boolean
  optionalChecks: string[]
  confirmed: boolean
  existing?: CaseReport
}

export interface AnalysisService {
  examples: readonly DemoExample[]
  prepare(exampleId: string): Promise<AnalysisPlan>
  run(request: AnalysisRequest, onUpdate: (report: CaseReport) => void, signal: AbortSignal): Promise<CaseReport>
  retry(exampleId: string, report: CaseReport, onUpdate: (report: CaseReport) => void, signal: AbortSignal): Promise<CaseReport>
  nextExample(exampleId: string): string | undefined
}
