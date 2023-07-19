import { expect, test } from "vitest";

import { rule, word } from "@/lib/rules/define-rules";

import { LR0ItemSet } from "./item-set";
import { LR0Item } from "./lr0-item";

test("construct item set", () => {
  const tokenSet = new LR0ItemSet([]);

  const result = [...tokenSet];

  expect(result).toStrictEqual([]);
});

test("set has item", () => {
  const tokenSet = new LR0ItemSet([new LR0Item(rule("S", word("any")))]);

  const result = tokenSet.has(new LR0Item(rule("S", word("any"))));

  expect(result).toBe(true);
});

test("add token", () => {
  const tokenSet = new LR0ItemSet([]);

  tokenSet.add(new LR0Item(rule("S", word("any"))));

  expect(tokenSet.has(new LR0Item(rule("S", word("any"))))).toBe(true);
  expect(tokenSet.has(new LR0Item(rule("S", word("all"))))).toBe(false);
});

test("equals item set", () => {
  const set1 = new LR0ItemSet([new LR0Item(rule("S", word("any")))]);
  const set2 = new LR0ItemSet([new LR0Item(rule("S", word("any")))]);

  expect(set1.equals(set2)).toBe(true);
});

test("not equals item set", () => {
  const set1 = new LR0ItemSet([new LR0Item(rule("S", word("any")))]);
  const set2 = new LR0ItemSet([new LR0Item(rule("S", word("all")))]);
  const set3 = new LR0ItemSet([new LR0Item(rule("F", word("any")))]);

  expect(set1.equals(set2)).toBe(false);
  expect(set2.equals(set3)).toBe(false);
  expect(set3.equals(set1)).toBe(false);
});
