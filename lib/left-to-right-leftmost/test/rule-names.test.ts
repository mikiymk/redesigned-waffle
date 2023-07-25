import { expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";

import { getRuleNames } from "../rule-names";

import type { Syntax } from "@/lib/rules/define-rules";

const syntax: Syntax<undefined> = [
  rule("rule1", [word("word", "rule"), word("word", "defined")]),
  rule("rule1", [reference("rule2")]),
  rule("rule2", [word("word", "rule2"), word("word", "defined")]),
  rule("rule2", [word("word", "hello"), word("word", "world")]),
];

test("get rule indexes from rule name", () => {
  const result = getRuleNames(syntax);

  expect(result).toStrictEqual(["rule1", "rule2"]);
});
