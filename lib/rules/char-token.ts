import { EOF, get, peek } from "../core/reader";

import type { BaseToken, TerminalToken } from "./base-token";
import type { ReferenceToken } from "./reference-token";
import type { ParseReader } from "../core/reader";
import type { Result } from "../util/parser";

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

    if (minCode > maxCode) {
      throw new Error(`needs "${min}" less than "${max}".`);
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
    return `char(${String.fromCodePoint(this.min)}[0x${("000" + this.min.toString(16)).slice(
      -4,
    )}]..${String.fromCodePoint(this.max)}[0x${("000" + this.max.toString(16)).slice(-4)}])`;
  }

  /**
   * 2つのトークンが等しいかどうか調べます
   * @param other もう一つのトークン
   * @returns 等しいなら`true`
   */
  equals(other: BaseToken): boolean {
    return other instanceof CharToken && other.min === this.min && other.max === this.max;
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
