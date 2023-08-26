import { empty } from "@/lib/rules/define-rules";

import { ObjectSet } from "../util/object-set";
import { zip } from "../util/zip-array";

import type { DirectorSetSymbol, FirstSetSymbol, FollowSetSymbol } from "@/lib/rules/define-rules";

/**
 * ファースト集合リストとフォロー集合リストからディレクター集合リストを作成する
 * @param firstSetList ファースト集合リスト
 * @param followSetList フォロー集合リスト
 * @returns ディレクター集合リスト
 */
export const getDirectorSetList = (
  firstSetList: ObjectSet<FirstSetSymbol>[],
  followSetList: ObjectSet<FollowSetSymbol>[],
): ObjectSet<DirectorSetSymbol>[] => {
  const directorSetList = firstSetList.map(() => new ObjectSet<DirectorSetSymbol>());

  for (const [index, firstSet, followSet] of zip(firstSetList, followSetList)) {
    directorSetList[index]?.append(generateDirectorSet(firstSet, followSet));
  }

  return directorSetList;
};

/**
 * ディレクター集合を作成する
 * @param firstSet ファースト集合
 * @param followSet フォロー集合
 * @returns ディレクター集合
 */
const generateDirectorSet = (
  firstSet: ObjectSet<FirstSetSymbol>,
  followSet: ObjectSet<FollowSetSymbol>,
): ObjectSet<DirectorSetSymbol> => {
  return firstSet.has(empty)
    ? firstSet.difference(new ObjectSet([empty])).union(followSet)
    : (firstSet as ObjectSet<DirectorSetSymbol>);
};
