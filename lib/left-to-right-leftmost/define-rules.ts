/**
 * @file
 */

/**
 * 言語の構文
 */
export type Syntax = Rule<string>[];

/**
 * 構文の名前付きルール
 */
export type Rule<T extends string> = [T, ...Token[]];

/**
 * ルール用のトークン
 *
 * 別のオブジェクトになるため、分解して作り直さないようにする
 */
export type Token = ["word", string] | ["char", number, number] | ["ref", string] | ["epsilon"];

/**
 * 構文用のルールを作る
 * @param name ルール名
 * @param tokens ルールのトークン列
 * @returns ルールオブジェクト（タグ付きタプル）
 */
export const rule = <T extends string>(name: T, ...tokens: Token[]): Rule<T> => {
  if (tokens.length === 0) {
    throw new Error(`word length must be greater than or equal to 1. received: ${tokens.length} items`);
  }

  return [name, ...tokens];
};

/**
 * 特定のキーワードのトークンを作る
 * @param word キーワード
 * @returns ルール用トークン
 */
export const word = (word: string): ["word", string] => {
  if (word.length === 0) {
    throw new Error(`word length must be greater than or equal to 1. received: ${word}(${word.length})`);
  }

  return ["word", word];
};

/**
 * 特定のUnicodeコードポイント範囲にある文字のトークンを作る
 * @param min その数を含む最小コードポイント
 * @param max その数を含む最大コードポイント
 * @returns ルール用トークン
 */
export const char = (min: number, max: number): ["char", number, number] => {
  return ["char", min, max];
};

/**
 * 他のルールのトークンを作る
 * @param terminal ルール名
 * @returns ルール用トークン
 */
export const reference = (terminal: string): ["ref", string] => {
  return ["ref", terminal];
};

/**
 * 空のトークン
 */
export const epsilon: ["epsilon"] = ["epsilon"];
