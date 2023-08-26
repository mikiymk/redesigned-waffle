/**
 * @file
 */

import { EmptySymbol } from "./empty-symbol";
import { EOFSymbol } from "./eof-symbol";
import { ReferenceSymbol } from "./reference-symbol";
import { Rule } from "./rule";
import { WordSymbol } from "./word-symbol";

import type { Tree } from "../parser/tree";

/**
 * 言語の構文
 */
export type Grammar<T> = Rule<T>[];

/**
 * 構文の名前付きルール
 */
export type RuleName = string | symbol;

export type SyntaxSymbol = WordSymbol | ReferenceSymbol | EmptySymbol;
export type FirstSetSymbol = WordSymbol | EmptySymbol;
export type FollowSetSymbol = WordSymbol | EOFSymbol;
export type DirectorSetSymbol = WordSymbol | EOFSymbol;
export type LR0ItemSymbol = WordSymbol | ReferenceSymbol;
export type TermSymbol = WordSymbol;
export type NonTermSymbol = ReferenceSymbol;

export type RuleSymbol = WordSymbol | ReferenceSymbol | EmptySymbol | EOFSymbol;

/**
 * 構文用のルールを作る
 * @param name ルール名
 * @param symbols ルールのトークン列
 * @param process 変換する関数
 * @returns ルールオブジェクト（タグ付きタプル）
 */
export const rule: {
  (name: string, symbols: SyntaxSymbol[]): Rule<undefined>;
  <T>(name: string, symbols: SyntaxSymbol[], process?: (children: Tree<T>[]) => T): Rule<T>;
} = <T>(name: string, symbols: SyntaxSymbol[], process?: (children: Tree<T>[]) => T): Rule<T> => {
  return new Rule(name, symbols, process);
};

/**
 * 特定のキーワードのトークンを作る
 * @param type キーワードタイプ
 * @param word キーワード
 * @returns ルール用トークン
 */
export const word = (type: string, word?: string): WordSymbol => {
  return new WordSymbol(type, word);
};

/**
 * 他のルールのトークンを作る
 * @param terminal ルール名
 * @returns ルール用トークン
 */
export const reference = (terminal: string | symbol): ReferenceSymbol => {
  return new ReferenceSymbol(terminal);
};

/**
 * 空のトークン
 */
export const empty: EmptySymbol = new EmptySymbol();
export const eof: EOFSymbol = new EOFSymbol();

/**
 * 2つのルールを比較します
 * @param rule1 ルール
 * @param rule2 ルール
 * @returns 2つのルールが等しいなら`true`
 */
export const equalsRule = <T>(rule1: Rule<T>, rule2: Rule<T>): boolean => {
  return rule1.equals(rule2);
};
