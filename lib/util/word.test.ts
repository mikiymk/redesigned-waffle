import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { ParseWordError } from "./errors";
import { word } from "./word";

import type { Result } from "./parser";

describe("parse the expected string", () => {
  const cases: [string, Result<"word">, number][] = [
    ["word", [true, "word"], 4],
    ["word1", [true, "word"], 4],
    ["world", [false, new ParseWordError("word", "worl")], 0],
    ["wod", [false, new ParseWordError("word", "wod")], 0],
  ];

  test.each(cases)("%j", (source, value) => {
    const pr = fromString(source);

    expect(word("word")(pr)).toStrictEqual(value);
  });
});
