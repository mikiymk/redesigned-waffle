import { empty } from "./define-rules";

import type { Tree } from "../parser/tree";
import type { SyntaxSymbol } from "./define-rules";

/**
 *
 */
export class Rule<T> {
  readonly name;
  readonly symbols;
  readonly #process;

  /**
   * 構文用のルールを作る
   * @param name ルール名
   * @param symbols ルールのトークン列
   * @param process 変換する関数
   */
  constructor(name: string, symbols: SyntaxSymbol[], process?: (children: Tree<T>[]) => T) {
    if (name.length === 0) {
      throw new Error("ルール名は１文字以上である必要があります。");
    }

    if (symbols.length === 0) {
      throw new Error("ルールトークンは１つ以上である必要があります。");
    }

    if (symbols.includes(empty) && symbols.length !== 1) {
      throw new Error(
        `ルールに空文字トークンを含む場合、トークン列は空文字トークン１つのみである必要があります。 受け取ったトークン: ${symbols.length}個`,
      );
    }

    this.name = name;
    this.symbols = symbols;

    this.#process = process;
  }

  /**
   * 構文木の値を処理します。
   * @param children 子ノード配列
   * @returns 処理済み値
   */
  process(children: Tree<T>[]) {
    return this.#process ? this.#process(children) : (undefined as unknown as T);
  }

  /**
   * 2つのルールを比較します。
   * @param other もう一つのルール
   * @returns 等しいなら`true`
   */
  equals(other: Rule<T>): boolean {
    return (
      this.name === other.name &&
      this.symbols.length === other.symbols.length &&
      this.symbols.every((value, index) => other.symbols[index]?.equals(value))
    );
  }

  /**
   * キー用の文字列表現にします
   * @returns 文字列
   */
  toKeyString(): string {
    return `rule:${this.name}(${this.symbols.map((symbol) => symbol.toString()).join(",")})`;
  }

  /**
   * 表示用の文字列表現にします
   * @returns 文字列
   */
  toString(): string {
    return `${this.name} ${this.symbols.map((symbol) => symbol.toString()).join(" ")}`;
  }
}
