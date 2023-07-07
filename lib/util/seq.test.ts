import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { ParseWordError } from "./errors";
import { seq } from "./seq";
import { word } from "./word";

import type { Result } from "./parser";

describe("parse the expected string", () => {
  const cases: [string, Result<["word", "chance"]>, number][] = [
    ["wordchance", [true, ["word", "chance"]], 10],
    ["wordchance1", [true, ["word", "chance"]], 10],
    ["word", [false, new ParseWordError("chance", "")], 0],
    ["chance", [false, new ParseWordError("word", "chan")], 0],
  ];

  test.each(cases)("%j", (source, value, position) => {
    const pr = fromString(source);
    const result = seq(word("word"), word("chance"))(pr);

    expect(result).toStrictEqual(value);
    expect(pr.position).toBe(position);
  });
});
