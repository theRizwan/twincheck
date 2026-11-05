import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const diagnostics = fixture => {
  const program = ts.createProgram([fileURLToPath(new URL(`../fixtures/types/${fixture}`, import.meta.url))], {
    noEmit: true,
    strict: true,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
  })
  return ts.getPreEmitDiagnostics(program)
}

test('the root entry point rejects stringEdit', () => {
  const errors = diagnostics('root-string-edit.mts')
  assert.equal(errors.length, 1, ts.formatDiagnosticsWithColorAndContext(errors, {
    getCanonicalFileName: name => name,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => '\n',
  }))
  assert.equal(errors[0].code, 2305)
  assert.match(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n'), /stringEdit/)
})

test('the pack and core entry points have separate, usable types', () => {
  const errors = diagnostics('consumer.mts')
  assert.deepEqual(errors.map(error => ts.flattenDiagnosticMessageText(error.messageText, '\n')), [])
})
