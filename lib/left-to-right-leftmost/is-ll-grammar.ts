import { isDisjoint } from "./is-disjoint";
import { eachRules } from "./rule-indexes";
import { getRuleNames } from "./rule-names";

import type { Result } from "../reader/parse-reader";
import type { ObjectSet } from "../util/object-set";
import type { DirectorSetSymbol, Grammar } from "@/lib/rules/define-rules";

/**
 * 構文リストがLL(1)パーサーになれるか調べます。
 * @param syntax 構文リスト
 * @param directorSetList ディレクター集合リスト
 * @returns 結果オブジェクト
 */
export const isValidLLGrammar = <T>(
  syntax: Grammar<T>,
  directorSetList: ObjectSet<DirectorSetSymbol>[],
): Result<undefined> => {
  for (const name of getRuleNames(syntax)) {
    for (const [left, [leftRule]] of eachRules(syntax, name, [directorSetList])) {
      for (const [right, [rightRule]] of eachRules(syntax, name, [directorSetList])) {
        if (left === right) {
          continue;
        }

        if (!isDisjoint(leftRule, rightRule)) {
          return [
            false,
            new Error(`[${leftRule.toKeyString()}] と [${rightRule.toKeyString()}] は互いに素ではありません。`),
          ];
        }
      }
    }
  }

  return [true, undefined];
};
