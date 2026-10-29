import { isDeepStrictEqual } from 'node:util'
import fc from 'fast-check'

// Runs fn on a private copy of the input so neither side can change what the other sees.
export function capture(fn, input, normalize) {
  try {
    return { kind: 'value', value: normalize(fn(copy(input))) }
  } catch (error) {
    return {
      kind: 'throw',
      name: error?.constructor?.name ?? typeof error,
      message: error?.message ?? String(error),
    }
  }
}

// Two outcomes agree when both returned equal values, or both threw the same kind of error.
// Error messages are not compared: libraries rarely promise to match a reference's wording.
export function agrees(a, b, equals = isDeepStrictEqual) {
  if (a.kind !== b.kind) return false
  if (a.kind === 'throw') return a.name === b.name
  return equals(a.value, b.value)
}

export function describe(outcome) {
  return outcome.kind === 'value'
    ? fc.stringify(outcome.value)
    : `throws ${outcome.name}: ${outcome.message}`
}

function copy(value) {
  try {
    return structuredClone(value)
  } catch {
    return value
  }
}
