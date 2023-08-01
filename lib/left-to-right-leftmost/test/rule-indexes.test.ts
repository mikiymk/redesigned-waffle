import { expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";

import { eachRules } from "../rule-indexes";

const syntax = [
  rule("rule1", [word("word", "rule"), word("word", "defined")]),
  rule("rule1", [reference("rule2")]),
  rule("rule2", [word("word", "rule2"), word("word", "defined")]),
  rule("rule2", [word("word", "hello"), word("word", "world")]),
];

test("get rule indexes from rule name", () => {
  const result = [
    ...eachRules(syntax, "rule1", [
      ["rule1", "rule1", "rule2", "rule2"],
      [0, 1, 2, 3],
    ]),
  ];

  expect(result).toStrictEqual([
    [0, ["rule1", 0]],
    [1, ["rule1", 1]],
  ]);
});
