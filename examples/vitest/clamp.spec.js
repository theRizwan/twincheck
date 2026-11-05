import { test } from 'vitest'
import { twin } from 'twincheck'

// Try Math.min(100, value) here to see twincheck find a negative input.
const clamp = value => Math.min(100, Math.max(0, value))

test('clamp agrees with a reference implementation', () => {
  twin('clamp to 0..100', {
    input: fc => fc.integer({ min: -1000, max: 1000 }),
    subject: clamp,
    reference: value => {
      if (value < 0) return 0
      if (value > 100) return 100
      return value
    },
    seed: 42,
    corpusDir: false,
    reportDir: false,
  })
})
