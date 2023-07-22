export type ToKey = {
  toKeyString(): string | number | symbol;
};

/**
 * オブジェクトの集合 （同じハッシュキーになるオブジェクトが最大で１つ含まれる）
 */
export class ObjectSet<T extends ToKey> {
  map = new Map<string | number | symbol, T>();

  /**
   * 新しい集合を作成します。
   * @param items 初期配列
   */
  constructor(items: Iterable<T> = []) {
    for (const item of items) {
      this.map.set(item.toKeyString(), item);
    }
  }

  /**
   * 要素の数を返します
   * @returns 要素数
   */
  get size() {
    return this.map.size;
  }

  /**
   * 集合に要素が含まれるか判定します。
   * @param item 要素
   * @returns 含まれる場合は `true`
   */
  has(item: T): boolean {
    return this.map.has(item.toKeyString());
  }

  /**
   * 要素を追加します
   * @param item 要素
   * @returns 要素を追加した自身
   */
  add(item: T): this {
    this.map.set(item.toKeyString(), item);

    return this;
  }

  /**
   * 要素を削除します
   * @param item 要素
   * @returns 要素が存在して削除された場合は `true`
   */
  delete(item: T): boolean {
    return this.map.delete(item.toKeyString());
  }

  /**
   * 自身に複数の要素を追加します
   * @param items 要素の配列
   * @returns 要素を追加した自身
   */
  append(items: Iterable<T>): this {
    for (const token of items) {
      this.map.set(token.toKeyString(), token);
    }

    return this;
  }

  /**
   * 自身と与えられた要素の集合から新しく和集合を作成します
   * @param other 要素の集合
   * @returns 新しい要素の集合
   */
  union<U extends ToKey = T>(other: ObjectSet<U>): ObjectSet<T | U> {
    return new ObjectSet<T | U>([...this, ...other]);
  }

  /**
   * 自身と与えられた要素の集合から新しく積集合を作成します
   * @param other 要素の集合
   * @returns 新しい要素の集合
   */
  intersection(other: ObjectSet<T>): ObjectSet<T> {
    const newSet = new ObjectSet<T>([]);

    for (const token of this) {
      if (other.has(token)) {
        newSet.add(token);
      }
    }

    return newSet;
  }

  /**
   * 自身と与えられた要素の集合から新しく差集合を作成します
   * @param other 要素の集合
   * @returns 新しい要素の集合
   */
  difference(other: ObjectSet<T>): ObjectSet<T> {
    const newSet = new ObjectSet<T>([]);

    for (const token of this) {
      if (!other.has(token)) {
        newSet.add(token);
      }
    }

    return newSet;
  }

  /**
   * @yields 要素
   */
  *[Symbol.iterator]() {
    for (const [_, item] of this.map) {
      yield item;
    }
  }

  /**
   * 2つの集合が同じかどうかを判定する
   * @param other もう一つの集合
   * @returns 集合の内容が同じなら`true`
   */
  equals(other: ObjectSet<T>): boolean {
    if (other.size === this.size) {
      for (const item of this) {
        if (!other.has(item)) {
          return false;
        }
      }
    }

    return true;
  }
}
