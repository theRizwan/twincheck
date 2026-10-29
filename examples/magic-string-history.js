// Runs the string-edit pack against past magic-string releases and the latest one.
// The point: fixes that landed in 1.3.1 should show up as disagreements on 1.2.3 and pass afterwards.
import { createRequire } from 'node:module'
import { check } from '../src/index.js'
import { formatSummary } from '../src/report.js'
import { stringEdit } from '../src/packs/string-edit.js'

const require = createRequire(import.meta.url)
const versions = ['magic-string-1.2.3', 'magic-string-1.4.2', 'magic-string-1.4.3', 'magic-string']

for (const pkg of versions) {
  const mod = require(pkg)
  const MagicString = mod.default ?? mod
  const { version } = require(`${pkg}/package.json`)
  console.log(`\nmagic-string ${version}`)
  for (const spec of stringEdit(MagicString)) {
    const result = check(spec.name, { ...spec, numRuns: 2000, seed: 42, corpusDir: false, reportDir: false })
    console.log(result.ok ? `  ✓ ${spec.name}` : formatSummary(result).replace(/^/gm, '  '))
  }
}
