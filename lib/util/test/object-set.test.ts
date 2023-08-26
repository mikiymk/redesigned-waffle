import { expect, test } from "vitest";

import { ObjectSet } from "../object-set";

const word = (word: string) => {
  return {
    toKeyString() {
      return word;
    },
  };
};

test("空の集合を作る", () => {
  const set = new ObjectSet([]);

  expect(set.size).toBe(0);
});

test("初期要素のある集合を作る", () => {
  const set = new ObjectSet([word("dog")]);

  expect(set.size).toBe(1);
  expect(set.has(word("dog"))).toBe(true);
});

test("重複した初期要素のある集合を作る", () => {
  const set = new ObjectSet([word("dog"), word("dog")]);

  expect(set.size).toBe(1);
  expect(set.has(word("dog"))).toBe(true);
});

test("集合が要素を含むか", () => {
  const set = new ObjectSet([word("dog")]);

  expect(set.size).toBe(1);
  expect(set.has(word("dog"))).toBe(true);
  expect(set.has(word("cat"))).toBe(false);
});

test("集合に要素を追加する", () => {
  const set = new ObjectSet([word("dog")]);

  set.add(word("cat"));

  expect(set.size).toBe(2);
  expect(set.has(word("dog"))).toBe(true);
  expect(set.has(word("cat"))).toBe(true);
  expect(set.has(word("bird"))).toBe(false);
});

test("集合に重複した要素を追加する", () => {
  const set = new ObjectSet([word("dog")]);

  set.add(word("dog"));

  expect(set.size).toBe(1);
  expect(set.has(word("dog"))).toBe(true);
  expect(set.has(word("cat"))).toBe(false);
});

test("集合に複数の要素を追加する", () => {
  const set = new ObjectSet([word("dog")]);

  set.append([word("cat"), word("bird")]);

  expect(set.size).toBe(3);
  expect(set.has(word("dog"))).toBe(true);
  expect(set.has(word("cat"))).toBe(true);
  expect(set.has(word("bird"))).toBe(true);
  expect(set.has(word("fish"))).toBe(false);
});

test("集合にある要素を削除する", () => {
  const set = new ObjectSet([word("dog"), word("cat")]);

  const isDeleted = set.delete(word("dog"));

  expect(set.size).toBe(1);
  expect(set.has(word("dog"))).toBe(false);
  expect(set.has(word("cat"))).toBe(true);
  expect(isDeleted).toBe(true);
});

test("集合にない要素を削除する", () => {
  const set = new ObjectSet([word("dog"), word("cat")]);

  const isDeleted = set.delete(word("bird"));

  expect(set.size).toBe(2);
  expect(set.has(word("dog"))).toBe(true);
  expect(set.has(word("cat"))).toBe(true);
  expect(set.has(word("bird"))).toBe(false);
  expect(isDeleted).toBe(false);
});

test("2つの集合を比較する", () => {
  const set1 = new ObjectSet([word("dog"), word("cat")]);
  const set2 = new ObjectSet([word("dog"), word("cat")]);

  expect(set1.equals(set2)).toBe(true);
});

test("順番の違う2つの集合を比較する", () => {
  const set1 = new ObjectSet([word("dog"), word("cat")]);
  const set2 = new ObjectSet([word("cat"), word("dog")]);

  expect(set1.equals(set2)).toBe(true);
});

test("要素の違う2つの集合を比較する", () => {
  const set1 = new ObjectSet([word("dog"), word("cat")]);
  const set2 = new ObjectSet([word("dog"), word("bird")]);

  expect(set1.equals(set2)).toBe(false);
});

test("2つの集合の和集合", () => {
  const set1 = new ObjectSet([word("dog"), word("cat")]);
  const set2 = new ObjectSet([word("dog"), word("bird")]);

  const newSet = set1.union(set2);

  expect(set1.has(word("dog"))).toBe(true);
  expect(set1.has(word("cat"))).toBe(true);
  expect(set1.has(word("bird"))).toBe(false);

  expect(set2.has(word("dog"))).toBe(true);
  expect(set2.has(word("cat"))).toBe(false);
  expect(set2.has(word("bird"))).toBe(true);

  expect(newSet.has(word("dog"))).toBe(true);
  expect(newSet.has(word("cat"))).toBe(true);
  expect(newSet.has(word("bird"))).toBe(true);
});

test("2つの集合の積集合", () => {
  const set1 = new ObjectSet([word("dog"), word("cat")]);
  const set2 = new ObjectSet([word("dog"), word("bird")]);

  const newSet = set1.intersection(set2);

  expect(set1.has(word("dog"))).toBe(true);
  expect(set1.has(word("cat"))).toBe(true);
  expect(set1.has(word("bird"))).toBe(false);

  expect(set2.has(word("dog"))).toBe(true);
  expect(set2.has(word("cat"))).toBe(false);
  expect(set2.has(word("bird"))).toBe(true);

  expect(newSet.has(word("dog"))).toBe(true);
  expect(newSet.has(word("cat"))).toBe(false);
  expect(newSet.has(word("bird"))).toBe(false);
});

test("2つの集合の差集合", () => {
  const set1 = new ObjectSet([word("dog"), word("cat")]);
  const set2 = new ObjectSet([word("dog"), word("bird")]);

  const newSet = set1.difference(set2);

  expect(set1.has(word("dog"))).toBe(true);
  expect(set1.has(word("cat"))).toBe(true);
  expect(set1.has(word("bird"))).toBe(false);

  expect(set2.has(word("dog"))).toBe(true);
  expect(set2.has(word("cat"))).toBe(false);
  expect(set2.has(word("bird"))).toBe(true);

  expect(newSet.has(word("dog"))).toBe(false);
  expect(newSet.has(word("cat"))).toBe(true);
  expect(newSet.has(word("bird"))).toBe(false);
});
