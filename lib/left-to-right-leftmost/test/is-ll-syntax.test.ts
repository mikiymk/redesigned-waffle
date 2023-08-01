import { expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";

import { getDirectorSetList } from "../../token-set/director-set";
import { getFirstSetList } from "../../token-set/first-set";
import { getFollowSetList } from "../../token-set/follow-set";
import { isValidLLGrammar } from "../is-ll-syntax";

test("valid ll", () => {
  const syntax = [
    rule("start", [reference("S")]),

    // one starts with "w" and the other with "c"
    rule("S", [word("word", "word")]),
    rule("S", [word("word", "code")]),
  ];

  const firstSetList = getFirstSetList(syntax);
  const followSetList = getFollowSetList(syntax, firstSetList);
  const directorSetList = getDirectorSetList(firstSetList, followSetList);

  const result = isValidLLGrammar(syntax, directorSetList);

  expect(result).toStrictEqual([true, undefined]);
});

test("invalid ll", () => {
  const syntax = [
    rule("start", [reference("S")]),

    // both start with "w"
    rule("S", [word("word", "word")]),
    rule("S", [word("word", "wish")]),
  ];

  const firstSetList = getFirstSetList(syntax);
  const followSetList = getFollowSetList(syntax, firstSetList);
  const directorSetList = getDirectorSetList(firstSetList, followSetList);

  const result = isValidLLGrammar(syntax, directorSetList);

  expect(result).toStrictEqual([true, undefined]);
});
