import { expect, test } from "vitest";

import { char, reference, rule, word } from "./define-rules";

import type { Rule } from "./define-rules";

test("define rules", () => {
  const expected: Rule = [
    "rule name",
    [
      ["word", "1"],
      ["char", 0x20, 0x21],
      ["ref", "expression"],
    ],
  ];
  const result = rule("rule name", word("1"), char(" ", "!"), reference("expression"));

  expect(result).toStrictEqual(expected);
});
