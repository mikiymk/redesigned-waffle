import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { ParseWordError } from "./errors";
import { seq } from "./seq";
import { word } from "./word";

import type { Result } from "./parser";

describe("parse the expected string", () => {
  const cases: [string, Result<["word", "chance"]>][] = [
    ["wordchance", [true, ["word", "chance"]]],
    ["wordchance1", [true, ["word", "chance"]]],
    ["word", [false, new ParseWordError("chance", "")]],
    ["chance", [false, new ParseWordError("word", "chan")]],
  ];

  test.each(cases)("%j", (source, value) => {
    const pr = fromString(source);

    expect(seq(word("word"), word("chance"))(pr)).toStrictEqual(value);
  });
});
