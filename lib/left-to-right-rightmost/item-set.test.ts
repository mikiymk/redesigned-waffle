import { expect, test } from "vitest";

import { word } from "../left-to-right-leftmost/define-rules";

import { LR0ItemSet } from "./item-set";

test("construct item set", () => {
  const tokenSet = new LR0ItemSet([]);

  const result = [...tokenSet];

  expect(result).toStrictEqual([]);
});

test("set has item", () => {
  const tokenSet = new LR0ItemSet([["S", [word("any")]]]);

  const result = tokenSet.has(["S", [word("any")]]);

  expect(result).toBe(true);
});

test("add token", () => {
  const tokenSet = new LR0ItemSet([]);

  tokenSet.add(["S", [word("any")]]);

  expect(tokenSet.has(["S", [word("any")]])).toBe(true);
  expect(tokenSet.has(["S", [word("all")]])).toBe(false);
});
