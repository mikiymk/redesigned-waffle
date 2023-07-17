import { expect, test } from "vitest";

import { dot, epsilon, reference, rule, word } from "../left-to-right-leftmost/define-rules";

import { getLR0Item } from "./lr0-item";

test("get items from rule", () => {
  const ruleS = rule("S", reference("E"), word("+"), reference("E"));

  const result = getLR0Item(ruleS);

  expect(result).toStrictEqual([
    ["S", [dot, reference("E"), word("+"), reference("E")]],
    ["S", [reference("E"), dot, word("+"), reference("E")]],
    ["S", [reference("E"), word("+"), dot, reference("E")]],
    ["S", [reference("E"), word("+"), reference("E"), dot]],
  ]);
});

test("get items from empty rule", () => {
  const ruleS = rule("S", epsilon);

  const result = getLR0Item(ruleS);

  expect(result).toStrictEqual([["S", [dot]]]);
});
