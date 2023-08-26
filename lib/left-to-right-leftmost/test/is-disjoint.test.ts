import { expect, test } from "vitest";

import { word } from "@/lib/rules/define-rules";
import { ObjectSet } from "@/lib/util/object-set";

import { isDisjoint } from "../is-disjoint";

test("disjoint word", () => {
  const symbolSet1 = new ObjectSet([word("word", "word")]);

  const symbolSet2 = new ObjectSet([word("word", "world")]);

  const result = isDisjoint(symbolSet1, symbolSet2);

  expect(result).toBe(true);
});

test("not disjoint word", () => {
  const Set1 = new ObjectSet([word("word", "word")]);

  const Set2 = new ObjectSet([word("word", "code")]);

  const result = isDisjoint(Set1, Set2);

  expect(result).toBe(true);
});
