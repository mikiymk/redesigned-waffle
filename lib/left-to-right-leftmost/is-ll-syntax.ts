import { isDisjoint } from "./is-disjoint";
import { getRuleIndexes } from "./rule-indexes";
import { getRuleNames } from "./rule-names";

import type { TokenSet } from "./token-set";
import type { Result } from "../util/parser";
import type { DirectorSetToken, Syntax } from "@/lib/rules/define-rules";

/**
 * 構文リストがLL(1)パーサーになれるか調べます。
 * @param syntax 構文リスト
 * @param directorSetList ディレクター集合リスト
 * @returns 結果オブジェクト
 */
export const isLLSyntax = (syntax: Syntax, directorSetList: TokenSet<DirectorSetToken>[]): Result<undefined> => {
  for (const name of getRuleNames(syntax)) {
    for (const left of getRuleIndexes(syntax, name)) {
      for (const right of getRuleIndexes(syntax, name)) {
        if (left === right) continue;

        const leftRule = directorSetList[left];
        const rightRule = directorSetList[right];

        if (leftRule === undefined || rightRule === undefined) {
          return [false, new Error(`director set does not support syntax list`)];
        }

        if (!isDisjoint(leftRule, rightRule)) {
          return [false, new Error(`left ${leftRule.asString()} and right ${rightRule.asString()} is not disjoint`)];
        }
      }
    }
  }

  return [true, undefined];
};
