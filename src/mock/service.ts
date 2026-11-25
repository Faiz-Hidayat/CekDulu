import type { AnalysisRequest, AnalysisService, CaseReport, Check, Evidence } from '../analysis/model'
import { fixtures } from './fixtures'
import type { Fixture, FixtureOutcome } from './fixture-types'

const examples = fixtures.map(({ example }) => example)
const fixtureById = new Map(fixtures.map((fixture) => [fixture.example.id, fixture]))

function getFixture(id: string): Fixture {
  const fixture = fixtureById.get(id)
  if (!fixture) throw new Error('Contoh simulasi tidak ditemukan.')
  return fixture
}

function pause(milliseconds: number, signal: AbortSignal): Promise<void> {
  signal.throwIfAborted()
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, milliseconds)
    function abort() {
      window.clearTimeout(timer)
      reject(signal.reason)
    }
    signal.addEventListener('abort', abort, { once: true })
  })
}

function materialize(outcome: FixtureOutcome, check: Check, time: string): { check: Check; evidence: Evidence[] } {
  const value = outcome.checks[check.id]
  if (!value) throw new Error('Hasil cek untuk contoh ini belum tersedia.')
  const attemptId = check.attemptId ?? crypto.randomUUID()
  const retryAt = value.retryDelayMs === undefined ? undefined : new Date(Date.parse(time) + value.retryDelayMs).toISOString()

  return {
    check: { ...check, status: value.status, coverage: value.coverage, reason: value.reason, attemptId, retryable: value.retryable, retryAt },
    evidence: (value.evidence ?? []).map((entry) => ({ ...entry, checkId: check.id, attemptId, retrievedAt: time })),
  }
}

function makeChecks(fixture: Fixture, request: AnalysisRequest): Check[] {
  return fixture.checks.map(({ external, ...plan }) => {
    const selected = plan.required || request.optionalChecks.includes(plan.id)
    const approved = !external || request.allowExternal
    const active = selected && approved
    return {
      ...plan,
      status: active ? 'pending' : null,
      coverage: 'not_checked',
      reason: !selected ? 'Cek opsional dilewati.' : !approved ? 'Dilewati karena izin belum diberikan.' : undefined,
      attemptId: active ? crypto.randomUUID() : undefined,
      consent: external && { ...external, decision: !selected ? 'pending' : approved ? 'granted' : 'declined' },
    }
  })
}

async function showProgress(
  report: CaseReport,
  update: (report: CaseReport) => void,
  signal: AbortSignal,
  duration: number,
) {
  signal.throwIfAborted()
  update(report)
  await pause(290, signal)
  update({
    ...report,
    status: 'running',
    checks: report.checks.map((check) => check.status === 'pending' ? { ...check, status: 'running' } : check),
  })
  await pause(duration, signal)
  signal.throwIfAborted()
}

export const mockAnalysis: AnalysisService = {
  examples,

  async prepare(exampleId) {
    const { example, artifacts, checks, confirmation } = getFixture(exampleId)
    return { example, artifacts, checks, confirmation }
  },

  async run(request, onUpdate, signal) {
    const fixture = getFixture(request.exampleId)
    if (fixture.confirmation && !request.confirmed) throw new Error('Konfirmasi hasil ekstraksi terlebih dahulu.')

    const prior = request.existing
    const outcome = request.allowExternal ? fixture.full : fixture.localOnly ?? fixture.full
    const checks = makeChecks(fixture, request)
    const newArtifacts = fixture.artifacts.map((artifact) => ({
      ...artifact,
      extractionStatus: artifact.extractionStatus === 'needs_confirmation' && request.confirmed ? 'confirmed' as const : artifact.extractionStatus,
    }))
    const progress: CaseReport = {
      id: prior?.id ?? crypto.randomUUID(),
      createdAt: prior?.createdAt ?? new Date().toISOString(),
      mode: 'mock',
      status: 'pending',
      verdict: prior?.verdict ?? null,
      summary: prior?.summary ?? '',
      artifacts: [...(prior?.artifacts ?? []), ...newArtifacts],
      checks: [...(prior?.checks ?? []), ...checks],
      evidence: prior?.evidence ?? [],
      actions: prior?.actions ?? [],
    }

    await showProgress(progress, onUpdate, signal, fixture.timingMs ?? 780)
    const time = new Date().toISOString()
    const results = checks.map((check) => check.status === null ? { check, evidence: [] } : materialize(outcome, check, time))
    // The only supported append is the scripted lowongan + QR case.
    // Declining its lookup leaves the original contextual finding in place.
    const keptFinding = prior && request.exampleId === 'qr_phishing' && !request.allowExternal ? prior : undefined
    return {
      ...progress,
      status: keptFinding ? 'partial' : outcome.status,
      verdict: keptFinding ? keptFinding.verdict : outcome.verdict,
      summary: keptFinding ? keptFinding.summary : outcome.summary,
      artifacts: [...(prior?.artifacts ?? []), ...newArtifacts.map((artifact) => ({ ...artifact, verdict: outcome.artifactVerdicts?.[artifact.id] }))],
      checks: [...(prior?.checks ?? []), ...results.map(({ check }) => check)],
      evidence: [...progress.evidence, ...results.flatMap(({ evidence }) => evidence)],
      actions: keptFinding ? keptFinding.actions : outcome.actions,
    }
  },

  async retry(exampleId, report, onUpdate, signal) {
    const outcome = getFixture(exampleId).retry
    if (!outcome) throw new Error('Contoh ini tidak memiliki percobaan ulang.')

    const now = Date.now()
    const targets = new Set(report.checks.filter((check) => (
      check.retryable && (!check.retryAt || Date.parse(check.retryAt) <= now) && outcome.checks[check.id]
    )).map(({ id }) => id))
    if (targets.size === 0) throw new Error('Tunggu hingga cek dapat diulang.')

    const pending = report.checks.map((check): Check => targets.has(check.id) ? {
      ...check, status: 'pending', coverage: 'not_checked', reason: undefined, attemptId: crypto.randomUUID(),
    } : check)
    await showProgress({ ...report, status: 'pending', checks: pending }, onUpdate, signal, 660)
    const time = new Date().toISOString()
    const results = pending.map((check) => targets.has(check.id) ? materialize(outcome, check, time) : { check, evidence: [] })
    const evidenceById = new Map(report.evidence.map((entry) => [entry.id, entry]))
    for (const { evidence } of results) {
      for (const entry of evidence) evidenceById.set(entry.id, entry)
    }

    return {
      ...report,
      status: outcome.status,
      verdict: outcome.verdict,
      summary: outcome.summary,
      artifacts: report.artifacts.map((artifact) => ({ ...artifact, verdict: outcome.artifactVerdicts?.[artifact.id] ?? artifact.verdict })),
      checks: results.map(({ check }) => check),
      evidence: [...evidenceById.values()],
      actions: outcome.actions,
    }
  },

  nextExample(exampleId) {
    return exampleId === 'scam_screenshot' ? 'qr_phishing' : undefined
  },
}
