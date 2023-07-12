/**
 * 左側の集合に右側の集合の要素を追加します
 * @param leftSet 左側の集合
 * @param rightSet 右側の集合
 * @returns 左側の集合 （左側の集合∪右側の集合）
 */
export const appendSet = <T>(leftSet: Set<T>, rightSet: Set<T>): Set<T> => {
  for (const item of rightSet) {
    leftSet.add(item);
  }
  return leftSet;
};

/**
 * ２つの集合の和集合を求めます。
 * @param leftSet 左側の集合
 * @param rightSet 右側の集合
 * @returns 和集合 （左側の集合∪右側の集合）
 */
export const unionSet = <T>(leftSet: Set<T>, rightSet: Set<T>): Set<T> => {
  return new Set([...leftSet, ...rightSet]);
};

/**
 * ２つの集合の積集合を求めます。
 * @param leftSet 左側の集合
 * @param rightSet 右側の集合
 * @returns 積集合 （左側の集合∩右側の集合）
 */
export const intersectionSet = <T>(leftSet: Set<T>, rightSet: Set<T>): Set<T> => {
  const newSet = new Set<T>();

  for (const item of leftSet) {
    if (rightSet.has(item)) {
      newSet.add(item);
    }
  }

  return newSet;
};

/**
 * ２つの集合の差集合を求めます。
 * @param leftSet 左側の集合
 * @param rightSet 右側の集合
 * @returns 差集合 （左側の集合＼右側の集合）
 */
export const differenceSet = <T>(leftSet: Set<T>, rightSet: Set<T>): Set<T> => {
  const newSet = new Set<T>();

  for (const item of leftSet) {
    if (!rightSet.has(item)) {
      newSet.add(item);
    }
  }

  return newSet;
};
