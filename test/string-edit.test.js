import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { check } from '../src/index.js'
import { stringEdit } from '../src/packs/string-edit.js'

const require = createRequire(import.meta.url)
const load = pkg => {
  const mod = require(pkg)
  return mod.default ?? mod
}
const run = (MagicString, name) => {
  const spec = stringEdit(MagicString).find(s => s.name.startsWith(name))
  return check(spec.name, { ...spec, numRuns: 2000, seed: 42, corpusDir: false, reportDir: false })
}

test('rediscovers the $ substitution bug fixed in magic-string 1.3.1 (#340)', () => {
  const result = run(load('magic-string-1.2.3'), 'replace(string, string)')
  assert.equal(result.ok, false)
  assert.deepEqual(result.failure.input, ['a', 'a', '$&'])
})

test('rediscovers the extra replacer argument fixed in magic-string 1.3.1 (#342)', () => {
  const result = run(load('magic-string-1.2.3'), 'replace(regex, fn)')
  assert.equal(result.ok, false)
})

test('magic-string 1.4.3 passes the whole pack', () => {
  for (const spec of stringEdit(load('magic-string-1.4.3'))) {
    const result = check(spec.name, { ...spec, numRuns: 2000, seed: 42, corpusDir: false, reportDir: false })
    assert.equal(result.ok, true, spec.name)
  }
})

test('finds the empty-string regression introduced in magic-string 1.4.4', () => {
  const result = run(load('magic-string-1.4.4'), 'replace(regex, string)')
  assert.equal(result.ok, false)
  assert.equal(result.failure.input[0], '')
})
