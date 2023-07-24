import { primitiveToString } from "../util/primitive-to-string";

import { getRuleIndexes } from "./rule-indexes";

import type { ParseReader, Result } from "../reader/peekable-iterator";
import type { ObjectSet } from "../util/object-set";
import type { DirectorSetToken, RuleName, Syntax } from "@/lib/rules/define-rules";

/**
 * 次の文字にマッチするルール番号を探します。
 * @param syntax 構文リスト
 * @param directorSetList ディレクター集合リスト
 * @param ruleName ルール名
 * @param pr 次の入力
 * @returns マッチするルールがあれば、その数字
 */
export const getMatchRuleIndex = (
  syntax: Syntax,
  directorSetList: ObjectSet<DirectorSetToken>[],
  ruleName: RuleName,
  pr: ParseReader,
): Result<number> => {
  // 各ルールについてループする
  for (const ruleIndex of getRuleIndexes(syntax, ruleName)) {
    const tokens = directorSetList[ruleIndex];

    if (tokens === undefined) {
      return [false, new Error("director set does not support syntax list")];
    }

    // ルールの文字範囲をループ
    for (const token of tokens) {
      // 先読みした入力が範囲に入っている場合
      if (token.matchFirstChar(pr)) {
        return [true, ruleIndex];
      }
    }
  }

  return [false, new Error(`no rule ${primitiveToString(ruleName)} matches`)];
};
