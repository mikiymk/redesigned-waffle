import { expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";

import { getDirectorSetList } from "../token-set/director-set-list";
import { getFirstSetList } from "../token-set/first-set-list";
import { getFollowSetList } from "../token-set/follow-set-list";

import { getMatchRuleIndex } from "./get-match-rule";

import type { Result } from "../util/parser";

const syntax = [
  rule("start", reference("S")),

  // one starts with "w" and the other with "c"
  rule("S", word("word")),
  rule("S", word("code")),
  rule("S", word("ambitious")),
];

const firstSetList = getFirstSetList(syntax);
const followSetList = getFollowSetList(syntax, firstSetList);
const directorSetList = getDirectorSetList(firstSetList, followSetList);

const cases: [number, Result<number>][] = [
  [0x77 /* "w" */, [true, 1]],
  [0x63 /* "c" */, [true, 2]],
  [0x61 /* "a" */, [true, 3]],
  [0x65 /* "e" */, [false, new Error("no rule matches")]],
];

test.each(cases)("matches %d", (code, expected) => {
  expect(getMatchRuleIndex(syntax, directorSetList, "S", code)).toStrictEqual(expected);
});
