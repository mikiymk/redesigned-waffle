import { expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";

import { GrammarRules } from "../grammar-rules";
import { ParseBuilder } from "../parse-builder";

const grammar = [rule("S", reference("E")), rule("E", word("1"))];
const builder = new ParseBuilder(grammar);

test("generate rules", () => {
  expect(() => new GrammarRules(builder)).not.toThrow();
});

test("rules has rules", () => {
  const rules = new GrammarRules(builder);

  const result = rules.rules;

  expect(result).toContainEqual({
    name: "S",
    tokens: [reference("E")],
    tokenIndexes: [builder.tokens.indexOf(reference("E"))],
    firstToken: reference("E"),
  });

  expect(result).toContainEqual({
    name: "E",
    tokens: [word("1")],
    tokenIndexes: [builder.tokens.indexOf(word("1"))],
    firstToken: word("1"),
  });
});

test("rule names", () => {
  const rules = new GrammarRules(builder);

  const result = rules.ruleNames;

  expect(result).toHaveLength(3);

  expect(result).toContain("S");
  expect(result).toContain("E");
});
