import { ReferenceToken } from "../rules/reference-token";

import type { EOF } from "../reader/peekable-iterator";
import type { Token } from "@/lib/rules/define-rules";

/**
 * トークンの集合（同じトークンが最大で１つ含まれる）
 */
export class TokenSet<T extends Token> {
  set = new Map<string | number | symbol, T>();

  /**
   * 新しいトークンの集合を作成します。
   * @param tokens トークンの配列
   */
  constructor(tokens: Iterable<T> = []) {
    for (const token of tokens) {
      this.set.set(token.toKeyString(), token);
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
  has(token: Token): token is T {
    return this.set.has(token.toKeyString());
  }

  /**
   * 自身にトークンを追加します
   * @param token トークン
   * @returns トークンを追加した自身
   */
  add(token: T): this {
    this.set.set(token.toKeyString(), token);

    return this;
  }

  /**
   * 自身のトークンを削除します
   * @param token トークン
   * @returns トークンが存在して削除された場合は `true`
   */
  delete(token: T): boolean {
    return this.set.delete(token.toKeyString());
  }

  /**
   * 自身に複数のトークンを追加します
   * @param tokens トークンの配列
   * @returns トークンを追加した自身
   */
  append(tokens: Iterable<T>): this {
    for (const token of tokens) {
      this.set.set(token.toKeyString(), token);
    }

    return this;
  }

  /**
   * 自身と与えられたトークンの集合から新しく和集合を作成します
   * @param tokens トークンの集合
   * @returns 新しいトークンの集合
   */
  union<U extends Token>(tokens: Iterable<U>): TokenSet<T | U> {
    return new TokenSet<T | U>(this).append(tokens);
  }

  /**
   * 自身と与えられたトークンの集合から新しく差集合を作成します
   * @param tokens トークンの集合
   * @returns 新しいトークンの集合
   */
  difference<U extends Token>(tokens: Iterable<U>): TokenSet<Exclude<T, U>> {
    const tokenSet = new TokenSet<U>(tokens);
    const newSet = new TokenSet<Exclude<T, U>>([]);

    for (const token of this) {
      if (!tokenSet.has(token)) {
        newSet.add(token as Exclude<T, U>);
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
   * 与えられた文字がこのトークン集合の最初の文字として有効か判定します。
   * @param char 文字
   * @returns 文字がマッチするか
   */
  matchFirstChar(char: string | EOF): boolean {
    for (const token of this) {
      if (token instanceof ReferenceToken) {
        throw new TypeError("cannot use matchFirstChar() at ReferenceToken set");
      }

      if (token.matchFirstChar(char)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 文字列表現を作ります
   * @returns 文字列
   */
  asString(): string {
    return `TokenSet [${[...this.set.keys()].join(", ")}]`;
  }
}
