import { describe, expect, test } from "vitest";

import { word, ParseWordError } from "./word";

import type { Result } from "./parser";

import { generatePR } from "../reader";

describe("parse the expected string", () => {
  const cases: [string, Result<"word">][] = [
    ["word", [true, "word"]],
    ["word1", [true, "word"]],
    ["world", [false, new ParseWordError("word", "worl")]],
  ];

  test.each(cases)("%j", (source, value) => {
    const pr = generatePR(source);

    expect(word("word")(pr)).toStrictEqual(value);
  });
});
