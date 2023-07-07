import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { eof } from "./eof";

import type { Result } from "./parser";

describe("parse the expected string", () => {
  const cases: [string, Result<undefined>][] = [
    ["", [true, undefined]],
    ["1", [false, new Error("not end of file")]],
  ];

  test.each(cases)("%j", (source, value) => {
    const pr = fromString(source);
    const result = eof(pr);

    expect(result).toStrictEqual(value);
    expect(pr.position).toBe(0);
  });
});
