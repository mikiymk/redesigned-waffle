import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { ParseWordError } from "./errors";
import { tryParse } from "./try";
import { word } from "./word";

import type { Result } from "./parser";

describe("parse the expected string", () => {
  const cases: [string, Result<"word">, number][] = [
    ["word", [true, "word"], 4],
    ["word1", [true, "word"], 4],
    ["world", [false, new ParseWordError("word", "worl")], 0],
  ];

  test.each(cases)("%j", (source, value, position) => {
    const pr = fromString(source);
    const result = tryParse(word("word"))(pr);

    expect(result).toStrictEqual(value);
    expect(pr.position).toBe(position);
  });
});
