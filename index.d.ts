import type fc from 'fast-check'

export type Outcome =
  | { kind: 'value'; value: unknown }
  | { kind: 'throw'; name: string; message: string }

export interface KnownDifference<T> {
  /** Why the subject is allowed to differ here. Shown in results and kept as documentation. */
  reason: string
  when: (input: T, subject: Outcome, reference: Outcome) => boolean
}

export interface TwinSpec<T> {
  /** A fast-check arbitrary, or a function that builds one from fast-check. */
  input: fc.Arbitrary<T> | ((fastCheck: typeof fc) => fc.Arbitrary<T>)
  subject: (input: T) => unknown
  reference: (input: T) => unknown
  /** Applied to both return values before comparing. */
  normalize?: (value: unknown) => unknown
  /** Value equality. Defaults to util.isDeepStrictEqual. */
  equals?: (a: unknown, b: unknown) => boolean
  allow?: KnownDifference<T>[]
  numRuns?: number
  seed?: number
  path?: string
  /** Where failing inputs are saved and replayed from. `false` disables it. Default `.twincheck/corpus`. */
  corpusDir?: string | false
  /** Where Markdown reports are written. `false` disables it. Default `.twincheck/reports`. */
  reportDir?: string | false
}

export interface TwinFailure<T> {
  input: T
  subject: Outcome
  reference: Outcome
  path: string
  numShrinks: number
}

export interface TwinResult<T> {
  name: string
  ok: boolean
  numRuns: number
  seed: number
  allowedHits: Map<string, number>
  failure?: TwinFailure<T>
  reportFile?: string
  savedToCorpus?: boolean
}

export declare class TwinMismatchError<T = unknown> extends Error {
  result: TwinResult<T>
}

export declare function check<T>(name: string, spec: TwinSpec<T>): TwinResult<T>
export declare function twin<T>(name: string, spec: TwinSpec<T>): TwinResult<T>
export declare function agrees(a: Outcome, b: Outcome, equals?: (a: unknown, b: unknown) => boolean): boolean
export declare function describe(outcome: Outcome): string
export declare function formatSummary(result: TwinResult<unknown>): string
export declare function formatReport(result: TwinResult<unknown>): string

export interface NamedSpec<T> extends TwinSpec<T> {
  name: string
}

/** From `twincheck/packs/string-edit`: checks that a string editor such as magic-string matches String.prototype. */
export declare function stringEdit(MagicString: new (source: string) => any): NamedSpec<any>[]
