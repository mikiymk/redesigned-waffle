import { EOF, get, clone, setPosition } from "./core/reader";

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

export const $as =
  <T, const U>(parser: Parser<T>, alterValue: U): Parser<U> =>
  (pr: ParseReader): Result<U> => {
    const [ok, value] = parser(pr);

    return ok ? [true, alterValue] : [false, value];
  };

export const $proc =
  <T, U>(parser: Parser<T>, function_: (value: T) => U): Parser<U> =>
  (pr: ParseReader): Result<U> => {
    const [ok, value] = parser(pr);

    return ok ? [true, function_(value)] : [false, value];
  };

export const $eof: Parser<void> = (pr) => {
  const cloned = clone(pr);

  if (get(cloned) === EOF) {
    setPosition(pr, cloned);
    return [true, undefined];
  }

  return [false, new Error("not end of file")];
};
