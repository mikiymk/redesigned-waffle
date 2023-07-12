import { describe, expect, test } from "vitest";

import { char, epsilon, reference, rule, tokenToString, word } from "./define-rules";
import { getFirstSetList } from "./first-set";

import type { Token, TokenString } from "./define-rules";

/**
 *
 * @param tokens トークン
 * @returns トークン文字列とトークンのエントリー
 */
const tokensToMap = (...tokens: Token[]): Map<TokenString, Token> => new Map(tokens.map((t) => [tokenToString(t), t]));

describe("get first-set from syntax", () => {
  const syntax = [
    rule("start", reference("rule1")),

    rule("rule1", reference("basic token")),
    rule("rule1", reference("reference token")),
    rule("rule1", reference("reference token and after")),
    rule("rule1", reference("left recursion")),
    rule("rule1", reference("right recursion")),
    rule("rule1", reference("indirect left recursion 1")),
    rule("rule1", reference("indirect right recursion 1")),

    rule("basic token", word("word")),
    rule("basic token", char("A", "Z")),
    rule("basic token", epsilon),

    rule("reference token", reference("basic token")),

    rule("reference token and after", reference("basic token"), word("after defined")),

    rule("left recursion", reference("left recursion"), word("follow lr")),
    rule("left recursion", word("word lr")),

    rule("right recursion", word("lead rr"), reference("right recursion")),
    rule("right recursion", word("word rr")),

    rule("indirect left recursion 1", reference("indirect left recursion 2"), word("follow in-lr 1")),

    rule("indirect left recursion 2", reference("indirect left recursion 1"), word("follow in-lr 2")),
    rule("indirect left recursion 2", word("word in-lr")),

    rule("indirect right recursion 1", word("lead in-rr 1"), reference("indirect right recursion 2")),

    rule("indirect right recursion 2", word("lead in-rr 2"), reference("indirect right recursion 1")),
    rule("indirect right recursion 2", word("word in-rr")),
  ];

  test("defined rules", () => {
    const result = getFirstSetList(syntax);
    const expected = [
      tokensToMap(
        word("word"),
        char("A", "Z"),
        epsilon,
        word("after defined"),
        word("word lr"),
        word("lead rr"),
        word("word rr"),
        word("word in-lr"),
        word("lead in-rr 1"),
      ),

      tokensToMap(word("word"), char("A", "Z"), epsilon),
      tokensToMap(word("word"), char("A", "Z"), epsilon),
      tokensToMap(word("word"), char("A", "Z"), word("after defined")),
      tokensToMap(word("word lr")),
      tokensToMap(word("lead rr"), word("word rr")),
      tokensToMap(word("word in-lr")),
      tokensToMap(word("lead in-rr 1")),

      // basic token
      tokensToMap(word("word")),
      tokensToMap(char("A", "Z")),
      tokensToMap(epsilon),

      // reference token
      tokensToMap(word("word"), char("A", "Z"), epsilon),

      // reference token and after
      tokensToMap(word("word"), char("A", "Z"), word("after defined")),

      // left recursion
      tokensToMap(word("word lr")),
      tokensToMap(word("word lr")),

      // right recursion
      tokensToMap(word("lead rr")),
      tokensToMap(word("word rr")),

      // indirect left recursion
      tokensToMap(word("word in-lr")),

      tokensToMap(word("word in-lr")),
      tokensToMap(word("word in-lr")),

      // indirect right recursion
      tokensToMap(word("lead in-rr 1")),

      tokensToMap(word("lead in-rr 2")),
      tokensToMap(word("word in-rr")),
    ];

    expect(result).toStrictEqual(expected);
  });

  test("basic token", () => {
    const syntax = [
      rule("start", reference("basic token")),

      rule("basic token", word("word")),
      rule("basic token", char("A", "Z")),
      rule("basic token", epsilon),
    ];

    const result = getFirstSetList(syntax);
    const expected = [
      tokensToMap(word("word"), char("A", "Z"), epsilon),

      tokensToMap(word("word")),
      tokensToMap(char("A", "Z")),
      tokensToMap(epsilon),
    ];

    expect(result).toStrictEqual(expected);
  });

  test("reference token", () => {
    const syntax = [
      rule("start", reference("reference token")),

      rule("reference token", reference("basic token")),

      rule("basic token", word("word")),
      rule("basic token", char("A", "Z")),
      rule("basic token", epsilon),
    ];

    const result = getFirstSetList(syntax);
    const expected = [
      tokensToMap(word("word"), char("A", "Z"), epsilon),

      tokensToMap(word("word"), char("A", "Z"), epsilon),

      tokensToMap(word("word")),
      tokensToMap(char("A", "Z")),
      tokensToMap(epsilon),
    ];

    expect(result).toStrictEqual(expected);
  });

  test("reference token and after", () => {
    const syntax = [
      rule("start", reference("reference token and after")),

      rule("reference token and after", reference("basic token"), word("after defined")),

      rule("basic token", word("word")),
      rule("basic token", char("A", "Z")),
      rule("basic token", epsilon),
    ];

    const result = getFirstSetList(syntax);
    const expected = [
      tokensToMap(word("word"), char("A", "Z"), word("after defined")),

      tokensToMap(word("word"), char("A", "Z"), word("after defined")),

      tokensToMap(word("word")),
      tokensToMap(char("A", "Z")),
      tokensToMap(epsilon),
    ];

    expect(result).toStrictEqual(expected);
  });

  test("left recursion", () => {
    const syntax = [
      rule("start", reference("left recursion")),

      rule("left recursion", reference("left recursion"), word("follow lr")),
      rule("left recursion", word("word lr")),
    ];

    const result = getFirstSetList(syntax);
    const expected = [tokensToMap(word("word lr")), tokensToMap(word("word lr")), tokensToMap(word("word lr"))];

    expect(result).toStrictEqual(expected);
  });

  test("right recursion", () => {
    const syntax = [
      rule("start", reference("right recursion")),

      rule("right recursion", word("lead rr"), reference("right recursion")),
      rule("right recursion", word("word rr")),
    ];

    const result = getFirstSetList(syntax);
    const expected = [
      tokensToMap(word("lead rr"), word("word rr")),

      tokensToMap(word("lead rr")),
      tokensToMap(word("word rr")),
    ];

    expect(result).toStrictEqual(expected);
  });

  test("indirect left recursion", () => {
    const syntax = [
      rule("start", reference("indirect left recursion 1")),

      rule("indirect left recursion 1", reference("indirect left recursion 2"), word("follow in-lr 1")),

      rule("indirect left recursion 2", reference("indirect left recursion 1"), word("follow in-lr 2")),
      rule("indirect left recursion 2", word("word in-lr")),
    ];

    const result = getFirstSetList(syntax);
    const expected = [
      tokensToMap(word("word in-lr")),

      // indirect left recursion
      tokensToMap(word("word in-lr")),

      tokensToMap(word("word in-lr")),
      tokensToMap(word("word in-lr")),
    ];

    expect(result).toStrictEqual(expected);
  });

  test("indirect right recursion", () => {
    const syntax = [
      rule("start", reference("indirect right recursion 1")),

      rule("indirect right recursion 1", word("lead in-rr 1"), reference("indirect right recursion 2")),

      rule("indirect right recursion 2", word("lead in-rr 2"), reference("indirect right recursion 1")),
      rule("indirect right recursion 2", word("word in-rr")),
    ];

    const result = getFirstSetList(syntax);
    const expected = [
      tokensToMap(word("lead in-rr 1")),

      // indirect right recursion
      tokensToMap(word("lead in-rr 1")),

      tokensToMap(word("lead in-rr 2")),
      tokensToMap(word("word in-rr")),
    ];

    expect(result).toStrictEqual(expected);
  });
});
