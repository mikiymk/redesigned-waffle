import { EOF, get, clone, setPosition } from "../core/reader";

import { ParseCharError } from "./errors";

import type { Parser } from "./parser";

type StringLength<T extends string, L extends unknown[] = []> = T extends ""
  ? L["length"]
  : T extends `${infer F}${infer R}`
  ? StringLength<R, [F, ...L]>
  : never;
type Char<T extends string> = StringLength<T> extends 1 ? T : "Char type to a string with a length of 1";

type CharParser = {
  (min: number, max: number): Parser<string>;
  <T extends string, U extends string>(min: Char<T>, max: Char<U>): Parser<string>;
};

/**
 * UTF-16 で min <= char <= max の１文字を読み込むパーサー関数を作ります。
 * @param min 最小文字コード
 * @param max 最大文字コード
 * @returns １文字を読み込むパーサー関数
 */
export const char: CharParser = (min: number | string, max: number | string): Parser<string> => {
  return (pr) => {
    const minCode = typeof min === "number" ? min : min.codePointAt(0) ?? 0;
    const maxCode = typeof max === "number" ? max : max.codePointAt(0) ?? 0;
    const cloned = clone(pr);

    const char = get(cloned);
    if (char === EOF) {
      return [false, new Error("reach to end of string")];
    }

    const charCode = char.codePointAt(0);
    if (charCode === undefined) {
      return [false, new Error("next char is not character")];
    }

    if (charCode && minCode <= charCode && charCode <= maxCode) {
      setPosition(pr, cloned);
      return [true, char];
    }

    return [false, new ParseCharError(minCode, maxCode, char)];
  };
};
