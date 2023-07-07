import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { char } from "./char";
import { ParseCharError } from "./errors";

import type { Result } from "./parser";

describe("parse the expected string", () => {
  const cases: [string, Result<string>, number][] = [
    ["A", [true, "A"], 1],
    ["Z", [true, "Z"], 1],
    ["a", [false, new ParseCharError(0x41, 0x5a, "a")], 0],
  ];

  test.each(cases)("%j", (source, value, position) => {
    const pr = fromString(source);
    const result = char(0x41, 0x5a)(pr);

    expect(result).toStrictEqual(value);
    expect(pr.position).toBe(position);
  });

  test.each(cases)("%j", (source, value, position) => {
    const pr = fromString(source);
    const result = char("A", "Z")(pr);

    expect(result).toStrictEqual(value);
    expect(pr.position).toBe(position);
  });
});
