type Success<T> = readonly [isSuccess: true, value: T];
type Failure<E extends Error> = readonly [isSuccess: false, value: E];
export type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

export const EOF = Symbol("EOF");
export type EOF = typeof EOF;

type ParseToken = { type: string; value: string };
export type ParseReader = Iterator<ParseToken, EOF> & {
  peek(...nextArguments: [] | [undefined]): IteratorResult<ParseToken, EOF>;
};

/**
 * 読み込みオブジェクトから１文字を読み込み、読み込み位置を１つ進めます。
 * @param pr パーサー読み込みオブジェクト
 * @returns 読み込んだ１文字。読み込みが終わりの場合、EOF
 */
export const get = (pr: ParseReader): string | EOF => {
  const value = pr.next().value;
  return value === EOF ? EOF : value.value;
};

/**
 * 読み込みオブジェクトから１文字を読み込みます。
 * @param pr パーサー読み込みオブジェクト
 * @returns 読み込んだ１文字。読み込みが終わりの場合、EOF
 */
export const peek = (pr: ParseReader): string | EOF => {
  const value = pr.peek().value;
  return value === EOF ? EOF : value.value;
};
