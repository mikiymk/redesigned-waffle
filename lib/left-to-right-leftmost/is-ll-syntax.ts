import { isDisjoint } from "./is-disjoint";
import { getRuleIndexesFromName } from "./rule-indexes";
import { getRuleNames } from "./rule-names";

import type { Result } from "../reader/parse-reader";
import type { ObjectSet } from "../util/object-set";
import type { DirectorSetToken, Syntax } from "@/lib/rules/define-rules";

/**
 * 構文リストがLL(1)パーサーになれるか調べます。
 * @param syntax 構文リスト
 * @param directorSetList ディレクター集合リスト
 * @returns 結果オブジェクト
 */
export const isValidLLGrammar = (syntax: Syntax, directorSetList: ObjectSet<DirectorSetToken>[]): Result<undefined> => {
  for (const name of getRuleNames(syntax)) {
    for (const left of getRuleIndexesFromName(syntax, name)) {
      for (const right of getRuleIndexesFromName(syntax, name)) {
        if (left === right) continue;

        const leftRule = directorSetList[left];
        const rightRule = directorSetList[right];

        if (leftRule === undefined || rightRule === undefined) {
          return [false, new Error(`director set does not support syntax list`)];
        }

        if (!isDisjoint(leftRule, rightRule)) {
          return [
            false,
            new Error(`left [${leftRule.toKeyString()}] and right [${rightRule.toKeyString()}] is not disjoint`),
          ];
        }
      }
    }
  }

  return [true, undefined];
};
