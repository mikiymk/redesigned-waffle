import { expect, test } from "vitest";

import { char, word } from "@/lib/rules/define-rules";

import { ObjectSet } from "./object-set";

import type { Token } from "@/lib/rules/define-rules";

test("construct token set", () => {
  const tokenSet = new ObjectSet<Token>([]);

  const result = [...tokenSet];

  expect(result).toStrictEqual([]);
});

test("construct token set and any tokens", () => {
  const tokenSet = new ObjectSet<Token>([word("any"), word("any")]);

  const result = [...tokenSet];

  expect(result).toStrictEqual([word("any")]);
});

test("set has token", () => {
  const tokenSet = new ObjectSet<Token>([word("any")]);

  const result = tokenSet.has(word("any"));

  expect(result).toBe(true);
});

test("set has not token", () => {
  const tokenSet = new ObjectSet<Token>([word("any")]);

  const result = tokenSet.has(word("all"));

  expect(result).toBe(false);
});

test("add token", () => {
  const tokenSet = new ObjectSet<Token>([]);

  tokenSet.add(word("any"));

  expect(tokenSet.has(word("any"))).toBe(true);
  expect(tokenSet.has(word("all"))).toBe(false);
});

test("add token, duplicate", () => {
  const tokenSet = new ObjectSet<Token>([]);

  tokenSet.add(word("any"));
  tokenSet.add(word("any"));

  expect(tokenSet.has(word("any"))).toBe(true);
  expect(tokenSet.has(word("any2"))).toBe(false);
});

test("append tokens", () => {
  const tokenSet = new ObjectSet<Token>([]);

  tokenSet.append([word("any"), char("A", "C")]);

  expect(tokenSet.has(word("any"))).toBe(true);
  expect(tokenSet.has(char("A", "C"))).toBe(true);
  expect(tokenSet.has(word("all"))).toBe(false);
});

test("union set", () => {
  const tokenSet1 = new ObjectSet<Token>([word("a"), word("b")]);
  const tokenSet2 = new ObjectSet<Token>([word("b"), word("c")]);

  const newSet = tokenSet1.union(tokenSet2);

  expect(tokenSet1.has(word("a"))).toBe(true);
  expect(tokenSet1.has(word("b"))).toBe(true);
  expect(tokenSet1.has(word("c"))).toBe(false);

  expect(tokenSet2.has(word("a"))).toBe(false);
  expect(tokenSet2.has(word("b"))).toBe(true);
  expect(tokenSet2.has(word("c"))).toBe(true);

  expect(newSet.has(word("a"))).toBe(true);
  expect(newSet.has(word("b"))).toBe(true);
  expect(newSet.has(word("c"))).toBe(true);
});

test("intersection set", () => {
  const tokenSet1 = new ObjectSet<Token>([word("a"), word("b")]);
  const tokenSet2 = new ObjectSet<Token>([word("b"), word("c")]);

  const newSet = tokenSet1.intersection(tokenSet2);

  expect(tokenSet1.has(word("a"))).toBe(true);
  expect(tokenSet1.has(word("b"))).toBe(true);
  expect(tokenSet1.has(word("c"))).toBe(false);

  expect(tokenSet2.has(word("a"))).toBe(false);
  expect(tokenSet2.has(word("b"))).toBe(true);
  expect(tokenSet2.has(word("c"))).toBe(true);

  expect(newSet.has(word("a"))).toBe(false);
  expect(newSet.has(word("b"))).toBe(true);
  expect(newSet.has(word("c"))).toBe(false);
});

test("difference set", () => {
  const tokenSet1 = new ObjectSet<Token>([word("a"), word("b")]);
  const tokenSet2 = new ObjectSet<Token>([word("b"), word("c")]);

  const newSet = tokenSet1.difference(tokenSet2);

  expect(tokenSet1.has(word("a"))).toBe(true);
  expect(tokenSet1.has(word("b"))).toBe(true);
  expect(tokenSet1.has(word("c"))).toBe(false);

  expect(tokenSet2.has(word("a"))).toBe(false);
  expect(tokenSet2.has(word("b"))).toBe(true);
  expect(tokenSet2.has(word("c"))).toBe(true);

  expect(newSet.has(word("a"))).toBe(true);
  expect(newSet.has(word("b"))).toBe(false);
  expect(newSet.has(word("c"))).toBe(false);
});
