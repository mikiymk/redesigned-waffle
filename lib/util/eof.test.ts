import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { eof } from "./eof";
import { seq } from "./seq";
import { word } from "./word";

import type { Result } from "./parser";

describe("parse the expected string", () => {
  const cases: [string, Result<(string | undefined)[]>][] = [
    ["word", [true, ["word", undefined]]],
    ["word1", [false, new Error("not end of file")]],
  ];

  test.each(cases)("%j", (source, value) => {
    const pr = fromString(source);

    expect(seq(word("word"), eof)(pr)).toStrictEqual(value);
  });
});
