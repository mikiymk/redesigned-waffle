import { empty } from "@/lib/rules/define-rules";

import { ObjectSet } from "../util/object-set";
import { zip } from "../util/zip-array";

import type { DirectorSetToken, FirstSetToken, FollowSetToken } from "@/lib/rules/define-rules";

/**
 * ファースト集合リストとフォロー集合リストからディレクター集合リストを作成する
 * @param firstSetList ファースト集合リスト
 * @param followSetList フォロー集合リスト
 * @returns ディレクター集合リスト
 */
export const getDirectorSetList = (
  firstSetList: ObjectSet<FirstSetToken>[],
  followSetList: ObjectSet<FollowSetToken>[],
): ObjectSet<DirectorSetToken>[] => {
  const directorSetList = firstSetList.map(() => new ObjectSet<DirectorSetToken>());

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
  firstSet: ObjectSet<FirstSetToken>,
  followSet: ObjectSet<FollowSetToken>,
): ObjectSet<DirectorSetToken> => {
  return firstSet.has(empty)
    ? firstSet.difference(new ObjectSet([empty])).union(followSet)
    : (firstSet as ObjectSet<DirectorSetToken>);
};
