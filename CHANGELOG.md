# Changelog

Each release is listed here and on [GitHub Releases](https://github.com/theRizwan/twincheck/releases). Add entries under
**Unreleased** as changes land, and credit contributors by their GitHub username.

## Unreleased

## 0.1.1 (2026-11-01)

- The Markdown report keeps an outcome containing `|` or a line break inside its table cell (#2, #7 by @bfs2021).

## 0.1.0 (2026-10-29)

First release.

- `twin()` and `check()`: run a subject and a reference on fast-check inputs, compare return values and thrown errors,
  and shrink any disagreement to the smallest failing input.
- `allow` for documenting intended differences, with a count of how often each one applied.
- Markdown report and a JSON regression corpus for each failing check.
- `string-edit` pack: `replace` and `replaceAll` against `String.prototype`. Run against past magic-string releases, it
  finds two bugs fixed in 1.3.1 and a regression in 1.4.4 and 1.4.5 (fix proposed in magic-string#384).
