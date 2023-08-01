import { expect, test } from "vitest";

import { zip } from "../zip-array";

test("2つの配列を合わせたイテレータを作成する", () => {
  const array1 = [1, 2, 3];
  const array2 = ["a", "b", "c"];

  const result = zip(array1, array2);

  expect(result.next()).toStrictEqual({ done: false, value: [0, 1, "a"] });
  expect(result.next()).toStrictEqual({ done: false, value: [1, 2, "b"] });
  expect(result.next()).toStrictEqual({ done: false, value: [2, 3, "c"] });
  expect(result.next()).toStrictEqual({ done: true, value: undefined });
});

test("3つの配列を合わせたイテレータを作成する", () => {
  const array1 = [1, 2, 3];
  const array2 = ["a", "b", "c"];
  const array3 = [101, 102, 103];

  const result = zip(array1, array2, array3);

  expect(result.next()).toStrictEqual({ done: false, value: [0, 1, "a", 101] });
  expect(result.next()).toStrictEqual({ done: false, value: [1, 2, "b", 102] });
  expect(result.next()).toStrictEqual({ done: false, value: [2, 3, "c", 103] });
  expect(result.next()).toStrictEqual({ done: true, value: undefined });
});

test("配列がない場合はエラーを起こす", () => {
  const result = zip();

  expect(() => result.next()).toThrow("１つ以上の配列が必要です。");
});

test("配列の長さが違う場合はエラーを起こす", () => {
  const array1 = [1, 2, 3, 4];
  const array2 = ["a", "b", "c"];

  const result = zip(array1, array2);

  expect(() => result.next()).toThrow("要素数が違う配列があります。");
});
