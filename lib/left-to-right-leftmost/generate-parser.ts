import { getDirectorSetList } from "./director-set";
import { getFirstSetList } from "./first-set";
import { getFollowSetList } from "./follow-set";
import { isDisjoint } from "./is-disjoint";

import type { Syntax } from "./define-rules";
/**
 * 構文ルールリストからLL(1)パーサーを作成します。
 * @param syntax 構文ルールリスト
 */
export const generateParser = (syntax: Syntax) => {
  const firstSetList = getFirstSetList(syntax);
  const followSetList = getFollowSetList(syntax, firstSetList);
  const directorSetList = getDirectorSetList(firstSetList, followSetList);

  for (const left of directorSetList)
    for (const right of directorSetList) {
      if (left === right) continue;

      if (!isDisjoint(left, right)) {
        console.error(`left and right is not disjoint`);
      }
    }

  console.log(firstSetList, followSetList, directorSetList);
};
