import { describe, expect, test } from "vitest";

import { char, epsilon, reference, rule, word } from "./define-rules";
import { getFirstSet } from "./first-set";

import type { Char } from "./generate-parser";

describe("get first-set from syntax", () => {
  const syntax = [
    rule("rule1", word("rule"), word("defined")),
    rule("rule1", reference("rule2")),
    rule("rule2", char(0x41, 0x5a)),
    rule("rule2", epsilon),
  ];

  const cases: [number, Set<Char>][] = [
    [0, new Set(["r"])],
    [1, new Set([["char", 0x41, 0x5a], epsilon])],
    [2, new Set([["char", 0x41, 0x5a]])],
    [3, new Set([epsilon])],
  ];

  test.each(cases)("defined rules %d", (index, expected) => {
    const result = getFirstSet([], syntax, index);

    expect(result).toStrictEqual(expected);
  });
});
