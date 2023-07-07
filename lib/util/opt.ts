import { tryParse } from "./try";

import type { Parser } from "./parser";

/**
 * パーサーを受け取り、１つ読み込むか読み込まないパーサーを作ります。
 * @param parser 読み込む場合のパーサー
 * @returns オプションで読み込むパーサー
 */
export const opt = <T>(parser: Parser<T>): Parser<T | undefined> => {
  return (pr) => {
    const [ok, value] = tryParse(parser)(pr);

    return ok ? [true, value] : [true, undefined];
  };
};
