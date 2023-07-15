import { epsilon } from "./define-rules";
import { TokenSet } from "./token-set";

/**
 * ファースト集合リストとフォロー集合リストからディレクター集合リストを作成する
 * @param firstSetList ファースト集合リスト
 * @param followSetList フォロー集合リスト
 * @returns ディレクター集合リスト
 */
export const getDirectorSetList = (firstSetList: TokenSet[], followSetList: TokenSet[]): TokenSet[] => {
  const directorSetList = firstSetList.map(() => new TokenSet());

  for (const [index, firstSet] of firstSetList.entries()) {
    const followSet = followSetList[index];

    if (followSet === undefined) {
      throw new Error(`rule length is ${followSetList.length}, but access index of ${index}`);
    }

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
const generateDirectorSet = (firstSet: TokenSet, followSet: TokenSet): TokenSet => {
  return firstSet.has(epsilon) ? firstSet.difference([epsilon]).union(followSet) : firstSet;
};
