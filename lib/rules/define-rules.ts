/**
 * @file
 */

import { EmptyToken } from "./empty-token";
import { EOFToken } from "./eof-token";
import { ReferenceToken } from "./reference-token";
import { Rule } from "./rule";
import { WordToken } from "./word-token";

import type { Tree } from "../parser/tree";

/**
 * 言語の構文
 */
export type Syntax<T> = Rule<T>[];

/**
 * 構文の名前付きルール
 */
export type RuleName = string | symbol;

export type SyntaxToken = WordToken | ReferenceToken | EmptyToken;
export type FirstSetToken = WordToken | EmptyToken;
export type FollowSetToken = WordToken | EOFToken;
export type DirectorSetToken = WordToken | EOFToken;
export type LR0ItemToken = WordToken | ReferenceToken;
export type TermToken = WordToken;
export type NonTermToken = ReferenceToken;

export type Token = WordToken | ReferenceToken | EmptyToken | EOFToken;

/**
 * 構文用のルールを作る
 * @param name ルール名
 * @param tokens ルールのトークン列
 * @param process 変換する関数
 * @returns ルールオブジェクト（タグ付きタプル）
 */
export const rule: {
  (name: string, tokens: SyntaxToken[]): Rule<undefined>;
  <T>(name: string, tokens: SyntaxToken[], process?: (children: Tree<T>[]) => T): Rule<T>;
} = <T>(name: string, tokens: SyntaxToken[], process?: (children: Tree<T>[]) => T): Rule<T> => {
  return new Rule(name, tokens, process);
};

/**
 * 特定のキーワードのトークンを作る
 * @param type キーワードタイプ
 * @param word キーワード
 * @returns ルール用トークン
 */
export const word = (type: string, word: string): WordToken => {
  return new WordToken(type, word);
};

/**
 * 他のルールのトークンを作る
 * @param terminal ルール名
 * @returns ルール用トークン
 */
export const reference = (terminal: string | symbol): ReferenceToken => {
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
export const equalsRule = <T>(rule1: Rule<T>, rule2: Rule<T>): boolean => {
  return rule1.equals(rule2);
};
