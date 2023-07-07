import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { either } from "./either";
import { ParseEitherError, ParseWordError } from "./errors";
import { as, map } from "./map";
import { word } from "./word";

import type { Result } from "./parser";

describe("parse and mapping string", () => {
  const cases: [string, Result<number>, number][] = [
    ["word", [true, 4], 4],
    ["word1", [true, 4], 4],
    ["chance", [true, 6], 6],
    ["chance1", [true, 6], 6],
    [
      "world",
      [false, new ParseEitherError([new ParseWordError("word", "worl"), new ParseWordError("chance", "world")])],
      0,
    ],
  ];

  test.each(cases)("%j", (source, value, position) => {
    const pr = fromString(source);
    const result = map(either(word("word"), word("chance")), (word) => word.length)(pr);

    expect(result).toStrictEqual(value);
    expect(pr.position).toBe(position);
  });
});

describe("parse the expected string", () => {
  const cases: [string, Result<string>, number][] = [
    ["word", [true, "success"], 4],
    ["word1", [true, "success"], 4],
    ["chance", [true, "success"], 6],
    ["chance1", [true, "success"], 6],
    [
      "world",
      [false, new ParseEitherError([new ParseWordError("word", "worl"), new ParseWordError("chance", "world")])],
      0,
    ],
  ];

  test.each(cases)("%j", (source, value, position) => {
    const pr = fromString(source);
    const result = as(either(word("word"), word("chance")), "success")(pr);

    expect(result).toStrictEqual(value);
    expect(pr.position).toBe(position);
  });
});
