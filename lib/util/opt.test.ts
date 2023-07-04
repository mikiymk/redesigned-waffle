import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { opt } from "./opt";
import { word } from "./word";

import type { Result } from "./parser";

describe("parse the expected string", () => {
  const cases: [string, Result<"word" | undefined>][] = [
    ["word", [true, "word"]],
    ["word1", [true, "word"]],
    ["world", [true, undefined]],
  ];

  test.each(cases)("%j", (source, value) => {
    const pr = fromString(source);

    expect(opt(word("word"))(pr)).toStrictEqual(value);
  });
});
