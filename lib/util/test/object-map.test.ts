import { expect, test } from "vitest";

import { ObjectMap } from "../object-map";

type Key = {
  toKeyString(): string;
};
const key = (word: string): Key => {
  return {
    toKeyString() {
      return word;
    },
  };
};

test("空のマップを作る", () => {
  const tokenSet = new ObjectMap([]);

  expect(tokenSet.size).toBe(0);
});

test("初期要素のあるマップを作る", () => {
  const tokenSet = new ObjectMap([[key("dog"), 1]]);

  expect(tokenSet.size).toBe(1);
  expect(tokenSet.get(key("dog"))).toBe(1);
});

test("重複した初期要素はより後の値にセットされる", () => {
  const tokenSet = new ObjectMap([
    [key("dog"), 1],
    [key("dog"), 2],
  ]);

  expect(tokenSet.size).toBe(1);
  expect(tokenSet.get(key("dog"))).toBe(2);
});

test("マップがキーを持つか", () => {
  const tokenSet = new ObjectMap([[key("dog"), 1]]);

  expect(tokenSet.size).toBe(1);
  expect(tokenSet.has(key("dog"))).toBe(true);
  expect(tokenSet.has(key("cat"))).toBe(false);
});

test("マップから要素を取得する", () => {
  const tokenSet = new ObjectMap([[key("dog"), 1]]);

  expect(tokenSet.size).toBe(1);
  expect(tokenSet.get(key("dog"))).toBe(1);
  expect(tokenSet.get(key("cat"))).toBeUndefined();
});

test("マップに要素を追加する", () => {
  const tokenSet = new ObjectMap([[key("dog"), 1]]);

  tokenSet.set(key("cat"), 2);

  expect(tokenSet.size).toBe(2);
  expect(tokenSet.get(key("dog"))).toBe(1);
  expect(tokenSet.get(key("cat"))).toBe(2);
  expect(tokenSet.get(key("bird"))).toBeUndefined();
});

test("マップの値を上書きする", () => {
  const tokenSet = new ObjectMap([[key("dog"), 1]]);

  tokenSet.set(key("dog"), 2);

  expect(tokenSet.size).toBe(1);
  expect(tokenSet.get(key("dog"))).toBe(2);
  expect(tokenSet.get(key("cat"))).toBeUndefined();
});

test("マップに複数の要素を追加する", () => {
  const tokenSet = new ObjectMap([[key("dog"), 1]]);

  tokenSet.append([
    [key("cat"), 2],
    [key("bird"), 3],
  ]);

  expect(tokenSet.size).toBe(3);
  expect(tokenSet.get(key("dog"))).toBe(1);
  expect(tokenSet.get(key("cat"))).toBe(2);
  expect(tokenSet.get(key("bird"))).toBe(3);
  expect(tokenSet.get(key("fish"))).toBeUndefined();
});

test("マップにある要素を削除する", () => {
  const tokenSet = new ObjectMap([
    [key("dog"), 1],
    [key("cat"), 2],
  ]);

  const isDeleted = tokenSet.delete(key("dog"));

  expect(tokenSet.size).toBe(1);
  expect(tokenSet.get(key("dog"))).toBeUndefined();
  expect(tokenSet.get(key("cat"))).toBe(2);
  expect(isDeleted).toBe(true);
});

test("マップにない要素を削除する", () => {
  const tokenSet = new ObjectMap([
    [key("dog"), 1],
    [key("cat"), 2],
  ]);

  const idDeleted = tokenSet.delete(key("bird"));

  expect(tokenSet.size).toBe(2);
  expect(tokenSet.get(key("dog"))).toBe(1);
  expect(tokenSet.get(key("cat"))).toBe(2);
  expect(tokenSet.get(key("bird"))).toBeUndefined();
  expect(idDeleted).toBe(false);
});

test("2つのマップを比較する", () => {
  const tokenSet1 = new ObjectMap([
    [key("dog"), 1],
    [key("cat"), 2],
  ]);
  const tokenSet2 = new ObjectMap([
    [key("dog"), 1],
    [key("cat"), 2],
  ]);

  expect(tokenSet1.equals(tokenSet2)).toBe(true);
});

test("順番の違う2つのマップを比較する", () => {
  const tokenSet1 = new ObjectMap([
    [key("dog"), 1],
    [key("cat"), 2],
  ]);
  const tokenSet2 = new ObjectMap([
    [key("cat"), 2],
    [key("dog"), 1],
  ]);

  expect(tokenSet1.equals(tokenSet2)).toBe(true);
});

test("キーの違う2つのマップを比較する", () => {
  const tokenSet1 = new ObjectMap([
    [key("dog"), 1],
    [key("cat"), 2],
  ]);
  const tokenSet2 = new ObjectMap([
    [key("dog"), 1],
    [key("bird"), 2],
  ]);

  expect(tokenSet1.equals(tokenSet2)).toBe(false);
});

test("値の違う2つのマップを比較する", () => {
  const tokenSet1 = new ObjectMap([
    [key("dog"), 1],
    [key("cat"), 2],
  ]);
  const tokenSet2 = new ObjectMap([
    [key("dog"), 1],
    [key("cat"), 3],
  ]);

  expect(tokenSet1.equals(tokenSet2)).toBe(false);
});

test("カスタム比較を使って同じマップを比較する", () => {
  const tokenSet1 = new ObjectMap([
    [key("dog"), { value: 5 }],
    [key("cat"), { value: 6 }],
  ]);
  const tokenSet2 = new ObjectMap([
    [key("dog"), { value: 5 }],
    [key("cat"), { value: 6 }],
  ]);

  expect(tokenSet1.equals(tokenSet2, (l, r) => l.value === r.value)).toBe(true);
});

test("カスタム比較を使って違うマップを比較する", () => {
  const tokenSet1 = new ObjectMap([
    [key("dog"), { value: 5 }],
    [key("cat"), { value: 6 }],
  ]);
  const tokenSet2 = new ObjectMap([
    [key("dog"), { value: 5 }],
    [key("cat"), { value: 7 }],
  ]);

  expect(tokenSet1.equals(tokenSet2, (l, r) => l.value === r.value)).toBe(false);
});
