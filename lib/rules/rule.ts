import { empty } from "./define-rules";

import type { SyntaxToken } from "./define-rules";
import type { Tree } from "../parser/tree";

/**
 *
 */
export class Rule<T> {
  readonly name;
  readonly tokens;
  readonly #process;

  /**
   * 構文用のルールを作る
   * @param name ルール名
   * @param tokens ルールのトークン列
   * @param process 変換する関数
   */
  constructor(name: string, tokens: SyntaxToken[], process?: (children: Tree<T>[]) => T) {
    if (name.length === 0) {
      throw new Error(`name length must 1 or greater. received: "${name}"`);
    }

    if (tokens.length === 0) {
      throw new Error(`rule token length must 1 or greater. received: ${tokens.length} items`);
    }

    if (tokens.includes(empty) && tokens.length !== 1) {
      throw new Error(`rule token length, including empty tokens, must be 1. received: ${tokens.length} items`);
    }

    this.name = name;
    this.tokens = tokens;

    this.#process = process;
  }

  /**
   * 構文木の値を処理します。
   * @param children 子ノード配列
   * @returns 処理済み値
   */
  process(children: Tree<T>[]) {
    return this.#process?.(children) ?? (undefined as unknown as T);
  }

  /**
   * 2つのルールを比較します。
   * @param other もう一つのルール
   * @returns 等しいなら`true`
   */
  equals(other: Rule<T>): boolean {
    return (
      this.name === other.name &&
      this.tokens.length === other.tokens.length &&
      this.tokens.every((value, index) => other.tokens[index]?.equals(value))
    );
  }
}
