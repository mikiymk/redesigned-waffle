import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { ParseWordError } from "./errors";
import { tryParse } from "./try";
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
    const result = tryParse(word("word"))(pr);

    expect(result).toStrictEqual(value);

    if (result[0]) {
      expect(pr.position).toBe(4);
    } else {
      expect(pr.position).toBe(0);
    }
  });
});
