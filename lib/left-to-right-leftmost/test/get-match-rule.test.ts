import { expect, test } from "vitest";

import { WordReader } from "@/lib/reader/word-reader";
import { reference, rule, word } from "@/lib/rules/define-rules";

import { EOF } from "../../reader/parse-reader";
import { getDirectorSetList } from "../../symbol-set/director-set";
import { getFirstSetList } from "../../symbol-set/first-set";
import { getFollowSetList } from "../../symbol-set/follow-set";
import { getMatchRuleIndex } from "../get-match-rule";

import type { ParseReader, ParseToken, Result } from "../../reader/parse-reader";

const syntax = [
  rule("start", [reference("S")]),

  // one starts with "w" and the other with "c"
  rule("S", [word("word", "word")]),
  rule("S", [word("word", "code")]),
  rule("S", [word("word", "ambitious")]),
];

const firstSetList = getFirstSetList(syntax);
const followSetList = getFollowSetList(syntax, firstSetList);
const directorSetList = getDirectorSetList(firstSetList, followSetList);

const cases: [ParseToken | EOF, ParseReader, Result<number>][] = [
  [{ type: "word", value: "word" }, new WordReader(" word "), [true, 1]],
  [{ type: "word", value: "code" }, new WordReader(" code "), [true, 2]],
  [{ type: "word", value: "ambitious" }, new WordReader(" ambitious "), [true, 3]],
  [
    { type: "word", value: "forest" },
    new WordReader(" forest "),
    [false, new Error('次の入力にマッチするルール(ルール名:"S")が見つかりませんでした。')],
  ],
  [EOF, new WordReader(" "), [false, new Error('次の入力にマッチするルール(ルール名:"S")が見つかりませんでした。')]],
];

test.each(cases)("matches %s", (_code, pr, expected) => {
  expect(getMatchRuleIndex(syntax, directorSetList, "S", pr)).toStrictEqual(expected);
});
