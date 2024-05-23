import { ObjectSet } from "../util/object-set";

import type { LR0ItemSymbol, RuleName } from "@/lib/rules/define-rules";
import type { LR0Item } from "./lr0-item";

/**
 * アイテムを次のトークンでグループ分けします。
 * @param items アイテムのリスト
 * @returns グループ分けされたアイテム集合のリスト
 */
export const groupByNextToken = <T>(items: Iterable<LR0Item<T>>): [LR0ItemSymbol, ObjectSet<LR0Item<T>>][] => {
  const record: Record<RuleName, [LR0ItemSymbol, ObjectSet<LR0Item<T>>]> = {};

  for (const item of items) {
    const symbol = item.nextSymbol();

    if (symbol === undefined) {
      // ドットの後ろにトークンがない状態は、空のルールから生まれる。
      // 空のルールはクロージャ操作で新しいアイテムを生まないはずなので、スキップできる。
      continue;
    }

    const set = record[symbol.toKeyString()]?.[1] ?? new ObjectSet<LR0Item<T>>();
    set.add(item);
    record[symbol.toKeyString()] = [symbol, set];
  }

  return Object.values(record);
};
