import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { isDeepStrictEqual } from 'node:util'
import { join } from 'node:path'

// Failing inputs are kept as JSON and replayed before any generated input on the next run.
// Inputs that do not survive a JSON round trip are not stored.

export function loadCorpus(dir, slug) {
  if (!dir) return []
  try {
    const entries = JSON.parse(readFileSync(join(dir, `${slug}.json`), 'utf8'))
    return Array.isArray(entries) ? entries : []
  } catch {
    return []
  }
}

export function addToCorpus(dir, slug, input) {
  if (!dir) return false
  let roundTripped
  try {
    roundTripped = JSON.parse(JSON.stringify(input))
  } catch {
    return false
  }
  if (!isDeepStrictEqual(roundTripped, input)) return false
  const entries = loadCorpus(dir, slug)
  if (entries.some(entry => isDeepStrictEqual(entry, input))) return true
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, `${slug}.json`), JSON.stringify([...entries, input], null, 2) + '\n')
  return true
}
