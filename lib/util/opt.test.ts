import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { opt } from "./opt";
import { word } from "./word";

import type { Result } from "./parser";

describe("parse the expected string", () => {
  const cases: [string, Result<"word" | undefined>, number][] = [
    ["word", [true, "word"], 4],
    ["word1", [true, "word"], 4],
    ["world", [true, undefined], 0],
  ];

  test.each(cases)("%j", (source, value, position) => {
    const pr = fromString(source);
    const result = opt(word("word"))(pr);

    expect(result).toStrictEqual(value);
    expect(pr.position).toBe(position);
  });
});
