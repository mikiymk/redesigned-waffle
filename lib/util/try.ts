import { clone, setPosition } from "../core/reader";

import type { Parser } from "./parser";

/**
 * 失敗した場合にリーダーの位置を進めないようにします。
 * @param parser 読み込み用パーサー
 * @returns 読み込み用パーサーで読み込みます。
 */
export const tryParse = <T>(parser: Parser<T>): Parser<T> => {
  return (pr) => {
    const cloned = clone(pr);

    const [ok, value] = parser(cloned);

    if (ok) {
      setPosition(pr, cloned);

      return [true, value];
    }

    return [false, value];
  };
};
