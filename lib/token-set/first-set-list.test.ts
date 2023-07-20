import { describe, expect, test } from "vitest";

import { char, empty, reference, rule, word } from "@/lib/rules/define-rules";

import { getFirstSetList } from "./first-set-list";
import { TokenSet } from "./token-set";

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
    rule("basic token", empty),

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
      new TokenSet([
        word("word"),
        char("A", "Z"),
        empty,
        word("after defined"),
        word("word lr"),
        word("lead rr"),
        word("word rr"),
        word("lead in-rr 1"),
        word("word in-lr"),
      ]),

      new TokenSet([word("word"), char("A", "Z"), empty]),
      new TokenSet([word("word"), char("A", "Z"), empty]),
      new TokenSet([word("word"), char("A", "Z"), word("after defined")]),
      new TokenSet([word("word lr")]),
      new TokenSet([word("lead rr"), word("word rr")]),
      new TokenSet([word("word in-lr")]),
      new TokenSet([word("lead in-rr 1")]),

      // basic token
      new TokenSet([word("word")]),
      new TokenSet([char("A", "Z")]),
      new TokenSet([empty]),

      // reference token
      new TokenSet([word("word"), char("A", "Z"), empty]),

      // reference token and after
      new TokenSet([word("word"), char("A", "Z"), word("after defined")]),

      // left recursion
      new TokenSet([word("word lr")]),
      new TokenSet([word("word lr")]),

      // right recursion
      new TokenSet([word("lead rr")]),
      new TokenSet([word("word rr")]),

      // indirect left recursion
      new TokenSet([word("word in-lr")]),

      new TokenSet([word("word in-lr")]),
      new TokenSet([word("word in-lr")]),

      // indirect right recursion
      new TokenSet([word("lead in-rr 1")]),

      new TokenSet([word("lead in-rr 2")]),
      new TokenSet([word("word in-rr")]),
    ];

    expect(result).toStrictEqual(expected);
  });

  test("basic token", () => {
    const syntax = [
      rule("start", reference("basic token")),

      rule("basic token", word("word")),
      rule("basic token", char("A", "Z")),
      rule("basic token", empty),
    ];

    const result = getFirstSetList(syntax);
    const expected = [
      new TokenSet([word("word"), char("A", "Z"), empty]),

      new TokenSet([word("word")]),
      new TokenSet([char("A", "Z")]),
      new TokenSet([empty]),
    ];

    expect(result).toStrictEqual(expected);
  });

  test("reference token", () => {
    const syntax = [
      rule("start", reference("reference token")),

      rule("reference token", reference("basic token")),

      rule("basic token", word("word")),
      rule("basic token", char("A", "Z")),
      rule("basic token", empty),
    ];

    const result = getFirstSetList(syntax);
    const expected = [
      new TokenSet([word("word"), char("A", "Z"), empty]),

      new TokenSet([word("word"), char("A", "Z"), empty]),

      new TokenSet([word("word")]),
      new TokenSet([char("A", "Z")]),
      new TokenSet([empty]),
    ];

    expect(result).toStrictEqual(expected);
  });

  test("reference token and after", () => {
    const syntax = [
      rule("start", reference("reference token and after")),

      rule("reference token and after", reference("basic token"), word("after defined")),

      rule("basic token", word("word")),
      rule("basic token", char("A", "Z")),
      rule("basic token", empty),
    ];

    const result = getFirstSetList(syntax);
    const expected = [
      new TokenSet([word("word"), char("A", "Z"), word("after defined")]),

      new TokenSet([word("word"), char("A", "Z"), word("after defined")]),

      new TokenSet([word("word")]),
      new TokenSet([char("A", "Z")]),
      new TokenSet([empty]),
    ];

    expect(result).toStrictEqual(expected);
  });

  test("left recursion", () => {
    const syntax = [
      rule("start", reference("left recursion")),

      rule("left recursion", reference("left recursion"), word("follow lr")),
      rule("left recursion", word("word lr")),
    ];

    const result = getFirstSetList(syntax);
    const expected = [
      new TokenSet([word("word lr")]),
      new TokenSet([word("word lr")]),
      new TokenSet([word("word lr")]),
    ];

    expect(result).toStrictEqual(expected);
  });

  test("right recursion", () => {
    const syntax = [
      rule("start", reference("right recursion")),

      rule("right recursion", word("lead rr"), reference("right recursion")),
      rule("right recursion", word("word rr")),
    ];

    const result = getFirstSetList(syntax);
    const expected = [
      new TokenSet([word("lead rr"), word("word rr")]),

      new TokenSet([word("lead rr")]),
      new TokenSet([word("word rr")]),
    ];

    expect(result).toStrictEqual(expected);
  });

  test("indirect left recursion", () => {
    const syntax = [
      rule("start", reference("indirect left recursion 1")),

      rule("indirect left recursion 1", reference("indirect left recursion 2"), word("follow in-lr 1")),

      rule("indirect left recursion 2", reference("indirect left recursion 1"), word("follow in-lr 2")),
      rule("indirect left recursion 2", word("word in-lr")),
    ];

    const result = getFirstSetList(syntax);
    const expected = [
      new TokenSet([word("word in-lr")]),

      // indirect left recursion
      new TokenSet([word("word in-lr")]),

      new TokenSet([word("word in-lr")]),
      new TokenSet([word("word in-lr")]),
    ];

    expect(result).toStrictEqual(expected);
  });

  test("indirect right recursion", () => {
    const syntax = [
      rule("start", reference("indirect right recursion 1")),

      rule("indirect right recursion 1", word("lead in-rr 1"), reference("indirect right recursion 2")),

      rule("indirect right recursion 2", word("lead in-rr 2"), reference("indirect right recursion 1")),
      rule("indirect right recursion 2", word("word in-rr")),
    ];

    const result = getFirstSetList(syntax);
    const expected = [
      new TokenSet([word("lead in-rr 1")]),

      // indirect right recursion
      new TokenSet([word("lead in-rr 1")]),

      new TokenSet([word("lead in-rr 2")]),
      new TokenSet([word("word in-rr")]),
    ];

    expect(result).toStrictEqual(expected);
  });
});
