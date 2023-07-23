import { expect, test } from "vitest";

import { differenceSet, intersectionSet, unionSet } from "../set-functions";

const set1 = new Map([
  ["a", "a"],
  ["b", "b"],
  ["c", "c"],
]);
const set2 = new Map([
  ["a", "a"],
  ["d", "d"],
  ["e", "e"],
]);

test("union", () => {
  const result = unionSet(set1, set2);

  expect(result).toStrictEqual(
    new Map([
      ["a", "a"],
      ["b", "b"],
      ["c", "c"],
      ["d", "d"],
      ["e", "e"],
    ]),
  );
});

test("intersection", () => {
  const result = intersectionSet(set1, set2);

  expect(result).toStrictEqual(new Map([["a", "a"]]));
});

test("difference", () => {
  const result = differenceSet(set1, set2);

  expect(result).toStrictEqual(
    new Map([
      ["b", "b"],
      ["c", "c"],
    ]),
  );
});
