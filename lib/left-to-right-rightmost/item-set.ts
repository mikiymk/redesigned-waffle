import { tokenToString } from "../left-to-right-leftmost/token-set";

import type { LR0Item } from "./lr0-item";

/**
 * トークンを文字列にする
 * Setに入れるため
 * @param token トークン
 * @returns 文字列
 */
const itemToString = (token: LR0Item): string => {
  return `${token[0]} [${token[1].map((value) => tokenToString(value)).join(", ")}]`;
};

/**
 * トークンの集合（同じトークンが最大で１つ含まれる）
 */
// eslint-disable-next-line import/no-unused-modules
export class LR0ItemSet {
  set = new Map<string, LR0Item>();

  /**
   * 新しいトークンの集合を作成します。
   * @param items トークンの配列
   */
  constructor(items: Iterable<LR0Item> = []) {
    for (const token of items) {
      this.set.set(itemToString(token), token);
    }
  }

  /**
   * トークンの数を返します
   * @returns 要素数
   */
  get size() {
    return this.set.size;
  }

  /**
   * トークンの集合にトークンが含まれるか判定します。
   * @param token トークン
   * @returns 含まれる場合は `true`
   */
  has(token: LR0Item): boolean {
    return this.set.has(itemToString(token));
  }

  /**
   * 自身にトークンを追加します
   * @param token トークン
   * @returns トークンを追加した自身
   */
  add(token: LR0Item): this {
    this.set.set(itemToString(token), token);

    return this;
  }

  /**
   * 自身のトークンを削除します
   * @param token トークン
   * @returns トークンが存在して削除された場合は `true`
   */
  delete(token: LR0Item): boolean {
    return this.set.delete(itemToString(token));
  }

  /**
   * 自身に複数のトークンを追加します
   * @param tokens トークンの配列
   * @returns トークンを追加した自身
   */
  append(tokens: Iterable<LR0Item>): this {
    for (const token of tokens) {
      this.set.set(itemToString(token), token);
    }

    return this;
  }

  /**
   * 自身と与えられたトークンの集合から新しく和集合を作成します
   * @param tokens トークンの集合
   * @returns 新しいトークンの集合
   */
  union(tokens: Iterable<LR0Item>): LR0ItemSet {
    return new LR0ItemSet(this).append(tokens);
  }

  /**
   * 自身と与えられたトークンの集合から新しく積集合を作成します
   * @param tokens トークンの集合
   * @returns 新しいトークンの集合
   */
  intersection(tokens: Iterable<LR0Item>): LR0ItemSet {
    const newSet = new LR0ItemSet([]);

    for (const token of tokens) {
      if (this.has(token)) {
        newSet.add(token);
      }
    }

    return newSet;
  }

  /**
   * 自身と与えられたトークンの集合から新しく差集合を作成します
   * @param tokens トークンの集合
   * @returns 新しいトークンの集合
   */
  difference(tokens: Iterable<LR0Item>): LR0ItemSet {
    const tokenSet = new LR0ItemSet(tokens);
    const newSet = new LR0ItemSet([]);

    for (const token of this) {
      if (!tokenSet.has(token)) {
        newSet.add(token);
      }
    }

    return newSet;
  }

  /**
   * @yields トークン
   */
  *[Symbol.iterator]() {
    for (const [_, token] of this.set) {
      yield token;
    }
  }

  /**
   * 文字列表現を作ります
   * @returns 文字列
   */
  asString(): string {
    return `LR0ItemSet [${[...this.set.keys()].join(", ")}]`;
  }
}
