import { clone, setPosition } from "../core/reader";

import type { Parser } from "./parser";

type ParserValuesTuple<Ps extends Parser<unknown>[]> = {
  [K in keyof Ps]: Ps[K] extends Parser<infer R> ? R : never;
};

/**
 * 複数のパーサーを順番に試し、最後まで正常にパースできた場合に結果を返すパーサーを作ります。
 * @param parsers パーサーのリスト
 * @returns リストを順番に読み込むパーサー
 */
export const seq = <Ps extends Parser<unknown>[]>(...parsers: Ps): Parser<ParserValuesTuple<Ps>> => {
  return (pr) => {
    const result = [];
    const cloned = clone(pr);

    for (const parser of parsers) {
      const [ok, value] = parser(cloned);
      if (!ok) {
        return [false, value];
      }

      result.push(value);
    }

    setPosition(pr, cloned);
    return [true, result as ParserValuesTuple<Ps>];
  };
};
