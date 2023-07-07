import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { either } from "./either";
import { ParseEitherError, ParseWordError } from "./errors";
import { word } from "./word";

import type { Result } from "./parser";

describe("parse the expected string", () => {
  const cases: [string, Result<"word" | "chance">][] = [
    ["word", [true, "word"]],
    ["word1", [true, "word"]],
    ["chance", [true, "chance"]],
    ["chance1", [true, "chance"]],
    [
      "world",
      [false, new ParseEitherError([new ParseWordError("word", "worl"), new ParseWordError("chance", "world")])],
    ],
  ];

  test.each(cases)("%j", (source, value) => {
    const pr = fromString(source);

    expect(either(word("word"), word("chance"))(pr)).toStrictEqual(value);
  });
});
