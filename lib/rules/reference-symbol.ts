import type { BaseSymbol } from "./base-symbol";

/**
 * 非終端記号トークン
 */
export class ReferenceSymbol implements BaseSymbol {
  readonly name;

  /**
   * 非終端記号トークンを作る
   * @param name 参照する名前
   */
  constructor(name: string | symbol) {
    if (typeof name === "string" && name.length === 0) {
      throw new Error("ルール名は１文字以上である必要があります。");
    }

    this.name = name;
  }

  /**
   * 終端記号かどうかを判定します。
   * @returns 終端記号なら`true`、非終端記号なら`false`
   */
  isNonTerminal(): this is ReferenceSymbol {
    return true;
  }

  /**
   * マップ用文字列に変換します。
   * @returns 文字列
   */
  toKeyString(): string | symbol {
    return typeof this.name === "string"
      ? `r "${this.name.replaceAll('"', String.raw`\"`).replaceAll("\\", "\\\\")}"`
      : this.name;
  }

  /**
   * 表示用文字列に変換します。
   * @returns 文字列
   */
  toString(): string {
    return typeof this.name === "string" ? `rule(${this.name})` : `rule(${this.name.toString()})`;
  }

  /**
   * 2つのトークンが等しいかどうか調べます
   * @param other もう一つのトークン
   * @returns 等しいなら`true`
   */
  equals(other: BaseSymbol): boolean {
    return other instanceof ReferenceSymbol && other.name === this.name;
  }
}
