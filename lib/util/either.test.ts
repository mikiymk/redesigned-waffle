import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { either } from "./either";
import { ParseEitherError, ParseWordError } from "./errors";
import { word } from "./word";

import type { Result } from "./parser";

describe("parse the expected string", () => {
  const cases: [string, Result<"word" | "chance">, number][] = [
    ["word", [true, "word"], 4],
    ["word1", [true, "word"], 4],
    ["chance", [true, "chance"], 6],
    ["chance1", [true, "chance"], 6],
    [
      "world",
      [false, new ParseEitherError([new ParseWordError("word", "worl"), new ParseWordError("chance", "world")])],
      0,
    ],
  ];

  test.each(cases)("%j", (source, value, position) => {
    const pr = fromString(source);
    const result = either(word("word"), word("chance"))(pr);

    expect(result).toStrictEqual(value);
    expect(pr.position).toBe(position);
  });
});
