import { expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";

import { getDirectorSetList } from "../../token-set/director-set-list";
import { getFirstSetList } from "../../token-set/first-set-list";
import { getFollowSetList } from "../../token-set/follow-set-list";
import { isLLSyntax } from "../is-ll-syntax";

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

  expect(result).toStrictEqual([false, new Error('left [w "word"] and right [w "wish"] is not disjoint')]);
});
