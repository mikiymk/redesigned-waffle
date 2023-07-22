import { expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";
import { ObjectSet } from "@/lib/util/object-set";

import { FirstSets } from "../first-set";
import { GrammarRules } from "../grammar-rules";
import { ParseBuilder } from "../parse-builder";
import { Tokens } from "../tokens";

const grammar = [rule("S", reference("E")), rule("E", word("1"))];
const builder = new ParseBuilder(grammar);

test("generate first set", () => {
  const tokens = new Tokens(builder);
  const rules = new GrammarRules(builder);

  expect(() => new FirstSets(tokens, rules)).not.toThrow();
});

test("first set set", () => {
  const tokens = new Tokens(builder);
  const rules = new GrammarRules(builder);
  const firstSets = new FirstSets(tokens, rules);

  const result = firstSets.sets;

  expect(result[0]).toStrictEqual(new ObjectSet([word("1")]));
  expect(result[1]).toStrictEqual(new ObjectSet([word("1")]));
});
