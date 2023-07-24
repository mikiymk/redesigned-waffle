import { EOF, get, peek } from "../reader/peekable-iterator";
import { primitiveToString } from "../util/primitive-to-string";

import type { BaseToken, TerminalToken } from "./base-token";
import type { ReferenceToken } from "./reference-token";
import type { ParseReader, Result } from "../reader/peekable-iterator";

/**
 * 文字列トークン
 * キーワードや演算子など
 */
export class WordToken implements BaseToken, TerminalToken {
  readonly type;
  readonly word;

  /**
   * ワードトークンを作る
   * @param type ワードタイプ
   * @param word ワード
   */
  constructor(type: string, word: string) {
    if (type.length === 0 || word.length === 0) {
      throw new Error("word must 1 or more characters");
    }

    this.type = type;
    this.word = word;
  }

  /**
   * リーダーからトークンにマッチする文字列を読み込みます
   * @param pr 読み込み機
   * @returns 読み込んだ文字列
   */
  read(pr: ParseReader): Result<string> {
    const peeked = peek(pr, this.type);

    if (peeked === EOF) {
      return [false, new Error("reach to end")];
    } else if (peeked.type === this.type && peeked.value === this.word) {
      get(pr, this.type);
      return [true, peeked.value];
    } else {
      return [false, new Error("not word")];
    }
  }

  /**
   * 次のトークンがこのトークンにマッチするか判定します。
   * @param pr リーダー
   * @returns マッチするか
   */
  matchFirstChar(pr: ParseReader): boolean {
    const token = peek(pr, this.type);
    return token !== EOF && token.type === this.type && token.value === this.word;
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
    return `w ${primitiveToString(this.type)} ${primitiveToString(this.word)}`;
  }

  /**
   * 表示用文字列に変換します。
   * @returns 文字列
   */
  toString(): string {
    return `word(${this.type}:${this.word})`;
  }

  /**
   * 2つのトークンが等しいかどうか調べます
   * @param other もう一つのトークン
   * @returns 等しいなら`true`
   */
  equals(other: BaseToken): boolean {
    return other instanceof WordToken && other.type === this.type && other.word === this.word;
  }

  /**
   * デバッグ用に出力をします。
   * @param indent インデント数
   */
  debugPrint(indent = 0): void {
    const indentSpaces = " ".repeat(indent);
    console.log(indentSpaces, this.toString());
  }
}
