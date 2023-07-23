/**
 *
 */
export class StrictArray<T> {
  #array: T[];

  /**
   *
   * @param array
   */
  constructor(array: T[]) {
    this.#array = array;
  }

  /**
   *
   * @param index
   * @param item
   */
  set(index: number, item: T) {
    this.#array[index] = item;
  }

  /**
   *
   * @param index
   */
  get(index: number): T {
    const item = this.#array[index];

    if (item) return item;

    throw new RangeError(`${index} is out of bounce`);
  }

  /**
   *
   */
  get length(): number {
    return this.#array.length;
  }
}
