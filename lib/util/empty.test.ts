import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { empty } from "./empty";

import type { Result } from "./parser";

describe("parse the expected string", () => {
  const cases: [string, Result<void>][] = [
    ["word", [true, undefined]],
    ["word1", [true, undefined]],
    ["world", [true, undefined]],
  ];

  test.each(cases)("%j", (source, value) => {
    const pr = fromString(source);
    const result = empty(pr);

    expect(result).toStrictEqual(value);
    expect(pr.position).toBe(0);
  });
});
