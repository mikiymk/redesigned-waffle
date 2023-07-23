import { expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";

import { closure } from "../closure";
import { groupByNextToken } from "../group-next-token";
import { LR0Item } from "../lr0-item";
import { LR0ItemSet } from "../lr0-item-set";

import type { Syntax } from "@/lib/rules/define-rules";

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
  const item = new LR0Item(syntax[0]!);

  const result = groupByNextToken([item, ...closure(syntax, item)]);

  expect(result).toStrictEqual([
    [
      reference("E"),
      new LR0ItemSet([
        new LR0Item(rule("S", reference("E"))),
        new LR0Item(rule("E", reference("E"), word("*"), reference("B"))),
        new LR0Item(rule("E", reference("E"), word("+"), reference("B"))),
      ]),
    ],
    [reference("B"), new LR0ItemSet([new LR0Item(rule("E", reference("B")))])],
    [word("0"), new LR0ItemSet([new LR0Item(rule("B", word("0")))])],
    [word("1"), new LR0ItemSet([new LR0Item(rule("B", word("1")))])],
  ]);
});
