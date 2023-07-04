import { EOF, get, clone, setPosition } from "../core/reader";

import type { Parser } from "./parser";

/**
 * UTF-16 で min <= char <= max の１文字を読み込むパーサー関数を作ります。
 * @param min 最小文字コード
 * @param max 最大文字コード
 * @returns １文字を読み込むパーサー関数
 */
export const char =
  (min: number, max: number): Parser<string> =>
  (pr) => {
    const cloned = clone(pr);
    const char = get(cloned);

    if (char === EOF) {
      return [false, new Error("reach to end of string")];
    }

    // eslint-disable-next-line unicorn/prefer-code-point
    const charCode = char.charCodeAt(0);

    if (min <= charCode && charCode <= max) {
      setPosition(pr, cloned);
      return [true, char];
    }

    return [false, new Error(`char ${char}(U+${("000" + charCode.toString(16)).slice(-4)}) is not in range`)];
  };
