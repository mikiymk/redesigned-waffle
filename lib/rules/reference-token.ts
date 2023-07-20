import type { BaseToken } from "./base-token";

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
