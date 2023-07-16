import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

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

describe("parsing", () => {
  const parser = generateParser(syntax);

  test("parse success", () => {
    const source = "(1+1)";

    const result = parser(fromString(source));

    expect(result).toStrictEqual([0, 2, "(", 1, 3, "1", "+", 3, "1", ")"]);
  });

  test("parse failure", () => {
    const source = "(1+)";

    expect(() => parser(fromString(source))).toThrow("no rule F matches first char )");
  });
});
