/**
 * @file
 */

/**
 * 言語の構文
 */
export type Syntax = Rule[];

/**
 * 構文の名前付きルール
 */
export type Rule = [string, SyntaxToken[]];

/**
 * ルール用のトークン
 */
type WordToken = ["word", string];
type CharToken = ["char", number, number];
type ReferenceToken = ["ref", string];
type EmptyToken = ["epsilon"];
type EOFToken = ["eof"];

export type SyntaxToken = WordToken | CharToken | ReferenceToken | EmptyToken;
export type FirstSetToken = WordToken | CharToken | EmptyToken;
export type FollowSetToken = WordToken | CharToken | EOFToken;
export type DirectorSetToken = WordToken | CharToken | EOFToken;
export type LR0ItemToken = WordToken | CharToken | ReferenceToken;

export type Token = WordToken | CharToken | ReferenceToken | EmptyToken | EOFToken;

/**
 * 構文用のルールを作る
 * @param name ルール名
 * @param tokens ルールのトークン列
 * @returns ルールオブジェクト（タグ付きタプル）
 */
export const rule = (name: string, ...tokens: SyntaxToken[]): Rule => {
  if (tokens.length === 0) {
    throw new Error(`word length must be greater than or equal to 1. received: ${tokens.length} items`);
  }

  return [name, tokens];
};

/**
 * 特定のキーワードのトークンを作る
 * @param word キーワード
 * @returns ルール用トークン
 */
export const word = (word: string): WordToken => {
  if (word.length === 0) {
    throw new Error(`word length must be greater than or equal to 1. received: ${word}(${word.length})`);
  }

  return ["word", word];
};

type StringLength<T extends string, L extends unknown[] = []> = T extends ""
  ? L["length"]
  : T extends `${infer F}${infer R}`
  ? StringLength<R, [F, ...L]>
  : never;
type StringChar<T extends string> = StringLength<T> extends 1 ? T : "Char type to a string with a length of 1";

/**
 * 特定のUnicodeコードポイント範囲にある文字のトークンを作る
 * @param min その数を含む最小コードポイント
 * @param max その数を含む最大コードポイント
 * @returns ルール用トークン
 */
export const char = <T extends string, U extends string>(min: StringChar<T>, max: StringChar<U>): CharToken => {
  if (min.length !== 1 || max.length !== 1) {
    throw new Error(`"${min}" and "${max}" needs length at 1.`);
  }

  const minCode = min.codePointAt(0);
  const maxCode = max.codePointAt(0);

  if (minCode === undefined || maxCode === undefined) {
    throw new Error(`"${min}" and "${max}" needs length at 1.`);
  }

  return ["char", minCode, maxCode];
};

/**
 * 他のルールのトークンを作る
 * @param terminal ルール名
 * @returns ルール用トークン
 */
export const reference = (terminal: string): ReferenceToken => {
  return ["ref", terminal];
};

/**
 * 空のトークン
 */
export const epsilon: EmptyToken = ["epsilon"];
export const eof: EOFToken = ["eof"];
