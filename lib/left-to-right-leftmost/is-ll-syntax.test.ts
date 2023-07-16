import { expect, test } from "vitest";

import { reference, rule, word } from "./define-rules";
import { getDirectorSetList } from "./director-set";
import { getFirstSetList } from "./first-set";
import { getFollowSetList } from "./follow-set";
import { isLLSyntax } from "./is-ll-syntax";

test("valid ll", () => {
  const syntax = [
    rule("start", reference("S")),

    // one starts with "w" and the other with "c"
    rule("S", word("word")),
    rule("S", word("code")),
  ];

  const firstSetList = getFirstSetList(syntax);
  const followSetList = getFollowSetList(syntax, firstSetList);
  const directorSetList = getDirectorSetList(firstSetList, followSetList);

  const result = isLLSyntax(syntax, directorSetList);

  expect(result).toStrictEqual([true, undefined]);
});

test("invalid ll", () => {
  const syntax = [
    rule("start", reference("S")),

    // both start with "w"
    rule("S", word("word")),
    rule("S", word("wish")),
  ];

  const firstSetList = getFirstSetList(syntax);
  const followSetList = getFollowSetList(syntax, firstSetList);
  const directorSetList = getDirectorSetList(firstSetList, followSetList);

  const result = isLLSyntax(syntax, directorSetList);

  expect(result).toStrictEqual([
    false,
    new Error("left TokenSet [word word] and right TokenSet [word wish] is not disjoint"),
  ]);
});
