import { ParseEitherError } from "./errors";
import { tryParse } from "./try";

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
    const errors: Error[] = [];
    for (const parser of parsers) {
      const [ok, value] = tryParse(parser)(pr);

      if (ok) {
        return [true, value as ParserValuesUnion<Ps>];
      }

      errors.push(value);
    }

    return [false, new ParseEitherError(errors)];
  };
};
