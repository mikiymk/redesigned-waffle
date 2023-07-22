import { EOF, peek } from "../core/reader";

import type { BaseToken, TerminalToken } from "./base-token";
import type { ReferenceToken } from "./reference-token";
import type { ParseReader } from "../core/reader";
import type { Result } from "../util/parser";

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

  /**
   * デバッグ用に出力をします。
   * @param indent インデント数
   */
  debugPrint(indent: number = 0): void {
    const indentSpaces = " ".repeat(indent);
    console.log(indentSpaces, this.toString());
  }
}
