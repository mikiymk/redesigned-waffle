import { expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";

import { generateParseTable } from "../parse-table";

import type { Syntax } from "@/lib/rules/define-rules";

// (0) S → E
// (1) E → E * B
// (2) E → E + B
// (3) E → B
// (4) B → 0
// (5) B → 1
const syntax: Syntax<undefined> = [
  rule("S", [reference("E")]),
  rule("E", [reference("E"), word("word", "*"), reference("B")]),
  rule("E", [reference("E"), word("word", "+"), reference("B")]),
  rule("E", [reference("B")]),
  rule("B", [word("word", "0")]),
  rule("B", [word("word", "1")]),
];

test("generate parser", () => {
  const result = generateParseTable(syntax);

  expect(result.shift).toHaveLength(9);
  expect(result.goto).toHaveLength(9);
  expect(result.reduce).toHaveLength(9);
  expect(result.accept).toHaveLength(9);

  // item set 0
  // S → • E
  // + E → • E * B
  // + E → • E + B
  // + E → • B
  // + B → • 0
  // + B → • 1

  // item set 1
  // B → 0 •

  // item set 2
  // B → 1 •

  // item set 3
  // S → E •
  // E → E • * B
  // E → E • + B

  // item set 4
  // E → B •

  // item set 5
  // E → E * • B
  // + B → • 0
  // + B → • 1

  // item set 6
  // E → E + • B
  // + B → • 0
  // + B → • 1

  // item set 7
  // E → E * B •

  // item set 8
  // E → E + B •

  expect(result.shift[0]).toEqual([
    [word("word", "0"), 3],
    [word("word", "1"), 4],
  ]);
  expect(result.goto[0]).toEqual([
    [reference("E"), 1],
    [reference("B"), 2],
  ]);
  expect(result.reduce[0]).toEqual([]);
  expect(result.accept[0]).toEqual([]);
});
