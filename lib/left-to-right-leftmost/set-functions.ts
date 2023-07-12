/**
 * 左側の集合に右側の集合の要素を追加します
 * @param leftSet 左側の集合
 * @param rightSet 右側の集合
 */
export const appendSet = <K, V>(leftSet: Map<K, V>, rightSet: Map<K, V>) => {
  for (const [key, value] of rightSet) {
    leftSet.set(key, value);
  }
};

/**
 * ２つの集合の和集合を求めます。
 * @param leftSet 左側の集合
 * @param rightSet 右側の集合
 * @returns 和集合 （左側の集合∪右側の集合）
 */
export const unionSet = <K, V>(leftSet: Map<K, V>, rightSet: Map<K, V>): Map<K, V> => {
  return new Map([...leftSet, ...rightSet]);
};

/**
 * ２つの集合の積集合を求めます。
 * @param leftSet 左側の集合
 * @param rightSet 右側の集合
 * @returns 積集合 （左側の集合∩右側の集合）
 */
export const intersectionSet = <K, V>(leftSet: Map<K, V>, rightSet: Map<K, V>): Map<K, V> => {
  const newSet = new Map<K, V>();

  for (const [key, value] of leftSet) {
    if (rightSet.has(key)) {
      newSet.set(key, value);
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
export const differenceSet = <K, V>(leftSet: Map<K, V>, rightSet: Map<K, V>): Map<K, V> => {
  const newSet = new Map<K, V>();

  for (const [key, value] of leftSet) {
    if (!rightSet.has(key)) {
      newSet.set(key, value);
    }
  }

  return newSet;
};
