import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { check, twin, TwinMismatchError } from '../src/index.js'

const quiet = { corpusDir: false, reportDir: false, seed: 1 }

test('passes when subject and reference agree', () => {
  const result = check('sort', {
    ...quiet,
    input: fc => fc.array(fc.integer()),
    subject: xs => [...xs].sort((a, b) => a - b),
    reference: xs => xs.toSorted((a, b) => a - b),
  })
  assert.equal(result.ok, true)
})

test('finds and shrinks a disagreement', () => {
  const result = check('abs', {
    ...quiet,
    input: fc => fc.integer(),
    subject: n => (n < -10 ? n : Math.abs(n)),
    reference: n => Math.abs(n),
  })
  assert.equal(result.ok, false)
  assert.equal(result.failure.input, -11)
  assert.deepEqual(result.failure.subject, { kind: 'value', value: -11 })
  assert.deepEqual(result.failure.reference, { kind: 'value', value: 11 })
})

test('treats both sides throwing the same error type as agreement', () => {
  const result = check('parse', {
    ...quiet,
    input: fc => fc.string(),
    subject: s => JSON.parse(s),
    reference: s => JSON.parse(s),
  })
  assert.equal(result.ok, true)
})

test('reports a throw against a value', () => {
  const result = check('throws', {
    ...quiet,
    input: fc => fc.nat(),
    subject: n => {
      if (n > 3) throw new RangeError('too big')
      return n
    },
    reference: n => n,
  })
  assert.equal(result.failure.input, 4)
  assert.equal(result.failure.subject.kind, 'throw')
  assert.equal(result.failure.subject.name, 'RangeError')
})

test('allow entries suppress known differences and are counted', () => {
  const result = check('known gap', {
    ...quiet,
    input: fc => fc.integer({ min: -5, max: 5 }),
    subject: n => (n < 0 ? 0 : n),
    reference: n => n,
    allow: [{ reason: 'negatives clamp to 0', when: n => n < 0 }],
  })
  assert.equal(result.ok, true)
  assert.ok(result.allowedHits.get('negatives clamp to 0') > 0)
})

test('normalize is applied to both outcomes', () => {
  const result = check('trim', {
    ...quiet,
    input: fc => fc.string(),
    subject: s => `${s} `,
    reference: s => s,
    normalize: s => s.trimEnd(),
  })
  assert.equal(result.ok, true)
})

test('neither side sees the other mutate the input', () => {
  const result = check('mutation', {
    ...quiet,
    input: fc => fc.array(fc.nat(), { minLength: 1 }),
    subject: xs => xs.push(99),
    reference: xs => xs.length + 1,
  })
  assert.equal(result.ok, true)
})

test('writes a report and replays saved failures first', () => {
  const dir = mkdtempSync(join(tmpdir(), 'twincheck-'))
  const spec = {
    seed: 7,
    corpusDir: join(dir, 'corpus'),
    reportDir: join(dir, 'reports'),
    input: fc => fc.integer(),
    subject: n => (n === 1234 ? 0 : n),
    reference: n => n,
  }
  // generation alone is unlikely to hit 1234, so plant it as a past failure
  const planted = check('planted', { ...spec, input: fc => fc.constant(1234) })
  assert.equal(planted.ok, false)
  assert.equal(planted.savedToCorpus, true)
  assert.ok(existsSync(planted.reportFile))
  assert.match(readFileSync(planted.reportFile, 'utf8'), /1234/)

  const replayed = check('planted', { ...spec, numRuns: 10 })
  assert.equal(replayed.ok, false)
  assert.equal(replayed.failure.input, 1234)
})

test('twin throws a TwinMismatchError with a readable summary', () => {
  assert.throws(
    () => twin('off by one', { ...quiet, input: fc => fc.nat(), subject: n => n + 1, reference: n => n }),
    error => error instanceof TwinMismatchError && /smallest failing input: 0/.test(error.message),
  )
})

test('rejects a spec without both functions', () => {
  assert.throws(() => check('bad', { ...quiet, input: fc => fc.nat(), subject: n => n }), TypeError)
})
