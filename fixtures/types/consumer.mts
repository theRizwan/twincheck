import { agrees, check, describe, formatReport, formatSummary, twin, TwinMismatchError } from 'twincheck'
import type { Outcome, TwinResult, TwinSpec } from 'twincheck'
import { stringEdit } from 'twincheck/packs/string-edit'
import type { NamedSpec } from 'twincheck/packs/string-edit'
import MagicString from 'magic-string'

// @ts-expect-error Core functions are not exported by the pack at runtime.
import { check as packCheck } from 'twincheck/packs/string-edit'

const specs: NamedSpec<any>[] = stringEdit(MagicString)
for (const spec of specs) {
  const name: string = spec.name
  const result: TwinResult<any> = check(name, spec)
  twin(name, spec)
  formatReport(result)
  formatSummary(result)
}

const spec: TwinSpec<string> = {
  input: fc => fc.string(),
  subject: value => value.toUpperCase(),
  reference: value => value.toUpperCase(),
}
const result: TwinResult<string> = check('uppercase', spec)
const error: TwinMismatchError<string> = new TwinMismatchError()
error.result = result
const outcome: Outcome = { kind: 'value', value: 'ok' }
const equal: boolean = agrees(outcome, outcome)
const description: string = describe(outcome)

// @ts-expect-error The pack needs a constructor accepting a source string.
stringEdit(123)
// @ts-expect-error Spec names remain strings rather than any.
const invalidName: number = specs[0].name

void [packCheck, equal, description, invalidName]
