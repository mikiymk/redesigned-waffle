import { expect, test } from "vitest";

import { eof, reference, rule, word } from "@/lib/rules/define-rules";
import { ObjectSet } from "@/lib/util/object-set";

import { closure } from "../closure";
import { groupByNextToken } from "../group-next-token";
import { LR0Item } from "../lr0-item";

import type { Syntax } from "@/lib/rules/define-rules";

// (0) S → E
const rule0 = rule("S", [reference("E")]);
// (1) E → E * B
const rule1 = rule("E", [reference("E"), word("word", "*"), reference("B")]);
// (2) E → E + B
const rule2 = rule("E", [reference("E"), word("word", "+"), reference("B")]);
// (3) E → B
const rule3 = rule("E", [reference("B")]);
// (4) B → 0
const rule4 = rule("B", [word("word", "0")]);
// (5) B → 1
const rule5 = rule("B", [word("word", "1")]);

const grammar: Syntax<undefined> = [rule0, rule1, rule2, rule3, rule4, rule5];

test("closure test non-terminal", () => {
  const item = new LR0Item<undefined>(rule0, 0, [eof]);

  const result = groupByNextToken([item, ...closure(grammar, item)]);

  expect(result).toEqual([
    [
      reference("E"),
      new ObjectSet<LR0Item<undefined>>([
        new LR0Item(rule0, 0, [eof]),
        new LR0Item(rule("E", [reference("E"), word("word", "*"), reference("B")]), 0, [
          eof,
          word("word", "*"),
          word("word", "+"),
        ]),
        new LR0Item(rule("E", [reference("E"), word("word", "+"), reference("B")]), 0, [
          eof,
          word("word", "*"),
          word("word", "+"),
        ]),
      ]),
    ],
    [
      reference("B"),
      new ObjectSet<LR0Item<undefined>>([
        new LR0Item(rule("E", [reference("B")]), 0, [eof, word("word", "*"), word("word", "+")]),
      ]),
    ],
    [
      word("word", "0"),
      new ObjectSet<LR0Item<undefined>>([
        new LR0Item(rule("B", [word("word", "0")]), 0, [eof, word("word", "*"), word("word", "+")]),
      ]),
    ],
    [
      word("word", "1"),
      new ObjectSet<LR0Item<undefined>>([
        new LR0Item(rule("B", [word("word", "1")]), 0, [eof, word("word", "*"), word("word", "+")]),
      ]),
    ],
  ]);
});
