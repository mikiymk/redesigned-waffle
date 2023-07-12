import { describe, expect, test } from "vitest";

import { char, epsilon, reference, rule, word } from "./define-rules";
import { getFirstSetList } from "./first-set";

describe("get first-set from syntax", () => {
  const syntax = [
    rule("start", reference("rule1")),

    rule("rule1", reference("basic token")),
    rule("rule1", reference("reference token")),
    rule("rule1", reference("reference token and after")),
    rule("rule1", reference("left recursion")),
    rule("rule1", reference("right recursion")),
    rule("rule1", reference("indirect left recursion 1")),
    rule("rule1", reference("indirect right recursion 1")),

    rule("basic token", word("word")),
    rule("basic token", char("A", "Z")),
    rule("basic token", epsilon),

    rule("reference token", reference("basic token")),

    rule("reference token and after", reference("basic token"), word("after defined")),

    rule("left recursion", reference("left recursion"), word("follow lr")),
    rule("left recursion", word("word lr")),

    rule("right recursion", word("lead rr"), reference("right recursion")),
    rule("right recursion", word("word rr")),

    rule("indirect left recursion 1", reference("indirect left recursion 2"), word("follow in-lr 1")),

    rule("indirect left recursion 2", reference("indirect left recursion 1"), word("follow in-lr 2")),
    rule("indirect left recursion 2", word("word in-lr")),

    rule("indirect right recursion 1", word("lead in-rr 1"), reference("indirect right recursion 2")),

    rule("indirect right recursion 2", word("lead in-rr 2"), reference("indirect right recursion 1")),
    rule("indirect right recursion 2", word("word in-rr")),
  ];

  test("defined rules", () => {
    const result = getFirstSetList(syntax);
    const expected = [
      new Set([word("word"), char("A", "Z"), word("defined"), epsilon, word("!"), word("?")]),

      new Set([word("word"), char("A", "Z"), epsilon]),
      new Set([word("word"), char("A", "Z"), epsilon]),
      new Set([word("word"), char("A", "Z"), word("after defined")]),
      new Set([word("word lr")]),
      new Set([word("lead rr"), word("word rr")]),
      new Set([word("word in-lr")]),
      new Set([word("lead in-rr 1")]),

      new Set([word("word")]),
      new Set([char("A", "Z")]),
      new Set([epsilon]),

      new Set([word("word"), char("A", "Z"), epsilon]),

      new Set([word("word"), char("A", "Z"), word("after defined")]),

      new Set([word("word lr")]),
      new Set([word("word lr")]),

      new Set([word("lead rr"), word("word rr")]),
      new Set([word("lead rr"), word("word rr")]),

      new Set([word("word in-lr")]),

      new Set([word("word in-lr")]),
      new Set([word("word in-lr")]),

      new Set([word("lead in-rr 1")]),

      new Set([word("lead in-rr 2")]),
      new Set([word("word in-rr")]),
    ];

    expect(result).toStrictEqual(expected);
  });
});
