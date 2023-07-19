import { expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";

import { generateParser } from "./generate-parser";
import { LR0ItemSet, itemToString } from "./item-set";

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

test("generate parser", () => {
  const result = generateParser(syntax);
  let count = 0;

  for (const { kernels, additions, gotoMap } of result) {
    console.log("item set", count++);
    for (const item of kernels) console.log("  ", itemToString(item));
    for (const item of additions) console.log(" +", itemToString(item));
    for (const [token, number] of gotoMap) console.log(" :", token.toString(), "=>", number);

    console.log();
  }

  expect(result).toHaveLength(9);

  // item set 0
  // S → • E
  // + E → • E * B
  // + E → • E + B
  // + E → • B
  // + B → • 0
  // + B → • 1
  expect(result[0]).toStrictEqual({
    kernels: new LR0ItemSet([{ name: "S", tokens: [reference("E")], position: 0 }]),
    additions: new LR0ItemSet([
      { name: "E", tokens: [reference("E"), word("*"), reference("B")], position: 0 },
      { name: "E", tokens: [reference("E"), word("+"), reference("B")], position: 0 },
      { name: "E", tokens: [reference("B")], position: 0 },
      { name: "B", tokens: [word("0")], position: 0 },
      { name: "B", tokens: [word("1")], position: 0 },
    ]),
    gotoMap: [
      [reference("E"), 1],
      [reference("B"), 2],
      [word("0"), 3],
      [word("1"), 4],
    ],
  });

  // item set 1
  // B → 0 •
  expect(result).toContainEqual({
    kernels: new LR0ItemSet([{ name: "B", tokens: [word("0")], position: 1 }]),
    additions: new LR0ItemSet(),
    gotoMap: [],
  });

  // item set 2
  // B → 1 •
  expect(result).toContainEqual({
    kernels: new LR0ItemSet([{ name: "B", tokens: [word("1")], position: 1 }]),
    additions: new LR0ItemSet(),
    gotoMap: [],
  });

  // item set 3
  // S → E •
  // E → E • * B
  // E → E • + B
  expect(result).toContainEqual({
    kernels: new LR0ItemSet([
      { name: "S", tokens: [reference("E")], position: 1 },
      { name: "E", tokens: [reference("E"), word("*"), reference("B")], position: 1 },
      { name: "E", tokens: [reference("E"), word("+"), reference("B")], position: 1 },
    ]),
    additions: new LR0ItemSet(),
    gotoMap: [
      [word("*"), 5],
      [word("+"), 6],
    ],
  });

  // item set 4
  // E → B •
  expect(result).toContainEqual({
    kernels: new LR0ItemSet([{ name: "E", tokens: [reference("B")], position: 1 }]),
    additions: new LR0ItemSet(),
    gotoMap: [],
  });

  // item set 5
  // E → E * • B
  // + B → • 0
  // + B → • 1
  expect(result).toContainEqual({
    kernels: new LR0ItemSet([{ name: "E", tokens: [reference("E"), word("*"), reference("B")], position: 2 }]),
    additions: new LR0ItemSet([
      { name: "B", tokens: [word("0")], position: 0 },
      { name: "B", tokens: [word("1")], position: 0 },
    ]),
    gotoMap: [
      [reference("B"), 7],
      [word("0"), 3],
      [word("1"), 4],
    ],
  });

  // item set 6
  // E → E + • B
  // + B → • 0
  // + B → • 1
  expect(result).toContainEqual({
    kernels: new LR0ItemSet([{ name: "E", tokens: [reference("E"), word("+"), reference("B")], position: 2 }]),
    additions: new LR0ItemSet([
      { name: "B", tokens: [word("0")], position: 0 },
      { name: "B", tokens: [word("1")], position: 0 },
    ]),
    gotoMap: [
      [reference("B"), 8],
      [word("0"), 3],
      [word("1"), 4],
    ],
  });

  // item set 7
  // E → E * B •
  expect(result).toContainEqual({
    kernels: new LR0ItemSet([{ name: "E", tokens: [reference("E"), word("*"), reference("B")], position: 3 }]),
    additions: new LR0ItemSet(),
    gotoMap: [],
  });

  // item set 8
  // E → E + B •
  expect(result).toContainEqual({
    kernels: new LR0ItemSet([{ name: "E", tokens: [reference("E"), word("+"), reference("B")], position: 3 }]),
    additions: new LR0ItemSet(),
    gotoMap: [],
  });
});
