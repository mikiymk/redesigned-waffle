import { Token, TokenString, tokenToString } from "./define-rules";

/**
 * トークンの集合（同じトークンが最大で１つ含まれる）
 */
export class TokenSet {
  #set = new Map<TokenString, Token>();

  /**
   * 新しいトークンの集合を作成します。
   * @param tokens トークンの配列
   */
  constructor(tokens: Iterable<Token>) {
    for (const token of tokens) {
      this.#set.set(tokenToString(token), token);
    }
  }

  /**
   * トークンの集合にトークンが含まれるか判定します。
   * @param token トークン
   * @returns 含まれる場合は `true`
   */
  has(token: Token): boolean {
    return this.#set.has(tokenToString(token));
  }

  /**
   * 自身にトークンを追加します
   * @param token トークン
   * @returns トークンを追加した自身
   */
  add(token: Token): TokenSet {
    this.#set.set(tokenToString(token), token);

    return this;
  }

  /**
   * 自身に複数のトークンを追加します
   * @param tokens トークンの配列
   * @returns トークンを追加した自身
   */
  append(tokens: Iterable<Token>): TokenSet {
    for (const token of tokens) {
      this.#set.set(tokenToString(token), token);
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
    const newSet = new TokenSet([]);

    for (const token of tokens) {
      if (!this.has(token)) {
        newSet.add(token);
      }
    }

    return newSet;
  }

  /** @override */
  *[Symbol.iterator]() {
    for (const [_, token] of this.#set) {
      yield token;
    }
  }
}
