import { describe, expect, test } from "vitest";

import { char, eof, empty, reference, rule, word } from "@/lib/rules/define-rules";

import { getFirstSetList } from "./first-set-list";
import { getFollowSetList } from "./follow-set-list";
import { TokenSet } from "./token-set";

describe("get first-set from syntax", () => {
  test("basic token", () => {
    const syntax = [
      rule("start", reference("basic token"), word("after basic token")),

      rule("basic token", word("word"), word("after word")),
      rule("basic token", char("A", "Z"), word("after char")),
      rule("basic token", empty),
    ];

    const firstSet = getFirstSetList(syntax);

    const expectedFirstSet = [
      new TokenSet([word("word"), char("A", "Z"), word("after basic token")]),

      new TokenSet([word("word")]),
      new TokenSet([char("A", "Z")]),
      new TokenSet([empty]),
    ];
    expect(firstSet).toStrictEqual(expectedFirstSet);

    const result = getFollowSetList(syntax, firstSet);
    const expected = [
      new TokenSet([eof]),

      new TokenSet([word("after basic token")]),
      new TokenSet([word("after basic token")]),
      new TokenSet([word("after basic token")]),
    ];

    expect(result).toStrictEqual(expected);
  });
});