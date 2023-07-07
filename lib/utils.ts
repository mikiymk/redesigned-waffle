import { clone, setPosition } from "./core/reader";

import type { ParseReader } from "./core/reader";
import type { Parser, Result } from "./util/parser";

export const $0orMore = <T>(parser: Parser<T>) => $NtoM(parser, 0, Number.POSITIVE_INFINITY);
export const $1orMore = <T>(parser: Parser<T>) => $NtoM(parser, 1, Number.POSITIVE_INFINITY);

const $NtoM =
  <T>(parser: Parser<T>, n: number, m: number) =>
  (pr: ParseReader): Result<T[]> => {
    const result = [];
    const cloned = clone(pr);

    for (let index = 0; index < n; index++) {
      const [contOk, cont] = parser(cloned);

      if (!contOk) {
        return [false, new Error(`not reached ${n}`, { cause: cont })];
      }

      result.push(cont);
    }

    for (let index = 0; index < m - n; index++) {
      const [contOk, cont] = parser(cloned);

      if (!contOk) {
        break;
      }

      result.push(cont);
    }

    setPosition(pr, cloned);
    return [true, result];
  };

export const $while =
  <T, U>(parser: Parser<T>, endParser: Parser<U>): Parser<[T[], U]> =>
  (pr) => {
    const result = [];
    const cloned = clone(pr);

    for (;;) {
      const [ok, value] = parser(cloned);

      if (!ok) {
        return [false, value];
      }

      result.push(value);

      const endReader = clone(cloned);
      const [endOk, endValue] = endParser(endReader);

      if (endOk) {
        setPosition(pr, endReader);
        return [true, [result, endValue]];
      }
    }
  };
