import { expect, test } from "vitest";

import { empty, eof, reference, rule, word } from "@/lib/rules/define-rules";

import { closure } from "../closure";
import { LR0Item } from "../lr0-item";

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

test("非終端記号のクロージャ展開", () => {
  // S → • E
  const item = new LR0Item<undefined>(syntax[0]!, 0, []);

  const result = closure(syntax, item);

  expect(result).toStrictEqual([
    // + E → • E * B
    new LR0Item(rule("E", [reference("E"), word("word", "*"), reference("B")])),
    // + E → • E + B
    new LR0Item(rule("E", [reference("E"), word("word", "+"), reference("B")])),
    // + E → • B
    new LR0Item(rule("E", [reference("B")])),
    // + B → • 0
    new LR0Item(rule("B", [word("word", "0")])),
    // + B → • 1
    new LR0Item(rule("B", [word("word", "1")])),
  ]);
});

test("終端記号のクロージャ展開", () => {
  // B → • 0
  const item = new LR0Item<undefined>(syntax[4]!);

  const result = closure(syntax, item);

  expect(result).toStrictEqual([]);
});

test("分岐のある展開", () => {
  // (0) S → N
  // (1) N → I
  // (2) N → I F
  // (3) I → n
  // (4) F → . n
  const syntax: Syntax<undefined> = [
    rule("S", [reference("N")]),
    rule("N", [reference("I")]),
    rule("N", [reference("I"), reference("F")]),
    rule("I", [word("n")]),
    rule("F", [word("d", "."), word("n")]),
  ];

  // S → • E [$]
  const item = new LR0Item(syntax[0]!, 0, [eof]);

  const result = closure(syntax, item);

  // + N → • I   [$]
  expect(result).toContainEqual(new LR0Item(syntax[1]!, 0, [eof]));
  // + N → • I F [$]
  expect(result).toContainEqual(new LR0Item(syntax[2]!, 0, [eof]));
  // + I → • n   [$]
  expect(result).toContainEqual(new LR0Item(syntax[3]!, 0, [eof]));
  // + I → • n   [F]
  expect(result).toContainEqual(new LR0Item(syntax[3]!, 0, [word("d", ".")]));
});

test("空のルールがある展開", () => {
  // (0) S → N
  // (1) N → I F
  // (2) I → n
  // (3) F → ε
  // (4) F → . n
  const syntax: Syntax<undefined> = [
    rule("S", [reference("N")]),
    rule("N", [reference("I"), reference("F")]),
    rule("I", [word("n")]),
    rule("F", [empty]),
    rule("F", [word("d", "."), word("n")]),
  ];

  // S → • E [$]
  const item = new LR0Item(syntax[0]!, 0, [eof]);

  const result = closure(syntax, item);

  // + N → • I F [$]
  expect(result).toContainEqual(new LR0Item(syntax[1]!, 0, [eof]));
  // + I → • n   [F]
  expect(result).toContainEqual(new LR0Item(syntax[2]!, 0, [word("d", "."), eof]));
});
