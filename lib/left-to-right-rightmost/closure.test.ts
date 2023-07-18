import { expect, test } from "vitest";

import { reference, rule, word } from "../left-to-right-leftmost/define-rules";

import { closure } from "./closure";
import { getLR0Item } from "./lr0-item";

import type { Syntax } from "../left-to-right-leftmost/define-rules";

// (0) S → E
// (1) E → E * B
// (2) E → E + B
// (3) E → B
// (4) B → 0
// (5) B → 1
const syntax: Syntax = [
  rule("S", reference("E")),
  rule("E", reference("E"), word("*"), reference("B")),
  rule("E", reference("E"), word("+"), reference("B")),
  rule("E", reference("B")),
  rule("B", word("0")),
  rule("B", word("1")),
];

test("closure test non-terminal", () => {
  // S → • E
  const item = getLR0Item(syntax[0]!);

  const result = closure(syntax, item);

  expect(result).toStrictEqual([
    // + E → • E * B
    getLR0Item(rule("E", reference("E"), word("*"), reference("B"))),
    // + E → • E + B
    getLR0Item(rule("E", reference("E"), word("+"), reference("B"))),
    // + E → • B
    getLR0Item(rule("E", reference("B"))),
    // + B → • 0
    getLR0Item(rule("B", word("0"))),
    // + B → • 1
    getLR0Item(rule("B", word("1"))),
  ]);
});

test("closure test terminal", () => {
  // B → • 0
  const item = getLR0Item(syntax[4]!);

  const result = closure(syntax, item);

  expect(result).toStrictEqual([]);
});
