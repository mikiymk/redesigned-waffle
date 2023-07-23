import { expect, test } from "vitest";

import { char, word } from "@/lib/rules/define-rules";

import { TokenSet } from "../../token-set/token-set";
import { isDisjoint } from "../is-disjoint";

test("disjoint word", () => {
  const tokenSet1 = new TokenSet([word("word")]);

  const tokenSet2 = new TokenSet([word("world")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(false);
});

test("not disjoint word", () => {
  const tokenSet1 = new TokenSet([word("word")]);

  const tokenSet2 = new TokenSet([word("code")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(true);
});

test("disjoint left char range", () => {
  const tokenSet1 = new TokenSet([char("a", "z")]);

  const tokenSet2 = new TokenSet([word("code")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(false);
});

test("not disjoint left char range", () => {
  const tokenSet1 = new TokenSet([char("a", "z")]);

  const tokenSet2 = new TokenSet([word("Code")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(true);
});

test("disjoint right char range", () => {
  const tokenSet1 = new TokenSet([word("word")]);

  const tokenSet2 = new TokenSet([char("a", "z")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(false);
});

test("not disjoint right char range", () => {
  const tokenSet1 = new TokenSet([word("Word")]);

  const tokenSet2 = new TokenSet([char("a", "z")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(true);
});

test("disjoint two char range", () => {
  const tokenSet1 = new TokenSet([char("a", "c")]);

  const tokenSet2 = new TokenSet([char("c", "e")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(false);
});

test("not disjoint two char range", () => {
  const tokenSet1 = new TokenSet([char("a", "c")]);

  const tokenSet2 = new TokenSet([char("d", "f")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(true);
});
