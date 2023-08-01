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
  isNonTerminal(): this is ReferenceToken {
    return true;
  }

  /**
   * マップ用文字列に変換します。
   * @returns 文字列
   */
  toKeyString(): string | symbol {
    return typeof this.name === "string"
      ? `r "${this.name.replaceAll('"', '\\"').replaceAll("\\", "\\\\")}"`
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
  equals(other: BaseToken): boolean {
    return other instanceof ReferenceToken && other.name === this.name;
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
