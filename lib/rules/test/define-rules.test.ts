import { expect, test } from "vitest";

import { char, reference, rule, word } from "../define-rules";

test("define rules", () => {
  const expected = ["rule name", [word("1"), char(" ", "!"), reference("expression")]];
  const result = rule("rule name", word("1"), char(" ", "!"), reference("expression"));

  expect(result).toStrictEqual(expected);
});
