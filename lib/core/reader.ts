export const EOF = Symbol("EOF");
export type EOF = typeof EOF;

const Source = Symbol("source");
const Position = Symbol("position");

export type ParseReader = {
  readonly [Source]: string;
  [Position]: number;
};

/**
 * 文字列から読み込み用オブジェクトを作成します。
 * @param source パースする文字列
 * @returns パーサー用読み込み可能オブジェクト
 */
export const fromString = (source: string): ParseReader => {
  return {
    [Source]: source,
    [Position]: 0,
  };
};

/**
 * 読み込みオブジェクトから１文字を読み込み、読み込み位置を１つ進めます。
 * @param pr パーサー読み込みオブジェクト
 * @returns 読み込んだ１文字。読み込みが終わりの場合、EOF
 */
export const get = (pr: ParseReader): string | EOF => {
  const char = pr[Source][pr[Position]++];

  return char ?? EOF;
};

/**
 * パーサー読み込みオブジェクトを複製します。
 * ソース文字列は同一ですが、一方を読み進めたとき、もう一方の読み込み位置は変わりません。
 * @param pr パーサー読み込みオブジェクト
 * @returns 複製された読み込みオブジェクト
 */
export const clone = (pr: ParseReader): ParseReader => {
  return {
    [Source]: pr[Source],
    [Position]: pr[Position],
  };
};

/**
 * 複製されたパーサー読み込みオブジェクトの位置を元のオブジェクトに反映します。
 * @param base 位置を変更する読み込みオブジェクト
 * @param moveTo 新しい位置にある読み込みオブジェクト
 */
export const setPosition = (base: ParseReader, moveTo: ParseReader) => {
  base[Position] = moveTo[Position];
};
