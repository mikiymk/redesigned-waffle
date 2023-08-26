import { primitiveToString } from "../util/primitive-to-string";

import { eachRules } from "./rule-indexes";

import type { ParseReader, Result } from "../reader/parse-reader";
import type { ObjectSet } from "../util/object-set";
import type { DirectorSetSymbol, RuleName, Grammar } from "@/lib/rules/define-rules";

/**
 * 次の文字にマッチするルール番号を探します。
 * @param grammar 構文リスト
 * @param directorSetList ディレクター集合リスト
 * @param ruleName ルール名
 * @param pr 次の入力
 * @returns マッチするルールがあれば、その数字
 */
export const getMatchRuleIndex = <T>(
  grammar: Grammar<T>,
  directorSetList: ObjectSet<DirectorSetSymbol>[],
  ruleName: RuleName,
  pr: ParseReader,
): Result<number> => {
  // 各ルールについてループする
  for (const [ruleIndex, [symbols]] of eachRules(grammar, ruleName, [directorSetList])) {
    // ルールの文字範囲をループ
    for (const symbol of symbols) {
      // 先読みした入力が範囲に入っている場合
      if (symbol.matchFirstChar(pr)) {
        return [true, ruleIndex];
      }
    }
  }

  return [
    false,
    new Error(`次の入力にマッチするルール(ルール名:${primitiveToString(ruleName)})が見つかりませんでした。`),
  ];
};
