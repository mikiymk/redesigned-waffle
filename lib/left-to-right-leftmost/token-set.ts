import { tokenToString } from "./define-rules";

import type { Token, TokenString } from "./define-rules";

/**
 * トークンの集合（同じトークンが最大で１つ含まれる）
 */
export class TokenSet {
  set = new Map<TokenString, Token>();

  /**
   * 新しいトークンの集合を作成します。
   * @param tokens トークンの配列
   */
  constructor(tokens: Iterable<Token> = []) {
    for (const token of tokens) {
      this.set.set(tokenToString(token), token);
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
  has(token: Token): boolean {
    return this.set.has(tokenToString(token));
  }

  /**
   * 自身にトークンを追加します
   * @param token トークン
   * @returns トークンを追加した自身
   */
  add(token: Token): this {
    this.set.set(tokenToString(token), token);

    return this;
  }

  /**
   * 自身のトークンを削除します
   * @param token トークン
   * @returns トークンが存在して削除された場合は `true`
   */
  delete(token: Token): boolean {
    return this.set.delete(tokenToString(token));
  }

  /**
   * 自身に複数のトークンを追加します
   * @param tokens トークンの配列
   * @returns トークンを追加した自身
   */
  append(tokens: Iterable<Token>): this {
    for (const token of tokens) {
      this.set.set(tokenToString(token), token);
    }

    return this;
  }

  /**
   * 自身と与えられたトークンの集合から新しく和集合を作成します
   * @param tokens トークンの集合
   * @returns 新しいトークンの集合
   */
  union(tokens: Iterable<Token>): TokenSet {
    return new TokenSet(this).append(tokens);
  }

  /**
   * 自身と与えられたトークンの集合から新しく積集合を作成します
   * @param tokens トークンの集合
   * @returns 新しいトークンの集合
   */
  intersection(tokens: Iterable<Token>): TokenSet {
    const newSet = new TokenSet([]);

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
  difference(tokens: Iterable<Token>): TokenSet {
    const tokenSet = new TokenSet(tokens);
    const newSet = new TokenSet([]);

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
}
