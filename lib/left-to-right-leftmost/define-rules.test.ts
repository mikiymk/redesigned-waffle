import { expect, test } from "vitest";

import { char, reference, rule, word } from "./define-rules";

test("define rules", () => {
  const expected = ["rule name", ["word", "1"], ["char", 32, 33], ["ref", "expression"]];
  const result = rule("rule name", word("1"), char(0x20, 0x21), reference("expression"));

  expect(result).toStrictEqual(expected);
});
