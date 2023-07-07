import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { ParseWordError } from "./errors";
import { oneOrMore, until, zeroOrMore } from "./multiple";
import { word } from "./word";

import type { Result } from "./parser";

describe("parse 0 or more string", () => {
  const cases: [string, Result<string[]>, number][] = [
    ["", [true, []], 0],
    ["word", [true, ["word"]], 4],
    ["wordwordword", [true, ["word", "word", "word"]], 12],
    ["world", [true, []], 0],
  ];

  test.each(cases)("%j", (source, value, position) => {
    const pr = fromString(source);
    const result = zeroOrMore(word("word"))(pr);

    expect(result).toStrictEqual(value);
    expect(pr.position).toStrictEqual(position);
  });
});

describe("parse 1 or more string", () => {
  const cases: [string, Result<string[]>, number][] = [
    ["", [false, new Error("not reached 1")], 0],
    ["word", [true, ["word"]], 4],
    ["wordwordword", [true, ["word", "word", "word"]], 12],
    ["world", [false, new Error("not reached 1")], 0],
  ];

  test.each(cases)("%j", (source, value, position) => {
    const pr = fromString(source);
    const result = oneOrMore(word("word"))(pr);

    expect(result).toStrictEqual(value);
    expect(pr.position).toBe(position);
  });
});

describe("parse until end string", () => {
  const cases: [string, Result<[string[], string]>, number][] = [
    ["wordend", [true, [["word"], "end"]], 7],
    ["wordwordwordend", [true, [["word", "word", "word"], "end"]], 15],
    ["end", [true, [[], "end"]], 3],
    ["worldend", [false, new ParseWordError("word", "worl")], 0],
  ];

  test.each(cases)("%j", (source, value, position) => {
    const pr = fromString(source);
    const result = until(word("word"), word("end"))(pr);

    expect(result).toStrictEqual(value);
    expect(pr.position).toBe(position);
  });
});
