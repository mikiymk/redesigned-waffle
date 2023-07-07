import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { either } from "./either";
import { ParseEitherError, ParseWordError } from "./errors";
import { as, map } from "./map";
import { word } from "./word";

import type { Result } from "./parser";

describe("parse and mapping string", () => {
  const cases: [string, Result<number>][] = [
    ["word", [true, 4]],
    ["word1", [true, 4]],
    ["chance", [true, 6]],
    ["chance1", [true, 6]],
    [
      "world",
      [false, new ParseEitherError([new ParseWordError("word", "worl"), new ParseWordError("chance", "world")])],
    ],
  ];

  test.each(cases)("%j", (source, value) => {
    const pr = fromString(source);

    expect(map(either(word("word"), word("chance")), (word) => word.length)(pr)).toStrictEqual(value);
  });
});

describe("parse the expected string", () => {
  const cases: [string, Result<string>][] = [
    ["word", [true, "success"]],
    ["word1", [true, "success"]],
    ["chance", [true, "success"]],
    ["chance1", [true, "success"]],
    [
      "world",
      [false, new ParseEitherError([new ParseWordError("word", "worl"), new ParseWordError("chance", "world")])],
    ],
  ];

  test.each(cases)("%j", (source, value) => {
    const pr = fromString(source);

    expect(as(either(word("word"), word("chance")), "success")(pr)).toStrictEqual(value);
  });
});
