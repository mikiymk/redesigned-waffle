import { describe, expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";

import { fromString } from "../core/reader";

import { generateParser } from "./generate-parser";

import type { Syntax } from "@/lib/rules/define-rules";

describe("parsing", () => {
  const syntax: Syntax = [
    rule("start", reference("S")),
    rule("S", reference("F")),
    rule("S", word("("), reference("S"), word("+"), reference("F"), word(")")),
    rule("F", word("1")),
  ];

  test("generating parser", () => {
    expect(() => generateParser(syntax)).not.toThrow();
  });

  const parser = generateParser(syntax);

  test("parse success", () => {
    const source = "(1+1)";

    const result = parser(fromString(source));

    expect(result).toStrictEqual([3, 1, 3, 2]);
  });

  test("parse failure", () => {
    const source = "(1+)";

    expect(parser(fromString(source))).toStrictEqual([false, new Error("nomatch input")]);
  });
});

describe("parsing 2", () => {
  const syntax: Syntax = [
    rule("S", reference("E")),
    rule("E", reference("E"), word("*"), reference("B")),
    rule("E", reference("E"), word("+"), reference("B")),
    rule("E", reference("B")),
    rule("B", word("0")),
    rule("B", word("1")),
  ];

  test("generating parser", () => {
    expect(() => generateParser(syntax)).not.toThrow();
  });

  const parser = generateParser(syntax);

  test("parse success", () => {
    const source = "1+1";

    const result = parser(fromString(source));

    expect(result).toStrictEqual([5, 3, 5, 2]);
  });

  test("parse failure", () => {
    const source = "1+2";

    expect(parser(fromString(source))).toStrictEqual([false, new Error("nomatch input")]);
  });
});
