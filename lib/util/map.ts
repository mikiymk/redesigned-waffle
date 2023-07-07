import type { Parser } from "./parser";

/**
 * パーサーが成功した場合、パース結果のかわりに指定した値を返します。
 * @param parser 読み込みをするパーサー
 * @param alterValue 返す値
 * @returns 値を返すパーサー
 */
export const as = <T, const U>(parser: Parser<T>, alterValue: U): Parser<U> => {
  return (pr) => {
    const [ok, value] = parser(pr);

    return ok ? [true, alterValue] : [false, value];
  };
};

/**
 * パーサーが成功した場合、パース結果を加工した値を返します。
 * @param parser 読み込みをするパーサー
 * @param mapFunction 加工する関数
 * @returns 加工した値を返すパーサー
 */
export const map = <T, U>(parser: Parser<T>, mapFunction: (value: T) => U): Parser<U> => {
  return (pr) => {
    const [ok, value] = parser(pr);

    return ok ? [true, mapFunction(value)] : [false, value];
  };
};
