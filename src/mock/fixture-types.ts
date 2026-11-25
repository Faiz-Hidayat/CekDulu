import type { Action, AnalysisPlan, AnalysisStatus, Coverage, Evidence, Verdict } from '../analysis/model'

export type EvidenceSeed = Omit<Evidence, 'checkId' | 'attemptId' | 'retrievedAt' | 'analyzedAt'>

export interface CheckOutcome {
  status: AnalysisStatus | null
  coverage: Coverage
  reason?: string
  evidence?: EvidenceSeed[]
  retryable?: boolean
  retryDelayMs?: number
}

export interface FixtureOutcome {
  status: AnalysisStatus
  verdict: Verdict | null
  summary: string
  actions: Action[]
  checks: Record<string, CheckOutcome>
  artifactVerdicts?: Record<string, Verdict>
}

export interface Fixture extends AnalysisPlan {
  full: FixtureOutcome
  localOnly?: FixtureOutcome
  retry?: FixtureOutcome
  timingMs?: number
}
