import { expect, test } from "vitest";

import { reference, rule, word } from "../left-to-right-leftmost/define-rules";

import { generateParser } from "./generate-parser";

import type { Syntax } from "../left-to-right-leftmost/define-rules";
import { itemToString } from "./item-set";

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

  for (const { kernels, additions } of result) {
    console.log("item set", count++);
    for (const item of kernels) console.log("  ", itemToString(item));
    for (const item of additions) console.log(" +", itemToString(item));

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
    kernels: [{ name: "S", tokens: [reference("E")], position: 0 }],
    additions: [
      { name: "E", tokens: [reference("E"), word("*"), reference("B")], position: 0 },
      { name: "E", tokens: [reference("E"), word("+"), reference("B")], position: 0 },
      { name: "E", tokens: [reference("B")], position: 0 },
      { name: "B", tokens: [word("0")], position: 0 },
      { name: "B", tokens: [word("1")], position: 0 },
    ],
  });

  // item set 1
  // B → 0 •
  expect(result).toContainEqual({
    kernels: [{ name: "B", tokens: [word("0")], position: 1 }],
    additions: [],
  });

  // item set 2
  // B → 1 •
  expect(result).toContainEqual({
    kernels: [{ name: "B", tokens: [word("1")], position: 1 }],
    additions: [],
  });

  // item set 3
  // S → E •
  // E → E • * B
  // E → E • + B
  expect(result).toContainEqual({
    kernels: [
      { name: "S", tokens: [reference("E")], position: 1 },
      { name: "E", tokens: [reference("E"), word("*"), reference("B")], position: 1 },
      { name: "E", tokens: [reference("E"), word("+"), reference("B")], position: 1 },
    ],
    additions: [],
  });

  // item set 4
  // E → B •
  expect(result).toContainEqual({
    kernels: [{ name: "E", tokens: [reference("B")], position: 1 }],
    additions: [],
  });

  // item set 5
  // E → E * • B
  // + B → • 0
  // + B → • 1
  expect(result).toContainEqual({
    kernels: [{ name: "E", tokens: [reference("E"), word("*"), reference("B")], position: 2 }],
    additions: [
      { name: "B", tokens: [word("0")], position: 0 },
      { name: "B", tokens: [word("1")], position: 0 },
    ],
  });

  // item set 6
  // E → E + • B
  // + B → • 0
  // + B → • 1
  expect(result).toContainEqual({
    kernels: [{ name: "E", tokens: [reference("E"), word("+"), reference("B")], position: 2 }],
    additions: [
      { name: "B", tokens: [word("0")], position: 0 },
      { name: "B", tokens: [word("1")], position: 0 },
    ],
  });

  // item set 7
  // E → E * B •
  expect(result).toContainEqual({
    kernels: [{ name: "E", tokens: [reference("E"), word("*"), reference("B")], position: 3 }],
    additions: [],
  });

  // item set 8
  // E → E + B •
  expect(result).toContainEqual({
    kernels: [{ name: "E", tokens: [reference("E"), word("+"), reference("B")], position: 3 }],
    additions: [],
  });
});
