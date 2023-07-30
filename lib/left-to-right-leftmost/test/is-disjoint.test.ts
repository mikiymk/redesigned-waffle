import { expect, test } from "vitest";

import { word } from "@/lib/rules/define-rules";
import { ObjectSet } from "@/lib/util/object-set";

import { isDisjoint } from "../is-disjoint";

test("disjoint word", () => {
  const tokenSet1 = new ObjectSet([word("word", "word")]);

  const tokenSet2 = new ObjectSet([word("word", "world")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(true);
});

test("not disjoint word", () => {
  const tokenSet1 = new ObjectSet([word("word", "word")]);

  const tokenSet2 = new ObjectSet([word("word", "code")]);

  const result = isDisjoint(tokenSet1, tokenSet2);

  expect(result).toBe(true);
});
