import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import fc from 'fast-check'
import { describe } from './outcome.js'

// Makes a value safe for a Markdown table cell: escapes the pipe that would
// start a new column and line breaks that would end the row.
function tableCell(value) {
  return value
    .replaceAll('|', '\\|')
    .replace(/\r\n?|\n/g, ' ')
}

// Wraps a value in a Markdown code span. Backslash escapes do not work inside
// code spans, so the fence uses one more backtick than the longest backtick
// run in the value, and a space is padded on each side when the value starts
// or ends with a backtick.
function codeSpan(value) {
  const longest = Math.max(0, ...(value.match(/`+/g) ?? []).map(run => run.length))
  const fence = '`'.repeat(longest + 1)
  const pad = value.startsWith('`') || value.endsWith('`') ? ' ' : ''
  return `${fence}${pad}${tableCell(value)}${pad}${fence}`
}

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
| Subject | ${codeSpan(describe(failure.subject))} |
| Reference | ${codeSpan(describe(failure.reference))} |

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
