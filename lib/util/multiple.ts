import { clone, setPosition } from "../core/reader";

import { tryParse } from "./try";

import type { Parser } from "./parser";

/**
 * 渡されたパーサーから０回以上の繰り返しを読み込むパーサーを作ります。
 * @param parser 繰り返し読み込むパーサー
 * @returns ０回以上の繰り返しを読み込むパーサー
 */
export const zeroOrMore = <T>(parser: Parser<T>): Parser<T[]> => $NtoM(parser, 0, Number.POSITIVE_INFINITY);

/**
 * 渡されたパーサーから１回以上の繰り返しを読み込むパーサーを作ります。
 * @param parser 繰り返し読み込むパーサー
 * @returns １回以上の繰り返しを読み込むパーサー
 */
export const oneOrMore = <T>(parser: Parser<T>): Parser<T[]> => $NtoM(parser, 1, Number.POSITIVE_INFINITY);

/**
 * 渡されたパーサーからmin回以上、max回以下の繰り返しを読み込むパーサーを作ります。
 * @param parser 繰り返し読み込むパーサー
 * @param min 繰り返しの最小回数
 * @param max 繰り返しの最大回数
 * @returns minからmax回の繰り返しを読み込むパーサー
 */
const $NtoM = <T>(parser: Parser<T>, min: number, max: number): Parser<T[]> => {
  return (pr) => {
    const result = [];
    const cloned = clone(pr);

    for (let index = 0; index < min; index++) {
      const [ok, value] = parser(cloned);

      if (!ok) {
        return [false, new Error(`not reached ${min}`, { cause: value })];
      }

      result.push(value);
    }

    setPosition(pr, cloned);

    for (let index = 0; index < max - min; index++) {
      const [ok, value] = tryParse(parser)(pr);

      if (!ok) {
        break;
      }

      result.push(value);
    }

    return [true, result];
  };
};

/**
 * endParserが成功するまでparserを読み込みます。
 * @param parser 繰り返し読み込むパーサー
 * @param endParser 最後に読み込むパーサー
 * @returns 繰り返した後１回読み込むパーサー
 */
export const until = <T, U>(parser: Parser<T>, endParser: Parser<U>): Parser<[T[], U]> => {
  return (pr) => {
    const result = [];
    const cloned = clone(pr);

    for (;;) {
      const [endOk, endValue] = tryParse(endParser)(cloned);

      if (endOk) {
        setPosition(pr, cloned);
        return [true, [result, endValue]];
      }

      const [ok, value] = parser(cloned);

      if (!ok) {
        return [false, value];
      }

      result.push(value);
    }
  };
};
