import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { ParseWordError } from "./errors";
import { oneOrMore, until, zeroOrMore } from "./multiple";
import { word } from "./word";

import type { Result } from "./parser";

describe("parse 0 or more string", () => {
  const cases: [string, Result<string[]>][] = [
    ["", [true, []]],
    ["word", [true, ["word"]]],
    ["wordwordword", [true, ["word", "word", "word"]]],
    ["world", [true, []]],
  ];

  test.each(cases)("%j", (source, value) => {
    const pr = fromString(source);

    expect(zeroOrMore(word("word"))(pr)).toStrictEqual(value);
  });
});

describe("parse 1 or more string", () => {
  const cases: [string, Result<string[]>][] = [
    ["", [false, new Error("not reached 1")]],
    ["word", [true, ["word"]]],
    ["wordwordword", [true, ["word", "word", "word"]]],
    ["world", [false, new Error("not reached 1")]],
  ];

  test.each(cases)("%j", (source, value) => {
    const pr = fromString(source);

    expect(oneOrMore(word("word"))(pr)).toStrictEqual(value);
  });
});

describe("parse until end string", () => {
  const cases: [string, Result<[string[], string]>][] = [
    ["wordend", [true, [["word"], "end"]]],
    ["wordwordwordend", [true, [["word", "word", "word"], "end"]]],
    ["end", [true, [[], "end"]]],
    ["worldend", [false, new ParseWordError("word", "worl")]],
  ];

  test.each(cases)("%j", (source, value) => {
    const pr = fromString(source);

    expect(until(word("word"), word("end"))(pr)).toStrictEqual(value);
  });
});
