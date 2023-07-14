import { describe, expect, test } from "vitest";

import { char, epsilon, reference, rule, tokenToString, word } from "./define-rules";
import { getFirstSetList } from "./first-set";
import { getFollowSetList } from "./follow-set";

import type { Token, TokenString } from "./define-rules";

/**
 *
 * @param tokens トークン
 * @returns トークン文字列とトークンのエントリー
 */
const tokensToMap = (...tokens: Token[]): Map<TokenString, Token> => new Map(tokens.map((t) => [tokenToString(t), t]));

describe("get first-set from syntax", () => {
  test("basic token", () => {
    const syntax = [
      rule("start", reference("basic token"), word("after basic token")),

      rule("basic token", word("word"), word("after word")),
      rule("basic token", char("A", "Z"), word("after char")),
      rule("basic token", epsilon),
    ];

    const firstSet = getFirstSetList(syntax);

    const expectedFirstSet = [
      tokensToMap(word("word"), char("A", "Z"), word("after basic token")),

      tokensToMap(word("word")),
      tokensToMap(char("A", "Z")),
      tokensToMap(epsilon),
    ];
    expect(firstSet).toStrictEqual(expectedFirstSet);

    const result = getFollowSetList(syntax, firstSet);
    const expected = [
      tokensToMap(),

      tokensToMap(word("after basic token")),
      tokensToMap(word("after basic token")),
      tokensToMap(word("after basic token")),
    ];

    expect(result).toStrictEqual(expected);
  });
});
