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
  const map = new ObjectMap([]);

  expect(map.size).toBe(0);
});

test("初期要素のあるマップを作る", () => {
  const map = new ObjectMap([[key("dog"), 1]]);

  expect(map.size).toBe(1);
  expect(map.get(key("dog"))).toBe(1);
});

test("重複した初期要素はより後の値にセットされる", () => {
  const map = new ObjectMap([
    [key("dog"), 1],
    [key("dog"), 2],
  ]);

  expect(map.size).toBe(1);
  expect(map.get(key("dog"))).toBe(2);
});

test("マップがキーを持つか", () => {
  const map = new ObjectMap([[key("dog"), 1]]);

  expect(map.size).toBe(1);
  expect(map.has(key("dog"))).toBe(true);
  expect(map.has(key("cat"))).toBe(false);
});

test("マップから要素を取得する", () => {
  const map = new ObjectMap([[key("dog"), 1]]);

  expect(map.size).toBe(1);
  expect(map.get(key("dog"))).toBe(1);
  expect(map.get(key("cat"))).toBeUndefined();
});

test("マップに要素を追加する", () => {
  const map = new ObjectMap([[key("dog"), 1]]);

  map.set(key("cat"), 2);

  expect(map.size).toBe(2);
  expect(map.get(key("dog"))).toBe(1);
  expect(map.get(key("cat"))).toBe(2);
  expect(map.get(key("bird"))).toBeUndefined();
});

test("マップの値を上書きする", () => {
  const map = new ObjectMap([[key("dog"), 1]]);

  map.set(key("dog"), 2);

  expect(map.size).toBe(1);
  expect(map.get(key("dog"))).toBe(2);
  expect(map.get(key("cat"))).toBeUndefined();
});

test("マップに複数の要素を追加する", () => {
  const map = new ObjectMap([[key("dog"), 1]]);

  map.append([
    [key("cat"), 2],
    [key("bird"), 3],
  ]);

  expect(map.size).toBe(3);
  expect(map.get(key("dog"))).toBe(1);
  expect(map.get(key("cat"))).toBe(2);
  expect(map.get(key("bird"))).toBe(3);
  expect(map.get(key("fish"))).toBeUndefined();
});

test("マップにある要素を削除する", () => {
  const map = new ObjectMap([
    [key("dog"), 1],
    [key("cat"), 2],
  ]);

  const isDeleted = map.delete(key("dog"));

  expect(map.size).toBe(1);
  expect(map.get(key("dog"))).toBeUndefined();
  expect(map.get(key("cat"))).toBe(2);
  expect(isDeleted).toBe(true);
});

test("マップにない要素を削除する", () => {
  const map = new ObjectMap([
    [key("dog"), 1],
    [key("cat"), 2],
  ]);

  const idDeleted = map.delete(key("bird"));

  expect(map.size).toBe(2);
  expect(map.get(key("dog"))).toBe(1);
  expect(map.get(key("cat"))).toBe(2);
  expect(map.get(key("bird"))).toBeUndefined();
  expect(idDeleted).toBe(false);
});

test("2つのマップを比較する", () => {
  const map1 = new ObjectMap([
    [key("dog"), 1],
    [key("cat"), 2],
  ]);
  const map2 = new ObjectMap([
    [key("dog"), 1],
    [key("cat"), 2],
  ]);

  expect(map1.equals(map2)).toBe(true);
});

test("順番の違う2つのマップを比較する", () => {
  const map1 = new ObjectMap([
    [key("dog"), 1],
    [key("cat"), 2],
  ]);
  const map2 = new ObjectMap([
    [key("cat"), 2],
    [key("dog"), 1],
  ]);

  expect(map1.equals(map2)).toBe(true);
});

test("キーの違う2つのマップを比較する", () => {
  const map1 = new ObjectMap([
    [key("dog"), 1],
    [key("cat"), 2],
  ]);
  const map2 = new ObjectMap([
    [key("dog"), 1],
    [key("bird"), 2],
  ]);

  expect(map1.equals(map2)).toBe(false);
});

test("値の違う2つのマップを比較する", () => {
  const map1 = new ObjectMap([
    [key("dog"), 1],
    [key("cat"), 2],
  ]);
  const map2 = new ObjectMap([
    [key("dog"), 1],
    [key("cat"), 3],
  ]);

  expect(map1.equals(map2)).toBe(false);
});

test("カスタム比較を使って同じマップを比較する", () => {
  const map1 = new ObjectMap([
    [key("dog"), { value: 5 }],
    [key("cat"), { value: 6 }],
  ]);
  const map2 = new ObjectMap([
    [key("dog"), { value: 5 }],
    [key("cat"), { value: 6 }],
  ]);

  expect(map1.equals(map2, (l, r) => l.value === r.value)).toBe(true);
});

test("カスタム比較を使って違うマップを比較する", () => {
  const map1 = new ObjectMap([
    [key("dog"), { value: 5 }],
    [key("cat"), { value: 6 }],
  ]);
  const map2 = new ObjectMap([
    [key("dog"), { value: 5 }],
    [key("cat"), { value: 7 }],
  ]);

  expect(map1.equals(map2, (l, r) => l.value === r.value)).toBe(false);
});
