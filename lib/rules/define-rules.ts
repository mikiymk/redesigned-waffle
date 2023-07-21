/**
 * @file
 */

import { CharToken } from "./char-token";
import { EmptyToken } from "./empty-token";
import { EOFToken } from "./eof-token";
import { ReferenceToken } from "./reference-token";
import { WordToken } from "./word-token";

/**
 * 言語の構文
 */
export type Syntax = Rule[];
export type AugmentedSyntax = AugmentedRule[];

/**
 * 構文の名前付きルール
 */
export type Rule = [string, SyntaxToken[]];
export type AugmentedRule = [string | symbol, SyntaxToken[]];

export type SyntaxToken = WordToken | CharToken | ReferenceToken | EmptyToken;
export type FirstSetToken = WordToken | CharToken | EmptyToken;
export type FollowSetToken = WordToken | CharToken | EOFToken;
export type DirectorSetToken = WordToken | CharToken | EOFToken;
export type LR0ItemToken = WordToken | CharToken | ReferenceToken;
export type TermToken = WordToken | CharToken;
export type NonTermToken = ReferenceToken;

export type Token = WordToken | CharToken | ReferenceToken | EmptyToken | EOFToken;

/**
 * 構文用のルールを作る
 * @param name ルール名
 * @param tokens ルールのトークン列
 * @returns ルールオブジェクト（タグ付きタプル）
 */
export const rule = (name: string, ...tokens: SyntaxToken[]): Rule => {
  if (name.length === 0) {
    throw new Error(`name length must 1 or greater. received: "${name}"`);
  }

  if (tokens.length === 0) {
    throw new Error(`rule token length must 1 or greater. received: ${tokens.length} items`);
  }

  if (tokens.includes(empty) && tokens.length !== 1) {
    throw new Error(`rule token length, including empty tokens, must be 1. received: ${tokens.length} items`);
  }

  return [name, tokens];
};

/**
 * 特定のキーワードのトークンを作る
 * @param word キーワード
 * @returns ルール用トークン
 */
export const word = (word: string): WordToken => {
  return new WordToken(word);
};

type StringLength<T extends string, L extends unknown[] = []> = T extends ""
  ? L["length"]
  : T extends `${infer F}${infer R}`
  ? StringLength<R, [F, ...L]>
  : never;
type StringChar<T extends string> = StringLength<T> extends 1 ? T : never;

/**
 * 特定のUnicodeコードポイント範囲にある文字のトークンを作る
 * @param min その数を含む最小コードポイント
 * @param max その数を含む最大コードポイント
 * @returns ルール用トークン
 */
export const char = <T extends string, U extends string>(min: StringChar<T>, max: StringChar<U>): CharToken => {
  return new CharToken(min, max);
};

/**
 * 他のルールのトークンを作る
 * @param terminal ルール名
 * @returns ルール用トークン
 */
export const reference = (terminal: string): ReferenceToken => {
  return new ReferenceToken(terminal);
};

/**
 * 空のトークン
 */
export const empty: EmptyToken = new EmptyToken();
export const eof: EOFToken = new EOFToken();

/**
 * 2つのルールを比較します
 * @param rule1 ルール
 * @param rule2 ルール
 * @returns 2つのルールが等しいなら`true`
 */
export const equalsRule = (rule1: Rule, rule2: Rule): boolean => {
  return (
    rule1[0] === rule2[0] &&
    rule1[1].length === rule2[1].length &&
    rule1[1].every((value, index) => rule2[1][index]?.equals(value))
  );
};
