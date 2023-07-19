import { expect, test } from "vitest";

import { char, reference, rule, word } from "@/lib/rules/define-rules";

import { getRuleNames } from "./rule-names";

const syntax = [
  rule("rule1", word("rule"), word("defined")),
  rule("rule1", char("A", "Z"), reference("rule2")),
  rule("rule2", word("rule2"), word("defined")),
  rule("rule2", word("hello"), word("world")),
];

test("get rule indexes from rule name", () => {
  const result = getRuleNames(syntax);

  expect(result).toStrictEqual(["rule1", "rule2"]);
});
