import { expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";
import { ObjectSet } from "@/lib/util/object-set";

import { FirstSets } from "../first-set";
import { GrammarRules } from "../grammar-rules";
import { Tokens } from "../tokens";

const grammar = [rule("S", reference("E")), rule("E", word("1"))];

test("generate first set", () => {
  const tokens = new Tokens(grammar);
  const rules = new GrammarRules(grammar, tokens);

  expect(() => new FirstSets(tokens, rules)).not.toThrow();
});

test("first set set", () => {
  const tokens = new Tokens(grammar);
  const rules = new GrammarRules(grammar, tokens);
  const firstSets = new FirstSets(tokens, rules);

  const result = firstSets.sets;

  expect(result[0]).toStrictEqual(new ObjectSet([word("1")]));
  expect(result[1]).toStrictEqual(new ObjectSet([word("1")]));
});
