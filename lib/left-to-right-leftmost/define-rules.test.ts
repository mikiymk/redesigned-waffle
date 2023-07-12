import { describe, expect, test } from "vitest";

import { char, epsilon, epsilonString, reference, rule, stringToToken, tokenToString, word } from "./define-rules";

import type { Rule, Token, TokenString } from "./define-rules";

test("define rules", () => {
  const expected: Rule = ["rule name", ["word", "1"], ["char", 0x20, 0x21], ["ref", "expression"]];
  const result = rule("rule name", word("1"), char(" ", "!"), reference("expression"));

  expect(result).toStrictEqual(expected);
});

describe("token to string", () => {
  test("word", () => {
    const source: Token = word("word 2");
    const expected: TokenString = '["word", "word 2"]';
    const result = tokenToString(source);

    expect(result).toStrictEqual(expected);
  });

  test("char", () => {
    const source: Token = char("A", "F");
    const expected: TokenString = '["char", 65, 70]';
    const result = tokenToString(source);

    expect(result).toStrictEqual(expected);
  });

  test("ref", () => {
    const source: Token = reference("ref 2");
    const expected: TokenString = '["ref", "ref 2"]';
    const result = tokenToString(source);

    expect(result).toStrictEqual(expected);
  });

  test("epsilon", () => {
    const source: Token = epsilon;
    const expected: TokenString = epsilonString;
    const result = tokenToString(source);

    expect(result).toStrictEqual(expected);
  });
});

describe("string to token", () => {
  test("word", () => {
    const source: TokenString = '["word", "word 2"]';
    const expected: Token = word("word 2");
    const result = stringToToken(source);

    expect(result).toStrictEqual(expected);
  });

  test("char", () => {
    const source: TokenString = '["char", 65, 70]';
    const expected: Token = char("A", "F");
    const result = stringToToken(source);

    expect(result).toStrictEqual(expected);
  });

  test("ref", () => {
    const source: TokenString = '["ref", "ref 2"]';
    const expected: Token = reference("ref 2");
    const result = stringToToken(source);

    expect(result).toStrictEqual(expected);
  });

  test("epsilon", () => {
    const source: TokenString = epsilonString;
    const expected: Token = epsilon;
    const result = stringToToken(source);

    expect(result).toStrictEqual(expected);
  });
});
