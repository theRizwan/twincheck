import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import fc from 'fast-check'
import { describe } from './outcome.js'

export function formatSummary(result) {
  const { name, failure, seed } = result
  return [
    `✗ ${name}`,
    `  smallest failing input: ${fc.stringify(failure.input)}`,
    `  subject:   ${describe(failure.subject)}`,
    `  reference: ${describe(failure.reference)}`,
    `  seed ${seed} · path ${failure.path} · ${failure.numShrinks} shrink steps`,
  ].join('\n')
}

export function formatReport(result) {
  const { name, failure, seed, numRuns } = result
  return `# ${name}

The subject and the reference disagree on this input.

## Smallest failing input

\`\`\`js
${fc.stringify(failure.input)}
\`\`\`

| | Outcome |
|---|---|
| Subject | \`${describe(failure.subject).replaceAll('`', '\\`')}\` |
| Reference | \`${describe(failure.reference).replaceAll('`', '\\`')}\` |

## Reproduce

Re-run the same check with:

\`\`\`js
{ seed: ${seed}, path: ${JSON.stringify(failure.path)} }
\`\`\`

Found after up to ${numRuns} generated inputs and ${failure.numShrinks} shrink steps.
`
}

export function writeReport(dir, slug, result) {
  if (!dir) return undefined
  mkdirSync(dir, { recursive: true })
  const file = join(dir, `${slug}.md`)
  writeFileSync(file, formatReport(result))
  return file
}
