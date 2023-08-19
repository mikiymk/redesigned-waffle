import { expect, test } from "vitest";

import { empty, eof, reference, rule, word } from "@/lib/rules/define-rules";

import { closure } from "../closure";
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

test("非終端記号のクロージャ展開", () => {
  // S → • E [$]
  const item = new LR0Item<undefined>(rule0, 0, [eof]);

  const result = closure(grammar, item);

  expect(result).toStrictEqual([
    // + E → • E * B [$, w *, w +]
    new LR0Item(rule1, 0, [eof, word("word", "*"), word("word", "+")]),
    // + E → • E + B [$, w *, w +]
    new LR0Item(rule2, 0, [eof, word("word", "*"), word("word", "+")]),
    // + E → • B [$, w *, w +]
    new LR0Item(rule3, 0, [eof, word("word", "*"), word("word", "+")]),
    // + B → • 0 [$]
    new LR0Item(rule4, 0, [eof, word("word", "*"), word("word", "+")]),
    // + B → • 1 [$]
    new LR0Item(rule5, 0, [eof, word("word", "*"), word("word", "+")]),
  ]);
});

test("終端記号のクロージャ展開", () => {
  // B → • 0
  const item = new LR0Item<undefined>(rule4);

  const result = closure(grammar, item);

  expect(result).toStrictEqual([]);
});

test("分岐のある展開", () => {
  // (0) S → N
  const rule0 = rule("S", [reference("N")]);
  // (1) N → I
  const rule1 = rule("N", [reference("I")]);
  // (2) N → I F
  const rule2 = rule("N", [reference("I"), reference("F")]);
  // (3) I → n
  const rule3 = rule("I", [word("n")]);
  // (4) F → . n
  const rule4 = rule("F", [word("d", "."), word("n")]);

  const syntax: Syntax<undefined> = [rule0, rule1, rule2, rule3, rule4];

  // S → • E [$]
  const item = new LR0Item(rule0, 0, [eof]);

  const result = closure(syntax, item).map((value) => value.toKeyString());

  expect(result).toHaveLength(3);
  // + N → • I   [$]
  expect(result).toContain(new LR0Item(rule1, 0, [eof]).toKeyString());
  // + N → • I F [$]
  expect(result).toContain(new LR0Item(rule2, 0, [eof]).toKeyString());
  // + I → • n   [$, w d]
  expect(result).toContain(new LR0Item(rule3, 0, [eof, word("d", ".")]).toKeyString());
});

test("空のルールがある展開", () => {
  // (0) S → N
  const rule0 = rule("S", [reference("N")]);
  // (1) N → I F
  const rule1 = rule("N", [reference("I"), reference("F")]);
  // (2) I → n
  const rule2 = rule("I", [word("n")]);
  // (3) F → ε
  const rule3 = rule("F", [empty]);
  // (4) F → . n
  const rule4 = rule("F", [word("d", "."), word("n")]);

  const syntax: Syntax<undefined> = [rule0, rule1, rule2, rule3, rule4];

  // S → • E [$]
  const item = new LR0Item(rule0, 0, [eof]);

  const result = closure(syntax, item);

  // + N → • I F [$]
  expect(result).toContainEqual(new LR0Item(rule1, 0, [eof]));
  // + I → • n   [F]
  expect(result).toContainEqual(new LR0Item(rule2, 0, [word("d", "."), eof]));
});
