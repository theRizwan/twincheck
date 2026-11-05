# Vitest example

Run from the repository root with Node 20.19+ or 22.12+ (including Node 24):

```bash
cd examples/vitest
npm install
npx vitest run
```

Or run `npm test` in this folder. The test calls `twin()` inside Vitest's `test()`;
it compares a clamp function with a separate reference on generated integers.

The dependency `"twincheck": "file:../.."` uses this checkout. The local `.npmrc`
sets `install-links=true` so npm installs a copy instead of a symlink. This lets
the example resolve its own `fast-check` dependency without a root install.
After changing twincheck itself, run `npm ci` here to refresh that copy.

To try a failing check, replace the `clamp` body with the deliberately wrong
`Math.min(100, value)` suggested in the comment, then run the test again. A
negative value is no longer clamped to zero, so `twin()` throws a
`TwinMismatchError` and Vitest fails the test. Restore the original body afterward.

The failure includes the shrunk input and both outcomes:

```text
TwinMismatchError: ✗ clamp to 0..100
  smallest failing input: -1
  subject:   -1
  reference: 0
```

The fixed seed makes the demonstration repeatable. Corpus and report files are
disabled to keep the example self-contained.
