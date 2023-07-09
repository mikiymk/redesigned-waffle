import { expect, test } from "vitest";

import { differenceSet, intersectionSet, unionSet } from "./set-functions";

const set1 = new Set([2, 3, 5, 8, 13, 21]);
const set2 = new Set([2, 3, 5, 7, 11, 13]);

test("union", () => {
  const result = unionSet(set1, set2);

  expect(result).toStrictEqual(new Set([2, 3, 5, 7, 8, 11, 13, 21]));
});

test("intersection", () => {
  const result = intersectionSet(set1, set2);

  expect(result).toStrictEqual(new Set([2, 3, 5, 13]));
});

test("difference", () => {
  const result = differenceSet(set1, set2);

  expect(result).toStrictEqual(new Set([8, 21]));
});
