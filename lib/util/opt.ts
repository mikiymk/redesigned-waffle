import { clone, setPosition } from "../core/reader";

import type { Parser } from "./parser";

/**
 * パーサーを受け取り、１つ読み込むか読み込まないパーサーを作ります。
 * @param parser 読み込む場合のパーサー
 * @returns オプションで読み込むパーサー
 */
export const opt = <T>(parser: Parser<T>): Parser<T | undefined> => {
  return (pr) => {
    const cloned = clone(pr);
    const [ok, value] = parser(cloned);

    if (ok) {
      setPosition(pr, cloned);
      return [true, value];
    }

    return [true, undefined];
  };
};
