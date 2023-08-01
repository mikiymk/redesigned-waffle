/**
 * 配列のリストから各要素のループにする
 * @param arrays 配列リスト。長さを揃える
 * @yields 各配列の同じ添字の要素のタプル
 */
export const zip = function* <T extends readonly (readonly unknown[])[]>(
  ...arrays: T
): Generator<[number, ...{ [K in keyof T]: T[K][number] }]> {
  const firstArray = arrays[0];
  if (firstArray === undefined) {
    throw new Error("must 1 or more");
  }
  const length = firstArray.length;
  for (const array of arrays) {
    if (array.length !== length) {
      throw new Error("different lengths");
    }
  }

  for (const index of firstArray.keys()) {
    yield [index, ...(arrays.map((array) => array[index]) as { [K in keyof T]: T[K][number] })];
  }
};
