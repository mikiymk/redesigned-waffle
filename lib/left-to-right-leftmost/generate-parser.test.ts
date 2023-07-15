import { expect, test } from "vitest";

import { reference, rule, word } from "./define-rules";
import { generateParser } from "./generate-parser";

import type { Syntax } from "./define-rules";

const syntax: Syntax = [
  rule("start", reference("S")),
  rule("S", reference("F")),
  rule("S", word("("), reference("S"), word("+"), reference("F"), word(")")),
  rule("F", word("1")),
];

test("generating parser", () => {
  expect(() => generateParser(syntax)).not.toThrow();
});
