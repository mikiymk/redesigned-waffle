import { firstChars } from "./is-disjoint";
import { getRuleIndexes } from "./rule-indexes";

import type { DirectorSetToken, Syntax } from "./define-rules";
import type { TokenSet } from "./token-set";
import type { Result } from "../util/parser";

/**
 * 次の文字にマッチするルール番号を探します。
 * @param syntax 構文リスト
 * @param directorSetList ディレクター集合リスト
 * @param ruleName ルール名
 * @param peekedCode 次の入力
 * @returns マッチするルールがあれば、その数字
 */
export const getMatchRuleIndex = (
  syntax: Syntax,
  directorSetList: TokenSet<DirectorSetToken>[],
  ruleName: string,
  peekedCode: number,
): Result<number> => {
  // 各ルールについてループする
  for (const ruleIndex of getRuleIndexes(syntax, ruleName)) {
    const tokens = directorSetList[ruleIndex];

    if (tokens === undefined) {
      return [false, new Error("director set does not support syntax list")];
    }

    // ルールの文字範囲をループ
    for (const [min, max] of firstChars(tokens)) {
      // 先読みした入力が範囲に入っている場合
      if (min <= peekedCode && peekedCode <= max) {
        return [true, ruleIndex];
      }
    }
  }

  return [false, new Error(`no rule matches`)];
};
