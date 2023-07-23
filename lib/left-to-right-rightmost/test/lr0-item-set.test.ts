import { expect, test } from "vitest";

import { rule, word } from "@/lib/rules/define-rules";

import { LR0Item } from "../lr0-item";
import { LR0ItemSet } from "../lr0-item-set";

test("LRアイテム集合を作成する", () => {
  const tokenSet = new LR0ItemSet([]);

  const result = [...tokenSet];

  expect(result).toStrictEqual([]);
});

test("アイテムを持つLRアイテム集合を作成する", () => {
  const result = new LR0ItemSet([new LR0Item(rule("S", word("any")))]);

  expect(result.size).toBe(1);
  expect(result.has(new LR0Item(rule("S", word("any"))))).toBe(true);
});

test("アイテムを追加する", () => {
  const tokenSet = new LR0ItemSet([]);

  tokenSet.add(new LR0Item(rule("S", word("any"))));

  expect(tokenSet.has(new LR0Item(rule("S", word("any"))))).toBe(true);
  expect(tokenSet.has(new LR0Item(rule("S", word("all"))))).toBe(false);
});

test("複数のアイテムを追加する", () => {
  const tokenSet = new LR0ItemSet([]);

  tokenSet.append([new LR0Item(rule("S", word("any"))), new LR0Item(rule("S", word("all")))]);

  expect(tokenSet.has(new LR0Item(rule("S", word("any"))))).toBe(true);
  expect(tokenSet.has(new LR0Item(rule("S", word("all"))))).toBe(true);
});

test("アイテムを削除する", () => {
  const tokenSet = new LR0ItemSet([new LR0Item(rule("S", word("any"))), new LR0Item(rule("S", word("all")))]);

  tokenSet.delete(new LR0Item(rule("S", word("any"))));

  expect(tokenSet.has(new LR0Item(rule("S", word("any"))))).toBe(false);
  expect(tokenSet.has(new LR0Item(rule("S", word("all"))))).toBe(true);
});

test("和集合", () => {
  const tokenSet1 = new LR0ItemSet([new LR0Item(rule("S", word("dog"))), new LR0Item(rule("S", word("cat")))]);
  const tokenSet2 = new LR0ItemSet([new LR0Item(rule("S", word("dog"))), new LR0Item(rule("S", word("bird")))]);

  const result = tokenSet1.union(tokenSet2);

  expect(tokenSet1.has(new LR0Item(rule("S", word("dog"))))).toBe(true);
  expect(tokenSet1.has(new LR0Item(rule("S", word("cat"))))).toBe(true);
  expect(tokenSet1.has(new LR0Item(rule("S", word("bird"))))).toBe(false);

  expect(tokenSet2.has(new LR0Item(rule("S", word("dog"))))).toBe(true);
  expect(tokenSet2.has(new LR0Item(rule("S", word("cat"))))).toBe(false);
  expect(tokenSet2.has(new LR0Item(rule("S", word("bird"))))).toBe(true);

  expect(result.has(new LR0Item(rule("S", word("dog"))))).toBe(true);
  expect(result.has(new LR0Item(rule("S", word("cat"))))).toBe(true);
  expect(result.has(new LR0Item(rule("S", word("bird"))))).toBe(true);
});

test("積集合", () => {
  const tokenSet1 = new LR0ItemSet([new LR0Item(rule("S", word("dog"))), new LR0Item(rule("S", word("cat")))]);
  const tokenSet2 = new LR0ItemSet([new LR0Item(rule("S", word("dog"))), new LR0Item(rule("S", word("bird")))]);

  const result = tokenSet1.intersection(tokenSet2);

  expect(tokenSet1.has(new LR0Item(rule("S", word("dog"))))).toBe(true);
  expect(tokenSet1.has(new LR0Item(rule("S", word("cat"))))).toBe(true);
  expect(tokenSet1.has(new LR0Item(rule("S", word("bird"))))).toBe(false);

  expect(tokenSet2.has(new LR0Item(rule("S", word("dog"))))).toBe(true);
  expect(tokenSet2.has(new LR0Item(rule("S", word("cat"))))).toBe(false);
  expect(tokenSet2.has(new LR0Item(rule("S", word("bird"))))).toBe(true);

  expect(result.has(new LR0Item(rule("S", word("dog"))))).toBe(true);
  expect(result.has(new LR0Item(rule("S", word("cat"))))).toBe(false);
  expect(result.has(new LR0Item(rule("S", word("bird"))))).toBe(false);
});

test("差集合", () => {
  const tokenSet1 = new LR0ItemSet([new LR0Item(rule("S", word("dog"))), new LR0Item(rule("S", word("cat")))]);
  const tokenSet2 = new LR0ItemSet([new LR0Item(rule("S", word("dog"))), new LR0Item(rule("S", word("bird")))]);

  const result = tokenSet1.difference(tokenSet2);

  expect(tokenSet1.has(new LR0Item(rule("S", word("dog"))))).toBe(true);
  expect(tokenSet1.has(new LR0Item(rule("S", word("cat"))))).toBe(true);
  expect(tokenSet1.has(new LR0Item(rule("S", word("bird"))))).toBe(false);

  expect(tokenSet2.has(new LR0Item(rule("S", word("dog"))))).toBe(true);
  expect(tokenSet2.has(new LR0Item(rule("S", word("cat"))))).toBe(false);
  expect(tokenSet2.has(new LR0Item(rule("S", word("bird"))))).toBe(true);

  expect(result.has(new LR0Item(rule("S", word("dog"))))).toBe(false);
  expect(result.has(new LR0Item(rule("S", word("cat"))))).toBe(true);
  expect(result.has(new LR0Item(rule("S", word("bird"))))).toBe(false);
});

test("#asString", () => {
  const set = new LR0ItemSet([new LR0Item(rule("S", word("any")))]);

  expect(set.asString()).toBe('LR0ItemSet ["S" →  . w "any"]');
});

test("等しい2つの集合", () => {
  const set1 = new LR0ItemSet([new LR0Item(rule("S", word("any")))]);
  const set2 = new LR0ItemSet([new LR0Item(rule("S", word("any")))]);

  expect(set1.equals(set2)).toBe(true);
});

test("等しくない2つの集合", () => {
  const set1 = new LR0ItemSet([new LR0Item(rule("S", word("any")))]);
  const set2 = new LR0ItemSet([new LR0Item(rule("S", word("all")))]);
  const set3 = new LR0ItemSet([new LR0Item(rule("F", word("any")))]);

  expect(set1.equals(set2)).toBe(false);
  expect(set2.equals(set3)).toBe(false);
  expect(set3.equals(set1)).toBe(false);
});
