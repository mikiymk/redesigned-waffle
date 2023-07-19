import { EOF, get, peek } from "../core/reader";

import type { BaseToken, TerminalToken } from "./base-token";
import type { ReferenceToken } from "./reference-token";
import type { ParseReader } from "../core/reader";
import type { Result } from "../util/parser";

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
