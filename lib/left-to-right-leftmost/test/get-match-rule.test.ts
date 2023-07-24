import { expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";

import { EOF } from "../../reader/peekable-iterator";
import { getDirectorSetList } from "../../token-set/director-set-list";
import { getFirstSetList } from "../../token-set/first-set-list";
import { getFollowSetList } from "../../token-set/follow-set-list";
import { getMatchRuleIndex } from "../get-match-rule";

import type { ParseToken, Result } from "../../reader/peekable-iterator";

const syntax = [
  rule("start", reference("S")),

  // one starts with "w" and the other with "c"
  rule("S", word("word", "word")),
  rule("S", word("word", "code")),
  rule("S", word("word", "ambitious")),
];

const firstSetList = getFirstSetList(syntax);
const followSetList = getFollowSetList(syntax, firstSetList);
const directorSetList = getDirectorSetList(firstSetList, followSetList);

const cases: [ParseToken | EOF, Result<number>][] = [
  [{ type: "word", value: "word" }, [true, 1]],
  [{ type: "word", value: "code" }, [true, 2]],
  [{ type: "word", value: "ambitious" }, [true, 3]],
  [{ type: "word", value: "forest" }, [false, new Error("no rule matches")]],
  [EOF, [false, new Error("no rule matches")]],
];

test.each(cases)("matches %s", (code, expected) => {
  expect(getMatchRuleIndex(syntax, directorSetList, "S", code)).toStrictEqual(expected);
});
