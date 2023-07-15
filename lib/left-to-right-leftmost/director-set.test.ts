import { describe, expect, test } from "vitest";

import { char, epsilon, reference, rule, word } from "./define-rules";
import { getDirectorSetList } from "./director-set";
import { getFirstSetList } from "./first-set";
import { getFollowSetList } from "./follow-set";
import { TokenSet } from "./token-set";

describe("get first-set from syntax", () => {
  test("basic token", () => {
    const syntax = [
      rule("start", reference("basic token"), word("after basic token")),

      rule("basic token", word("word"), word("after word")),
      rule("basic token", char("A", "Z"), word("after char")),
      rule("basic token", epsilon),
    ];

    const firstSet = getFirstSetList(syntax);

    const expectedFirstSet = [
      new TokenSet([word("word"), char("A", "Z"), word("after basic token")]),

      new TokenSet([word("word")]),
      new TokenSet([char("A", "Z")]),
      new TokenSet([epsilon]),
    ];
    expect(firstSet).toStrictEqual(expectedFirstSet);

    const followSet = getFollowSetList(syntax, firstSet);
    const expectedFollowSet = [
      new TokenSet(),

      new TokenSet([word("after basic token")]),
      new TokenSet([word("after basic token")]),
      new TokenSet([word("after basic token")]),
    ];

    expect(followSet).toStrictEqual(expectedFollowSet);

    const result = getDirectorSetList(firstSet, followSet);
    const expected = [
      new TokenSet([word("word"), char("A", "Z"), word("after basic token")]),

      new TokenSet([word("word")]),
      new TokenSet([char("A", "Z")]),
      new TokenSet([word("after basic token")]),
    ];

    expect(result).toStrictEqual(expected);
  });
});
