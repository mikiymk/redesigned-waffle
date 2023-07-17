import type { Token } from "./define-rules";

type TokenString = `word "${string}"` | `char ${number}..${number}` | `ref "${string}"` | "epsilon" | "eof";

/**
 * トークンを文字列にする
 * Setに入れるため
 * @param token トークン
 * @returns 文字列
 */
export const tokenToString = (token: Token): TokenString => {
  switch (token[0]) {
    case "char": {
      return `char ${token[1]}..${token[2]}`;
    }

    case "epsilon": {
      return "epsilon";
    }

    case "ref": {
      return `ref "${token[1].replaceAll('"', '\\"').replaceAll("\\", "\\\\")}"`;
    }

    case "word": {
      return `word "${token[1].replaceAll('"', '\\"').replaceAll("\\", "\\\\")}"`;
    }

    case "eof": {
      return "eof";
    }
  }
};

/**
 * トークンの集合（同じトークンが最大で１つ含まれる）
 */
export class TokenSet<T extends Token> {
  set = new Map<TokenString, T>();

  /**
   * 新しいトークンの集合を作成します。
   * @param tokens トークンの配列
   */
  constructor(tokens: Iterable<T> = []) {
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
  has(token: Token): token is T {
    return this.set.has(tokenToString(token));
  }

  /**
   * 自身にトークンを追加します
   * @param token トークン
   * @returns トークンを追加した自身
   */
  add(token: T): this {
    this.set.set(tokenToString(token), token);

    return this;
  }

  /**
   * 自身のトークンを削除します
   * @param token トークン
   * @returns トークンが存在して削除された場合は `true`
   */
  delete(token: T): boolean {
    return this.set.delete(tokenToString(token));
  }

  /**
   * 自身に複数のトークンを追加します
   * @param tokens トークンの配列
   * @returns トークンを追加した自身
   */
  append(tokens: Iterable<T>): this {
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
  union<U extends Token>(tokens: Iterable<U>): TokenSet<T | U> {
    return new TokenSet<T | U>(this).append(tokens);
  }

  /**
   * 自身と与えられたトークンの集合から新しく積集合を作成します
   * @param tokens トークンの集合
   * @returns 新しいトークンの集合
   */
  intersection(tokens: Iterable<T>): TokenSet<T> {
    const newSet = new TokenSet<T>([]);

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
   * 文字列表現を作ります
   * @returns 文字列
   */
  asString(): string {
    return `TokenSet [${[...this.set.keys()].join(", ")}]`;
  }
}
