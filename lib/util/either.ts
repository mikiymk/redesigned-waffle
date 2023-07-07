import { clone, setPosition } from "../core/reader";

import { ParseEitherError } from "./errors";

import type { Parser } from "./parser";

/**
 * パーサーのタプルからパーサーが返す値のタプルに変換する型関数
 */
type ParserValuesUnion<Ps extends Parser<unknown>[]> = {
  [K in keyof Ps]: Ps[K] extends Parser<infer R> ? R : never;
}[number];

/**
 * 複数のパーサーを試し、最初に正常にパースできた結果を返すパーサーを作ります。
 * @param parsers パーサーのリスト
 * @returns リストのうちどれかを使って読み込むパーサー
 */
export const either = <Ps extends Parser<unknown>[]>(...parsers: Ps): Parser<ParserValuesUnion<Ps>> => {
  return (pr) => {
    const errors = [];
    for (const parser of parsers) {
      const cloned = clone(pr);
      const [ok, value] = parser(cloned);
      if (ok) {
        setPosition(pr, cloned);
        return [true, value as ParserValuesUnion<Ps>];
      }

      errors.push(value);
    }

    return [false, new ParseEitherError(errors)];
  };
};
