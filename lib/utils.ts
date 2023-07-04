import { EOF, get, clone, setPosition } from "./reader";

import type { ParseReader } from "./reader";
import type { Parser, Result } from "./util/parser";

export const $charRange =
  (min: number, max: number) =>
  (pr: ParseReader): Result<string> => {
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

export const $0or1 =
  <T>(parser: Parser<T>) =>
  (pr: ParseReader): Result<T | undefined> => {
    const cloned = clone(pr);
    const [ok, value] = parser(cloned);

    if (ok) {
      setPosition(pr, cloned);
      return [true, value];
    }

    return [true, undefined];
  };

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

type ParserValuesUnion<Ps extends Parser<unknown>[]> = {
  [K in keyof Ps]: Ps[K] extends Parser<infer R> ? R : never;
}[number];
export const $switch =
  <Ps extends Parser<unknown>[]>(...conditions: Ps) =>
  (pr: ParseReader): Result<ParserValuesUnion<Ps>> => {
    for (const parser of conditions) {
      const cloned = clone(pr);
      const [ok, value] = parser(cloned);
      if (ok) {
        setPosition(pr, cloned);
        return [true, value as ParserValuesUnion<Ps>];
      }
    }

    return [false, new Error("uncaught condition")];
  };

type ParserValuesTuple<Ps extends Parser<unknown>[]> = {
  [K in keyof Ps]: Ps[K] extends Parser<infer R> ? R : never;
};
export const $seq =
  <Ps extends Parser<unknown>[]>(...parsers: Ps) =>
  (pr: ParseReader): Result<ParserValuesTuple<Ps>> => {
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
