import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { char } from "./char";
import { ParseCharError } from "./errors";

import type { Result } from "./parser";

describe("parse the expected string", () => {
  const cases: [string, Result<string>][] = [
    ["A", [true, "A"]],
    ["Z", [true, "Z"]],
    ["a", [false, new ParseCharError(0x41, 0x5a, "a")]],
  ];

  test.each(cases)("%j", (source, value) => {
    const pr = fromString(source);

    expect(char(0x41, 0x5a)(pr)).toStrictEqual(value);
  });

  test.each(cases)("%j", (source, value) => {
    const pr = fromString(source);

    expect(char("A", "Z")(pr)).toStrictEqual(value);
  });
});
