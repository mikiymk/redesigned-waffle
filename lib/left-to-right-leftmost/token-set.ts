import { Token, TokenString, tokenToString } from "./define-rules";

export class TokenSet {
  #set = new Map<TokenString, Token>();

  constructor(tokens: Iterable<Token>) {
    for (const token of tokens) {
      this.#set.set(tokenToString(token), token);
    }
  }

  has(token: Token): boolean {
    return this.#set.has(tokenToString(token));
  }

  add(token: Token): TokenSet {
    this.#set.set(tokenToString(token), token);

    return this;
  }

  append(tokenSet: TokenSet): TokenSet {
    for (const token of tokenSet) {
      this.#set.set(tokenToString(token), token);
    }

    return this;
  }

  union(tokenSet: TokenSet): TokenSet {
    return new TokenSet(this).append(tokenSet);
  }

  intersection(tokenSet: TokenSet): TokenSet {
    const newSet = new TokenSet([]);

    for (const token of this) {
      if (tokenSet.has(token)) {
        newSet.add(token);
      }
    }

    return newSet;
  }

  difference(tokenSet: TokenSet): TokenSet {
    const newSet = new TokenSet([]);

    for (const token of this) {
      if (!tokenSet.has(token)) {
        newSet.add(token);
      }
    }

    return newSet;
  }

  *[Symbol.iterator]() {
    for (const [_, token] of this.#set) {
      yield token;
    }
  }
}
