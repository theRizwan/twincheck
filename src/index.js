import fc from 'fast-check'
import { agrees, capture } from './outcome.js'
import { addToCorpus, loadCorpus } from './corpus.js'
import { formatSummary, writeReport } from './report.js'

export { agrees, describe } from './outcome.js'
export { formatReport, formatSummary } from './report.js'

export class TwinMismatchError extends Error {
  constructor(result) {
    super(formatSummary(result))
    this.name = 'TwinMismatchError'
    this.result = result
  }
}

/**
 * Runs subject and reference on generated inputs and returns the result without throwing.
 */
export function check(name, spec) {
  const {
    input,
    subject,
    reference,
    normalize = value => value,
    equals,
    allow = [],
    numRuns = 1000,
    seed,
    path,
    corpusDir = '.twincheck/corpus',
    reportDir = '.twincheck/reports',
  } = spec
  if (typeof subject !== 'function' || typeof reference !== 'function') {
    throw new TypeError('twincheck: subject and reference must both be functions')
  }
  const arbitrary = typeof input === 'function' ? input(fc) : input
  const slug = slugify(name)
  const allowedHits = new Map()

  const compare = value => {
    const s = capture(subject, value, normalize)
    const r = capture(reference, value, normalize)
    if (agrees(s, r, equals)) return { agree: true, s, r }
    const known = allow.find(entry => entry.when(value, s, r))
    if (known) {
      allowedHits.set(known.reason, (allowedHits.get(known.reason) ?? 0) + 1)
      return { agree: true, s, r }
    }
    return { agree: false, s, r }
  }

  const examples = loadCorpus(corpusDir, slug).map(value => [value])
  const details = fc.check(
    fc.property(arbitrary, value => compare(value).agree),
    { numRuns, seed, path, examples },
  )

  const result = { name, ok: !details.failed, numRuns, seed: details.seed, allowedHits }
  if (details.failed) {
    if (!details.counterexample) throw details.errorInstance ?? new Error(`twincheck: ${name} failed`)
    const [value] = details.counterexample
    const { s, r } = compare(value)
    result.failure = {
      input: value,
      subject: s,
      reference: r,
      path: details.counterexamplePath,
      numShrinks: details.numShrinks,
    }
    result.reportFile = writeReport(reportDir, slug, result)
    result.savedToCorpus = addToCorpus(corpusDir, slug, value)
  }
  return result
}

/**
 * Like check(), but throws a TwinMismatchError on the first disagreement, for use inside any test runner.
 */
export function twin(name, spec) {
  const result = check(name, spec)
  if (!result.ok) throw new TwinMismatchError(result)
  return result
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'check'
}
