import { describe, expect, test } from "vitest";

import { char, epsilon, reference, rule, word } from "./define-rules";
import { getFirstSetList } from "./first-set";

describe("get first-set from syntax", () => {
  const syntax = [
    rule("start", reference("rule1")),

    rule("rule1", reference("rule2"), word("defined")),
    rule("rule1", reference("rule2")),
    rule("rule1", reference("left recursion")),
    rule("rule1", reference("indirect left recursion 1")),

    rule("rule2", word("word")),
    rule("rule2", char("A", "Z")),
    rule("rule2", epsilon),

    rule("left recursion", reference("left recursion"), word("follow")),
    rule("left recursion", word("!"), word("follow")),

    rule("indirect left recursion 1", reference("indirect left recursion 2"), word("follow")),

    rule("indirect left recursion 2", reference("indirect left recursion 1"), word("follow")),
    rule("indirect left recursion 2", word("?")),
  ];

  test("defined rules", () => {
    const result = getFirstSetList(syntax);
    const expected = [
      new Set([word("word"), char("A", "Z"), word("defined"), epsilon, word("!"), word("?")]),

      new Set([word("word"), char("A", "Z"), word("defined")]),
      new Set([word("word"), char("A", "Z"), epsilon]),
      new Set([word("!")]),
      new Set([word("?")]),

      new Set([word("word")]),
      new Set([char("A", "Z")]),
      new Set([epsilon]),

      new Set([word("!")]),
      new Set([word("!")]),

      new Set([word("?")]),

      new Set([word("?")]),
      new Set([word("?")]),
    ];

    expect(result).toStrictEqual(expected);
  });
});
