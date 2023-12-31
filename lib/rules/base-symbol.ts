import type { ParseReader, Result } from "../reader/parse-reader";

export type BaseSymbol = {
  /**
   * 終端記号かどうかを判定します。
   * @returns 終端記号なら`true`、非終端記号なら`false`
   */
  isNonTerminal(): boolean;

  /**
   * マップのキー用文字列に変換します。
   * @returns 文字列
   */
  toKeyString(): string | number | symbol;

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
  equals(other: BaseSymbol): boolean;
};

export type TerminalSymbol = {
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
  matchFirstChar(symbol: ParseReader): boolean;
};
