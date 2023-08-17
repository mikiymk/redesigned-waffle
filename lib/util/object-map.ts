import { primitiveToString } from "./primitive-to-string";

type ToKey = {
  toKeyString(): string | number | symbol;
};

/**
 * オブジェクトの集合 （同じハッシュキーになるオブジェクトが最大で１つ含まれる）
 */
export class ObjectMap<K extends ToKey, V> {
  map = new Map<string | number | symbol, [K, V]>();

  /**
   * 新しい集合を作成します。
   * @param items 初期配列
   */
  constructor(items: Iterable<[K, V]> = []) {
    for (const [key, value] of items) {
      this.map.set(key.toKeyString(), [key, value]);
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
   * @param key 要素
   * @returns 含まれる場合は `true`
   */
  has(key: K): boolean {
    return this.map.has(key.toKeyString());
  }

  /**
   * 要素を追加します
   * @param key キー
   * @param value 値
   * @returns 要素を追加した自身
   */
  set(key: K, value: V): this {
    this.map.set(key.toKeyString(), [key, value]);

    return this;
  }

  /**
   * 要素を取得します
   * @param key キー
   * @returns 値
   */
  get(key: K): V | undefined {
    return this.map.get(key.toKeyString())?.[1];
  }

  /**
   * 要素を削除します
   * @param key 要素
   * @returns 要素が存在して削除された場合は `true`
   */
  delete(key: K): boolean {
    return this.map.delete(key.toKeyString());
  }

  /**
   * 自身に複数の要素を追加します
   * @param items 要素の配列
   * @returns 要素を追加した自身
   */
  append(items: Iterable<[K, V]>): this {
    for (const [key, value] of items) {
      this.map.set(key.toKeyString(), [key, value]);
    }

    return this;
  }

  /**
   * @yields キー
   */
  *keys(): Generator<K, void, undefined> {
    for (const [key] of this.map.values()) {
      yield key;
    }
  }

  /**
   * @yields 値
   */
  *values(): Generator<V, void, undefined> {
    for (const [_, value] of this.map.values()) {
      yield value;
    }
  }

  /**
   * @yields キーと値のペア
   */
  *[Symbol.iterator](): Generator<[K, V], void, undefined> {
    for (const [key, value] of this.map.values()) {
      yield [key, value];
    }
  }

  /**
   * 2つの集合が同じかどうかを判定する
   * @param other もう一つの集合
   * @param comparator 値のカスタム比較
   * @returns 集合の内容が同じなら`true`
   */
  equals(other: ObjectMap<K, V>, comparator?: (left: V, right: V) => boolean): boolean {
    if (other.size !== this.size) {
      return false;
    }

    for (const [key, value] of this) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (!(comparator?.(other.get(key)!, value) ?? other.get(key) === value)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 文字列表現を作ります
   * @returns 文字列
   */
  toKeyString(): string {
    return `[${[...this]
      .map(([key, value]) => `${primitiveToString(key.toKeyString())} => ${JSON.stringify(value)}`)
      .join(" ")}]`;
  }
}
