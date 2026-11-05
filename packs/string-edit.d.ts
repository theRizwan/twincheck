import type { TwinSpec } from '../index.js'

export interface NamedSpec<T> extends TwinSpec<T> {
  name: string
}

/** Checks that a string editor such as magic-string matches String.prototype. */
export declare function stringEdit(MagicString: new (source: string) => any): NamedSpec<any>[]
