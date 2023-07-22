export class StrictArray<T> {
  #array: T[];

  constructor(array: T[]) {
    this.#array = array;
  }

  set(index: number, item: T) {
    this.#array[index] = item;
  }

  get(index: number): T {
    const item = this.#array[index];

    if (item) return item;

    throw new RangeError(`${index} is out of bounce`);
  }

  get length(): number {
    return this.#array.length;
  }
}
