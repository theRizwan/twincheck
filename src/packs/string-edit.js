// Checks for string editors that promise to behave like String.prototype, such as magic-string.
// Pass the library's constructor; each entry is a spec ready for twin() or check().
//
//   import MagicString from 'magic-string'
//   import { stringEdit } from 'twincheck/packs/string-edit'
//   for (const spec of stringEdit(MagicString)) twin(spec.name, spec)

// A two-letter alphabet makes matches, overlaps and empty matches common.
const text = fc => fc.string({ unit: fc.constantFrom('a', 'b'), maxLength: 12 })

// Replacement strings built from the special $ patterns String.prototype.replace understands.
const replacement = fc =>
  fc
    .array(fc.constantFrom('$&', '$$', '$`', "$'", '$1', '$2', '$<x>', '$', 'a', 'b', 'x'), { maxLength: 5 })
    .map(parts => parts.join(''))

const patterns = ['a', 'b', 'ab', '(a)', '(a)(b)?', '(?<x>a)', '(?<x>a)(b)?', 'a*', '(?:)']

export function stringEdit(MagicString) {
  const edit = source => new MagicString(source)

  return [
    {
      name: 'replace(string, string) matches String.prototype.replace',
      input: fc => fc.tuple(text(fc), fc.string({ unit: fc.constantFrom('a', 'b'), minLength: 1, maxLength: 3 }), replacement(fc)),
      subject: ([source, find, repl]) => edit(source).replace(find, repl).toString(),
      reference: ([source, find, repl]) => source.replace(find, repl),
    },
    {
      name: 'replaceAll(string, string) matches String.prototype.replaceAll',
      input: fc => fc.tuple(text(fc), fc.string({ unit: fc.constantFrom('a', 'b'), minLength: 1, maxLength: 3 }), replacement(fc)),
      subject: ([source, find, repl]) => edit(source).replaceAll(find, repl).toString(),
      reference: ([source, find, repl]) => source.replaceAll(find, repl),
    },
    {
      name: 'replace(regex, string) matches String.prototype.replace',
      input: fc => fc.tuple(text(fc), fc.constantFrom(...patterns), fc.constantFrom('', 'g'), replacement(fc)),
      subject: ([source, pattern, flags, repl]) => edit(source).replace(new RegExp(pattern, flags), repl).toString(),
      reference: ([source, pattern, flags, repl]) => source.replace(new RegExp(pattern, flags), repl),
    },
    {
      // The replacer receives the match, groups, offset, whole string and (only with named groups) the groups object.
      name: 'replace(regex, fn) passes the replacer the same arguments as String.prototype.replace',
      input: fc => fc.tuple(text(fc), fc.constantFrom(...patterns), fc.constantFrom('', 'g')),
      subject: ([source, pattern, flags]) =>
        edit(source).replace(new RegExp(pattern, flags), (...args) => JSON.stringify(args)).toString(),
      reference: ([source, pattern, flags]) =>
        source.replace(new RegExp(pattern, flags), (...args) => JSON.stringify(args)),
    },
  ]
}
