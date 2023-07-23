import { expect, test } from "vitest";

import { char, word } from "@/lib/rules/define-rules";
import { ObjectSet } from "@/lib/util/object-set";

import { isDisjoint } from "../is-disjoint";

test("disjoint word", () => {
  const tokenSet1 = new ObjectSet([word("word")]);

  const tokenSet2 = new ObjectSet([word("world")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(false);
});

test("not disjoint word", () => {
  const tokenSet1 = new ObjectSet([word("word")]);

  const tokenSet2 = new ObjectSet([word("code")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(true);
});

test("disjoint left char range", () => {
  const tokenSet1 = new ObjectSet([char("a", "z")]);

  const tokenSet2 = new ObjectSet([word("code")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(false);
});

test("not disjoint left char range", () => {
  const tokenSet1 = new ObjectSet([char("a", "z")]);

  const tokenSet2 = new ObjectSet([word("Code")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(true);
});

test("disjoint right char range", () => {
  const tokenSet1 = new ObjectSet([word("word")]);

  const tokenSet2 = new ObjectSet([char("a", "z")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(false);
});

test("not disjoint right char range", () => {
  const tokenSet1 = new ObjectSet([word("Word")]);

  const tokenSet2 = new ObjectSet([char("a", "z")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(true);
});

test("disjoint two char range", () => {
  const tokenSet1 = new ObjectSet([char("a", "c")]);

  const tokenSet2 = new ObjectSet([char("c", "e")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(false);
});

test("not disjoint two char range", () => {
  const tokenSet1 = new ObjectSet([char("a", "c")]);

  const tokenSet2 = new ObjectSet([char("d", "f")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(true);
});
