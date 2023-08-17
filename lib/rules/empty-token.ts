import type { BaseToken, TerminalToken } from "./base-token";
import type { ReferenceToken } from "./reference-token";
import type { Result } from "../reader/parse-reader";

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
  matchFirstChar(): boolean {
    return true;
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
