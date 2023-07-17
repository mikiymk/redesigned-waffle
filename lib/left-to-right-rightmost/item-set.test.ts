import { expect, test } from "vitest";

import { rule, word } from "../left-to-right-leftmost/define-rules";

import { LR0ItemSet } from "./item-set";
import { getLR0Item } from "./lr0-item";

test("construct item set", () => {
  const tokenSet = new LR0ItemSet([]);

  const result = [...tokenSet];

  expect(result).toStrictEqual([]);
});

test("set has item", () => {
  const tokenSet = new LR0ItemSet([getLR0Item(rule("S", word("any")))]);

  const result = tokenSet.has(getLR0Item(rule("S", word("any"))));

  expect(result).toBe(true);
});

test("add token", () => {
  const tokenSet = new LR0ItemSet([]);

  tokenSet.add(getLR0Item(rule("S", word("any"))));

  expect(tokenSet.has(getLR0Item(rule("S", word("any"))))).toBe(true);
  expect(tokenSet.has(getLR0Item(rule("S", word("all"))))).toBe(false);
});
