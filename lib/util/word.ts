import { EOF, clone, get, setPosition } from "../core/reader";

import { ParseWordError } from "./errors";

import type { Parser, Result } from "./parser";
import type { ParseReader } from "@/lib/core/reader";

/**
 * １つの単語をパースするパーサー関数を作ります
 * @param word 読み込みたい単語
 * @returns パーサー関数
 */
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
