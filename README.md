# twincheck

**Find the inputs where your library disagrees with the thing it is supposed to match.**

twincheck runs your function and a trusted reference side by side on generated inputs. When they disagree, it shrinks
the input to the smallest failing case, saves it so the next run tries it first, and writes a report you can paste
into an issue.

```bash
npm install --save-dev twincheck fast-check
```

```js
import { twin } from 'twincheck'
import MagicString from 'magic-string'

twin('replace(string, string) matches String.prototype.replace', {
  input: fc => fc.tuple(fc.string(), fc.string({ minLength: 1 }), fc.string()),
  subject: ([text, find, repl]) => new MagicString(text).replace(find, repl).toString(),
  reference: ([text, find, repl]) => text.replace(find, repl),
})
```

`twin()` throws on the first disagreement, so it works inside any test runner (`node:test`, Vitest, Jest, Mocha).
`check()` does the same work and returns the result instead of throwing.

## What it found

The bundled `string-edit` pack, run against past magic-string releases (`npm run history`):

```text
magic-string 1.2.3
  ✗ replace(string, string) matches String.prototype.replace
    smallest failing input: ["a","a","$&"]
    subject:   "$&"
    reference: "a"
  ✗ replace(regex, fn) passes the replacer the same arguments as String.prototype.replace
    smallest failing input: ["","a*",""]
    subject:   "[\"\",0,\"\",null]"
    reference: "[\"\",0,\"\"]"
```

- On **1.2.3** it rediscovers two bugs fixed in 1.3.1: `$` patterns not being expanded in replacements ([#340](https://github.com/Rich-Harris/magic-string/pull/340)) and
  the replacer receiving an extra `undefined` argument ([#342](https://github.com/Rich-Harris/magic-string/pull/342)).
- **1.4.3** passes the whole pack.
- On **1.4.4 and 1.4.5** it finds a regression: an empty match in an empty string is dropped, so
  `new MagicString('').replace(/x?/, 'b')` gives `''` where `''.replace(/x?/, 'b')` gives `'b'`.

## How it compares

- Each side runs on its own copy of the input, so one cannot change what the other sees.
- Return values are compared with `util.isDeepStrictEqual` (or your `equals`). If both sides throw, they agree when
  the error types match; messages are not compared.
- `normalize` is applied to both return values first, for differences that do not matter (whitespace, key order).

## Known differences

Libraries sometimes differ from their reference on purpose. Write those cases down instead of loosening the check:

```js
twin('parse matches JSON.parse', {
  input: fc => fc.json(),
  subject: text => myParse(text),
  reference: text => JSON.parse(text),
  allow: [{ reason: 'returns BigInt for integers above 2^53', when: (text, s) => typeof s.value === 'bigint' }],
})
```

The run fails only on new disagreements, and `result.allowedHits` counts how often each reason applied.

## Reports and the regression corpus

On a failure, twincheck writes `.twincheck/reports/<check>.md` with the smallest input, both outcomes, and the
`seed` and `path` that replay it. The input is also saved to `.twincheck/corpus/<check>.json` and tried first on
every later run, so a fixed bug stays fixed. Set `reportDir: false` or `corpusDir: false` to turn either off.

## Options

| Option | Default | |
|---|---|---|
| `input` | required | fast-check arbitrary, or `fc => arbitrary` |
| `subject`, `reference` | required | functions of the input |
| `normalize` | identity | applied to both return values |
| `equals` | `util.isDeepStrictEqual` | value comparison |
| `allow` | `[]` | known differences: `{ reason, when(input, subject, reference) }` |
| `numRuns` | `1000` | generated inputs per run |
| `seed`, `path` | random | replay a previous run |
| `corpusDir` | `.twincheck/corpus` | `false` to disable |
| `reportDir` | `.twincheck/reports` | `false` to disable |

## Packs

A pack is a list of ready-made checks for one kind of library.

```js
import MagicString from 'magic-string'
import { twin } from 'twincheck'
import { stringEdit } from 'twincheck/packs/string-edit'

for (const spec of stringEdit(MagicString)) twin(spec.name, spec)
```

| Pack | Checks |
|---|---|
| `string-edit` | `replace` and `replaceAll` with strings and regexes, including `$` patterns, empty matches and the replacer's arguments, against `String.prototype` |

More packs are planned (source maps, stack trace parsers, CSS selector parsers). New packs are welcome: a pack is one
file that returns specs.

## Status

0.1, pre-release. Built on [fast-check](https://fast-check.dev), which does the generation and shrinking.

## Licence

MIT
