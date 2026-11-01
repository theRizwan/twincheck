# Contributing to twincheck

Thanks for helping. Small, focused pull requests are the easiest to review and merge.

## Finding something to work on

- Issues labelled [`good first issue`](https://github.com/theRizwan/twincheck/labels/good%20first%20issue) are small and
  describe exactly what to change and how to check it.
- Comment on the issue before you start, so two people don't do the same work. If you go quiet for two weeks, the
  issue is open to others again.
- For anything bigger, such as a new pack, open an issue first to agree on the shape.

## Setup

Node 20 or newer.

```bash
git clone https://github.com/<you>/twincheck.git
cd twincheck
npm install
npm test
```

`npm run history` runs the `string-edit` pack against several magic-string releases and is a good way to see the tool
in action.

## Pull requests

- One change per pull request, with a test that fails before it and passes after.
- Keep the style of the surrounding code: ES modules, no semicolons, single quotes, two-space indent.
- If you change the public API, update `index.d.ts` and the README in the same pull request.
- Link the issue in the description (`Fixes #3`).

## Writing a pack

A pack is one file in `src/packs/` that takes the library under test and returns an array of specs, each with a
`name`. Look at `src/packs/string-edit.js`. Keep inputs small (short strings, small alphabets), because that is where
edge cases live and it keeps shrunk examples readable.

If a pack finds a real bug in another project, report it to that project before mentioning it here.

## Licence

By contributing you agree that your work is released under the MIT licence of this project.

## Releasing (maintainers)

1. Move the **Unreleased** entries in `CHANGELOG.md` under a new heading, `## x.y.z (YYYY-MM-DD)`, and commit.
2. `npm version x.y.z` (bumps `package.json`, commits and creates the `vx.y.z` tag).
3. `npm publish`
4. `git push --follow-tags`

Pushing the tag runs `.github/workflows/release.yml`, which creates the GitHub release from that version's changelog
section. It fails if the tag and `package.json` disagree or the changelog has no section for the version.
