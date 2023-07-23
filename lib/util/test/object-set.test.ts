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
  const tokenSet = new ObjectSet([]);

  expect(tokenSet.size).toBe(0);
});

test("初期要素のある集合を作る", () => {
  const tokenSet = new ObjectSet([word("dog")]);

  expect(tokenSet.size).toBe(1);
  expect(tokenSet.has(word("dog"))).toBe(true);
});

test("重複した初期要素のある集合を作る", () => {
  const tokenSet = new ObjectSet([word("dog"), word("dog")]);

  expect(tokenSet.size).toBe(1);
  expect(tokenSet.has(word("dog"))).toBe(true);
});

test("集合が要素を含むか", () => {
  const tokenSet = new ObjectSet([word("dog")]);

  expect(tokenSet.size).toBe(1);
  expect(tokenSet.has(word("dog"))).toBe(true);
  expect(tokenSet.has(word("cat"))).toBe(false);
});

test("集合に要素を追加する", () => {
  const tokenSet = new ObjectSet([word("dog")]);

  tokenSet.add(word("cat"));

  expect(tokenSet.size).toBe(2);
  expect(tokenSet.has(word("dog"))).toBe(true);
  expect(tokenSet.has(word("cat"))).toBe(true);
  expect(tokenSet.has(word("bird"))).toBe(false);
});

test("集合に重複した要素を追加する", () => {
  const tokenSet = new ObjectSet([word("dog")]);

  tokenSet.add(word("dog"));

  expect(tokenSet.size).toBe(1);
  expect(tokenSet.has(word("dog"))).toBe(true);
  expect(tokenSet.has(word("cat"))).toBe(false);
});

test("集合に複数の要素を追加する", () => {
  const tokenSet = new ObjectSet([word("dog")]);

  tokenSet.append([word("cat"), word("bird")]);

  expect(tokenSet.size).toBe(3);
  expect(tokenSet.has(word("dog"))).toBe(true);
  expect(tokenSet.has(word("cat"))).toBe(true);
  expect(tokenSet.has(word("bird"))).toBe(true);
  expect(tokenSet.has(word("fish"))).toBe(false);
});

test("集合にある要素を削除する", () => {
  const tokenSet = new ObjectSet([word("dog"), word("cat")]);

  const isDeleted = tokenSet.delete(word("dog"));

  expect(tokenSet.size).toBe(1);
  expect(tokenSet.has(word("dog"))).toBe(false);
  expect(tokenSet.has(word("cat"))).toBe(true);
  expect(isDeleted).toBe(true);
});

test("集合にない要素を削除する", () => {
  const tokenSet = new ObjectSet([word("dog"), word("cat")]);

  const isDeleted = tokenSet.delete(word("bird"));

  expect(tokenSet.size).toBe(2);
  expect(tokenSet.has(word("dog"))).toBe(true);
  expect(tokenSet.has(word("cat"))).toBe(true);
  expect(tokenSet.has(word("bird"))).toBe(false);
  expect(isDeleted).toBe(false);
});

test("2つの集合を比較する", () => {
  const tokenSet1 = new ObjectSet([word("dog"), word("cat")]);
  const tokenSet2 = new ObjectSet([word("dog"), word("cat")]);

  expect(tokenSet1.equals(tokenSet2)).toBe(true);
});

test("順番の違う2つの集合を比較する", () => {
  const tokenSet1 = new ObjectSet([word("dog"), word("cat")]);
  const tokenSet2 = new ObjectSet([word("cat"), word("dog")]);

  expect(tokenSet1.equals(tokenSet2)).toBe(true);
});

test("要素の違う2つの集合を比較する", () => {
  const tokenSet1 = new ObjectSet([word("dog"), word("cat")]);
  const tokenSet2 = new ObjectSet([word("dog"), word("bird")]);

  expect(tokenSet1.equals(tokenSet2)).toBe(false);
});

test("2つの集合の和集合", () => {
  const tokenSet1 = new ObjectSet([word("dog"), word("cat")]);
  const tokenSet2 = new ObjectSet([word("dog"), word("bird")]);

  const newSet = tokenSet1.union(tokenSet2);

  expect(tokenSet1.has(word("dog"))).toBe(true);
  expect(tokenSet1.has(word("cat"))).toBe(true);
  expect(tokenSet1.has(word("bird"))).toBe(false);

  expect(tokenSet2.has(word("dog"))).toBe(true);
  expect(tokenSet2.has(word("cat"))).toBe(false);
  expect(tokenSet2.has(word("bird"))).toBe(true);

  expect(newSet.has(word("dog"))).toBe(true);
  expect(newSet.has(word("cat"))).toBe(true);
  expect(newSet.has(word("bird"))).toBe(true);
});

test("2つの集合の積集合", () => {
  const tokenSet1 = new ObjectSet([word("dog"), word("cat")]);
  const tokenSet2 = new ObjectSet([word("dog"), word("bird")]);

  const newSet = tokenSet1.intersection(tokenSet2);

  expect(tokenSet1.has(word("dog"))).toBe(true);
  expect(tokenSet1.has(word("cat"))).toBe(true);
  expect(tokenSet1.has(word("bird"))).toBe(false);

  expect(tokenSet2.has(word("dog"))).toBe(true);
  expect(tokenSet2.has(word("cat"))).toBe(false);
  expect(tokenSet2.has(word("bird"))).toBe(true);

  expect(newSet.has(word("dog"))).toBe(true);
  expect(newSet.has(word("cat"))).toBe(false);
  expect(newSet.has(word("bird"))).toBe(false);
});

test("2つの集合の差集合", () => {
  const tokenSet1 = new ObjectSet([word("dog"), word("cat")]);
  const tokenSet2 = new ObjectSet([word("dog"), word("bird")]);

  const newSet = tokenSet1.difference(tokenSet2);

  expect(tokenSet1.has(word("dog"))).toBe(true);
  expect(tokenSet1.has(word("cat"))).toBe(true);
  expect(tokenSet1.has(word("bird"))).toBe(false);

  expect(tokenSet2.has(word("dog"))).toBe(true);
  expect(tokenSet2.has(word("cat"))).toBe(false);
  expect(tokenSet2.has(word("bird"))).toBe(true);

  expect(newSet.has(word("dog"))).toBe(false);
  expect(newSet.has(word("cat"))).toBe(true);
  expect(newSet.has(word("bird"))).toBe(false);
});
