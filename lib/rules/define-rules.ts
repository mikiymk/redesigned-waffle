/**
 * @file
 */

import { EOF, get, peek } from "../core/reader";

import type { ParseReader } from "../core/reader";
import type { Result } from "../util/parser";

/**
 * 言語の構文
 */
export type Syntax = Rule[];

/**
 * 構文の名前付きルール
 */
export type Rule = [string, SyntaxToken[]];

type BaseToken = {
  /**
   * 終端記号かどうかを判定します。
   * @returns 終端記号なら`true`、非終端記号なら`false`
   */
  isNonTerminal(): boolean;

  /**
   * マップのキー用文字列に変換します。
   * @returns 文字列
   */
  toKeyString(): string;

  /**
   * 表示用文字列に変換します。
   * @returns 文字列
   */
  toString(): string;

  /**
   * 2つのトークンが等しいかどうか調べます
   * @param other もう一つのトークン
   * @returns 等しいなら`true`
   */
  equals(other: BaseToken): boolean;
};

type TerminalToken = {
  /**
   * リーダーからトークンにマッチする文字列を読み込みます
   * @param pr 読み込み機
   * @returns 読み込んだ文字列
   */
  read(pr: ParseReader): Result<string>;

  /**
   * 与えられた文字がこのトークンの最初の文字として有効か判定します。
   * @param char 文字
   * @returns 文字がマッチするか
   */
  matchFirstChar(char: string | EOF): boolean;
};

/**
 * 文字列トークン
 * キーワードや演算子など
 */
export class WordToken implements BaseToken, TerminalToken {
  readonly word;

  /**
   * ワードトークンを作る
   * @param word ワード
   */
  constructor(word: string) {
    if (word.length === 0) {
      throw new Error("word must 1 or more characters");
    }

    this.word = word;
  }

  /**
   * リーダーからトークンにマッチする文字列を読み込みます
   * @param pr 読み込み機
   * @returns 読み込んだ文字列
   */
  read(pr: ParseReader): Result<string> {
    for (const c of this.word) {
      if (peek(pr) === c) {
        get(pr);
      } else {
        return [false, new Error("not word")];
      }
    }

    return [true, this.word];
  }

  /**
   * 与えられた文字がこのトークンの最初の文字として有効か判定します。
   * @param char 文字
   * @returns 文字がマッチするか
   */
  matchFirstChar(char: string | EOF): boolean {
    return char !== EOF && this.word.startsWith(char);
  }

  /**
   * 終端記号かどうかを判定します。
   * @returns 終端記号なら`true`、非終端記号なら`false`
   */
  isNonTerminal(): this is ReferenceToken {
    return false;
  }

  /**
   * マップ用文字列に変換します。
   * @returns 文字列
   */
  toKeyString(): string {
    return `w "${this.word.replaceAll('"', '\\"').replaceAll("\\", "\\\\")}"`;
  }

  /**
   * 表示用文字列に変換します。
   * @returns 文字列
   */
  toString(): string {
    return `word(${this.word})`;
  }

  /**
   * 2つのトークンが等しいかどうか調べます
   * @param other もう一つのトークン
   * @returns 等しいなら`true`
   */
  equals(other: BaseToken): boolean {
    return other instanceof WordToken && other.word === this.word;
  }
}

/**
 * 文字範囲トークン
 * 数字や文字列用
 */
export class CharToken implements BaseToken, TerminalToken {
  readonly min;
  readonly max;

  /**
   * 文字トークンを作る
   * @param min 最小文字
   * @param max 最大文字
   */
  constructor(min: string, max: string) {
    if (min.length !== 1 || max.length !== 1) {
      throw new Error(`"${min}" and "${max}" needs length at 1.`);
    }

    const minCode = min.codePointAt(0);
    const maxCode = max.codePointAt(0);

    if (minCode === undefined || maxCode === undefined) {
      throw new Error(`"${min}" and "${max}" needs length at 1.`);
    }

    this.min = minCode;
    this.max = maxCode;
  }

  /**
   * リーダーからトークンにマッチする文字列を読み込みます
   * @param pr 読み込み機
   * @returns 読み込んだ文字列
   */
  read(pr: ParseReader): Result<string> {
    const char = peek(pr);
    if (char === EOF) return [false, new Error("end of file")];
    const charCode = char.codePointAt(0);

    if (charCode && this.min <= charCode && charCode <= this.max) {
      get(pr);
      return [true, char];
    } else {
      return [false, new Error("not word")];
    }
  }

  /**
   * 与えられた文字がこのトークンの最初の文字として有効か判定します。
   * @param char 文字
   * @returns 文字がマッチするか
   */
  matchFirstChar(char: string | EOF): boolean {
    if (char === EOF) return false;
    const charCode = char.codePointAt(0);

    return charCode !== undefined && this.min <= charCode && charCode <= this.max;
  }

  /**
   * 終端記号かどうかを判定します。
   * @returns 終端記号なら`true`、非終端記号なら`false`
   */
  isNonTerminal(): this is ReferenceToken {
    return false;
  }

  /**
   * マップ用文字列に変換します。
   * @returns 文字列
   */
  toKeyString(): string {
    return `c ${this.min}.${this.max}`;
  }

  /**
   * 表示用文字列に変換します。
   * @returns 文字列
   */
  toString(): string {
    return `char(${this.min}..${this.max})`;
  }

  /**
   * 2つのトークンが等しいかどうか調べます
   * @param other もう一つのトークン
   * @returns 等しいなら`true`
   */
  equals(other: BaseToken): boolean {
    return other instanceof CharToken && other.min === this.min && other.max === this.max;
  }
}

/**
 * 非終端記号トークン
 */
export class ReferenceToken implements BaseToken {
  readonly name;

  /**
   * 非終端記号トークンを作る
   * @param name 参照する名前
   */
  constructor(name: string) {
    if (name.length === 0) {
      throw new Error("rule name must 1 or more characters");
    }

    this.name = name;
  }

  /**
   * 終端記号かどうかを判定します。
   * @returns 終端記号なら`true`、非終端記号なら`false`
   */
  isNonTerminal(): this is ReferenceToken {
    return true;
  }

  /**
   * マップ用文字列に変換します。
   * @returns 文字列
   */
  toKeyString(): string {
    return `r "${this.name.replaceAll('"', '\\"').replaceAll("\\", "\\\\")}"`;
  }

  /**
   * 表示用文字列に変換します。
   * @returns 文字列
   */
  toString(): string {
    return `rule(${this.name})`;
  }

  /**
   * 2つのトークンが等しいかどうか調べます
   * @param other もう一つのトークン
   * @returns 等しいなら`true`
   */
  equals(other: BaseToken): boolean {
    return other instanceof ReferenceToken && other.name === this.name;
  }
}

/**
 * 空文字トークン
 */
export class EmptyToken implements BaseToken, TerminalToken {
  /**
   * リーダーからトークンにマッチする文字列を読み込みます
   * @returns 読み込んだ文字列
   */
  read(): Result<string> {
    return [true, ""];
  }

  /**
   * 与えられた文字がこのトークンの最初の文字として有効か判定します。
   * @returns 文字がマッチするか
   */
  matchFirstChar(): false {
    return false;
  }

  /**
   * 終端記号かどうかを判定します。
   * @returns 終端記号なら`true`、非終端記号なら`false`
   */
  isNonTerminal(): this is ReferenceToken {
    return false;
  }

  /**
   * マップ用文字列に変換します。
   * @returns 文字列
   */
  toKeyString(): string {
    return "e";
  }

  /**
   * 表示用文字列に変換します。
   * @returns 文字列
   */
  toString(): string {
    return "empty";
  }

  /**
   * 2つのトークンが等しいかどうか調べます
   * @param other もう一つのトークン
   * @returns 等しいなら`true`
   */
  equals(other: BaseToken): boolean {
    return other instanceof EmptyToken;
  }
}

/**
 * 文字終了トークン
 */
export class EOFToken implements BaseToken, TerminalToken {
  /**
   * リーダーからトークンにマッチする文字列を読み込みます
   * @param pr 読み込み機
   * @returns 読み込んだ文字列
   */
  read(pr: ParseReader): Result<string> {
    const char = peek(pr);
    if (char === EOF) {
      return [true, ""];
    }
    return [false, new Error("not end of file")];
  }

  /**
   * 与えられた文字がこのトークンの最初の文字として有効か判定します。
   * @param char 文字
   * @returns 文字がマッチするか
   */
  matchFirstChar(char: string | EOF): boolean {
    return char === EOF;
  }

  /**
   * 終端記号かどうかを判定します。
   * @returns 終端記号なら`true`、非終端記号なら`false`
   */
  isNonTerminal(): this is ReferenceToken {
    return false;
  }

  /**
   * マップ用文字列に変換します。
   * @returns 文字列
   */
  toKeyString(): string {
    return "$";
  }

  /**
   * 表示用文字列に変換します。
   * @returns 文字列
   */
  toString(): string {
    return "eof";
  }

  /**
   * 2つのトークンが等しいかどうか調べます
   * @param other もう一つのトークン
   * @returns 等しいなら`true`
   */
  equals(other: BaseToken): boolean {
    return other instanceof EOFToken;
  }
}

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
  if (name.length === 0) {
    throw new Error(`name length must 1 or greater. received: "${name}"`);
  }

  if (tokens.length === 0) {
    throw new Error(`rule token length must 1 or greater. received: ${tokens.length} items`);
  }

  if (tokens.includes(epsilon) && tokens.length !== 1) {
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
export const epsilon: EmptyToken = new EmptyToken();
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
