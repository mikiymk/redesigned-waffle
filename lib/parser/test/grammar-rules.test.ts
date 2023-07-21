import { expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";

import { GrammarRules } from "../grammar-rules";
import { Tokens } from "../tokens";

const grammar = [rule("S", reference("E")), rule("E", word("1"))];

test("generate rules", () => {
  const tokens = new Tokens(grammar);
  expect(() => new GrammarRules(grammar, tokens)).not.toThrow();
});

test("rules has rules", () => {
  const tokens = new Tokens(grammar);
  const rules = new GrammarRules(grammar, tokens);

  const referenceE = tokens.indexOf(reference("E"));
  const word1 = tokens.indexOf(word("1"));

  const result = rules.rules;

  expect(result).toContainEqual({
    name: "S",
    tokens: [referenceE],
  });

  expect(result).toContainEqual({
    name: "E",
    tokens: [word1],
  });
});

test("rule names", () => {
  const tokens = new Tokens(grammar);
  const rules = new GrammarRules(grammar, tokens);

  const result = rules.ruleNames;

  expect(result).toEqual(["S", "E"]);
});
