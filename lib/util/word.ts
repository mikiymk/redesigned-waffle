import type { Parser, Result } from "./parser";
import type { ParseReader } from "../reader";

import { EOF, clone, get, setPosition } from "../reader";

export class ParseWordError extends Error {
  constructor(expected: string, actual: string) {
    super(`The parser expected "${expected}", but encountered "${actual}" instead.`);
  }
}

export const word =
  <T extends string>(word: T): Parser<T> =>
  (pr: ParseReader): Result<T> => {
    const readChars = [];
    const cloned = clone(pr);

    for (const _ of word) {
      const readChar = get(cloned);

      if (readChar === EOF) {
        return [false, new Error("reach to end of string")];
      }

      readChars.push(readChar);
    }

    const readString = readChars.join("");

    if (word === readString) {
      setPosition(pr, cloned);
      return [true, readString as T];
    }

    return [false, new ParseWordError(word, readString)];
  };
