import { EOF, get, peek } from "../reader/parse-reader";
import { primitiveToString } from "../util/primitive-to-string";

import type { ParseReader, Result } from "../reader/parse-reader";
import type { BaseToken, TerminalToken } from "./base-token";
import type { ReferenceToken } from "./reference-token";

/**
 * 文字列トークン
 * キーワードや演算子など
 */
export class WordToken implements BaseToken, TerminalToken {
  readonly type: string;
  readonly word: string | undefined;

  /**
   * ワードトークンを作る
   * @param type ワードタイプ
   * @param word ワード
   */
  constructor(type: string, word?: string | undefined) {
    if (type.length === 0 || word?.length === 0) {
      throw new Error("単語と種類は１文字以上である必要があります。");
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
    const peeked = peek(pr);

    if (peeked === EOF) {
      return [false, new Error("文字列の終端に到達しました。")];
    } else if (peeked.type === this.type && (undefined === this.word || peeked.value === this.word)) {
      get(pr);
      return [true, peeked.value];
    } else {
      return [false, new Error(`${peeked.value}は単語とマッチしません。`)];
    }
  }

  /**
   * 次のトークンがこのトークンにマッチするか判定します。
   * @param pr リーダー
   * @returns マッチするか
   */
  matchFirstChar(pr: ParseReader): boolean {
    const token = peek(pr);
    return token !== EOF && token.type === this.type && (undefined === this.word || token.value === this.word);
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
}
