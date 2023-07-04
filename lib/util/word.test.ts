import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { ParseWordError } from "./errors";
import { word } from "./word";

import type { Result } from "./parser";

describe("parse the expected string", () => {
  const cases: [string, Result<"word">][] = [
    ["word", [true, "word"]],
    ["word1", [true, "word"]],
    ["world", [false, new ParseWordError("word", "worl")]],
  ];

  test.each(cases)("%j", (source, value) => {
    const pr = fromString(source);

    expect(word("word")(pr)).toStrictEqual(value);
  });
});
